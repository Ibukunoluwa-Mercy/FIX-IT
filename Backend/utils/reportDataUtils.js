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

module.exports = {
	CATEGORY_GROUPS,
	getStartOfCurrentMonth,
	getAuthorName,
	getInitials,
	getTimeAgo,
	getTimeframeStart,
};
