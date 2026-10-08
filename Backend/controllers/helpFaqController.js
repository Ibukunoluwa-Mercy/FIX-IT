const HelpFaq = require('../models/HelpFaq');

/**
 * Helper to determine caller audience based on auth user role.
 */
const getCallerAudience = (req) => {
	const role = req.user?.role;
	if (role === 'artisan') return 'artisan';
	if (role === 'official' || role === 'admin') return 'resident';
	return 'resident';
};

/**
 * GET /api/help/faqs?limit=5 (and /api/help/faqs/all)
 * Filters by audience inside MongoDB query so callers only receive their role's FAQs.
 */
const getFaqs = (req, res) => {
	const shouldReturnAll = req.query.all === 'true' || req.query.all === '1' || req.path.endsWith('/all');
	const limit = parseInt(req.query.limit, 10) || 5;
	const userAudience = getCallerAudience(req);

	let query = HelpFaq.find({
		audience: { $in: [userAudience, 'all'] },
	}).sort({ order: 1 });

	if (!shouldReturnAll) {
		query = query.limit(limit);
	}

	query
		.lean()
		.then((faqs) => {
			const formattedFaqs = faqs.map((f) => ({
				id: f._id.toString(),
				audience: f.audience || 'all',
				question: f.question,
				answer: f.answer,
				order: f.order,
			}));

			if (formattedFaqs.length > 0) {
				return res.status(200).json(formattedFaqs);
			}

			if (userAudience === 'artisan') {
				const artisanFaqs = require('../seed/data/artisanHelpFaqsData');
				return res.status(200).json(shouldReturnAll ? artisanFaqs : artisanFaqs.slice(0, limit));
			}

			return res.status(200).json([]);
		})
		.catch((err) => {
			console.error('Failed to retrieve FAQs from DB:', err.message);
			if (userAudience === 'artisan') {
				const artisanFaqs = require('../seed/data/artisanHelpFaqsData');
				return res.status(200).json(shouldReturnAll ? artisanFaqs : artisanFaqs.slice(0, limit));
			}
			return res.status(500).json({ error: 'Unable to load FAQs at this time.' });
		});
};

/**
 * GET /api/help/faqs/all
 */
const getAllFaqs = (req, res) => {
	const userAudience = getCallerAudience(req);

	HelpFaq.find({
		audience: { $in: [userAudience, 'all'] },
	})
		.sort({ order: 1 })
		.lean()
		.then((faqs) => {
			const formattedFaqs = faqs.map((f) => ({
				id: f._id.toString(),
				audience: f.audience || 'all',
				question: f.question,
				answer: f.answer,
				order: f.order,
			}));

			if (formattedFaqs.length > 0) {
				return res.status(200).json(formattedFaqs);
			}

			if (userAudience === 'artisan') {
				const artisanFaqs = require('../seed/data/artisanHelpFaqsData');
				return res.status(200).json(artisanFaqs);
			}

			return res.status(200).json([]);
		})
		.catch((err) => {
			console.error('Failed to retrieve all FAQs from DB:', err.message);
			if (userAudience === 'artisan') {
				const artisanFaqs = require('../seed/data/artisanHelpFaqsData');
				return res.status(200).json(artisanFaqs);
			}
			return res.status(500).json({ error: 'Unable to load all FAQs.' });
		});
};

module.exports = {
	getFaqs,
	getAllFaqs,
};
