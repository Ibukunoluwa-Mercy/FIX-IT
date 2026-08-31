const Report = require('../models/Report');
const User = require('../models/User');

const getAuthenticatedUserId = (req) => req.user?.id || req.user?._id;

const getNextReportId = async () => {
	const year = new Date().getFullYear();
	const latestResult = await Report.aggregate([
		{ $match: { reportId: new RegExp(`^#CF-${year}-\\d+$`) } },
		{ $project: { sequence: { $toInt: { $arrayElemAt: [{ $split: ['$reportId', '-'] }, 2] } } } },
		{ $group: { _id: null, latestNumber: { $max: '$sequence' } } },
	]);
	const latestNumber = latestResult[0]?.latestNumber || 0;
	return `#CF-${year}-${String(latestNumber + 1).padStart(2, '0')}`;
};

const formatLocation = (location) => {
	if (!location) return { address: '', coordinates: null };
	if (Array.isArray(location.coordinates)) {
		return { address: location.address || '', coordinates: { lat: location.coordinates[1], lng: location.coordinates[0] } };
	}
	return { address: location.address || '', coordinates: location.coordinates || null };
};

const getOverview = async (req, res) => {
	try {
		const userId = getAuthenticatedUserId(req);
		if (!userId) return res.status(401).json({ message: 'Authentication required' });
		const user = await User.findById(userId).select('name avatarUrl impactScore cityRank').lean();
		if (!user) return res.status(404).json({ message: 'User not found' });

		const userReportFilter = { $or: [{ user: userId }, { createdBy: userId }] };
		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);
		const [totalActiveReports, resolvedThisMonth, recentReports, recentUpdates, mapReports] = await Promise.all([
			Report.countDocuments({ ...userReportFilter, status: { $ne: 'Resolved' } }),
			Report.countDocuments({ ...userReportFilter, status: 'Resolved', updatedAt: { $gte: startOfMonth } }),
			Report.find(userReportFilter).sort({ createdAt: -1 }).limit(5).lean(),
			Report.aggregate([
				{ $match: { ...userReportFilter, status: { $ne: 'Resolved' } } },
				{ $unwind: '$updates' },
				{ $sort: { 'updates.timestamp': -1 } },
				{ $limit: 5 },
				{ $replaceRoot: { newRoot: '$updates' } },
			]),
			Report.find({ status: { $ne: 'Resolved' } }).select('_id title location status').lean(),
		]);

		return res.json({
			userInfo: { name: user.name, avatar: user.avatarUrl, impactScore: user.impactScore, communityRank: user.cityRank },
			stats: { totalActiveReports, resolvedThisMonth, impactScore: user.impactScore, rank: user.cityRank },
			recentReports,
			recentUpdates,
			mapIssues: mapReports.map((report) => ({ id: report.reportId || report._id, title: report.title, location: formatLocation(report.location), status: report.status })),
		});
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load dashboard overview', error: error.message });
	}
};

const submitReport = async (req, res) => {
	const { title, description = '', address = '', lat, lng, imageUrl = '' } = req.body;
	if (!title || !address || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
		return res.status(400).json({ message: 'Title, address, latitude, and longitude are required' });
	}
	try {
		const userId = getAuthenticatedUserId(req);
		const reportId = await getNextReportId();
		const report = await Report.create({
			reportId, user: userId, createdBy: userId, title, description,
			location: { address, coordinates: { lat: Number(lat), lng: Number(lng) } },
			status: 'New', imageUrl, images: imageUrl ? [imageUrl] : [],
			updates: [{ type: 'SUBMITTED', text: 'Report submitted and pending review.', author: req.user?.name || '', timestamp: new Date() }],
		});
		return res.status(201).json(report);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to submit report', error: error.message });
	}
};

module.exports = { getOverview, submitReport };
