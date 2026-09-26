/**
 * Seed data for Help Center topics and numbered walkthrough steps.
 * Aggregates quick help options, category topics, and quick guides.
 */
const quickHelpTopicsData = require('./quickHelpTopicsData');
const categoryTopicsData = require('./categoryTopicsData');
const guideTopicsData = require('./guideTopicsData');

const helpTopicsData = [
	...quickHelpTopicsData,
	...categoryTopicsData,
	...guideTopicsData,
];

module.exports = helpTopicsData;
