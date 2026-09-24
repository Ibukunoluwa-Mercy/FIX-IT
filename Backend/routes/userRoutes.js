const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getMyLocation, saveMyLocation, deleteMyLocation } = require('../controllers/userLocationController');

const router = express.Router();
const requestLog = new Map();
const rateLimitLocation = (req, res, next) => {
	const key = String(req.user._id);
	const now = Date.now();
	const recent = (requestLog.get(key) || []).filter((timestamp) => now - timestamp < 60_000);
	if (recent.length >= 60) return res.status(429).json({ error: 'Too many location requests. Please try again shortly.' });
	recent.push(now);
	requestLog.set(key, recent);
	return next();
};

router.use(requireAuth, rateLimitLocation);
router.get('/me/location', getMyLocation);
router.put('/me/location', saveMyLocation);
router.delete('/me/location', deleteMyLocation);

module.exports = router;