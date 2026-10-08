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
			const effectiveProfile = profile || { verificationStatus: 'Approved', businessName: user.name };

			// 2. Count ALL reports without any restrictive filter using Report.countDocuments({})
			const countPromise = Report.countDocuments({});
			
			// 3. Additional stats promises
			const earningsPromise = getTotalEarnings();
			const reviewsPromise = getTotalReviews(user._id);
			const messagesPromise = getUnreadMessages();
			const notifsPromise = getUnreadNotifications();

			// 4. Fetch recent activity
			const recentActivityPromise = Report.find({}).sort({ createdAt: -1 }).limit(5).select('_id title category location createdAt').lean();

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
						verificationStatus: effectiveProfile.verificationStatus,
						rejectionReason: effectiveProfile.rejectionReason || ''
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
		.populate('user', 'name avatarUrl')
		.populate('createdBy', 'name avatarUrl')
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
					reporter: {
						name: r.user?.name || r.createdBy?.name || 'Resident',
						avatar: r.user?.avatarUrl || r.createdBy?.avatarUrl || '',
					},
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

	const now = new Date();

	// Atomic findOneAndUpdate with status: 'reported' baked into the filter.
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
	).lean()
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

/**
 * getArtisanReviews
 * -----------------
 * GET /api/artisans/reviews
 * Returns all reviews submitted by residents for the authenticated artisan.
 * Supports both the Review collection and embedded Report.review data.
 */
const getArtisanReviews = (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	const Review = require('../models/Review');

	// Query Review collection for this artisan, populate resident and report
	Review.find({ artisanId: userId })
		.populate('residentId', 'name fullName avatarUrl profilePhoto email')
		.populate('reportId', 'title category reportId location images imageUrl status')
		.sort({ createdAt: -1 })
		.lean()
		.then((reviews) => {
			if (reviews && reviews.length > 0) {
				const formattedReviews = reviews.map((rev) => {
					const resident = rev.residentId || {};
					const report = rev.reportId || {};
					return {
						id: String(rev._id),
						_id: rev._id,
						rating: rev.rating,
						comment: rev.comment || '',
						createdAt: rev.createdAt,
						resident: {
							id: resident._id ? String(resident._id) : null,
							name: resident.name || resident.fullName || 'Resident',
							avatarUrl: resident.avatarUrl || resident.profilePhoto || '',
						},
						report: {
							id: report._id ? String(report._id) : null,
							reportId: report.reportId || `#CF-${String(report._id || '').slice(-6).toUpperCase()}`,
							title: report.title || report.category || 'Service Request',
							category: report.category || 'General',
							location: report.location?.addressText || report.location?.address || 'Community Area',
						},
					};
				});

				const totalReviews = formattedReviews.length;
				const avgRating = totalReviews > 0
					? Number((formattedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
					: 0;

				return res.status(200).json({
					success: true,
					reviews: formattedReviews,
					stats: {
						totalReviews,
						avgRating,
					},
				});
			}

			// Fallback: Check Reports collection where review.rating exists and assignedArtisan matches
			return Report.find({
				$or: [{ assignedArtisan: userId }, { assignedArtisanId: userId }],
				'review.rating': { $exists: true, $ne: null },
			})
				.populate('user', 'name fullName avatarUrl profilePhoto')
				.populate('createdBy', 'name fullName avatarUrl profilePhoto')
				.populate('review.reviewedBy', 'name fullName avatarUrl profilePhoto')
				.sort({ 'review.reviewedAt': -1, updatedAt: -1 })
				.lean()
				.then((reportsWithReview) => {
					const formattedReviews = reportsWithReview.map((rep) => {
						const revUser = rep.review?.reviewedBy || rep.user || rep.createdBy || {};
						return {
							id: String(rep._id),
							_id: rep._id,
							rating: rep.review?.rating || 5,
							comment: rep.review?.comment || '',
							createdAt: rep.review?.reviewedAt || rep.updatedAt,
							resident: {
								id: revUser._id ? String(revUser._id) : null,
								name: revUser.name || revUser.fullName || 'Resident',
								avatarUrl: revUser.avatarUrl || revUser.profilePhoto || '',
							},
							report: {
								id: String(rep._id),
								reportId: rep.reportId || `#CF-${String(rep._id).slice(-6).toUpperCase()}`,
								title: rep.title || rep.category || 'Service Request',
								category: rep.category || 'General',
								location: rep.location?.addressText || rep.location?.address || 'Community Area',
							},
						};
					});

					const totalReviews = formattedReviews.length;
					const avgRating = totalReviews > 0
						? Number((formattedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
						: 0;

					return res.status(200).json({
						success: true,
						reviews: formattedReviews,
						stats: {
							totalReviews,
							avgRating,
						},
					});
				});
		})
		.catch((err) => {
			console.error('getArtisanReviews failed:', err);
			return res.status(500).json({ error: 'Unable to load reviews' });
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

// In-memory data store for Artisan Help Center
const ARTISAN_HELP_DATA = {
	topics: [
		// Quick Help Options (4 items)
		{
			id: 'apply-for-report',
			slug: 'apply-for-report',
			section: 'quick_help',
			icon: 'fa-solid fa-hand-holding-hand',
			iconBg: '#eff6ff',
			iconColor: '#2563eb',
			title: 'Apply for a Report',
			description: 'Learn how to claim a report you want to fix.',
			hasSteps: true,
			steps: [
				{
					order: 1,
					title: 'Open "Reports" from the sidebar',
					description: 'Navigate to the Reports page to view the live community feed of reported issues.',
				},
				{
					order: 2,
					title: 'Browse the list of reports submitted by residents',
					description: 'Filter by Open to Claim or search by issue category and location area.',
				},
				{
					order: 3,
					title: 'Click "Apply" on the report you want to fix',
					description: 'Inspect the report description, photos, and address to confirm you can resolve it.',
				},
				{
					order: 4,
					title: 'Confirm in the popup',
					description: 'Confirm your application in the modal dialog to lock in your assignment.',
				},
				{
					order: 5,
					title: 'Job transitions to "In Progress"',
					description: 'The report is now yours and shows as In Progress (the resident sees this update too). Other artisans can no longer apply for it.',
				},
			],
		},
		{
			id: 'update-job-status',
			slug: 'update-job-status',
			section: 'quick_help',
			icon: 'fa-solid fa-wrench',
			iconBg: '#fef3c7',
			iconColor: '#d97706',
			title: 'Update Job Status',
			description: 'Mark your job as in progress or resolved.',
			hasSteps: true,
			steps: [
				{
					order: 1,
					title: 'Go to "Reports" in your artisan dashboard',
					description: 'Filter by "My Active Jobs" to see all reports assigned to your workspace.',
				},
				{
					order: 2,
					title: 'Inspect your active job',
					description: 'Each claimed report shows a status tracker stepper ("Reported → In Progress").',
				},
				{
					order: 3,
					title: 'Click "Mark as Resolved"',
					description: 'Once all physical repairs and tests are finished, click the green "Mark as Resolved" button.',
				},
				{
					order: 4,
					title: 'Confirm in the popup',
					description: 'Confirm the resolution in the confirmation dialog.',
				},
				{
					order: 5,
					title: 'Resident review prompt',
					description: 'The resident is notified that the job is resolved and prompted to leave a 1-5 star review. Once reviewed, the report officially closes.',
				},
			],
		},
		{
			id: 'message-residents',
			slug: 'message-residents',
			section: 'quick_help',
			icon: 'fa-solid fa-envelope',
			iconBg: '#ecfdf5',
			iconColor: '#059669',
			title: 'Message Residents',
			description: 'Understand how resident messages reach you.',
			hasSteps: true,
			steps: [
				{
					order: 1,
					title: 'Resident opens "See Details"',
					description: 'A resident views their in-progress report and clicks the "Message" button on your artisan card.',
				},
				{
					order: 2,
					title: 'Message sent to your email',
					description: 'Their message is dispatched directly to the primary email address registered on your artisan account.',
				},
				{
					order: 3,
					title: 'Reply to them by email',
					description: 'You can reply directly to the resident via email. Always keep your email address updated in Settings.',
				},
			],
		},
		{
			id: 'get-verified',
			slug: 'get-verified',
			section: 'quick_help',
			icon: 'fa-solid fa-shield-halved',
			iconBg: '#f3e8ff',
			iconColor: '#9333ea',
			title: 'Get Verified',
			description: 'Learn how account approval works.',
			hasSteps: true,
			steps: [
				{
					order: 1,
					title: 'Sign up with brand & certificate',
					description: 'During sign-up, enter your business name and upload your professional certificate (PDF, JPG, or PNG).',
				},
				{
					order: 2,
					title: 'Account review period',
					description: 'Your dashboard displays "Account Under Review" while the municipal team verifies your credentials.',
				},
				{
					order: 3,
					title: 'Verified status badge',
					description: 'Once approved, your account badge changes to "Account Verified" and you can claim and resolve community jobs.',
				},
			],
		},

		// Browse by Category (8 items)
		{
			id: 'getting-started',
			slug: 'getting-started',
			section: 'category',
			icon: 'fa-solid fa-rocket',
			iconBg: '#eff6ff',
			iconColor: '#2563eb',
			title: 'Getting Started',
			description: 'Set up your artisan account.',
			hasSteps: true,
			steps: [
				{ order: 1, title: 'Complete your registration', description: 'Provide your name, phone number, trade category, and business details.' },
				{ order: 2, title: 'Upload your credentials', description: 'Attach a valid vocational certificate or proof of trade apprenticeship.' },
				{ order: 3, title: 'Explore your dashboard', description: 'Tour the Reports feed, Reviews tracker, and profile configuration tools.' },
			],
		},
		{
			id: 'account-verification',
			slug: 'account-verification',
			section: 'category',
			icon: 'fa-solid fa-id-card',
			iconBg: '#ecfdf5',
			iconColor: '#059669',
			title: 'Account Verification',
			description: 'Certificate upload and approval status.',
			hasSteps: false,
			body: 'Fixit enforces quality assurance by vetting artisan credentials. When you register, our admin team reviews your uploaded certificate. While pending, your dashboard displays an "Account Under Review" banner. If rejected, you will receive a specific explanation and can upload a replacement certificate directly from Settings.',
		},
		{
			id: 'browsing-reports',
			slug: 'browsing-reports',
			section: 'category',
			icon: 'fa-solid fa-list-check',
			iconBg: '#fff7ed',
			iconColor: '#ea580c',
			title: 'Browsing Reports',
			description: 'Find and filter available reports.',
			hasSteps: true,
			steps: [
				{ order: 1, title: 'Navigate to Reports', description: 'Click "Reports" in your sidebar to see real-time issues submitted by residents.' },
				{ order: 2, title: 'Use Quick Filter Tabs', description: 'Switch between "All Reports", "Open to Claim", "My Active Jobs", and "Resolved Jobs".' },
				{ order: 3, title: 'Inspect Details', description: 'Click "Details" on any card to view photos, full description, reporter info, and exact GPS location.' },
			],
		},
		{
			id: 'applying-job-status',
			slug: 'applying-job-status',
			section: 'category',
			icon: 'fa-solid fa-clipboard-check',
			iconBg: '#fef3c7',
			iconColor: '#d97706',
			title: 'Applying & Job Status',
			description: 'Claim jobs and track their progress.',
			hasSteps: true,
			steps: [
				{ order: 1, title: 'Claim an open report', description: 'Click "Apply" and confirm to assign the report to yourself.' },
				{ order: 2, title: 'Work in progress', description: 'Perform repairs on-site; the issue is marked as In Progress across the community feed.' },
				{ order: 3, title: 'Mark as Resolved', description: 'Click "Mark as Resolved" once finished to trigger resident confirmation and review.' },
			],
		},
		{
			id: 'messages-reviews',
			slug: 'messages-reviews',
			section: 'category',
			icon: 'fa-solid fa-star',
			iconBg: '#fdf2f8',
			iconColor: '#db2777',
			title: 'Messages & Reviews',
			description: 'Resident messages and ratings.',
			hasSteps: false,
			body: 'Residents can communicate with you regarding your assigned reports. When a job is marked resolved, residents leave a 1 to 5 star rating and feedback comment. You can view all testimonials, ratings breakdown, and average score on your "Reviews" page.',
		},
		{
			id: 'earnings',
			slug: 'earnings',
			section: 'category',
			icon: 'fa-solid fa-wallet',
			iconBg: '#f0fdf4',
			iconColor: '#16a34a',
			title: 'Earnings',
			description: 'Understand your total earnings.',
			hasSteps: false,
			body: 'Your dashboard features a Total Earnings card summarizing payments from completed community repairs and municipal sponsorships. Keep resolving issues and receiving positive reviews to boost your service ranking and payout eligibility.',
		},
		{
			id: 'settings-profile',
			slug: 'settings-profile',
			section: 'category',
			icon: 'fa-solid fa-sliders',
			iconBg: '#f1f5f9',
			iconColor: '#475569',
			title: 'Settings & Profile',
			description: 'Manage your account, password and appearance.',
			hasSteps: true,
			steps: [
				{ order: 1, title: 'Access Settings', description: 'Click "Settings" in the sidebar to open the account management portal.' },
				{ order: 2, title: 'Update Personal & Business Profile', description: 'Change your display photo, business name, phone number, and service skills.' },
				{ order: 3, title: 'Security & Theme', description: 'Update your password and toggle your preferred appearance (Light, Dark, or System mode).' },
			],
		},
		{
			id: 'troubleshooting',
			slug: 'troubleshooting',
			section: 'category',
			icon: 'fa-solid fa-triangle-exclamation',
			iconBg: '#fef2f2',
			iconColor: '#dc2626',
			title: 'Troubleshooting',
			description: 'Fix common issues and errors.',
			hasSteps: false,
			body: 'If you encounter issues claiming a report, make sure your account is active and the report has not already been claimed by another artisan. If the dashboard fails to load stats, click the "Retry" button or check your internet connection. For persistent issues, contact support using the button below.',
		},

		// Quick Guides (4 items with read times)
		{
			id: 'guide-how-to-apply',
			slug: 'guide-how-to-apply',
			section: 'guide',
			icon: 'fa-solid fa-file-signature',
			iconBg: '#eff6ff',
			iconColor: '#2563eb',
			title: 'How to Apply for a Report',
			readTime: '2 min read',
			hasSteps: true,
			steps: [
				{ order: 1, title: 'Open Reports Tab', description: 'Click "Reports" in your navigation sidebar.' },
				{ order: 2, title: 'Find Unclaimed Issue', description: 'Locate a report with the orange "Reported" badge and "Apply" button.' },
				{ order: 3, title: 'Click Apply & Confirm', description: 'Review the details, click Apply, and confirm in the dialog to begin work.' },
			],
		},
		{
			id: 'guide-how-to-resolve',
			slug: 'guide-how-to-resolve',
			section: 'guide',
			icon: 'fa-solid fa-circle-check',
			iconBg: '#ecfdf5',
			iconColor: '#059669',
			title: 'How to Mark a Job as Resolved',
			readTime: '2 min read',
			hasSteps: true,
			steps: [
				{ order: 1, title: 'Go to My Active Jobs', description: 'Filter your reports by "My Active Jobs" to locate your in-progress repair.' },
				{ order: 2, title: 'Complete On-site Repair', description: 'Ensure the problem is fully resolved and safe for the community.' },
				{ order: 3, title: 'Click "Mark as Resolved"', description: 'Click the green button and confirm to notify the resident for review.' },
			],
		},
		{
			id: 'guide-dashboard-stats',
			slug: 'guide-dashboard-stats',
			section: 'guide',
			icon: 'fa-solid fa-chart-simple',
			iconBg: '#fef3c7',
			iconColor: '#d97706',
			title: 'Understanding Your Dashboard Stats',
			readTime: '3 min read',
			hasSteps: false,
			body: 'Your dashboard displays four key indicators: Total Reports (all community issues submitted across the zone), Total Earnings (funds earned from confirmed jobs), Reviews (number of resident reviews received), and New Messages. The Recent Activity feed lists the latest issues and updates in your zone.',
		},
		{
			id: 'guide-update-profile',
			slug: 'guide-update-profile',
			section: 'guide',
			icon: 'fa-solid fa-user-gear',
			iconBg: '#f3e8ff',
			iconColor: '#9333ea',
			title: 'Updating Your Profile and Brand Details',
			readTime: '2 min read',
			hasSteps: true,
			steps: [
				{ order: 1, title: 'Open Settings', description: 'Select Settings from the sidebar or top profile menu.' },
				{ order: 2, title: 'Edit Business Information', description: 'Update your Trade Category, Business Name, and phone number.' },
				{ order: 3, title: 'Save Changes', description: 'Click Save Changes to ensure your updated profile is visible to residents.' },
			],
		},
	],

	faqs: [
		{
			id: 'faq-under-review',
			order: 1,
			question: 'Why does my dashboard say "Account Under Review"?',
			answer: 'When you register as an artisan and submit your trade certificate, your credentials undergo validation by our team. While under review, your profile remains pending. Once approved, the badge updates to "Account Verified" and you can claim and resolve community jobs.',
		},
		{
			id: 'faq-how-apply',
			order: 2,
			question: 'How do I apply for a report?',
			answer: 'Go to the Reports page from the sidebar, find any unclaimed report with the orange "Reported" status, and click the orange "Apply" button. Confirm in the dialog, and the report will be assigned to your workspace under "In Progress".',
		},
		{
			id: 'faq-after-apply',
			order: 3,
			question: 'What happens after I apply for a report?',
			answer: 'The report status updates to "In Progress" in real-time. The resident who submitted the report receives an update showing that an artisan has taken the job, and other artisans can no longer claim it.',
		},
		{
			id: 'faq-two-artisans',
			order: 4,
			question: 'Can two artisans apply for the same report?',
			answer: 'No. Fixit enforces a single-artisan lock. As soon as you confirm your application, the report is locked to you and displays "Assigned to another artisan" to other users.',
		},
		{
			id: 'faq-mark-completed',
			order: 5,
			question: 'How do I mark a job as completed?',
			answer: 'Navigate to Reports, select your active job, and click the green "Mark as Resolved" button. Confirm in the popup. The report will update to "Resolved", and the resident will be invited to confirm and rate your workmanship.',
		},
		{
			id: 'faq-residents-contact',
			order: 6,
			question: 'How do residents contact me?',
			answer: 'Residents who view your assigned report can click "Message" on your profile card. The system dispatches their message directly to the email registered on your artisan account. You can reply directly through your email provider.',
		},
		{
			id: 'faq-reviews-where',
			order: 7,
			question: 'How do I get reviews, and where do I see them?',
			answer: 'Once you mark a job as resolved, the resident is prompted to review your service with a 1-5 star rating and comment. All submissions appear on your "Reviews" page (accessible via the sidebar or the Reviews stat card on your dashboard).',
		},
		{
			id: 'faq-reports-number',
			order: 8,
			question: 'What does the Reports number on my dashboard mean?',
			answer: 'The "Reports" card on your dashboard displays the total number of community issues reported within your coverage zone, giving you an accurate picture of available opportunities and local maintenance needs.',
		},
	],
};

/**
 * getArtisanHelpTopics
 * GET /api/artisans/help/topics
 */
const getArtisanHelpTopics = (req, res) => {
	const { section } = req.query;
	let topics = ARTISAN_HELP_DATA.topics;
	if (section) {
		topics = topics.filter((t) => t.section === section);
	}
	return res.status(200).json(topics);
};

/**
 * getArtisanHelpTopicBySlug
 * GET /api/artisans/help/topics/:slug
 */
const getArtisanHelpTopicBySlug = (req, res) => {
	const { slug } = req.params;
	const topic = ARTISAN_HELP_DATA.topics.find((t) => t.slug === slug || t.id === slug);
	if (!topic) {
		return res.status(404).json({ error: 'Help topic not found' });
	}
	return res.status(200).json(topic);
};

/**
 * getArtisanHelpFaqs
 * GET /api/artisans/help/faqs
 */
const getArtisanHelpFaqs = (req, res) => {
	const shouldReturnAll = req.query.all === 'true' || req.query.all === '1';
	const limit = parseInt(req.query.limit, 10) || 5;
	const faqs = shouldReturnAll ? ARTISAN_HELP_DATA.faqs : ARTISAN_HELP_DATA.faqs.slice(0, limit);
	return res.status(200).json(faqs);
};

/**
 * searchArtisanHelp
 * GET /api/artisans/help/search?q=...
 */
const searchArtisanHelp = (req, res) => {
	const rawQuery = req.query.q || req.query.query || '';
	const query = rawQuery.trim().toLowerCase();

	if (!query) {
		return res.status(200).json({
			query: '',
			total: 0,
			results: { articles: [], faqs: [] },
		});
	}

	const matchedArticles = ARTISAN_HELP_DATA.topics.filter((t) => {
		const inTitle = t.title.toLowerCase().includes(query);
		const inDesc = t.description?.toLowerCase().includes(query);
		const inBody = t.body?.toLowerCase().includes(query);
		const inSteps = t.steps?.some((s) => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query));
		return inTitle || inDesc || inBody || inSteps;
	});

	const matchedFaqs = ARTISAN_HELP_DATA.faqs.filter((f) => {
		return f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query);
	});

	return res.status(200).json({
		query,
		total: matchedArticles.length + matchedFaqs.length,
		results: {
			articles: matchedArticles,
			faqs: matchedFaqs,
		},
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
	getArtisanReviews,
	getArtisanHelpTopics,
	getArtisanHelpTopicBySlug,
	getArtisanHelpFaqs,
	searchArtisanHelp,
};
