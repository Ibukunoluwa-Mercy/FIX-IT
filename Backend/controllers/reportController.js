const Report = require('../models/Report');
const User = require('../models/User');

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

module.exports = { getHomeData };
