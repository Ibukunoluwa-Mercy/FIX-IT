const express = require('express');
const { submitContactSupport } = require('../controllers/supportController');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Rate limiter: max 5 contact submissions per 15 minutes per IP
const contactLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: 'Too many contact messages sent from this device. Please wait a few minutes before submitting again.',
});

/**
 * POST /api/support/contact
 * Handles contact support form submissions with rate limiting,
 * validation, sanitization, database persistence, and email notification.
 */
router.post('/contact', contactLimiter, submitContactSupport);

module.exports = router;
