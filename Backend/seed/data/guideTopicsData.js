/**
 * Seed data for Quick Guides section topics.
 */
const guideTopicsData = [
	{
		slug: 'how-to-report-an-issue',
		section: 'guide',
		order: 1,
		title: 'How to Report an Issue',
		description: 'Step-by-step walkthrough to report community problems with photos and location.',
		readTime: '2 min read',
		icon: 'fa-solid fa-file-lines',
		iconBg: '#f1f5f9',
		iconColor: '#64748b',
		hasSteps: true,
		body: null,
		steps: [
			{
				order: 1,
				title: 'Open the Report Wizard',
				description: 'Click "+ New Report" in the dashboard header or on the quick action button.',
			},
			{
				order: 2,
				title: 'Select Issue Category & Severity',
				description: 'Choose from 5 primary categories and rate the severity (Low, Medium, High).',
			},
			{
				order: 3,
				title: 'Pinpoint Location on Map',
				description: 'Use device GPS, type the street address, or reposition the map pin directly over the problem.',
			},
			{
				order: 4,
				title: 'Upload Clear Photos',
				description: 'Add up to 5 photos showing the full context and close-up damage.',
			},
			{
				order: 5,
				title: 'Submit & Track',
				description: 'Review summary and click Submit. Your issue will immediately receive a tracking ticket in My Reports.',
			},
		],
	},
	{
		slug: 'using-the-community-map',
		section: 'guide',
		order: 2,
		title: 'Using the Community Map',
		description: 'Learn how to discover, filter, and track nearby neighborhood issues.',
		readTime: '3 min read',
		icon: 'fa-solid fa-file-lines',
		iconBg: '#f1f5f9',
		iconColor: '#64748b',
		hasSteps: true,
		body: null,
		steps: [
			{
				order: 1,
				title: 'Explore Your Neighborhood',
				description: 'Navigate to "Nearby Issues" to view reports within 5 km of your location.',
			},
			{
				order: 2,
				title: 'Filter by Problem Type',
				description: 'Use category pills (Roads, Water, Streetlights, Drainage) to see what impacts your daily route.',
			},
			{
				order: 3,
				title: 'Inspect Markers and Photos',
				description: 'Click pins on the map to view submitted images, timestamps, and resolver status.',
			},
			{
				order: 4,
				title: 'Upvote & Track',
				description: 'Track issues to stay informed with real-time push and email notifications as repairs take place.',
			},
		],
	},
	{
		slug: 'understanding-issue-status',
		section: 'guide',
		order: 3,
		title: 'Understanding Issue Status',
		description: 'A breakdown of each lifecycle stage from New to Resolved.',
		readTime: '2 min read',
		icon: 'fa-solid fa-file-lines',
		iconBg: '#f1f5f9',
		iconColor: '#64748b',
		hasSteps: true,
		body: null,
		steps: [
			{
				order: 1,
				title: 'Pending Review',
				description: 'Issue has been received and queued for review by the municipal zonal coordinator.',
			},
			{
				order: 2,
				title: 'Verified',
				description: 'Site details have been validated and assigned to the relevant public works department.',
			},
			{
				order: 3,
				title: 'In Progress',
				description: 'Crews are deployed and active repair work or maintenance is ongoing.',
			},
			{
				order: 4,
				title: 'Resolved',
				description: 'The problem is officially fixed, confirmed by photographic before-and-after evidence.',
			},
		],
	},
	{
		slug: 'setting-up-your-profile',
		section: 'guide',
		order: 4,
		title: 'Setting Up Your Profile',
		description: 'Configure your residential zone and notification preferences.',
		readTime: '2 min read',
		icon: 'fa-solid fa-file-lines',
		iconBg: '#f1f5f9',
		iconColor: '#64748b',
		hasSteps: true,
		body: null,
		steps: [
			{
				order: 1,
				title: 'Open Settings',
				description: 'Click your profile avatar on the sidebar to access Account Settings.',
			},
			{
				order: 2,
				title: 'Configure Your Residential Zone',
				description: 'Set your neighborhood zone/ward to receive localized civic alerts.',
			},
			{
				order: 3,
				title: 'Save Default Coordinates',
				description: 'Save your primary home address for instant 1-click nearby map positioning.',
			},
			{
				order: 4,
				title: 'Notification Preferences',
				description: 'Customize SMS or email notifications for updates on your reported and tracked issues.',
			},
		],
	},
];

module.exports = guideTopicsData;
