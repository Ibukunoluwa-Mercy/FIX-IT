const express = require('express');
const {
	getTopics,
	getTopicBySlug,
	getFaqs,
	searchHelp,
} = require('../controllers/helpController');
const { seedHelpCenter } = require('../seed/seedHelpCenter');

const router = express.Router();

/**
 * Help Center Content Routes
 *
 * All handlers execute promise chains with .then() and .catch().
 */

// 1. GET /api/help/topics - Returns all topics with ordered steps / body
router.get('/topics', getTopics);

// 2. GET /api/help/topics/:slug - Full detail for a single topic modal walkthrough
router.get('/topics/:slug', getTopicBySlug);

// 3. GET /api/help/faqs/all - Returns all FAQs without limit
router.get('/faqs/all', (req, res, next) => {
	req.query.all = 'true';
	next();
}, getFaqs);

// 4. GET /api/help/faqs - Returns default 5-item FAQ slice or limited via ?limit=
router.get('/faqs', getFaqs);

// 5. GET /api/help/search?q=keyword - Full-text and substring search across articles and FAQs
router.get('/search', searchHelp);

// 6. POST /api/help/seed - Idempotent re-seed endpoint for admin/content maintenance
router.post('/seed', (req, res) => {
	seedHelpCenter()
		.then((result) => res.json({ message: 'Help center content successfully seeded.', ...result }))
		.catch((err) => res.status(500).json({ error: 'Failed to seed help content.', details: err.message }));
});

module.exports = router;
