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

// Helper promises for artisan metrics
const getTotalEarnings = () => Promise.resolve(0);
const getTotalReviews = (userId) => {
	if (!userId) return Promise.resolve(0);
	return Report.countDocuments({
		assignedArtisan: userId,
		'review.rating': { $exists: true, $ne: null }
	});
};
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
			const reviewsPromise = getTotalReviews(user._id);
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

/**
 * getArtisanReports
 * Returns all reports for the artisan feed with claim status flags:
 * - isClaimedByMe: true if assignedArtisan equals current user
 * - isClaimedByOther: true if assignedArtisan exists and is not current user
 * - isUnclaimed: true if no assignedArtisan and status is reported
 */
const getArtisanReports = async (req, res) => {
	try {
		const userId = req.user?._id;
		if (!userId) return res.status(401).json({ message: 'Authentication required' });

		const { filter = 'all', page = 1, limit = 15 } = req.query;
		const pageNum = parseInt(page, 10) || 1;
		const limitNum = parseInt(limit, 10) || 15;

		const query = {};
		if (filter === 'unclaimed') {
			query.assignedArtisan = null;
			query.status = 'reported';
		} else if (filter === 'my_jobs') {
			query.assignedArtisan = userId;
		} else if (filter === 'resolved') {
			query.assignedArtisan = userId;
			query.status = { $in: ['resolved', 'closed'] };
		}

		const total = await Report.countDocuments(query);
		const totalAllReports = await Report.countDocuments({});
		const reports = await Report.find(query)
			.sort({ createdAt: -1 })
			.skip((pageNum - 1) * limitNum)
			.limit(limitNum)
			.lean();

		const mappedReports = reports.map((r) => {
			const assignedId = r.assignedArtisan ? String(r.assignedArtisan) : null;
			const isClaimedByMe = assignedId === String(userId);
			const isClaimedByOther = assignedId !== null && !isClaimedByMe;
			const isUnclaimed = !assignedId && r.status === 'reported';

			return {
				id: String(r._id),
				reportId: r.reportId || `#CF-${String(r._id).slice(-6).toUpperCase()}`,
				title: r.title || r.category || 'Report',
				description: r.description || '',
				category: r.category || 'General',
				severity: r.severity || 'Medium',
				status: r.status,
				location: {
					address: r.location?.addressText || r.location?.address || 'Location unavailable',
					lat: r.location?.lat,
					lng: r.location?.lng,
				},
				reportedAt: r.reportedAt || r.createdAt,
				inProgressAt: r.inProgressAt,
				resolvedAt: r.resolvedAt,
				closedAt: r.closedAt,
				images: [...new Set([...(r.images || []), ...(r.photos || []), r.imageUrl].filter(Boolean))],
				isClaimedByMe,
				isClaimedByOther,
				isUnclaimed,
				review: r.review || null,
			};
		});

		return res.status(200).json({
			success: true,
			reports: mappedReports,
			totalAllReports,
			pagination: {
				page: pageNum,
				limit: limitNum,
				total,
				totalPages: Math.ceil(total / limitNum),
			},
		});
	} catch (error) {
		console.error('getArtisanReports failed:', error);
		return res.status(500).json({ message: 'Unable to load reports feed', error: error.message });
	}
};

/**
 * applyForReport
 * Atomically claims an unclaimed report for this artisan.
 * If report is already claimed, rejects with 409 and "Already claimed".
 */
const applyForReport = async (req, res) => {
	try {
		const userId = req.user?._id;
		const reportId = req.params.id;

		if (!userId) return res.status(401).json({ message: 'Authentication required' });
		if (!mongoose.Types.ObjectId.isValid(reportId)) {
			return res.status(400).json({ message: 'Invalid report ID' });
		}

		const now = new Date();
		// Atomic findOneAndUpdate ensuring only 1 artisan can claim
		const updatedReport = await Report.findOneAndUpdate(
			{
				_id: reportId,
				assignedArtisan: null,
				status: 'reported',
			},
			{
				$set: {
					assignedArtisan: userId,
					assignedAt: now,
					status: 'in_progress',
					inProgressAt: now,
				},
				$push: {
					updates: {
						type: 'STATUS_CHANGE',
						text: `Artisan ${req.user.name || 'assigned'} claimed this report and started resolution.`,
						author: req.user.name || 'Artisan',
						timestamp: now,
					},
				},
			},
			{ new: true }
		).lean();

		if (!updatedReport) {
			// Check if report exists and was claimed by someone else
			const existing = await Report.findById(reportId).select('assignedArtisan status').lean();
			if (!existing) {
				return res.status(404).json({ message: 'Report not found' });
			}
			if (existing.assignedArtisan) {
				return res.status(409).json({ message: 'This report has already been claimed by another artisan.' });
			}
			return res.status(400).json({ message: 'This report is not available for claim.' });
		}

		return res.status(200).json({
			success: true,
			message: 'Report claimed successfully. Status updated to In Progress.',
			report: {
				id: String(updatedReport._id),
				status: updatedReport.status,
				inProgressAt: updatedReport.inProgressAt,
				isClaimedByMe: true,
				isClaimedByOther: false,
				isUnclaimed: false,
			},
		});
	} catch (error) {
		console.error('applyForReport error:', error);
		return res.status(500).json({ message: 'Failed to claim report', error: error.message });
	}
};

/**
 * resolveReport
 * Marks a claimed report as Resolved by the assigned artisan.
 */
const resolveReport = async (req, res) => {
	try {
		const userId = req.user?._id;
		const reportId = req.params.id;

		if (!userId) return res.status(401).json({ message: 'Authentication required' });
		if (!mongoose.Types.ObjectId.isValid(reportId)) {
			return res.status(400).json({ message: 'Invalid report ID' });
		}

		const now = new Date();
		const updatedReport = await Report.findOneAndUpdate(
			{
				_id: reportId,
				assignedArtisan: userId,
				status: 'in_progress',
			},
			{
				$set: {
					status: 'resolved',
					resolvedAt: now,
					completedAt: now,
				},
				$push: {
					updates: {
						type: 'STATUS_CHANGE',
						text: `Job marked as resolved by artisan ${req.user.name || ''}.`,
						author: req.user.name || 'Artisan',
						timestamp: now,
					},
				},
			},
			{ new: true }
		).lean();

		if (!updatedReport) {
			const existing = await Report.findById(reportId).lean();
			if (!existing) return res.status(404).json({ message: 'Report not found' });
			if (String(existing.assignedArtisan) !== String(userId)) {
				return res.status(403).json({ message: 'You can only resolve reports assigned to you.' });
			}
			if (existing.status === 'resolved' || existing.status === 'closed') {
				return res.status(400).json({ message: 'Report is already marked as resolved or closed.' });
			}
			return res.status(400).json({ message: 'Cannot mark this report as resolved in its current state.' });
		}

		return res.status(200).json({
			success: true,
			message: 'Job marked as resolved successfully.',
			report: {
				id: String(updatedReport._id),
				status: updatedReport.status,
				resolvedAt: updatedReport.resolvedAt,
			},
		});
	} catch (error) {
		console.error('resolveReport error:', error);
		return res.status(500).json({ message: 'Failed to resolve report', error: error.message });
	}
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

module.exports = {
	registerArtisan,
	getDashboardSummary,
	getDebugCounts,
	getArtisanReports,
	applyForReport,
	resolveReport,
};
