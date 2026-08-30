const jwt = require('jsonwebtoken');

const normalizeRole = (value) => {
	const normalized = String(value || '').trim().toLowerCase();
	if (!normalized) return '';
	const aliases = {
		resident: 'resident',
		communitymember: 'resident',
		admin: 'admin',
		administrator: 'admin',
		official: 'admin',
		issueresolver: 'admin',
	};
	return aliases[normalized] || normalized;
};

const requireAuth = (req, res, next) => {
	const authorization = req.headers.authorization || '';
	const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
	if (!token) return res.status(401).json({ message: 'Authentication required' });

	try {
		req.user = jwt.verify(token, process.env.JWT_SECRET || 'fixit-development-secret');
		return next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};

module.exports = { requireAuth };

const requireRole = (...allowedRoles) => (req, res, next) => {
	const normalizedAllowed = allowedRoles.map(normalizeRole);
	const userRole = normalizeRole(req.user?.role);
	if (!req.user || !normalizedAllowed.includes(userRole)) {
		return res.status(403).json({ message: 'Insufficient permissions' });
	}
	return next();
};

module.exports.requireRole = requireRole;
