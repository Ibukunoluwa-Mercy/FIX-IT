const HelpTopic = require('../models/HelpTopic');
const HelpTopicStep = require('../models/HelpTopicStep');
const HelpFaq = require('../models/HelpFaq');
const topicsData = require('./data/helpTopicsData');
const faqsData = require('./data/helpFaqsData');

/**
 * Seed function executing via .then() / .catch() promise chains.
 *
 * First deletes existing HelpTopic, HelpTopicStep, and HelpFaq documents to ensure
 * idempotency, then inserts all topics, creates step records for topics with hasSteps: true,
 * and populates the FAQ documents.
 */
const seedHelpCenter = () => {
	console.log('Seeding Help Center content...');

	return HelpTopicStep.deleteMany({})
		.then(() => HelpTopic.deleteMany({}))
		.then(() => HelpFaq.deleteMany({}))
		.then(() => {
			// Insert all topics without steps first
			const topicsToInsert = topicsData.map((t) => ({
				slug: t.slug,
				section: t.section,
				order: t.order,
				title: t.title,
				description: t.description,
				icon: t.icon,
				iconBg: t.iconBg,
				iconColor: t.iconColor,
				readTime: t.readTime,
				hasSteps: t.hasSteps,
				body: t.body,
				content: t.content || [],
			}));

			return HelpTopic.insertMany(topicsToInsert);
		})
		.then((insertedTopics) => {
			// Build step records linked by topicId and topicSlug
			const topicMap = new Map();
			insertedTopics.forEach((t) => topicMap.set(t.slug, t._id));

			const stepsToInsert = [];
			topicsData.forEach((t) => {
				if (t.hasSteps && Array.isArray(t.steps)) {
					const topicId = topicMap.get(t.slug);
					if (topicId) {
						t.steps.forEach((s) => {
							stepsToInsert.push({
								topicId,
								topicSlug: t.slug,
								order: s.order,
								title: s.title,
								description: s.description,
							});
						});
					}
				}
			});

			return HelpTopicStep.insertMany(stepsToInsert);
		})
		.then(() => {
			// Insert FAQs
			return HelpFaq.insertMany(faqsData);
		})
		.then(() => {
			console.log('Help Center content seeded successfully.');
			return { success: true };
		})
		.catch((err) => {
			console.error('Error seeding Help Center content:', err);
			throw err;
		});
};

module.exports = { seedHelpCenter, topicsData, faqsData };
