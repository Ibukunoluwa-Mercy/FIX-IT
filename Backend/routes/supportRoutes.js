const express = require('express');
const { submitContactSupport } = require('../controllers/supportController');
const { createRateLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

const router = express.Router();

const contactLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: 'Too many contact messages sent from this device. Please wait a few minutes before submitting again.',
});

// Middleware that attaches req.user if Bearer token is provided, without blocking public callers
const optionalAuth = (req, res, next) => {
	const authorization = req.headers.authorization || '';
	if (authorization.startsWith('Bearer ') || req.cookies?.token) {
		return protect(req, res, (err) => {
			// If invalid token, proceed without user rather than hard failing
			return next();
		});
	}
	return next();
};

router.post('/contact', contactLimiter, optionalAuth, submitContactSupport);

module.exports = router;
