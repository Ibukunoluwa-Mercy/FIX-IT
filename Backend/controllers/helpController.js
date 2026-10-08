const HelpTopic = require('../models/HelpTopic');
const HelpTopicStep = require('../models/HelpTopicStep');
const HelpFaq = require('../models/HelpFaq');

/**
 * Helper to determine caller audience based on auth user role.
 * Defaults to 'resident' if unauthenticated, or uses caller's actual role.
 */
const getCallerAudience = (req) => {
	const role = req.user?.role;
	if (role === 'artisan') return 'artisan';
	if (role === 'official' || role === 'admin') return 'resident';
	return 'resident';
};

/**
 * GET /api/help/topics
 * Returns topics where audience is the caller's role or 'all', grouped by section.
 * Filters by audience inside the database query so artisans never receive resident-only content.
 */
const getTopics = (req, res) => {
	const userAudience = getCallerAudience(req);

	// Query database directly for caller's audience or universal 'all'
	HelpTopic.find({
		audience: { $in: [userAudience, 'all'] },
	})
		.sort({ order: 1 })
		.lean()
		.then((topics) => {
			const topicIds = topics.map((t) => t._id);

			// Retrieve steps only for matching topics
			return HelpTopicStep.find({ topicId: { $in: topicIds } })
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
							audience: topic.audience || 'all',
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

					// If database has topics, return them
					if (formattedTopics.length > 0) {
						return res.status(200).json(formattedTopics);
					}

					// Fallback to in-memory artisan topics if DB has not been seeded with artisan topics yet
					if (userAudience === 'artisan') {
						const artisanSeed = require('../seed/data/artisanHelpTopicsData');
						return res.status(200).json(artisanSeed);
					}

					return res.status(200).json([]);
				});
		})
		.catch((err) => {
			console.error('Failed to retrieve help topics from DB:', err.message);
			if (userAudience === 'artisan') {
				const artisanSeed = require('../seed/data/artisanHelpTopicsData');
				return res.status(200).json(artisanSeed);
			}
			return res.status(500).json({ error: 'Unable to load help topics at this time.' });
		});
};

/**
 * GET /api/help/topics/:slug
 * Returns one topic plus its ordered steps for the modal.
 * Enforces 404 if the topic does not match the caller's audience.
 */
const getTopicBySlug = (req, res) => {
	const slug = req.params.slug ? req.params.slug.trim().toLowerCase() : '';
	if (!slug) {
		return res.status(400).json({ error: 'A topic slug must be provided.' });
	}

	const userAudience = getCallerAudience(req);

	// Filter by audience inside the query so an artisan can never fetch a resident-only topic by guessing its slug
	HelpTopic.findOne({
		slug,
		audience: { $in: [userAudience, 'all'] },
	})
		.lean()
		.then((topic) => {
			if (!topic) {
				return res.status(404).json({ error: `Help topic "${slug}" was not found or is unavailable for your account type.` });
			}

			// Topics without steps (e.g. Troubleshooting) return their body text directly and skip extra steps query
			if (!topic.hasSteps) {
				return res.status(200).json({
					id: topic._id.toString(),
					slug: topic.slug,
					audience: topic.audience || 'all',
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

					return res.status(200).json({
						id: topic._id.toString(),
						slug: topic.slug,
						audience: topic.audience || 'all',
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
			console.error(`Error retrieving help topic for slug "${slug}":`, err.message);
			if (userAudience === 'artisan') {
				const artisanSeed = require('../seed/data/artisanHelpTopicsData');
				const found = artisanSeed.find((t) => t.slug === slug || t.id === slug);
				if (found) return res.status(200).json(found);
			}
			return res.status(500).json({ error: 'Unable to load topic details.' });
		});
};

const { getFaqs, getAllFaqs } = require('./helpFaqController');

/**
 * GET /api/help/search?q=keyword
 * Case-insensitive text search over topics and FAQs for caller's audience only.
 * Returns { topics: [...], faqs: [...] }
 */
const searchHelp = (req, res) => {
	const rawQuery = req.query.q || req.query.query || '';
	const query = rawQuery.trim();

	if (!query) {
		return res.status(200).json({
			query: '',
			total: 0,
			topics: [],
			faqs: [],
			results: {
				articles: [],
				faqs: [],
			},
		});
	}

	const userAudience = getCallerAudience(req);
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(escaped, 'i');

	// 1. Search FAQs matching caller's audience
	HelpFaq.find({
		audience: { $in: [userAudience, 'all'] },
		$or: [{ question: regex }, { answer: regex }],
	})
		.sort({ order: 1 })
		.lean()
		.then((matchedFaqs) => {
			// 2. Search Steps for matching keywords
			return HelpTopicStep.find({
				$or: [{ title: regex }, { description: regex }],
			})
				.lean()
				.then((matchedSteps) => {
					const matchedTopicIdsFromSteps = matchedSteps.map((s) => s.topicId);

					// 3. Search Topics with audience filter strictly applied in MongoDB
					return HelpTopic.find({
						audience: { $in: [userAudience, 'all'] },
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
								audience: topic.audience,
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

							if (totalMatches > 0) {
								return res.status(200).json({
									query,
									total: totalMatches,
									topics: formattedArticles,
									faqs: formattedFaqs,
									results: {
										articles: formattedArticles,
										faqs: formattedFaqs,
									},
								});
							}

							if (userAudience === 'artisan') {
								const artisanSeed = require('../seed/data/artisanHelpTopicsData');
								const artisanFaqs = require('../seed/data/artisanHelpFaqsData');
								const q = query.toLowerCase();

								const fallbackArticles = artisanSeed.filter((t) => {
									return t.title.toLowerCase().includes(q) ||
										t.description?.toLowerCase().includes(q) ||
										t.body?.toLowerCase().includes(q) ||
										t.steps?.some((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
								});

								const fallbackFaqs = artisanFaqs.filter((f) => {
									return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
								});

								return res.status(200).json({
									query,
									total: fallbackArticles.length + fallbackFaqs.length,
									topics: fallbackArticles,
									faqs: fallbackFaqs,
									results: {
										articles: fallbackArticles,
										faqs: fallbackFaqs,
									},
								});
							}

							return res.status(200).json({
								query,
								total: 0,
								topics: [],
								faqs: [],
								results: { articles: [], faqs: [] },
							});
						});
				});
		})
		.catch((err) => {
			console.error('Help search error:', err.message);
			if (userAudience === 'artisan') {
				const artisanSeed = require('../seed/data/artisanHelpTopicsData');
				const artisanFaqs = require('../seed/data/artisanHelpFaqsData');
				const q = query.toLowerCase();

				const fallbackArticles = artisanSeed.filter((t) => {
					return t.title.toLowerCase().includes(q) ||
						t.description?.toLowerCase().includes(q) ||
						t.body?.toLowerCase().includes(q) ||
						t.steps?.some((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
				});

				const fallbackFaqs = artisanFaqs.filter((f) => {
					return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
				});

				return res.status(200).json({
					query,
					total: fallbackArticles.length + fallbackFaqs.length,
					topics: fallbackArticles,
					faqs: fallbackFaqs,
					results: {
						articles: fallbackArticles,
						faqs: fallbackFaqs,
					},
				});
			}
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
