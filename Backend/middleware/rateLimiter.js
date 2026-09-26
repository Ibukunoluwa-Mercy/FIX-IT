/**
 * Lightweight In-Memory Rate Limiter Middleware
 *
 * Tracks request counts per client IP over a sliding window duration (e.g. 15 minutes).
 * Used on public form submissions like POST /api/support/contact to mitigate
 * spam and automated request flooding without requiring extra infrastructure like Redis.
 */
const createRateLimiter = (options = {}) => {
	const windowMs = options.windowMs || 15 * 60 * 1000; // Default: 15 minutes
	const max = options.max || 5; // Default: 5 requests per window
	const message = options.message || 'Too many submissions from this IP, please try again later.';

	// In-memory request store mapping IP -> { count, resetTime }
	const hits = new Map();

	// Periodic cleanup of expired records every 5 minutes to prevent memory leak
	setInterval(() => {
		const now = Date.now();
		hits.forEach((record, ip) => {
			if (record.resetTime <= now) {
				hits.delete(ip);
			}
		});
	}, 5 * 60 * 1000).unref();

	return (req, res, next) => {
		const ip = typeof options.keyGenerator === 'function'
			? options.keyGenerator(req)
			: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
		const now = Date.now();

		let clientRecord = hits.get(ip);

		// If this is the first request or window expired, initialize new window
		if (!clientRecord || clientRecord.resetTime <= now) {
			clientRecord = {
				count: 1,
				resetTime: now + windowMs,
			};
			hits.set(ip, clientRecord);
			return next();
		}

		// Increment request counter
		clientRecord.count += 1;

		// Check if threshold exceeded
		if (clientRecord.count > max) {
			const retryAfterSeconds = Math.ceil((clientRecord.resetTime - now) / 1000);
			res.setHeader('Retry-After', retryAfterSeconds);
			return res.status(429).json({
				error: message,
				retryAfter: retryAfterSeconds,
			});
		}

		return next();
	};
};

module.exports = { createRateLimiter };
