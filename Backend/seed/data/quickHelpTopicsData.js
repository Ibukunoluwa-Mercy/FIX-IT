/**
 * Seed data for Quick Help section topics.
 */
const quickHelpTopicsData = [
	{
		slug: 'report-an-issue',
		section: 'quick_help',
		order: 1,
		title: 'Report an Issue',
		description: 'Learn how to submit a new community issue.',
		icon: 'fa-solid fa-file-circle-plus',
		iconBg: '#fee2e2',
		iconColor: '#ef4444',
		readTime: null,
		hasSteps: true,
		body: null,
		steps: [
			{
				order: 1,
				title: 'Click "+ New Report"',
				description: 'From your resident dashboard header or sidebar, click "+ New Report" to launch the 4-step wizard.',
			},
			{
				order: 2,
				title: 'Enter Issue Details',
				description: 'Choose your issue category (e.g. Potholes, Streetlights, Water Leaks), describe the problem, and pick a severity level.',
			},
			{
				order: 3,
				title: 'Specify Location',
				description: 'Use automatic device GPS, enter a street address to geocode, or adjust the marker pin directly on the interactive map.',
			},
			{
				order: 4,
				title: 'Attach Photos',
				description: 'Upload up to 5 clear photos (JPEG/PNG under 5MB each) so municipal resolvers can assess the damage visually.',
			},
			{
				order: 5,
				title: 'Review & Submit',
				description: 'Check your report summary for accuracy, review nearby reports to avoid duplicates, and submit for resolution dispatch.',
			},
		],
	},
	{
		slug: 'use-the-map',
		section: 'quick_help',
		order: 2,
		title: 'Use the Map',
		description: 'Find and explore issues near you.',
		icon: 'fa-solid fa-location-dot',
		iconBg: '#dbeafe',
		iconColor: '#2563eb',
		readTime: null,
		hasSteps: true,
		body: null,
		steps: [
			{
				order: 1,
				title: 'Open Nearby Issues or Community Map',
				description: 'Click "Nearby Issues" in your sidebar or "Community Map" in the main navigation to open the map view.',
			},
			{
				order: 2,
				title: 'Center on Your Location',
				description: 'Allow browser geolocation to automatically center on reports within a 5 km radius, or search by neighborhood/zone.',
			},
			{
				order: 3,
				title: 'Filter by Category & Status',
				description: 'Use the quick filter chips (Road/Pothole, Water, Streetlight, Drainage) and status toggles to narrow down results.',
			},
			{
				order: 4,
				title: 'Click Markers for Details',
				description: 'Click any map pin or nearby card to inspect photos, distance, reported date, and current resolver activity.',
			},
			{
				order: 5,
				title: 'Track and Upvote',
				description: 'Click "Track" on an issue card to upvote it and receive notification updates as it progresses towards resolution.',
			},
		],
	},
	{
		slug: 'track-your-report',
		section: 'quick_help',
		order: 3,
		title: 'Track Your Report',
		description: 'Check the status of your submitted issues.',
		icon: 'fa-solid fa-circle-check',
		iconBg: '#dcfce7',
		iconColor: '#16a34a',
		readTime: null,
		hasSteps: true,
		body: null,
		steps: [
			{
				order: 1,
				title: 'Navigate to "My Reports"',
				description: 'Click "My Reports" on your dashboard sidebar to view your complete submission history.',
			},
			{
				order: 2,
				title: 'Filter by Status Tabs',
				description: 'Switch between status tabs: All, Pending (submitted & awaiting triage), In Progress (crew assigned), Resolved (fixed), or Rejected.',
			},
			{
				order: 3,
				title: 'Search by Keyword',
				description: 'Use the search input at the top of My Reports to quickly locate specific reports by category, address, or description.',
			},
			{
				order: 4,
				title: 'Inspect Detailed Timeline',
				description: 'Click "View Details" on any report card to review the resolution progress, resolver notes, and before-and-after photos.',
			},
		],
	},
	{
		slug: 'community-guidelines',
		section: 'quick_help',
		order: 4,
		title: 'Community Guidelines',
		description: 'Understand our rules and expectations.',
		icon: 'fa-solid fa-users',
		iconBg: '#f3e8ff',
		iconColor: '#9333ea',
		readTime: null,
		hasSteps: false,
		body: 'FixIt connects residents and municipal authorities to ensure faster, transparent civic improvements across our neighborhoods. To keep our platform constructive, respectful, and effective, please adhere to these core rules: report genuine civic issues, provide accurate locations, respect privacy in media, engage constructively, and upvote existing issues rather than filing duplicates.',
		content: [
			'FixIt connects residents and municipal authorities to ensure faster, transparent civic improvements across our neighborhoods.',
			'To keep our platform constructive, respectful, and effective, please adhere to these core rules:',
			'• Genuine Civic Issues: Only report legitimate public infrastructure damage, sanitation, water, electrical, and safety concerns.',
			'• Accurate Information: Provide precise addresses or GPS pins and honest descriptions. Never file false or prank reports.',
			'• Respectful Media: Ensure uploaded photos clearly show the problem without capturing private faces or confidential vehicle details without consent.',
			'• Constructive Discourse: Harassment, abusive language, or spam in community comments and discussions will result in immediate account suspension.',
			'• Duplicate Reporting: Check nearby issues on the map before reporting; upvoting an existing report accelerates its resolution more than filing a duplicate.',
		],
	},
];

module.exports = quickHelpTopicsData;
