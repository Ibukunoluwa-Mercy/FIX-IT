const express = require('express');
const { reverseGeocode, searchGeocode } = require('../controllers/geocodeController');

const router = express.Router();
const requestLog = new Map();
const rateLimitGeocode = (req, res, next) => {
	const key = req.ip || 'unknown';
	const now = Date.now();
	const recent = (requestLog.get(key) || []).filter((timestamp) => now - timestamp < 60_000);
	if (recent.length >= 30) return res.status(429).json({ error: 'Too many geocoding requests. Please try again shortly.' });
	recent.push(now);
	requestLog.set(key, recent);
	return next();
};

router.use(rateLimitGeocode);
router.get('/reverse', reverseGeocode);
router.get('/search', searchGeocode);

module.exports = router;