const HelpTopic = require('../models/HelpTopic');
const HelpTopicStep = require('../models/HelpTopicStep');
const HelpFaq = require('../models/HelpFaq');

const getTopics = (req, res) => {
	
	HelpTopic.find({})
		.sort({ order: 1 })
		.lean()
		.then((topics) => {
			
			return HelpTopicStep.find({})
				.sort({ order: 1 })
				.lean()
				.then((allSteps) => {
					
					const stepsByTopicId = new Map();
					allSteps.forEach((step) => {
						const key = step.topicId.toString();
						if (!stepsByTopicId.has(key)) {
							stepsByTopicId.set(key, []);
						}
						stepsByTopicId.get(key).push({
							id: step._id.toString(),
							order: step.order,
							title: step.title,
							description: step.description,
						});
					});

					
					
					
					const formattedTopics = topics.map((topic) => {
						const topicIdStr = topic._id.toString();
						const steps = topic.hasSteps ? (stepsByTopicId.get(topicIdStr) || []) : [];

						return {
							id: topicIdStr,
							slug: topic.slug,
							section: topic.section, 
							icon: topic.icon,
							iconBg: topic.iconBg,
							iconColor: topic.iconColor,
							title: topic.title,
							description: topic.description,
							readTime: topic.readTime || null,
							hasSteps: Boolean(topic.hasSteps),
							steps,
							body: topic.body || null,
							content: topic.content || [],
							order: topic.order,
						};
					});

					
					return res.json(formattedTopics);
				});
		})
		.catch((err) => {
			console.error('Failed to retrieve help topics:', err);
			return res.status(500).json({ error: 'Unable to load help topics at this time.' });
		});
};

const getTopicBySlug = (req, res) => {
	const slug = req.params.slug ? req.params.slug.trim().toLowerCase() : '';

	if (!slug) {
		return res.status(400).json({ error: 'A topic slug must be provided.' });
	}

	
	HelpTopic.findOne({ slug })
		.lean()
		.then((topic) => {
			if (!topic) {
				return res.status(404).json({ error: `Help topic "${slug}" was not found.` });
			}

			
			
			if (!topic.hasSteps) {
				return res.json({
					id: topic._id.toString(),
					slug: topic.slug,
					section: topic.section,
					icon: topic.icon,
					iconBg: topic.iconBg,
					iconColor: topic.iconColor,
					title: topic.title,
					description: topic.description,
					readTime: topic.readTime || null,
					hasSteps: false,
					steps: [],
					body: topic.body,
					content: topic.content || [],
				});
			}

			
			return HelpTopicStep.find({ topicId: topic._id })
				.sort({ order: 1 })
				.lean()
				.then((steps) => {
					const formattedSteps = steps.map((s) => ({
						id: s._id.toString(),
						order: s.order,
						title: s.title,
						description: s.description,
					}));

					return res.json({
						id: topic._id.toString(),
						slug: topic.slug,
						section: topic.section,
						icon: topic.icon,
						iconBg: topic.iconBg,
						iconColor: topic.iconColor,
						title: topic.title,
						description: topic.description,
						readTime: topic.readTime || null,
						hasSteps: true,
						steps: formattedSteps,
						body: topic.body,
						content: topic.content || [],
					});
				});
		})
		.catch((err) => {
			console.error(`Error retrieving help topic for slug "${slug}":`, err);
			return res.status(500).json({ error: 'Unable to load topic details.' });
		});
};

const { getFaqs, getAllFaqs } = require('./helpFaqController');

const searchHelp = (req, res) => {
	const rawQuery = req.query.q || req.query.query || '';
	const query = rawQuery.trim();

	
	if (!query) {
		return res.json({
			query: '',
			total: 0,
			results: {
				articles: [],
				faqs: [],
			},
		});
	}

	
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(escaped, 'i');

	
	HelpFaq.find({
		$or: [{ question: regex }, { answer: regex }],
	})
		.sort({ order: 1 })
		.lean()
		.then((matchedFaqs) => {
			
			return HelpTopicStep.find({
				$or: [{ title: regex }, { description: regex }],
			})
				.lean()
				.then((matchedSteps) => {
					const matchedTopicIdsFromSteps = matchedSteps.map((s) => s.topicId);

					
					return HelpTopic.find({
						$or: [
							{ title: regex },
							{ description: regex },
							{ body: regex },
							{ _id: { $in: matchedTopicIdsFromSteps } },
						],
					})
						.sort({ order: 1 })
						.lean()
						.then((matchedTopics) => {
							
							const formattedArticles = matchedTopics.map((topic) => ({
								id: topic._id.toString(),
								slug: topic.slug,
								section: topic.section,
								icon: topic.icon,
								iconBg: topic.iconBg,
								iconColor: topic.iconColor,
								title: topic.title,
								description: topic.description,
								readTime: topic.readTime,
								hasSteps: topic.hasSteps,
							}));

							
							const formattedFaqs = matchedFaqs.map((faq) => ({
								id: faq._id.toString(),
								question: faq.question,
								answer: faq.answer,
								order: faq.order,
							}));

							const totalMatches = formattedArticles.length + formattedFaqs.length;

							return res.json({
								query,
								total: totalMatches,
								results: {
									articles: formattedArticles,
									faqs: formattedFaqs,
								},
							});
						});
				});
		})
		.catch((err) => {
			console.error('Help search error:', err);
			return res.status(500).json({ error: 'Search failed, please try again.' });
		});
};

module.exports = {
	getTopics,
	getTopicBySlug,
	getFaqs,
	getAllFaqs,
	searchHelp,
};
