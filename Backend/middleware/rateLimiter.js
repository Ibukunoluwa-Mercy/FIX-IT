const createRateLimiter = (options = {}) => {
	const windowMs = options.windowMs || 15 * 60 * 1000; 
	const max = options.max || 5; 
	const message = options.message || 'Too many submissions from this IP, please try again later.';

	
	const hits = new Map();

	
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

		
		if (!clientRecord || clientRecord.resetTime <= now) {
			clientRecord = {
				count: 1,
				resetTime: now + windowMs,
			};
			hits.set(ip, clientRecord);
			return next();
		}

		
		clientRecord.count += 1;

		
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
