const { protect } = require('./auth');

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

const requireAuth = protect;

module.exports = { requireAuth, protect };

const requireRole = (...allowedRoles) => (req, res, next) => {
	const normalizedAllowed = allowedRoles.map(normalizeRole);
	const userRole = normalizeRole(req.user?.role);
	if (!req.user || !normalizedAllowed.includes(userRole)) {
		return res.status(403).json({ message: 'Insufficient permissions' });
	}
	return next();
};

module.exports.requireRole = requireRole;
