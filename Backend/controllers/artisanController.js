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
const mongoose = require('mongoose');

// Helper promises for placeholder artisan metrics
const getTotalEarnings = () => Promise.resolve(0);
const getTotalReviews = () => Promise.resolve(0);
const getUnreadMessages = () => Promise.resolve(0);
const getUnreadNotifications = () => Promise.resolve(0);

const getDashboardSummary = (req, res) => {
	// Set Cache-Control header so browser never caches stale summary response
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');

	const user = req.user;
	
	// Ensure user is attached by auth middleware
	if (!user) {
		return res.status(401).json({ message: 'Authentication required' });
	}

	// 1. Fetch Artisan Profile to verify identity and check verification status
	ArtisanProfile.findOne({ user: user._id }).lean()
		.then((profile) => {
			if (!profile) {
				return res.status(404).json({ message: 'Artisan profile not found' });
			}

			// 2. Count ALL reports without any restrictive filter using Report.countDocuments({})
			const countPromise = Report.countDocuments({});
			
			// 3. Additional stats promises
			const earningsPromise = getTotalEarnings();
			const reviewsPromise = getTotalReviews();
			const messagesPromise = getUnreadMessages();
			const notifsPromise = getUnreadNotifications();

			// 4. Check if artisan account is approved to fetch recent activity
			const isApproved = String(profile.verificationStatus || '').toLowerCase() === 'approved';
			
			const recentActivityPromise = isApproved 
				? Report.find({}).sort({ createdAt: -1 }).limit(5).select('_id title category location createdAt').lean()
				: Promise.resolve([]);

			// 5. Execute all queries in parallel with Promise.all
			return Promise.all([
				countPromise,
				earningsPromise,
				reviewsPromise,
				messagesPromise,
				notifsPromise,
				recentActivityPromise
			]).then(([totalReports, totalEarnings, totalReviews, unreadMessages, unreadNotifications, recentReports]) => {
				
				// Map recent activity items cleanly
				const recentActivity = (recentReports || []).map((r) => ({
					id: r._id,
					title: r.title || r.category || 'Report',
					category: r.category || 'General',
					neighborhood: r.location?.address || r.location?.addressText || '',
					createdAt: r.createdAt
				}));

				// Return full structured JSON object
				return res.status(200).json({
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
				});
			});
		})
		.catch((error) => {
			// On database/server failure, log error and return 500 status (never return fake 0)
			console.error('Error in getDashboardSummary:', error.message);
			return res.status(500).json({ message: 'Unable to fetch dashboard summary', error: error.message });
		});
};

// Dev-only debug endpoint to inspect database collections and document counts
const getDebugCounts = (req, res) => {
	const db = mongoose.connection.db;
	if (!db) {
		return res.status(500).json({ message: 'Database connection not initialized' });
	}

	db.listCollections().toArray()
		.then((collections) => {
			const countPromises = collections.map((col) => {
				return db.collection(col.name).countDocuments()
					.then((count) => ({ collectionName: col.name, count }));
			});

			return Promise.all(countPromises)
				.then((counts) => {
					return res.status(200).json({
						databaseName: db.databaseName,
						reportModelCollection: Report.collection.name,
						collections: counts
					});
				});
		})
		.catch((err) => {
			return res.status(500).json({ message: 'Debug count query failed', error: err.message });
		});
};

module.exports = { registerArtisan, getDashboardSummary, getDebugCounts };
