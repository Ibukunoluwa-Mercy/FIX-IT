const HelpTopic = require('../models/HelpTopic');
const HelpTopicStep = require('../models/HelpTopicStep');
const HelpFaq = require('../models/HelpFaq');

/**
 * Controller for Help Center content endpoints.
 *
 * Implements promise chaining with .then() and .catch() exclusively as requested,
 * paired with detailed inline comments explaining the execution flow, data formatting,
 * and design decisions.
 */

/**
 * GET /api/help/topics
 * Returns all Quick Help Options, Browse by Category items, and Quick Guides.
 *
 * Each topic is returned with its core metadata (id, slug, section, icon, title, description,
 * readTime). For step-based topics, steps are merged into the topic payload so the frontend
 * can either consume everything up front or query individually.
 */
const getTopics = (req, res) => {
	// Step 1: Query all topics sorted by their natural display order
	HelpTopic.find({})
		.sort({ order: 1 })
		.lean()
		.then((topics) => {
			// Step 2: Fetch all topic steps in a single query to avoid N+1 database lookups
			return HelpTopicStep.find({})
				.sort({ order: 1 })
				.lean()
				.then((allSteps) => {
					// Group steps by topic ID in a Map for fast lookup
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

					// Step 3: Format response objects, attaching steps where applicable
					// Topics with hasSteps: true get an ordered 'steps' array;
					// topics with hasSteps: false retain their explanatory 'body' and 'content'.
					const formattedTopics = topics.map((topic) => {
						const topicIdStr = topic._id.toString();
						const steps = topic.hasSteps ? (stepsByTopicId.get(topicIdStr) || []) : [];

						return {
							id: topicIdStr,
							slug: topic.slug,
							section: topic.section, // 'quick_help' | 'category' | 'guide'
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

					// Return the complete collection of topics to client
					return res.json(formattedTopics);
				});
		})
		.catch((err) => {
			console.error('Failed to retrieve help topics:', err);
			return res.status(500).json({ error: 'Unable to load help topics at this time.' });
		});
};

/**
 * GET /api/help/topics/:slug
 * Retrieves full detail for a single topic by unique slug.
 *
 * Populates the step walkthrough modal when a user clicks a specific row,
 * fetching steps only if the topic is configured with hasSteps: true.
 */
const getTopicBySlug = (req, res) => {
	const slug = req.params.slug ? req.params.slug.trim().toLowerCase() : '';

	if (!slug) {
		return res.status(400).json({ error: 'A topic slug must be provided.' });
	}

	// Look up the topic by slug first; if not found, exit immediately with 404
	HelpTopic.findOne({ slug })
		.lean()
		.then((topic) => {
			if (!topic) {
				return res.status(404).json({ error: `Help topic "${slug}" was not found.` });
			}

			// If the topic is purely informational (hasSteps: false),
			// return it directly without performing a sub-query for steps
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

			// If the topic has steps, fetch all corresponding step records ordered sequentially
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

/**
 * GET /api/help/faqs
 * Retrieves FAQs sorted by priority order.
 *
 * Supports limiting results (default: 5) for the accordion preview,
 * or returning all FAQs via query parameter (?all=true) or endpoint.
 */
const getFaqs = (req, res) => {
	const shouldReturnAll = req.query.all === 'true' || req.query.all === '1' || req.path.endsWith('/all');
	const limit = parseInt(req.query.limit, 10) || 5;

	let query = HelpFaq.find({}).sort({ order: 1 });

	// If not requesting all FAQs, apply the limit for the initial 5-item display
	if (!shouldReturnAll) {
		query = query.limit(limit);
	}

	query
		.lean()
		.then((faqs) => {
			const formattedFaqs = faqs.map((f) => ({
				id: f._id.toString(),
				question: f.question,
				answer: f.answer,
				order: f.order,
			}));

			return res.json(formattedFaqs);
		})
		.catch((err) => {
			console.error('Failed to retrieve FAQs:', err);
			return res.status(500).json({ error: 'Unable to load FAQs at this time.' });
		});
};

const getAllFaqs = (req, res) => {
	HelpFaq.find({})
		.sort({ order: 1 })
		.lean()
		.then((faqs) => {
			const formattedFaqs = faqs.map((f) => ({
				id: f._id.toString(),
				question: f.question,
				answer: f.answer,
				order: f.order,
			}));

			return res.json(formattedFaqs);
		})
		.catch((err) => {
			console.error('Failed to retrieve all FAQs:', err);
			return res.status(500).json({ error: 'Unable to load all FAQs.' });
		});
};

/**
 * GET /api/help/search?q=keyword
 * Full-text / substring search across help topics, walkthrough steps, and FAQs.
 *
 * Returns results grouped by type ('articles' vs 'faqs') so the UI can present
 * clean categorised search results.
 */
const searchHelp = (req, res) => {
	const rawQuery = req.query.q || req.query.query || '';
	const query = rawQuery.trim();

	// If no search query provided, return empty results immediately
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

	// Create a safe case-insensitive regex for substring matching
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(escaped, 'i');

	// Step 1: Find matching FAQs
	HelpFaq.find({
		$or: [{ question: regex }, { answer: regex }],
	})
		.sort({ order: 1 })
		.lean()
		.then((matchedFaqs) => {
			// Step 2: Find matching steps to capture topics where the step content matches
			return HelpTopicStep.find({
				$or: [{ title: regex }, { description: regex }],
			})
				.lean()
				.then((matchedSteps) => {
					const matchedTopicIdsFromSteps = matchedSteps.map((s) => s.topicId);

					// Step 3: Find topics that match directly OR matched via their steps
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
							// Format articles
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

							// Format FAQs
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
