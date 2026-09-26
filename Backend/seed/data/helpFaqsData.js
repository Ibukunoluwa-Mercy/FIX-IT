/**
 * Seed data for Help Center Frequently Asked Questions.
 */
const helpFaqsData = [
	{
		order: 1,
		question: 'How do I report a problem on FixIt?',
		answer: 'Click the "+ New Report" button located in the dashboard header or sidebar. The wizard will walk you through 4 simple steps: choosing an issue category, entering a description, specifying the location via GPS or address search, uploading up to 5 photos, and reviewing before submitting.',
	},
	{
		order: 2,
		question: 'Can I add photos or videos to my report?',
		answer: 'Yes! In Step 3 of the reporting wizard, you can upload up to 5 high-resolution photos (up to 5MB each, JPEG or PNG). High-clarity photos significantly accelerate municipal verification and dispatch. Video upload support is currently in development and will be available soon.',
	},
	{
		order: 3,
		question: 'How do I check the status of my reported issue?',
		answer: 'Navigate to "My Reports" from your dashboard sidebar. You will see a breakdown of all your reports organized by status tabs: All, Pending, In Progress, Resolved, and Rejected. Click "View Details" on any report to see the live timeline, assigned resolver team, and resolution notes.',
	},
	{
		order: 4,
		question: 'What do the different severity levels mean?',
		answer: 'Low: Minor non-urgent issues that do not disrupt traffic or pose immediate danger (e.g. minor paint fading, small litter). Medium: Moderate problems that require routine maintenance (e.g. potholes, non-functional streetlights). High: Urgent hazards posing immediate danger to life or property (e.g. fallen power lines, major main water bursts, severe road collapses).',
	},
	{
		order: 5,
		question: 'How do I change my location or update my profile?',
		answer: 'Click on your avatar at the bottom of the sidebar or top header, then select "Account settings". Here you can update your contact information, residential zone/ward, and save your default community location to customize your Nearby Issues feed.',
	},
	{
		order: 6,
		question: 'Who resolves the issues reported on FixIt?',
		answer: 'Reports are automatically routed to verified municipal departments, public utility agencies, and local zonal resolvers assigned to your district.',
	},
	{
		order: 7,
		question: 'Can I upvote or track issues reported by other residents?',
		answer: 'Yes! Open "Nearby Issues" or "Community Map" to view reports around you and click the "Track" button to upvote and increase its community priority score.',
	},
	{
		order: 8,
		question: 'Is my personal information kept private when I report?',
		answer: 'Yes. Your contact phone number and exact personal account details are never publicly visible on community boards. Only your report description, location, and photos are displayed.',
	},
];

module.exports = helpFaqsData;
