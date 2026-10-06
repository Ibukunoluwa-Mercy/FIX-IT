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

const getCommunityOverview = async (req, res) => {
	try {
		const requestedTimeframe = req.query.timeframe || 'this_month';
		const validTimeframes = ['today', 'this_week', 'this_month', 'this_year', 'all_time'];
		const timeframe = validTimeframes.includes(requestedTimeframe) ? requestedTimeframe : 'this_month';
		const startDate = getTimeframeStart(timeframe);
		const reportFilter = startDate ? { createdAt: { $gte: startDate } } : {};
		const [totalReports, verifiedReports, inProgressReports, resolvedReports, activeUsers, severityCounts, statusCounts, topCategories, activeAreas] = await Promise.all([
			Report.countDocuments(reportFilter),
			Report.countDocuments({ ...reportFilter, status: 'Verified' }),
			Report.countDocuments({ ...reportFilter, status: 'In Progress' }),
			Report.countDocuments({ ...reportFilter, status: 'Resolved' }),
			User.countDocuments({ isActive: { $ne: false } }),
			Report.aggregate([{ $match: reportFilter }, { $group: { _id: '$severity', count: { $sum: 1 } } }]),
			Report.aggregate([{ $match: reportFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
			Report.aggregate([{ $match: reportFilter }, { $match: { category: { $nin: ['', null] } } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 5 }]),
			Report.aggregate([{ $match: { ...reportFilter, 'location.address': { $nin: ['', null] } } }, { $group: { _id: '$location.address', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 5 }]),
		]);
		const severities = Object.fromEntries(severityCounts.map(({ _id, count }) => [_id, count]));
		const statuses = Object.fromEntries(statusCounts.map(({ _id, count }) => [_id, count]));
		return res.json({
			timeframe,
			metrics: { totalReports, verifiedReports, inProgressReports, resolvedReports, activeUsers },
			issuesBySeverity: getBreakdown(severities, totalReports, ['High', 'Medium', 'Low']),
			issuesByStatus: getBreakdown(statuses, totalReports, ['In Progress', 'Resolved']),
			topIssueCategories: topCategories.map(({ _id, count }) => ({ category: _id, count })),
			mostActiveAreas: activeAreas.map(({ _id, count }) => ({ location: _id, totalLoggedIssues: count })),
		});
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load community overview', error: error.message });
	}
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

const getHomeData = async (req, res) => {
	try {
		const startOfMonth = getStartOfCurrentMonth();
		const [resolvedCount, membersCount, neighborhoods, recentReports, reportedThisMonth, resolvedThisMonth, currentlyInProgress, resolvedReports] = await Promise.all([
			Report.countDocuments({ status: 'Resolved' }), User.countDocuments(), Report.distinct('location.address', { 'location.address': { $nin: ['', null] } }),
			Report.find().sort({ createdAt: -1 }).limit(3).populate('createdBy', 'name firstName lastName').lean(),
			Report.countDocuments({ createdAt: { $gte: startOfMonth } }), Report.countDocuments({ status: 'Resolved', updatedAt: { $gte: startOfMonth } }),
			Report.countDocuments({ status: 'In Progress' }), Report.find({ status: 'Resolved' }).select('createdAt resolvedAt completedAt updatedAt').lean(),
		]);
		const recentActivity = recentReports.map((report) => {
			const author = getAuthorName(report.createdBy);
			return { _id: report._id, title: report.title || 'Untitled report', description: report.description || '', locationTag: report.location?.address || 'Location unavailable', status: report.status || 'Reported', image: report.images?.[0] || null, author, initials: getInitials(author), timeAgo: getTimeAgo(report.createdAt) };
		});
		const durations = resolvedReports.map((report) => {
			const completionDate = report.resolvedAt || report.completedAt || report.updatedAt;
			return report.createdAt && completionDate ? (new Date(completionDate) - new Date(report.createdAt)) / 86400000 : null;
		}).filter((duration) => Number.isFinite(duration) && duration >= 0);
		const avgResolutionTimeDays = durations.length ? Number((durations.reduce((sum, duration) => sum + duration, 0) / durations.length).toFixed(1)) : 0;
		return res.json({
			heroMetrics: { resolvedCount: resolvedCount || 0, membersCount: membersCount || 0, neighborhoodsCount: neighborhoods.length || 0 },
			recentActivity,
			communityImpact: { issuesReportedThisMonth: reportedThisMonth || 0, issuesResolvedThisMonth: resolvedThisMonth || 0, resolutionRate: reportedThisMonth ? Math.round((resolvedThisMonth / reportedThisMonth) * 100) : 0, currentlyInProgress: currentlyInProgress || 0, avgResolutionTimeDays },
		});
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load homepage data', error: error.message });
	}
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
		.then(async (report) => {
			if (!report) return null;
			const reporter = await User.findById(report.createdBy || report.user).select('name avatarUrl').lean();
			let artisanInfo = null;
			if (report.assignedArtisan) {
				const [artisanUser, artisanProfile] = await Promise.all([
					User.findById(report.assignedArtisan).select('name avatarUrl email phone').lean(),
					ArtisanProfile.findOne({ user: report.assignedArtisan }).select('businessName certificateUrl verificationStatus').lean()
				]);
				if (artisanUser) {
					artisanInfo = {
						id: String(artisanUser._id),
						name: artisanUser.name,
						avatarUrl: artisanUser.avatarUrl || '',
						email: artisanUser.email || '',
						phone: artisanUser.phone || '',
						businessName: artisanProfile?.businessName || '',
						certificateUrl: artisanProfile?.certificateUrl || '',
						verificationStatus: artisanProfile?.verificationStatus || '',
						qualifications: artisanProfile?.businessName ? `Verified Artisan • ${artisanProfile.businessName}` : 'Registered Community Artisan'
					};
				}
			}
			return { report, reporter, artisanInfo };
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
 * Sends an email message from the resident to the artisan assigned to this report.
 * Hides the artisan's direct email from the resident.
 */
const sendMessageToArtisan = async (req, res) => {
	try {
		const userId = req.user?._id || req.user?.id;
		const reportId = req.params.id;
		const { subject, message } = req.body;

		if (!userId) return res.status(401).json({ error: 'Unauthorized' });
		if (!mongoose.Types.ObjectId.isValid(reportId)) return res.status(404).json({ error: 'Report not found' });
		if (!message || !message.trim()) {
			return res.status(400).json({ error: 'Message content is required.' });
		}

		// Find report owned by or created by this resident
		const report = await Report.findOne({
			_id: reportId,
			$or: [{ user: userId }, { createdBy: userId }],
		}).lean();

		if (!report) return res.status(404).json({ error: 'Report not found' });
		if (!report.assignedArtisan) {
			return res.status(400).json({ error: 'No artisan is currently assigned to this report.' });
		}

		const [artisanUser, residentUser] = await Promise.all([
			User.findById(report.assignedArtisan).select('name email').lean(),
			User.findById(userId).select('name email').lean(),
		]);

		if (!artisanUser || !artisanUser.email) {
			return res.status(404).json({ error: 'Artisan contact details are unavailable.' });
		}

		const { sendArtisanMessageEmail } = require('../services/emailService');
		await sendArtisanMessageEmail({
			artisanEmail: artisanUser.email,
			artisanName: artisanUser.name,
			residentName: residentUser?.name || 'Resident',
			residentEmail: residentUser?.email || '',
			reportTitle: report.title || report.category,
			reportId: report.reportId || `#CF-${String(report._id).slice(-6).toUpperCase()}`,
			subject: subject ? subject.trim() : '',
			message: message.trim(),
		});

		// Also add to report updates timeline
		await Report.findByIdAndUpdate(reportId, {
			$push: {
				updates: {
					type: 'NEW_COMMENT',
					text: `Resident sent a direct message to artisan: ${subject ? `[${subject.trim()}] ` : ''}${message.trim()}`,
					author: residentUser?.name || 'Resident',
					timestamp: new Date(),
				},
			},
		});

		return res.status(200).json({
			success: true,
			message: `Your message has been sent to ${artisanUser.name}.`,
			artisanName: artisanUser.name,
		});
	} catch (error) {
		console.error('sendMessageToArtisan error:', error);
		return res.status(500).json({ error: 'Unable to send message to artisan' });
	}
};

/**
 * submitReportReview
 * Allows resident to submit a 1-5 star review for a resolved report.
 * Transitions report status from resolved to closed.
 */
const submitReportReview = async (req, res) => {
	try {
		const userId = req.user?._id || req.user?.id;
		const reportId = req.params.id;
		const { rating, comment } = req.body;

		if (!userId) return res.status(401).json({ error: 'Unauthorized' });
		if (!mongoose.Types.ObjectId.isValid(reportId)) return res.status(404).json({ error: 'Report not found' });

		const numericRating = Number(rating);
		if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
			return res.status(400).json({ error: 'A valid rating between 1 and 5 stars is required.' });
		}

		const report = await Report.findOne({
			_id: reportId,
			$or: [{ user: userId }, { createdBy: userId }],
		});

		if (!report) return res.status(404).json({ error: 'Report not found' });
		if (report.review?.rating) {
			return res.status(400).json({ error: 'This report has already been reviewed.' });
		}
		if (report.status !== 'resolved') {
			return res.status(400).json({ error: 'Only resolved reports can be reviewed.' });
		}

		const now = new Date();
		report.review = {
			rating: numericRating,
			comment: comment ? String(comment).trim() : '',
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

		await report.save();

		return res.status(200).json({
			success: true,
			message: 'Review submitted successfully. Report is now closed.',
			report: {
				id: String(report._id),
				status: report.status,
				closedAt: report.closedAt,
				review: report.review,
			},
		});
	} catch (error) {
		console.error('submitReportReview error:', error);
		return res.status(500).json({ error: 'Unable to submit review' });
	}
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
