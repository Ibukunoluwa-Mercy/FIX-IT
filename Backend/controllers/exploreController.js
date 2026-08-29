const Report = require('../models/Report');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

const CATEGORY_GROUPS = {
	Infrastructure: ['Road/Pothole', 'Drainage'],
	Utilities: ['Streetlight', 'Water'],
	'Public Safety': ['Safety', 'Public Facility'],
	Environment: ['Waste', 'Environment'],
};

const EXPLORE_FILTER_OPTIONS = {
	status: ['Verified', 'Pending', 'In Progress', 'Resolved'],
	category: ['Road/Pothole', 'Drainage', 'Streetlight', 'Water', 'Safety', 'Public Facility', 'Waste', 'Environment', 'Other'],
	severity: ['High', 'Medium', 'Low'],
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseArrayQuery = (value) => {
	if (!value) return [];
	const values = Array.isArray(value) ? value : [value];
	return values.flatMap((item) => String(item).split(',')).map((item) => item.trim()).filter(Boolean);
};

const getDateReportedStart = (value) => {
	const now = new Date();
	const start = new Date(now);
	if (value === 'today') start.setHours(0, 0, 0, 0);
	else if (value === 'past_week') start.setDate(start.getDate() - 7);
	else if (value === 'past_month') start.setMonth(start.getMonth() - 1);
	else if (value === 'past_year') start.setFullYear(start.getFullYear() - 1);
	else return null;
	return start;
};

const getCurrentUserId = (req) => req.user?._id || req.user?.id || req.auth?.userId;
const severityWeights = { High: 3, Medium: 2, Low: 1 };

const calculatePriorityScore = (severity, confirmationsCount, createdAt) => {
	const ageInDays = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
	return Number(((severityWeights[severity] || 1) * 100 + confirmationsCount * 10 + ageInDays).toFixed(2));
};

const expandCategories = (values) => values.flatMap((value) => CATEGORY_GROUPS[value] || [value]);

const getExploreData = async (req, res) => {
	try {
		const statuses = parseArrayQuery(req.query.status);
		const categories = parseArrayQuery(req.query.category);
		const severities = parseArrayQuery(req.query.severity);
		const search = String(req.query.search || '').trim();
		const dateStart = getDateReportedStart(req.query.dateReported);
		const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
		const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
		const currentUserId = getCurrentUserId(req);
		const match = {};

		if (statuses.length) match.status = { $in: statuses };
		if (categories.length) match.category = { $in: expandCategories(categories) };
		if (severities.length) match.severity = { $in: severities };
		if (dateStart) match.createdAt = { $gte: dateStart };
		if (search) {
			const searchPattern = escapeRegex(search);
			const searchConditions = [
				{ title: { $regex: searchPattern, $options: 'i' } },
				{ description: { $regex: searchPattern, $options: 'i' } },
				{ 'location.address': { $regex: searchPattern, $options: 'i' } },
			];
			if (mongoose.Types.ObjectId.isValid(search)) searchConditions.push({ _id: search });
			match.$or = searchConditions;
		}

		const sortBy = req.query.sortBy || 'most_recent';
		const sortStage = sortBy === 'most_upvoted'
			? { confirmationsCount: -1, createdAt: -1 }
			: sortBy === 'highest_severity'
				? { severityWeight: -1, createdAt: -1 }
				: sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
		const commentsLookup = {
			$lookup: {
				from: Comment.collection.name,
				let: { reportId: '$_id' },
				pipeline: [{ $match: { $expr: { $eq: ['$report', '$$reportId'] } } }, { $count: 'count' }],
				as: 'commentStats',
			},
		};
		const userConfirmedExpression = currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)
			? { $in: [new mongoose.Types.ObjectId(currentUserId), { $ifNull: ['$confirmedBy', []] }] }
			: false;

		const [result] = await Report.aggregate([
			{ $match: match },
			{ $addFields: {
				confirmationsCount: { $size: { $ifNull: ['$confirmedBy', []] } },
				severityWeight: { $switch: { branches: [
					{ case: { $eq: ['$severity', 'High'] }, then: 3 },
					{ case: { $eq: ['$severity', 'Medium'] }, then: 2 },
				], default: 1 } },
			} },
			commentsLookup,
			{ $addFields: {
				commentsCount: { $ifNull: [{ $arrayElemAt: ['$commentStats.count', 0] }, 0] },
				isConfirmedByCurrentUser: userConfirmedExpression,
			} },
			{ $facet: {
				feed: [
					{ $sort: sortStage },
					{ $skip: (page - 1) * limit },
					{ $limit: limit },
					{ $project: {
						_id: 1, title: 1, description: 1, 'location.address': 1, category: 1, severity: 1,
						status: 1, images: 1, imageCount: { $size: { $ifNull: ['$images', []] } },
						confirmationsCount: 1, commentsCount: 1, createdAt: 1, priorityScore: 1,
						isConfirmedByCurrentUser: 1,
					}, },
				],
				total: [{ $count: 'count' }],
				verified: [{ $match: { status: 'Verified' } }, { $count: 'count' }],
				inProgress: [{ $match: { status: 'In Progress' } }, { $count: 'count' }],
				resolved: [{ $match: { status: 'Resolved' } }, { $count: 'count' }],
				statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }],
				categoryCounts: [{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }],
				severityCounts: [{ $group: { _id: '$severity', count: { $sum: 1 } } }, { $sort: { _id: 1 } }],
				trending: [
					{ $sort: { confirmationsCount: -1, createdAt: -1 } }, { $limit: 4 },
					{ $project: { _id: 1, title: 1, thumbnail: { $arrayElemAt: ['$images', 0] }, 'location.address': 1, confirmationsCount: 1, severity: 1 } },
				],
				impact: [{ $group: {
					_id: null,
					total: { $sum: 1 },
					resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
					issuesReportedThisMonth: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)] }, 1, 0] } },
					issuesResolvedThisMonth: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'Resolved'] }, { $gte: ['$updatedAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)] }] }, 1, 0] } },
					resolutionDays: { $push: { $cond: [
						{ $eq: ['$status', 'Resolved'] },
						{ $divide: [{ $subtract: [{ $ifNull: ['$resolvedAt', '$updatedAt'] }, '$createdAt'] }, 86400000] },
						null,
					] } },
				} }, { $project: {
					_id: 0, resolutionRate: { $cond: [{ $gt: ['$total', 0] }, { $round: [{ $multiply: [{ $divide: ['$resolved', '$total'] }, 100] }, 0] }, 0] },
					resolutionDays: { $filter: { input: '$resolutionDays', as: 'days', cond: { $ne: ['$$days', null] } } },
					issuesReportedThisMonth: 1, issuesResolvedThisMonth: 1,
				} }, { $project: {
					resolutionRate: 1, issuesReportedThisMonth: 1, issuesResolvedThisMonth: 1,
					avgResolutionTimeDays: { $cond: [{ $gt: [{ $size: '$resolutionDays' }, 0] }, { $round: [{ $avg: '$resolutionDays' }, 1] }, 0] },
				} }],
			} },
		]);

		const total = result.total[0]?.count || 0;
		const impact = result.impact[0] || { resolutionRate: 0, avgResolutionTimeDays: 0 };

		return res.json({
			issues: result.feed,
			pagination: { page, limit, total, pages: Math.ceil(total / limit) },
			metrics: { totalIssues: total, verifiedIssues: result.verified[0]?.count || 0, inProgress: result.inProgress[0]?.count || 0, resolved: result.resolved[0]?.count || 0 },
			filterCounts: {
				statuses: EXPLORE_FILTER_OPTIONS.status.map((name) => ({ name, count: result.statusCounts.find((item) => item._id === name)?.count || 0 })),
				categories: EXPLORE_FILTER_OPTIONS.category.map((name) => ({ name, count: result.categoryCounts.find((item) => item._id === name)?.count || 0 })),
				severities: EXPLORE_FILTER_OPTIONS.severity.map((name) => ({ name, count: result.severityCounts.find((item) => item._id === name)?.count || 0 })),
			},
			trendingIssues: result.trending,
			communityImpact: { resolutionRate: impact.resolutionRate || 0, avgResolutionTimeDays: impact.avgResolutionTimeDays || 0, issuesReportedThisMonth: impact.issuesReportedThisMonth || 0, issuesResolvedThisMonth: impact.issuesResolvedThisMonth || 0 },
		});
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load explore data', error: error.message });
	}
};

const toggleConfirmReport = async (req, res) => {
	const userId = getCurrentUserId(req);
	if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return res.status(401).json({ message: 'Authentication required' });
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid report ID' });

	try {
		const report = await Report.findById(req.params.id).select('confirmedBy severity createdAt');
		if (!report) return res.status(404).json({ message: 'Report not found' });
		report.confirmedBy = report.confirmedBy || [];
		const alreadyConfirmed = report.confirmedBy.some((id) => id.toString() === userId.toString());
		if (alreadyConfirmed) report.confirmedBy.pull(userId);
		else report.confirmedBy.addToSet(userId);
		report.priorityScore = calculatePriorityScore(report.severity, report.confirmedBy.length, report.createdAt);
		await report.save();
		return res.json({ confirmed: !alreadyConfirmed, confirmationsCount: report.confirmedBy.length, priorityScore: report.priorityScore });
	} catch (error) {
		return res.status(500).json({ message: 'Unable to update confirmation', error: error.message });
	}
};

module.exports = { getExploreData, toggleConfirmReport };
