const quickHelpTopicsData = require('./quickHelpTopicsData');
const categoryTopicsData = require('./categoryTopicsData');
const guideTopicsData = require('./guideTopicsData');

const helpTopicsData = [
	...quickHelpTopicsData,
	...categoryTopicsData,
	...guideTopicsData,
];

module.exports = helpTopicsData;
