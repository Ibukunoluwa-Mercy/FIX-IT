/**
 * Artisan Help Center FAQs Data
 * Answers grounded directly in project implementation and real artisan flows.
 */
const artisanHelpFaqsData = [
	{
		audience: 'artisan',
		order: 1,
		question: 'Why does my dashboard say "Account Under Review"?',
		answer: 'When you register as an artisan and submit your trade certificate, your credentials undergo validation by our team. While under review, your profile remains pending. Once approved, the badge updates to "Account Verified" and you can claim and resolve community jobs.',
	},
	{
		audience: 'artisan',
		order: 2,
		question: 'How do I apply for a report?',
		answer: 'Go to the Reports page from the sidebar, find any unclaimed report with the orange "Reported" status, and click the orange "Apply" button. Confirm in the dialog, and the report will be assigned to your workspace under "In Progress".',
	},
	{
		audience: 'artisan',
		order: 3,
		question: 'What happens after I apply for a report?',
		answer: 'The report status updates to "In Progress" in real-time. The resident who submitted the report receives an update showing that an artisan has taken the job, and other artisans can no longer claim it.',
	},
	{
		audience: 'artisan',
		order: 4,
		question: 'Can two artisans apply for the same report?',
		answer: 'No. Fixit enforces a single-artisan lock. As soon as you confirm your application, the report is locked to you and displays "Assigned to another artisan" to other users.',
	},
	{
		audience: 'artisan',
		order: 5,
		question: 'How do I mark a job as completed?',
		answer: 'Navigate to Reports, select your active job, and click the green "Mark as Resolved" button. Confirm in the popup. The report will update to "Resolved", and the resident will be invited to confirm and rate your workmanship.',
	},
	{
		audience: 'artisan',
		order: 6,
		question: 'How do residents contact me?',
		answer: 'Residents who view your assigned report can click "Message" on your profile card. The system dispatches their message directly to the email registered on your artisan account. You can reply directly through your email provider.',
	},
	{
		audience: 'artisan',
		order: 7,
		question: 'How do I get reviews, and where do I see them?',
		answer: 'Once you mark a job as resolved, the resident is prompted to review your service with a 1-5 star rating and comment. All submissions appear on your "Reviews" page (accessible via the sidebar or the Reviews stat card on your dashboard).',
	},
	{
		audience: 'artisan',
		order: 8,
		question: 'What does the Reports number on my dashboard mean?',
		answer: 'The "Reports" card on your dashboard displays the total number of community issues reported within your coverage zone, giving you an accurate picture of available opportunities and local maintenance needs.',
	},
];

module.exports = artisanHelpFaqsData;
