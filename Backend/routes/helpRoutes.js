const express = require('express');
const {
	getTopics,
	getTopicBySlug,
	getFaqs,
	getAllFaqs,
	searchHelp,
} = require('../controllers/helpController');
const { seedHelpCenter } = require('../seed/seedHelpCenter');

const router = express.Router();

router.get('/topics', getTopics);

router.get('/topics/:slug', getTopicBySlug);

router.get('/faqs/all', getAllFaqs);

router.get('/faqs', getFaqs);

router.get('/search', searchHelp);

router.post('/seed', (req, res) => {
	seedHelpCenter()
		.then((result) => res.json({ message: 'Help center content successfully seeded.', ...result }))
		.catch((err) => res.status(500).json({ error: 'Failed to seed help content.', details: err.message }));
});

module.exports = router;
