const Report = require('../models/Report');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');
const {
	CATEGORY_GROUPS,
	getStartOfCurrentMonth,
	getAuthorName,
	getInitials,
	getTimeAgo,
	getTimeframeStart,
} = require('../utils/reportDataUtils');

const percentage = (count, total) => (total ? Math.round((count / total) * 100) : 0);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const getBreakdown = (counts, total, labels) => labels.map((label) => ({
	name: label,
	count: counts[label] || 0,
	percentage: percentage(counts[label] || 0, total),
}));
const expandCategories = (values) => values.flatMap((value) => CATEGORY_GROUPS[value] || [value]);
const getCoordinates = (coordinates) => {
	if (Array.isArray(coordinates) && coordinates.length >= 2) return { lat: coordinates[1], lng: coordinates[0] };
	if (coordinates && Number.isFinite(Number(coordinates.lat)) && Number.isFinite(Number(coordinates.lng))) {
		return { lat: Number(coordinates.lat), lng: Number(coordinates.lng) };
	}
	return null;
};

const getCommunityOverview = (req, res) => {
	const requestedTimeframe = req.query.timeframe || 'this_month';
	const validTimeframes = ['today', 'this_week', 'this_month', 'this_year', 'all_time'];
	const timeframe = validTimeframes.includes(requestedTimeframe) ? requestedTimeframe : 'this_month';
	const startDate = getTimeframeStart(timeframe);
	const reportFilter = startDate ? { createdAt: { $gte: startDate } } : {};

	// Count total reports for timeframe
	const totalReportsPromise = Report.countDocuments(reportFilter);

	// Verified issues: reports that have community confirmations or are verified
	const verifiedReportsPromise = Report.countDocuments({
		...reportFilter,
		$or: [
			{ 'confirmedBy.0': { $exists: true } },
			{ status: { $in: ['verified', 'Verified'] } },
		],
	});

	// In Progress: active artisan work
	const inProgressReportsPromise = Report.countDocuments({
		...reportFilter,
		status: { $in: ['in_progress', 'In Progress', 'in progress'] },
	});

	// Resolved: resolved or closed reports
	const resolvedReportsPromise = Report.countDocuments({
		...reportFilter,
		status: { $in: ['resolved', 'Resolved', 'closed', 'Closed'] },
	});

	// Active community members
	const activeUsersPromise = User.countDocuments({ isActive: { $ne: false } });

	// Issues by severity aggregation
	const severityCountsPromise = Report.aggregate([
		{ $match: reportFilter },
		{ $group: { _id: '$severity', count: { $sum: 1 } } },
	]);

	// Issues by status aggregation
	const statusCountsPromise = Report.aggregate([
		{ $match: reportFilter },
		{ $group: { _id: '$status', count: { $sum: 1 } } },
	]);

	// Top issue categories aggregation
	const topCategoriesPromise = Report.aggregate([
		{ $match: reportFilter },
		{ $match: { category: { $nin: ['', null] } } },
		{ $group: { _id: '$category', count: { $sum: 1 } } },
		{ $sort: { count: -1, _id: 1 } },
		{ $limit: 5 },
	]);

	// Most active areas aggregation
	const activeAreasPromise = Report.aggregate([
		{ $match: { ...reportFilter, 'location.address': { $nin: ['', null] } } },
		{ $group: { _id: '$location.address', count: { $sum: 1 } } },
		{ $sort: { count: -1, _id: 1 } },
		{ $limit: 5 },
	]);

	return Promise.all([
		totalReportsPromise,
		verifiedReportsPromise,
		inProgressReportsPromise,
		resolvedReportsPromise,
		activeUsersPromise,
		severityCountsPromise,
		statusCountsPromise,
		topCategoriesPromise,
		activeAreasPromise,
	])
		.then(([totalReports, verifiedReports, inProgressReports, resolvedReports, activeUsers, severityCounts, statusCounts, topCategories, activeAreas]) => {
			const severities = Object.fromEntries(severityCounts.map(({ _id, count }) => [_id, count]));
			const statuses = Object.fromEntries(statusCounts.map(({ _id, count }) => [String(_id).toLowerCase(), count]));

			const normalizedInProgress = (statuses['in_progress'] || 0) + (statuses['in progress'] || 0);
			const normalizedResolved = (statuses['resolved'] || 0) + (statuses['closed'] || 0);

			return res.status(200).json({
				timeframe,
				metrics: {
					totalReports,
					verifiedReports,
					inProgressReports,
					resolvedReports,
					activeUsers,
				},
				issuesBySeverity: getBreakdown(severities, totalReports, ['High', 'Medium', 'Low']),
				issuesByStatus: [
					{ name: 'In Progress', count: normalizedInProgress, percentage: percentage(normalizedInProgress, totalReports) },
					{ name: 'Resolved', count: normalizedResolved, percentage: percentage(normalizedResolved, totalReports) },
				],
				topIssueCategories: topCategories.map(({ _id, count }) => ({ category: _id, count })),
				mostActiveAreas: activeAreas.map(({ _id, count }) => ({ location: _id, totalLoggedIssues: count })),
			});
		})
		.catch((error) => {
			console.error('getCommunityOverview error:', error);
			return res.status(500).json({ message: 'Unable to load community overview', error: error.message });
		});
};

const getMapReports = async (req, res) => {
	try {
		const { search, category = 'All', severity } = req.query;
		const filters = [];
		if (search?.trim()) {
			const searchValue = search.trim();
			const searchPattern = escapeRegex(searchValue);
			const searchConditions = [{ title: { $regex: searchPattern, $options: 'i' } }, { 'location.address': { $regex: searchPattern, $options: 'i' } }];
			if (mongoose.Types.ObjectId.isValid(searchValue)) searchConditions.push({ _id: searchValue });
			filters.push({ $or: searchConditions });
		}
		if (category !== 'All') filters.push({ category: { $in: CATEGORY_GROUPS[category] || [category] } });
		if (severity) filters.push({ severity });
		const reports = await Report.find(filters.length ? { $and: filters } : {})
			.select('_id title description category severity status location createdAt')
			.sort({ createdAt: -1 })
			.lean();
		return res.json(reports
			.map((report) => ({ report, coordinates: getCoordinates(report.location?.coordinates) }))
			.filter(({ coordinates }) => coordinates)
			.map(({ report, coordinates }) => ({
				_id: report._id, title: report.title, description: report.description, category: report.category, severity: report.severity, status: report.status,
				location: { ...coordinates, address: report.location.address || '' }, createdAt: report.createdAt,
			})));
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load map reports', error: error.message });
	}
};

const getHomeData = (req, res) => {
	const startOfMonth = getStartOfCurrentMonth();

	// Resolved & closed issues count
	const resolvedCountPromise = Report.countDocuments({
		status: { $in: ['resolved', 'Resolved', 'closed', 'Closed'] },
	});

	// Total active users
	const membersCountPromise = User.countDocuments({ isActive: { $ne: false } });

	// Distinct neighborhoods with reports
	const neighborhoodsPromise = Report.distinct('location.address', { 'location.address': { $nin: ['', null] } });

	// Recent 3 reports
	const recentReportsPromise = Report.find()
		.sort({ createdAt: -1 })
		.limit(3)
		.populate('createdBy', 'name firstName lastName')
		.lean();

	// Reports created this month
	const reportedThisMonthPromise = Report.countDocuments({ createdAt: { $gte: startOfMonth } });

	// Reports resolved this month
	const resolvedThisMonthPromise = Report.countDocuments({
		status: { $in: ['resolved', 'Resolved', 'closed', 'Closed'] },
		$or: [
			{ resolvedAt: { $gte: startOfMonth } },
			{ updatedAt: { $gte: startOfMonth } },
		],
	});

	// Currently active / in progress issues
	const currentlyInProgressPromise = Report.countDocuments({
		status: { $in: ['in_progress', 'In Progress', 'in progress'] },
	});

	// Active issues overall (reported or in_progress)
	const activeIssuesPromise = Report.countDocuments({
		status: { $in: ['reported', 'in_progress', 'Reported', 'In Progress'] },
	});

	// Total problems reported all-time
	const totalReportsPromise = Report.countDocuments({});

	// Resolved reports for average duration calculation
	const resolvedReportsPromise = Report.find({
		status: { $in: ['resolved', 'Resolved', 'closed', 'Closed'] },
	})
		.select('createdAt resolvedAt completedAt updatedAt')
		.lean();

	return Promise.all([
		resolvedCountPromise,
		membersCountPromise,
		neighborhoodsPromise,
		recentReportsPromise,
		reportedThisMonthPromise,
		resolvedThisMonthPromise,
		currentlyInProgressPromise,
		activeIssuesPromise,
		totalReportsPromise,
		resolvedReportsPromise,
	])
		.then(([
			resolvedCount,
			membersCount,
			neighborhoods,
			recentReports,
			reportedThisMonth,
			resolvedThisMonth,
			currentlyInProgress,
			activeIssues,
			totalReports,
			resolvedReports,
		]) => {
			const recentActivity = recentReports.map((report) => {
				const author = getAuthorName(report.createdBy);
				return {
					_id: report._id,
					title: report.title || report.category || 'Untitled report',
					description: report.description || '',
					locationTag: report.location?.addressText || report.location?.address || 'Location unavailable',
					status: report.status || 'reported',
					image: report.images?.[0] || report.photos?.[0] || report.imageUrl || null,
					author,
					initials: getInitials(author),
					timeAgo: getTimeAgo(report.createdAt),
				};
			});

			const durations = resolvedReports
				.map((report) => {
					const completionDate = report.resolvedAt || report.completedAt || report.updatedAt;
					return report.createdAt && completionDate
						? (new Date(completionDate) - new Date(report.createdAt)) / 86400000
						: null;
				})
				.filter((duration) => Number.isFinite(duration) && duration >= 0);

			const avgResolutionTimeDays = durations.length
				? Number((durations.reduce((sum, duration) => sum + duration, 0) / durations.length).toFixed(1))
				: 0;

			return res.status(200).json({
				heroMetrics: {
					totalReports: totalReports || 0,
					resolvedCount: resolvedCount || 0,
					membersCount: membersCount || 0,
					neighborhoodsCount: neighborhoods.length || 0,
					activeIssues: activeIssues || 0,
				},
				recentActivity,
				communityImpact: {
					issuesReportedThisMonth: reportedThisMonth || 0,
					issuesResolvedThisMonth: resolvedThisMonth || 0,
					resolutionRate: reportedThisMonth ? Math.round((resolvedThisMonth / reportedThisMonth) * 100) : (totalReports ? Math.round((resolvedCount / totalReports) * 100) : 0),
					currentlyInProgress: currentlyInProgress || 0,
					activeIssues: activeIssues || 0,
					avgResolutionTimeDays,
				},
			});
		})
		.catch((error) => {
			console.error('getHomeData failed:', error);
			return res.status(500).json({ message: 'Unable to load homepage data', error: error.message });
		});
};

const getNearbyReports = async (req, res) => {
	try {
		const lat = parseFloat(req.query.lat);
		const lng = parseFloat(req.query.lng);
		const radius = parseFloat(req.query.radius) || 5000;

		if (isNaN(lat) || isNaN(lng) || !Number.isFinite(radius) || radius <= 0 || radius > 50000) {
			return res.status(400).json({ message: 'Invalid coordinates' });
		}

		const latDelta = radius / 111000;
		const lngDelta = radius / (111000 * Math.cos((lat * Math.PI) / 180));

		const minLat = lat - latDelta;
		const maxLat = lat + latDelta;
		const minLng = lng - lngDelta;
		const maxLng = lng + lngDelta;

		const reports = await Report.find({
			'location.lat': { $gte: minLat, $lte: maxLat },
			'location.lng': { $gte: minLng, $lte: maxLng }
		}).select('_id title description category severity status location createdAt resolvedAt confirmedBy images photos imageUrl').lean();

		const toRad = (val) => (val * Math.PI) / 180;
		const R = 6371e3; 

		const nearbyReports = reports.filter(report => {
			if (report.location?.lat == null || report.location?.lng == null) return false;
			const phi1 = toRad(lat);
			const phi2 = toRad(report.location.lat);
			const deltaPhi = toRad(report.location.lat - lat);
			const deltaLambda = toRad(report.location.lng - lng);

			const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
				Math.cos(phi1) * Math.cos(phi2) *
				Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

			const distance = R * c;
			return distance <= radius;
		}).map(report => ({
			id: report._id,
			title: report.title,
			description: report.description || '',
			category: report.category,
			severity: report.severity || 'Medium',
			status: report.status || 'New',
			lat: report.location.lat,
			lng: report.location.lng,
			areaName: report.location.address || report.location.addressText || '',
			reportedAt: report.createdAt,
			resolvedAt: report.resolvedAt || null,
			upvotes: Array.isArray(report.confirmedBy) ? report.confirmedBy.length : 0,
			thumbnailUrl: report.images?.[0] || report.photos?.[0] || report.imageUrl || null,
		}));

		return res.json(nearbyReports);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load nearby reports', error: error.message });
	}
};

const getReportsByMe = async (req, res) => {
	try {
		const userId = req.user?._id;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });
		
		const { status = 'all', q = '', page = 1, limit = 5 } = req.query;
		const pageNum = parseInt(page, 10) || 1;
		const limitNum = parseInt(limit, 10) || 5;
		
		const baseFilter = { user: userId };
		if (q.trim()) {
			const searchPattern = new RegExp(escapeRegex(q.trim()), 'i');
			baseFilter.$or = [
				{ title: searchPattern },
				{ description: searchPattern },
				{ 'location.addressText': searchPattern },
				{ 'location.address': searchPattern }
			];
		}
		
		const [allCount, pendingCount, inProgressCount, resolvedCount, rejectedCount] = await Promise.all([
			Report.countDocuments(baseFilter),
			Report.countDocuments({ ...baseFilter, status: { $in: ['reported', 'New', 'Pending'] } }),
			Report.countDocuments({ ...baseFilter, status: { $in: ['in_progress', 'In Progress'] } }),
			Report.countDocuments({ ...baseFilter, status: { $in: ['resolved', 'Resolved'] } }),
			Report.countDocuments({ ...baseFilter, status: { $regex: /Rejected/i } }),
		]);
		
		const counts = {
			all: allCount,
			pending: pendingCount,
			in_progress: inProgressCount,
			resolved: resolvedCount,
			rejected: rejectedCount
		};
		
		const queryFilter = { ...baseFilter };
		if (status !== 'all') {
			if (status === 'pending') queryFilter.status = { $in: ['reported', 'New', 'Pending'] };
			else if (status === 'in_progress') queryFilter.status = { $in: ['in_progress', 'In Progress'] };
			else if (status === 'resolved') queryFilter.status = { $in: ['resolved', 'Resolved'] };
			else if (status === 'rejected') queryFilter.status = { $regex: /Rejected/i };
		}
		
		const total = await Report.countDocuments(queryFilter);
		const reports = await Report.find(queryFilter)
			.sort({ createdAt: -1 })
			.skip((pageNum - 1) * limitNum)
			.limit(limitNum)
			.lean();
			
		const data = reports.map(r => ({
			id: r._id,
			title: r.title,
			category: r.category,
			description: r.description,
			status: normalizeReportStatus(r.status),
			addressText: r.location?.addressText || r.location?.address || '',
			thumbnailUrl: r.images?.[0] || r.photos?.[0] || r.imageUrl || null,
			createdAt: r.createdAt
		}));
		
		res.json({
			data,
			pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
			counts
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const normalizeReportStatus = (value) => {
	const status = String(value || '').toLowerCase().trim().replace(/[_-]+/g, ' ');
	if (status === 'new' || status === 'pending' || status === 'reported') return 'reported';
	if (status === 'in progress') return 'in_progress';
	if (status === 'resolved') return 'resolved';
	if (status === 'closed' || status === 'rejected') return 'closed';
	return 'reported';
};

const getMyReport = (req, res) => {
	const userId = req.user?._id || req.user?.id;
	const reportId = req.params.id;
	if (!userId) return res.status(401).json({ error: 'Unauthorized' });
	if (!mongoose.Types.ObjectId.isValid(reportId)) return res.status(404).json({ error: 'Report not found' });

	const isArtisan = req.user?.role === 'artisan';
	const reportQuery = isArtisan
		? { _id: reportId }
		: { _id: reportId, $or: [{ user: userId }, { createdBy: userId }] };

	return Report.findOne(reportQuery).lean()
		.then((report) => {
			if (!report) return null;

			// Fetch reporter public profile
			const reporterPromise = User.findById(report.createdBy || report.user)
				.select('name avatarUrl')
				.lean();

			// If assignedArtisanId / assignedArtisan is present, populate LIMITED public artisan profile:
			// { name, photoUrl, phone, email, qualifications }
			// Do NOT expose artisan's full user record, internal hashes, or unrelated reports.
			const assignedId = report.assignedArtisanId || report.assignedArtisan;
			const artisanPromise = assignedId
				? Promise.all([
					User.findById(assignedId).select('name avatarUrl email phone').lean(),
					ArtisanProfile.findOne({ user: assignedId }).select('businessName certificateUrl verificationStatus').lean()
				]).then(([artisanUser, artisanProfile]) => {
					if (!artisanUser) return null;
					return {
						id: String(artisanUser._id),
						name: artisanUser.name,
						photoUrl: artisanUser.avatarUrl || '',
						avatarUrl: artisanUser.avatarUrl || '',
						email: artisanUser.email || '',
						phone: artisanUser.phone || '',
						businessName: artisanProfile?.businessName || '',
						certificateUrl: artisanProfile?.certificateUrl || '',
						verificationStatus: artisanProfile?.verificationStatus || '',
						qualifications: artisanProfile?.businessName ? `Verified Artisan • ${artisanProfile.businessName}` : 'Registered Community Artisan'
					};
				})
				: Promise.resolve(null);

			return Promise.all([reporterPromise, artisanPromise])
				.then(([reporter, artisanInfo]) => ({ report, reporter, artisanInfo }));
		})
		.then((result) => {
			if (!result) return res.status(404).json({ error: 'Report not found' });
			const { report, reporter, artisanInfo } = result;
			const images = [...new Set([...(report.images || []), ...(report.photos || []), report.imageUrl].filter(Boolean))];
			const location = report.location || {};
			
			return res.json({
				id: String(report._id),
				reportId: report.reportId || '',
				title: report.title || report.category || '',
				category: report.category || '',
				description: report.description || '',
				location: {
					address: location.addressText || location.address || '',
					lat: location.latitude ?? location.lat ?? null,
					lng: location.longitude ?? location.lng ?? null,
				},
				images,
				reportedBy: {
					id: String(reporter?._id || report.createdBy || report.user),
					name: reporter?.name || 'Resident',
					avatar: reporter?.avatarUrl || '',
				},
				createdAt: report.createdAt,
				reportedAt: report.reportedAt || report.createdAt,
				status: normalizeReportStatus(report.status),
				inProgressAt: report.inProgressAt || null,
				resolvedAt: report.resolvedAt || null,
				closedAt: report.closedAt || null,
				assignedArtisan: artisanInfo,
				review: report.review || null,
				updates: report.updates || [],
			});
		})
		.catch((error) => {
			console.error('Report details fetch failed:', error);
			return res.status(500).json({ error: 'Unable to load report details' });
		});
};



const getMyReportComments = (req, res) => {
	const userId = req.user?._id || req.user?.id;
	const reportId = req.params.id;

	if (!userId) return res.status(401).json({ error: 'Unauthorized' });

	
	
	if (!mongoose.Types.ObjectId.isValid(reportId)) {
		return res.status(404).json({ error: 'Report not found' });
	}

	
	
	
	
	return Report.findOne({
		_id: reportId,
		$or: [{ user: userId }, { createdBy: userId }],
	}).lean()
		.then((report) => {
			
			if (!report) return null;

			
			
			
			return Promise.all([
				
				
				
				Comment.find({ report: report._id })
					.populate('createdBy', 'name avatarUrl')
					.sort({ createdAt: 1 }) 
					.lean(),

				
				
				
				User.findById(report.createdBy || report.user)
					.select('name avatarUrl')
					.lean(),
			])
				
				.then(([comments, reporter]) => ({ report, comments, reporter }));
		})
		.then((result) => {
			if (!result) return res.status(404).json({ error: 'Report not found' });

			const { report, comments, reporter } = result;

			
			
			
			const commentItems = comments.map((comment) => ({
				id:        String(comment._id),
				type:      'comment',
				commenter: {
					
					
					id:     String(comment.createdBy?._id || comment.createdBy || ''),
					name:   comment.createdBy?.name || 'Community member',
					avatar: comment.createdBy?.avatarUrl || '',
				},
				message:   comment.text,
				timestamp: comment.createdAt,
			}));

			
			
			
			
			const updateItems = (report.updates || []).map((update, index) => ({
				id:        `update-${index}`,
				type:      'update',
				commenter: {
					id:     String(report.createdBy || report.user),
					
					
					name:   update.author || reporter?.name || 'FixIt',
					avatar: reporter?.avatarUrl || '',
				},
				message:   update.text,
				timestamp: update.timestamp,
			}));

			
			
			
			
			
			const allItems = [...commentItems, ...updateItems]
				.filter((item) => Boolean(item.message))
				.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

			
			
			
			
			
			
			
			return res.json({
				reportId: String(report._id),
				comments: allItems,
			});
		})
		.catch((error) => {
			console.error('Report comments fetch failed:', error);
			return res.status(500).json({ error: 'Unable to load report comments' });
		});
};

/**
 * sendMessageToArtisan
 * --------------------
 * POST /api/reports/:id/message (also supports /message-artisan)
 * Auth: resident role, must be the report's own submitter.
 * Body: { subject (optional), message }
 *
 * 1. Validates that the report exists and has an assignedArtisanId (cannot message unclaimed reports).
 * 2. Looks up artisan's email from their user record server-side (never trusting client-supplied email).
 * 3. Logs the message in the messages collection for an immutable audit trail.
 * 4. Attempts email delivery via sendArtisanMessageEmail and updates emailDeliveryStatus ('sent' | 'failed').
 * 5. Appends a timeline update entry to the report.
 * 6. Uses .then()/.catch() promise chaining throughout.
 */
const sendMessageToArtisan = (req, res) => {
	const userId = req.user?._id || req.user?.id;
	const reportId = req.params.id;
	const { subject, message } = req.body;

	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	if (!mongoose.Types.ObjectId.isValid(reportId)) {
		return res.status(404).json({ error: 'Report not found' });
	}
	if (!message || !message.trim()) {
		return res.status(400).json({ error: 'Message content is required.' });
	}

	const Message = require('../models/Message');
	const { sendArtisanMessageEmail } = require('../services/emailService');

	// Step 1: Look up report owned by this resident
	return Report.findOne({
		_id: reportId,
		$or: [{ user: userId }, { createdBy: userId }],
	}).lean()
		.then((report) => {
			if (!report) {
				return res.status(404).json({ error: 'Report not found' });
			}

			const assignedArtisanId = report.assignedArtisanId || report.assignedArtisan;
			if (!assignedArtisanId) {
				return res.status(400).json({
					error: 'No artisan is currently assigned to this report. Messages can only be sent once an artisan has claimed the job.',
				});
			}

			// Step 2: Fetch artisan and resident details server-side (never trust client email)
			return Promise.all([
				User.findById(assignedArtisanId).select('name email').lean(),
				User.findById(userId).select('name email').lean(),
			]).then(([artisanUser, residentUser]) => {
				if (!artisanUser || !artisanUser.email) {
					return res.status(404).json({ error: 'Artisan contact details are unavailable.' });
				}

				const trimmedSubject = subject ? subject.trim() : '';
				const trimmedMessage = message.trim();
				const now = new Date();

				// Step 3: Create audit message record with 'pending' status
				return Message.create({
					reportId: report._id,
					fromUserId: userId,
					toArtisanId: artisanUser._id,
					subject: trimmedSubject,
					message: trimmedMessage,
					sentAt: now,
					emailDeliveryStatus: 'pending',
				}).then((savedMessage) => {
					// Step 4: Dispatch email notification to artisan
					return sendArtisanMessageEmail({
						artisanEmail: artisanUser.email,
						artisanName: artisanUser.name,
						residentName: residentUser?.name || 'Resident',
						residentEmail: residentUser?.email || '',
						reportTitle: report.title || report.category,
						reportId: report.reportId || `#CF-${String(report._id).slice(-6).toUpperCase()}`,
						subject: trimmedSubject,
						message: trimmedMessage,
					})
						.then(() => {
							// Email dispatched successfully
							savedMessage.emailDeliveryStatus = 'sent';
							return savedMessage.save().then(() => ({ savedMessage, dispatchFailed: false }));
						})
						.catch((emailErr) => {
							console.error('Email delivery to artisan failed:', emailErr.message);
							savedMessage.emailDeliveryStatus = 'failed';
							return savedMessage.save().then(() => ({ savedMessage, dispatchFailed: true }));
						})
						.then(({ savedMessage: finalMessage, dispatchFailed }) => {
							// Step 5: Add entry to report updates timeline
							return Report.findByIdAndUpdate(reportId, {
								$push: {
									updates: {
										type: 'NEW_COMMENT',
										text: `Resident sent a direct message to artisan: ${trimmedSubject ? `[${trimmedSubject}] ` : ''}${trimmedMessage}`,
										author: residentUser?.name || 'Resident',
										timestamp: now,
									},
								},
							}).then(() => {
								if (dispatchFailed) {
									return res.status(502).json({
										error: 'Email dispatch failed, but message was saved to audit log.',
										message: finalMessage,
									});
								}
								return res.status(200).json({
									success: true,
									message: `Your message has been sent to ${artisanUser.name}.`,
									data: finalMessage,
									artisanName: artisanUser.name,
								});
							});
						});
				});
			});
		})
		.catch((error) => {
			console.error('sendMessageToArtisan error:', error);
			if (!res.headersSent) {
				return res.status(500).json({ error: 'Unable to send message to artisan' });
			}
		});
};

/**
 * submitReportReview
 * ------------------
 * POST /api/reports/:id/review
 * Auth: resident role, must be the report's own submitter.
 * Body: { rating (1-5), comment (optional) }
 *
 * Why review submission and report status 'closed' are coupled together:
 * In the Fixit workflow, a resolved job is an unconfirmed artisan claim that the work is finished.
 * The resident's review serves as the official confirmation that closes the loop. Performing
 * both operations in one transaction/operation guarantees that a report cannot be closed without
 * review data, and cannot be reviewed multiple times or left in an inconsistent state.
 *
 * 1. Checks report status === 'resolved' (rejects if already closed or still in_progress).
 * 2. Checks only one review per report (unique constraint & guard).
 * 3. Creates the Review record.
 * 4. Transitions report status to 'closed', sets closedAt = now.
 * 5. Recomputes and denormalizes artisan's reviewCount and avgRating on their User record.
 * 6. Uses .then()/.catch() promise chaining.
 */
const submitReportReview = (req, res) => {
	const userId = req.user?._id || req.user?.id;
	const reportId = req.params.id;
	const { rating, comment } = req.body;

	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	if (!mongoose.Types.ObjectId.isValid(reportId)) {
		return res.status(404).json({ error: 'Report not found' });
	}

	const numericRating = Number(rating);
	if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
		return res.status(400).json({ error: 'A valid rating between 1 and 5 stars is required.' });
	}

	const Review = require('../models/Review');

	// Step 1: Find the resident's report
	return Report.findOne({
		_id: reportId,
		$or: [{ user: userId }, { createdBy: userId }],
	})
		.then((report) => {
			if (!report) {
				return res.status(404).json({ error: 'Report not found' });
			}

			// Validate report lifecycle status: ONLY 'resolved' reports can receive a review
			if (report.status !== 'resolved') {
				return res.status(400).json({
					error: `Only resolved reports can be reviewed. Current status is '${report.status}'.`,
				});
			}

			// Check if review already exists on the report object
			if (report.review?.rating) {
				return res.status(400).json({ error: 'This report has already been reviewed.' });
			}

			const assignedArtisanId = report.assignedArtisanId || report.assignedArtisan;
			if (!assignedArtisanId) {
				return res.status(400).json({ error: 'Cannot review a report with no assigned artisan.' });
			}

			// Step 2: Check Review collection for existing review by reportId
			return Review.findOne({ reportId: report._id }).lean()
				.then((existingReview) => {
					if (existingReview) {
						return res.status(400).json({ error: 'A review has already been submitted for this report.' });
					}

					const now = new Date();
					const trimmedComment = comment ? String(comment).trim() : '';

					// Step 3: Create Review record in reviews collection
					return Review.create({
						reportId: report._id,
						residentId: userId,
						artisanId: assignedArtisanId,
						rating: numericRating,
						comment: trimmedComment,
					}).then((savedReview) => {
						// Step 4: Update Report status to 'closed' and embed review summary
						report.review = {
							rating: numericRating,
							comment: trimmedComment,
							reviewedAt: now,
							reviewedBy: userId,
						};
						report.status = 'closed';
						report.closedAt = now;
						report.completedAt = report.completedAt || now;
						report.updates.push({
							type: 'STATUS_CHANGE',
							text: `Resident left a ${numericRating}-star review. Report is now closed.`,
							author: req.user?.name || 'Resident',
							timestamp: now,
						});

						return report.save().then((updatedReport) => {
							// Step 5: Recompute & denormalize artisan review stats (reviewCount and avgRating)
							return Review.aggregate([
								{ $match: { artisanId: new mongoose.Types.ObjectId(assignedArtisanId) } },
								{
									$group: {
										_id: '$artisanId',
										count: { $sum: 1 },
										avgRating: { $avg: '$rating' },
									},
								},
							]).then((stats) => {
								const reviewCount = stats[0]?.count || 1;
								const avgRating = stats[0]?.avgRating ? Number(stats[0].avgRating.toFixed(1)) : numericRating;

								return User.findByIdAndUpdate(
									assignedArtisanId,
									{ $set: { reviewCount, avgRating } }
								).then(() => {
									return res.status(200).json({
										success: true,
										message: 'Review submitted successfully. Report is now closed.',
										review: savedReview,
										report: {
											id: String(updatedReport._id),
											status: updatedReport.status,
											closedAt: updatedReport.closedAt,
											review: updatedReport.review,
										},
									});
								});
							});
						});
					});
				});
		})
		.catch((error) => {
			console.error('submitReportReview error:', error);
			if (!res.headersSent) {
				return res.status(500).json({ error: 'Unable to submit review' });
			}
		});
};

module.exports = {
	getHomeData,
	getCommunityOverview,
	getMapReports,
	getNearbyReports,
	getReportsByMe,
	getMyReport,
	getMyReportComments,
	sendMessageToArtisan,
	submitReportReview,
};
