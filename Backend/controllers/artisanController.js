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
 * getArtisanDashboardStats
 * ------------------------
 * GET /api/artisan/dashboard/stats
 * Auth: artisan role
 * Returns: { totalReports, totalEarnings, reviewCount, newMessageCount }
 * Uses .then()/.catch() promise chaining.
 */
const getArtisanDashboardStats = (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	const Message = require('../models/Message');
	const Review = require('../models/Review');

	// 1. Total reports system/zone-wide count (unaffected by claims)
	const totalReportsPromise = Report.countDocuments({});

	// 2. Review count for this artisan (or read from denormalized User.reviewCount)
	const reviewCountPromise = Review.countDocuments({ artisanId: userId });

	// 3. New message count for this artisan
	const newMessageCountPromise = Message.countDocuments({ toArtisanId: userId });

	// 4. Total earnings
	const totalEarningsPromise = Promise.resolve(0);

	return Promise.all([
		totalReportsPromise,
		totalEarningsPromise,
		reviewCountPromise,
		newMessageCountPromise,
	])
		.then(([totalReports, totalEarnings, reviewCount, newMessageCount]) => {
			return res.status(200).json({
				totalReports,
				totalEarnings,
				reviewCount,
				newMessageCount,
			});
		})
		.catch((error) => {
			console.error('getArtisanDashboardStats failed:', error);
			return res.status(500).json({ error: 'Unable to load artisan dashboard stats' });
		});
};

/**
 * getArtisanReports
 * -----------------
 * Returns all reports visible to artisans with claim states and optional filters (status, category).
 * Uses Promise chaining (.then/.catch) to retrieve and format reports.
 */
const getArtisanReports = (req, res) => {
	const userId = req.user?._id;
	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	const { status, category, filter = 'all', page = 1, limit = 20 } = req.query;
	const pageNum = parseInt(page, 10) || 1;
	const limitNum = parseInt(limit, 10) || 20;

	// Build query conditions
	const query = {};
	if (category && category.trim()) {
		query.category = new RegExp(`^${category.trim()}$`, 'i');
	}
	if (status && status.trim()) {
		query.status = status.trim().toLowerCase();
	} else if (filter === 'unclaimed') {
		query.$or = [{ assignedArtisan: null }, { assignedArtisanId: null }];
		query.status = 'reported';
	} else if (filter === 'my_jobs') {
		query.$or = [{ assignedArtisan: userId }, { assignedArtisanId: userId }];
	} else if (filter === 'resolved') {
		query.$or = [{ assignedArtisan: userId }, { assignedArtisanId: userId }];
		query.status = { $in: ['resolved', 'closed'] };
	}

	const countPromise = Report.countDocuments(query);
	const totalAllReportsPromise = Report.countDocuments({});
	const reportsPromise = Report.find(query)
		.sort({ createdAt: -1 })
		.skip((pageNum - 1) * limitNum)
		.limit(limitNum)
		.lean();

	return Promise.all([countPromise, totalAllReportsPromise, reportsPromise])
		.then(([total, totalAllReports, reports]) => {
			const mappedReports = reports.map((r) => {
				const assignedId = r.assignedArtisanId ? String(r.assignedArtisanId) : (r.assignedArtisan ? String(r.assignedArtisan) : null);
				const isClaimedByMe = assignedId === String(userId);
				const isClaimedByOther = assignedId !== null && !isClaimedByMe;
				const isUnclaimed = !assignedId && r.status === 'reported';

				return {
					id: String(r._id),
					_id: r._id,
					reportId: r.reportId || `#CF-${String(r._id).slice(-6).toUpperCase()}`,
					title: r.title || r.category || 'Report',
					description: r.description || '',
					category: r.category || 'General',
					severity: r.severity || 'Medium',
					status: r.status,
					assignedArtisanId: assignedId,
					assignedArtisan: assignedId,
					location: {
						address: r.location?.addressText || r.location?.address || 'Location unavailable',
						lat: r.location?.lat,
						lng: r.location?.lng,
					},
					reportedAt: r.reportedAt || r.createdAt,
					appliedAt: r.appliedAt || r.assignedAt || null,
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
		})
		.catch((error) => {
			console.error('getArtisanReports failed:', error);
			return res.status(500).json({ error: 'Unable to load reports feed' });
		});
};

/**
 * applyForReport
 * --------------
 * POST /api/artisan/reports/:id/apply
 * Auth: artisan role required; artisan account must be approved/verified.
 *
 * ATOMIC CLAIM:
 * We fold the "is this still unclaimed?" check directly into the findOneAndUpdate's filter
 * (status: 'reported') instead of reading the report first and checking in application code.
 * That read-then-write pattern has a race condition where two artisans could both pass the
 * check before either writes. Doing it atomically in one DB operation guarantees only the
 * first request can possibly succeed. The second request returns null and receives a 409
 * "Report already claimed" response.
 */
const applyForReport = (req, res) => {
	const userId = req.user?._id || req.user?.id;
	const reportId = req.params.id;

	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	if (!mongoose.Types.ObjectId.isValid(reportId)) {
		return res.status(400).json({ error: 'Invalid report ID' });
	}

	// 1. Verify artisan account is approved/verified (not "Pending" or "Rejected")
	return ArtisanProfile.findOne({ user: userId }).lean()
		.then((profile) => {
			if (!profile) {
				return res.status(404).json({ error: 'Artisan profile not found' });
			}
			const status = String(profile.verificationStatus || '').toLowerCase();
			if (status !== 'approved') {
				return res.status(403).json({
					error: 'Your artisan account is still under review or unapproved. Only approved artisans can claim reports.',
					verificationStatus: profile.verificationStatus,
				});
			}

			const now = new Date();

			// 2. Atomic findOneAndUpdate with status: 'reported' baked into the filter.
			// This prevents race conditions when multiple artisans claim concurrently.
			return Report.findOneAndUpdate(
				{
					_id: reportId,
					status: 'reported',
				},
				{
					$set: {
						status: 'in_progress',
						assignedArtisanId: userId,
						assignedArtisan: userId,
						appliedAt: now,
						assignedAt: now,
						inProgressAt: now,
					},
					$push: {
						updates: {
							type: 'STATUS_CHANGE',
							text: `Artisan ${req.user.name || 'assigned'} claimed this report. Job status is now In Progress.`,
							author: req.user.name || 'Artisan',
							timestamp: now,
						},
					},
				},
				{ new: true }
			).lean();
		})
		.then((report) => {
			// If response already handled (e.g. 403 unapproved), return early
			if (res.headersSent) return null;

			if (!report) {
				// null here means either the report does not exist or was claimed already
				return Report.findById(reportId).select('assignedArtisanId assignedArtisan status').lean()
					.then((existing) => {
						if (!existing) {
							return res.status(404).json({ error: 'Report not found' });
						}
						return res.status(409).json({
							error: 'Report already claimed',
							message: 'This report has already been claimed by another artisan.',
						});
					});
			}

			// Atomic update succeeded
			return res.status(200).json({
				success: true,
				message: 'Report claimed successfully. Status updated to In Progress.',
				report: {
					id: String(report._id),
					_id: report._id,
					status: report.status,
					assignedArtisanId: String(report.assignedArtisanId || report.assignedArtisan),
					appliedAt: report.appliedAt,
					inProgressAt: report.inProgressAt,
				},
			});
		})
		.catch((err) => {
			console.error('Report apply failed:', err);
			if (!res.headersSent) {
				return res.status(500).json({ error: 'Unable to apply for report' });
			}
		});
};

/**
 * updateReportStatus
 * ------------------
 * PATCH /api/artisan/reports/:id/status
 * Auth: artisan role, must be THIS report's assignedArtisanId.
 * Body: { status: 'resolved' } (only this transition allowed from artisan).
 * Strictly enforces in_progress → resolved; notifies resident on success.
 */
const updateReportStatus = (req, res) => {
	const userId = req.user?._id || req.user?.id;
	const reportId = req.params.id;
	const { status } = req.body;

	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	if (!mongoose.Types.ObjectId.isValid(reportId)) {
		return res.status(400).json({ error: 'Invalid report ID' });
	}

	// Artisans are strictly restricted to transitioning to 'resolved'
	if (status !== 'resolved') {
		return res.status(400).json({
			error: "Invalid status transition. Artisans may only mark jobs as 'resolved'.",
		});
	}

	const now = new Date();

	// Step 1: Verify report ownership and valid current status 'in_progress'
	return Report.findOne({ _id: reportId }).lean()
		.then((report) => {
			if (!report) {
				return res.status(404).json({ error: 'Report not found' });
			}

			const assigned = String(report.assignedArtisanId || report.assignedArtisan || '');
			if (assigned !== String(userId)) {
				return res.status(403).json({
					error: 'Forbidden. You are not the assigned artisan for this report.',
				});
			}

			// Validate transition is from current status in_progress only
			if (report.status !== 'in_progress') {
				return res.status(400).json({
					error: `Cannot resolve report. Current status is '${report.status}', but must be 'in_progress'.`,
				});
			}

			// Step 2: Atomic update to resolved
			return Report.findOneAndUpdate(
				{
					_id: reportId,
					status: 'in_progress',
					$or: [{ assignedArtisanId: userId }, { assignedArtisan: userId }],
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
							text: `Job marked as resolved by artisan ${req.user.name || ''}. Waiting for resident review.`,
							author: req.user.name || 'Artisan',
							timestamp: now,
						},
					},
				},
				{ new: true }
			).lean();
		})
		.then((updatedReport) => {
			if (res.headersSent || !updatedReport) return null;

			// Step 3: Trigger resolution notification to resident
			User.findById(updatedReport.createdBy || updatedReport.user).select('name email').lean()
				.then((residentUser) => {
					if (residentUser && residentUser.email) {
						const { sendResolutionNoticeEmail } = require('../services/emailService');
						sendResolutionNoticeEmail({
							residentEmail: residentUser.email,
							residentName: residentUser.name,
							reportTitle: updatedReport.title || updatedReport.category,
							reportId: updatedReport.reportId || `#CF-${String(updatedReport._id).slice(-6).toUpperCase()}`,
							artisanName: req.user?.name || 'Your assigned artisan',
						}).catch((emailErr) => console.error('Resolution notice email failed:', emailErr.message));
					}
				})
				.catch((err) => console.error('Resident lookup for notice failed:', err.message));

			return res.status(200).json({
				success: true,
				message: 'Job marked as resolved successfully.',
				report: {
					id: String(updatedReport._id),
					_id: updatedReport._id,
					status: updatedReport.status,
					resolvedAt: updatedReport.resolvedAt,
				},
			});
		})
		.catch((err) => {
			console.error('updateReportStatus failed:', err);
			if (!res.headersSent) {
				return res.status(500).json({ error: 'Unable to update report status' });
			}
		});
};

/**
 * resolveReport (backward compatible alias for updateReportStatus)
 */
const resolveReport = (req, res) => {
	req.body.status = 'resolved';
	return updateReportStatus(req, res);
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
	getArtisanDashboardStats,
	getDebugCounts,
	getArtisanReports,
	applyForReport,
	updateReportStatus,
	resolveReport,
};
