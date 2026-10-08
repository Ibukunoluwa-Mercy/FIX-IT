const express = require('express');
const {
	getTopics,
	getTopicBySlug,
	getFaqs,
	getAllFaqs,
	searchHelp,
} = require('../controllers/helpController');
const { seedHelpCenter } = require('../seed/seedHelpCenter');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Middleware to hydrate req.user if Bearer token is provided
const optionalAuth = (req, res, next) => {
	const authorization = req.headers.authorization || '';
	if (authorization.startsWith('Bearer ') || req.cookies?.token) {
		return protect(req, res, (err) => next());
	}
	return next();
};

router.use(optionalAuth);

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
