const express = require('express');
const { submitContactSupport } = require('../controllers/supportController');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const contactLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: 'Too many contact messages sent from this device. Please wait a few minutes before submitting again.',
});

router.post('/contact', contactLimiter, submitContactSupport);

module.exports = router;
