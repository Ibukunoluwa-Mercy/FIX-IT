const WINDOW_MS = 60_000;
const configuredLimit = Number(process.env.NEARBY_ISSUES_RATE_LIMIT_PER_MINUTE);
const MAX_REQUESTS = Number.isInteger(configuredLimit) && configuredLimit > 0 ? configuredLimit : 60;
const requestsByUser = new Map();
let lastCleanup = 0;

const rateLimitNearbyIssues = (req, res, next) => {
	const userId = String(req.user?._id || '');
	if (!userId) return res.status(401).json({ error: 'Authentication required' });

	const now = Date.now();
	if (now - lastCleanup >= WINDOW_MS) {
		// Remove expired user buckets periodically so this per-process limiter does
		// not retain every account that has ever requested nearby issues.
		requestsByUser.forEach((timestamps, key) => {
			const activeTimestamps = timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
			if (activeTimestamps.length) requestsByUser.set(key, activeTimestamps);
			else requestsByUser.delete(key);
		});
		lastCleanup = now;
	}

	const recentRequests = (requestsByUser.get(userId) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
	if (recentRequests.length >= MAX_REQUESTS) {
		const retryAfterSeconds = Math.max(1, Math.ceil((recentRequests[0] + WINDOW_MS - now) / 1000));
		res.set('Retry-After', String(retryAfterSeconds));
		return res.status(429).json({ error: 'Too many nearby issue requests. Please try again shortly.' });
	}

	recentRequests.push(now);
	requestsByUser.set(userId, recentRequests);
	return next();
};

module.exports = { rateLimitNearbyIssues, requestsByUser, MAX_REQUESTS };