const Report = require('../models/Report');
const User = require('../models/User');
const mongoose = require('mongoose');

const CATEGORY_GROUPS = {
	Infrastructure: ['Road/Pothole', 'Drainage'],
	Utilities: ['Streetlight', 'Water'],
	'Public Safety': ['Safety', 'Public Facility'],
	Environment: ['Waste', 'Environment'],
};

const getStartOfCurrentMonth = () => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), 1);
};

const getAuthorName = (creator) => {
	if (!creator) return 'Anonymous';
	if (creator.name) return creator.name;
	return [creator.firstName, creator.lastName].filter(Boolean).join(' ') || 'Anonymous';
};

const getInitials = (name) => {
	const initials = name
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
	return initials || 'AN';
};

const getTimeAgo = (date) => {
	if (!date) return 'Just now';
	const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
	if (elapsedSeconds < 60) return 'Just now';
	const elapsedMinutes = Math.floor(elapsedSeconds / 60);
	if (elapsedMinutes < 60) return `${elapsedMinutes} ${elapsedMinutes === 1 ? 'minute' : 'minutes'} ago`;
	const elapsedHours = Math.floor(elapsedMinutes / 60);
	if (elapsedHours < 24) return `${elapsedHours} ${elapsedHours === 1 ? 'hour' : 'hours'} ago`;
	const elapsedDays = Math.floor(elapsedHours / 24);
	return `${elapsedDays} ${elapsedDays === 1 ? 'day' : 'days'} ago`;
};

const getTimeframeStart = (timeframe) => {
	if (timeframe === 'all_time') return null;
	const now = new Date();
	if (timeframe === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
	if (timeframe === 'this_week') {
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const day = start.getDay();
		start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
		return start;
	}
	if (timeframe === 'this_month') return new Date(now.getFullYear(), now.getMonth(), 1);
	if (timeframe === 'this_year') return new Date(now.getFullYear(), 0, 1);
	return new Date(now.getFullYear(), now.getMonth(), 1);
};

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
		const R = 6371e3; // earth radius in meters

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
			Report.countDocuments({ ...baseFilter, status: { $regex: /^New$|^Pending$/i } }),
			Report.countDocuments({ ...baseFilter, status: { $regex: /In Progress/i } }),
			Report.countDocuments({ ...baseFilter, status: { $regex: /Resolved/i } }),
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
			if (status === 'pending') queryFilter.status = { $regex: /^New$|^Pending$/i };
			else if (status === 'in_progress') queryFilter.status = { $regex: /In Progress/i };
			else if (status === 'resolved') queryFilter.status = { $regex: /Resolved/i };
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
			status: r.status,
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

module.exports = { getHomeData, getCommunityOverview, getMapReports, getNearbyReports, getReportsByMe };
