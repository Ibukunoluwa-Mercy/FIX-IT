const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');
const { createVerificationToken, normalizeText, emailPattern, createToken } = require('../utils/authUtils');
const { sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');

const registerArtisan = (req, res) => {
	
	const fullName = normalizeText(req.body.fullName);
	const email = normalizeText(req.body.email).toLowerCase();
	const phone = normalizeText(req.body.phone);
	const neighborhood = normalizeText(req.body.neighborhood);
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	const businessName = normalizeText(req.body.businessName);

	
	const removeUploadedFile = () => {
		if (req.file && req.file.path) {
			
			fs.unlink(req.file.path, () => {});
		}
	};

	
	if (!fullName || !email || !phone || !password || !neighborhood || !businessName) {
		removeUploadedFile();
		return res.status(400).json({ message: 'All required fields must be provided' });
	}
	if (!req.file) {
		return res.status(400).json({ message: 'Certificate document is required' });
	}
	if (!emailPattern.test(email)) {
		removeUploadedFile();
		return res.status(400).json({ message: 'Please provide a valid email address' });
	}
	if (password.length < 8 || password.length > 128) {
		removeUploadedFile();
		return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
	}

	
	User.findOne({ $or: [{ email }, { phone }] })
		.select('email phone')
		.lean()
		.then((duplicate) => {
			if (duplicate) {
				removeUploadedFile();
				const msg = duplicate.email === email ? 'An account with this email already exists' : 'An account with this phone number already exists';
				return res.status(409).json({ message: msg });
			}

			
			const verification = createVerificationToken();
			
			const verifMinutes = parseInt(process.env.VERIFICATION_MINUTES, 10) || 2;
			const verificationEndsAt = new Date(Date.now() + verifMinutes * 60 * 1000);

			return User.create({
				name: fullName,
				email,
				phone,
				location: neighborhood,
				password, 
				role: 'artisan',
				emailVerificationTokenHash: verification.hash,
				emailVerificationExpires: verification.expires,
				verificationEndsAt,
			}).then((user) => {
				
				return ArtisanProfile.create({
					user: user._id,
					businessName,
					certificateUrl: `/private/artisan-certs/${req.file.filename}`,
					verificationStatus: 'Pending',
				}).then((profile) => {
					
					setImmediate(() => {
						sendVerificationEmail({
							email,
							fullName,
							verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verification.rawToken}`,
						}).catch((err) => console.error('Artisan verify email failed:', err.message));
						
						sendWelcomeEmail({ email, fullName })
							.catch((err) => console.error('Artisan welcome email failed:', err.message));
					});

					
					return res.status(201).json({
						message: 'Artisan account created successfully',
						token: createToken(user),
						verificationEndsAt,
						profile: {
							...user.toSafeProfile(),
							phone: user.phone,
							role: 'artisan',
							artisanDetails: {
								businessName: profile.businessName,
								verificationStatus: profile.verificationStatus,
							},
						},
					});
				}).catch((profileError) => {
					
					User.deleteOne({ _id: user._id }).catch(() => {});
					removeUploadedFile();
					console.error('Profile creation failed:', profileError.message);
					return res.status(500).json({ message: 'Unable to create Artisan profile' });
				});
			});
		})
		.catch((error) => {
			removeUploadedFile();
			console.error('Artisan registration failed:', error.message);
			return res.status(500).json({ message: 'Unable to register Artisan' });
		});
};

const Report = require('../models/Report');

// Dummy functions as requested
const getTotalEarnings = () => Promise.resolve(0);
const getTotalReviews = () => Promise.resolve(0);
const getUnreadMessages = () => Promise.resolve(0);
const getUnreadNotifications = () => Promise.resolve(0);

const getDashboardSummary = (req, res) => {
	const user = req.user;
	
	// Ensure we only process if user is authenticated (handled by requireAuth, but safe check)
	if (!user) return res.status(401).json({ message: 'Authentication required' });

	// 1. Fetch Artisan Profile to check verification status
	ArtisanProfile.findOne({ user: user._id }).lean()
		.then((profile) => {
			if (!profile) {
				return res.status(404).json({ message: 'Artisan profile not found' });
			}

			// 2. Fetch the total reports count unconditionally (visible to all artisans)
			const countPromise = Report.countDocuments();
			
			// 3. Dummy stats promises
			const earningsPromise = getTotalEarnings();
			const reviewsPromise = getTotalReviews();
			const messagesPromise = getUnreadMessages();
			const notifsPromise = getUnreadNotifications();

			// 4. If approved, fetch recent reports, otherwise resolve to empty array
			const isApproved = profile.verificationStatus === 'approved' || profile.verificationStatus === 'Approved';
			
			const recentActivityPromise = isApproved 
				? Report.find().sort({ createdAt: -1 }).limit(5).select('_id title category location createdAt').lean()
				: Promise.resolve([]);

			// 5. Run everything in parallel
			return Promise.all([
				countPromise,
				earningsPromise,
				reviewsPromise,
				messagesPromise,
				notifsPromise,
				recentActivityPromise
			]).then(([totalReports, totalEarnings, totalReviews, unreadMessages, unreadNotifications, recentReports]) => {
				
				// Map recent reports to fit requested structure
				const recentActivity = recentReports.map(r => ({
					id: r._id,
					title: r.title,
					category: r.category,
					neighborhood: r.location?.address || r.location?.addressText || '',
					createdAt: r.createdAt
				}));

				// Build the summary response object
				const summary = {
					artisan: {
						fullName: user.name,
						avatarUrl: user.avatarUrl || '',
						verificationStatus: profile.verificationStatus,
						rejectionReason: profile.rejectionReason || ''
					},
					stats: {
						totalReports,
						totalEarnings,
						totalReviews,
						unreadMessages
					},
					unreadNotifications,
					recentActivity
				};

				return res.status(200).json(summary);
			});
		})
		.catch((error) => {
			console.error('Error fetching dashboard summary:', error.message);
			return res.status(500).json({ message: 'Unable to fetch dashboard summary' });
		});
};

module.exports = { registerArtisan, getDashboardSummary };
