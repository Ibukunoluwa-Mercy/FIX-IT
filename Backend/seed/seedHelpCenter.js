const HelpTopic = require('../models/HelpTopic');
const HelpTopicStep = require('../models/HelpTopicStep');
const HelpFaq = require('../models/HelpFaq');
const topicsData = require('./data/helpTopicsData');
const faqsData = require('./data/helpFaqsData');
const artisanTopicsData = require('./data/artisanHelpTopicsData');
const artisanFaqsData = require('./data/artisanHelpFaqsData');

/**
 * Re-runnable seed script that upserts topics, steps, and FAQs by slug and question.
 * Supports both 'resident' and 'artisan' audiences without duplicating or wiping records indiscriminately.
 */
const seedHelpCenter = () => {
	console.log('Seeding Help Center content for residents and artisans...');

	// Merge topics, ensuring default audience is 'resident' if unspecified
	const allTopics = [
		...topicsData.map((t) => ({ ...t, audience: t.audience || 'resident' })),
		...artisanTopicsData,
	];

	const allFaqs = [
		...faqsData.map((f) => ({ ...f, audience: f.audience || 'resident' })),
		...artisanFaqsData,
	];

	// Step 1: Upsert topics by slug
	const topicUpsertPromises = allTopics.map((t) => {
		return HelpTopic.findOneAndUpdate(
			{ slug: t.slug },
			{
				$set: {
					slug: t.slug,
					audience: t.audience || 'all',
					section: t.section,
					order: t.order || 0,
					title: t.title,
					description: t.description || '',
					icon: t.icon,
					iconBg: t.iconBg || '#eff6ff',
					iconColor: t.iconColor || '#2563eb',
					readTime: t.readTime || null,
					hasSteps: Boolean(t.hasSteps),
					body: t.body || null,
					content: t.content || [],
				},
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		).lean();
	});

	return Promise.all(topicUpsertPromises)
		.then((savedTopics) => {
			const topicMap = new Map();
			savedTopics.forEach((doc) => {
				if (doc) topicMap.set(doc.slug, doc._id);
			});

			// Step 2: Delete existing steps for these topics and re-insert to guarantee accurate ordering
			const topicIds = Array.from(topicMap.values());
			return HelpTopicStep.deleteMany({ topicId: { $in: topicIds } })
				.then(() => {
					const stepsToInsert = [];
					allTopics.forEach((t) => {
						const topicId = topicMap.get(t.slug);
						if (topicId && t.hasSteps && Array.isArray(t.steps)) {
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
					});

					if (stepsToInsert.length > 0) {
						return HelpTopicStep.insertMany(stepsToInsert);
					}
					return Promise.resolve();
				});
		})
		.then(() => {
			// Step 3: Upsert FAQs by question and audience
			const faqUpsertPromises = allFaqs.map((f) => {
				return HelpFaq.findOneAndUpdate(
					{ question: f.question, audience: f.audience || 'all' },
					{
						$set: {
							question: f.question,
							answer: f.answer,
							audience: f.audience || 'all',
							order: f.order || 0,
						},
					},
					{ upsert: true, new: true, setDefaultsOnInsert: true }
				);
			});

			return Promise.all(faqUpsertPromises);
		})
		.then(() => {
			console.log('Help Center content seeded and upserted successfully.');
			return { success: true, totalTopics: allTopics.length, totalFaqs: allFaqs.length };
		})
		.catch((err) => {
			console.error('Error seeding Help Center content:', err);
			throw err;
		});
};

module.exports = { seedHelpCenter, topicsData, faqsData, artisanTopicsData, artisanFaqsData };
