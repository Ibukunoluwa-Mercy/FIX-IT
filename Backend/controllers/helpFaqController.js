const HelpFaq = require('../models/HelpFaq');

const getFaqs = (req, res) => {
	const shouldReturnAll = req.query.all === 'true' || req.query.all === '1' || req.path.endsWith('/all');
	const limit = parseInt(req.query.limit, 10) || 5;

	let query = HelpFaq.find({}).sort({ order: 1 });

	
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

module.exports = {
	getFaqs,
	getAllFaqs,
};
