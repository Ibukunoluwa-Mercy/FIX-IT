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

const getCommunityOverview = async (req, res) => {
	try {
		const requestedTimeframe = req.query.timeframe || 'this_month';
		const validTimeframes = ['today', 'this_week', 'this_month', 'this_year', 'all_time'];
		const timeframe = validTimeframes.includes(requestedTimeframe) ? requestedTimeframe : 'this_month';
		const startDate = getTimeframeStart(timeframe);
		const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};
		const reportFilter = { ...dateFilter };

		const [totalReports, verifiedReports, inProgressReports, resolvedReports, activeUsers, severityCounts, statusCounts, topCategories, activeAreas] = await Promise.all([
			Report.countDocuments(reportFilter),
			Report.countDocuments({ ...reportFilter, status: 'Verified' }),
			Report.countDocuments({ ...reportFilter, status: 'In Progress' }),
			Report.countDocuments({ ...reportFilter, status: 'Resolved' }),
			User.countDocuments({ isActive: { $ne: false } }),
			Report.aggregate([
				{ $match: reportFilter },
				{ $group: { _id: '$severity', count: { $sum: 1 } } },
			]),
			Report.aggregate([
				{ $match: reportFilter },
				{ $group: { _id: '$status', count: { $sum: 1 } } },
			]),
			Report.aggregate([
				{ $match: reportFilter },
				{ $match: { category: { $nin: ['', null] } } },
				{ $group: { _id: '$category', count: { $sum: 1 } } },
				{ $sort: { count: -1, _id: 1 } },
				{ $limit: 5 },
			]),
			Report.aggregate([
				{ $match: { ...reportFilter, 'location.address': { $nin: ['', null] } } },
				{ $group: { _id: '$location.address', count: { $sum: 1 } } },
				{ $sort: { count: -1, _id: 1 } },
				{ $limit: 5 },
			]),
		]);

		const severities = Object.fromEntries(severityCounts.map(({ _id, count }) => [_id, count]));
		const statuses = Object.fromEntries(statusCounts.map(({ _id, count }) => [_id, count]));

		return res.json({
			timeframe,
			metrics: {
				totalReports,
				verifiedReports,
				inProgressReports,
				resolvedReports,
				activeUsers,
			},
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
			const searchConditions = [
				{ title: { $regex: searchPattern, $options: 'i' } },
				{ 'location.address': { $regex: searchPattern, $options: 'i' } },
			];
			if (mongoose.Types.ObjectId.isValid(searchValue)) searchConditions.push({ _id: searchValue });
			filters.push({ $or: searchConditions });
		}

		if (category !== 'All') {
			const categoryValues = CATEGORY_GROUPS[category] || [category];
			filters.push({ category: { $in: categoryValues } });
		}
		if (severity) filters.push({ severity });

		const reports = await Report.find(filters.length ? { $and: filters } : {})
			.select('_id title category severity status location createdAt')
			.sort({ createdAt: -1 })
			.lean();

		const mapReports = reports
			.filter((report) => Array.isArray(report.location?.coordinates) && report.location.coordinates.length >= 2)
			.map((report) => ({
				_id: report._id,
				title: report.title,
				category: report.category,
				severity: report.severity,
				status: report.status,
				location: {
					lat: report.location.coordinates[1],
					lng: report.location.coordinates[0],
					address: report.location.address || '',
				},
				createdAt: report.createdAt,
			}));

		return res.json(mapReports);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load map reports', error: error.message });
	}
};

const getHomeData = async (req, res) => {
	try {
		const startOfMonth = getStartOfCurrentMonth();
		const [resolvedCount, membersCount, neighborhoods, recentReports, reportedThisMonth, resolvedThisMonth, currentlyInProgress, resolvedReports] = await Promise.all([
			Report.countDocuments({ status: 'Resolved' }),
			User.countDocuments(),
			Report.distinct('location.address', { 'location.address': { $nin: ['', null] } }),
			Report.find()
				.sort({ createdAt: -1 })
				.limit(3)
				.populate('createdBy', 'name firstName lastName')
				.lean(),
			Report.countDocuments({ createdAt: { $gte: startOfMonth } }),
			Report.countDocuments({ status: 'Resolved', updatedAt: { $gte: startOfMonth } }),
			Report.countDocuments({ status: 'In Progress' }),
			Report.find({ status: 'Resolved' })
				.select('createdAt resolvedAt completedAt updatedAt')
				.lean(),
		]);

		const recentActivity = recentReports.map((report) => {
			const author = getAuthorName(report.createdBy);
			return {
				_id: report._id,
				title: report.title || 'Untitled report',
				description: report.description || '',
				locationTag: report.location?.address || 'Location unavailable',
				status: report.status || 'Reported',
				image: report.images?.[0] || null,
				author,
				initials: getInitials(author),
				timeAgo: getTimeAgo(report.createdAt),
			};
		});

		const resolutionDurations = resolvedReports
			.map((report) => {
				const completionDate = report.resolvedAt || report.completedAt || report.updatedAt;
				if (!report.createdAt || !completionDate) return null;
				return (new Date(completionDate) - new Date(report.createdAt)) / (1000 * 60 * 60 * 24);
			})
			.filter((duration) => Number.isFinite(duration) && duration >= 0);
		const avgResolutionTimeDays = resolutionDurations.length
			? Number((resolutionDurations.reduce((sum, duration) => sum + duration, 0) / resolutionDurations.length).toFixed(1))
			: 0;

		return res.json({
			heroMetrics: {
				resolvedCount: resolvedCount || 0,
				membersCount: membersCount || 0,
				neighborhoodsCount: neighborhoods.length || 0,
			},
			recentActivity,
			communityImpact: {
				issuesReportedThisMonth: reportedThisMonth || 0,
				issuesResolvedThisMonth: resolvedThisMonth || 0,
				resolutionRate: reportedThisMonth ? Math.round((resolvedThisMonth / reportedThisMonth) * 100) : 0,
				currentlyInProgress: currentlyInProgress || 0,
				avgResolutionTimeDays,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load homepage data', error: error.message });
	}
};

module.exports = { getHomeData, getCommunityOverview, getMapReports };
