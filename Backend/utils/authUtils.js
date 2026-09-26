const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ROLE_MAP = {
	resident: 'resident',
	official: 'admin',
	admin: 'admin',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const parseBoolean = (value) => value === true || value === 'true';

const createToken = (user) => jwt.sign(
	{ id: user._id.toString(), role: user.role },
	process.env.JWT_SECRET || 'fixit-development-secret',
	{ expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
);

const createVerificationToken = () => {
	const rawToken = crypto.randomBytes(32).toString('hex');
	return {
		rawToken,
		hash: crypto.createHash('sha256').update(rawToken).digest('hex'),
		expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
	};
};

const createPasswordResetToken = () => {
	const rawToken = crypto.randomBytes(32).toString('hex');
	return {
		rawToken,
		hash: crypto.createHash('sha256').update(rawToken).digest('hex'),
		expires: new Date(Date.now() + 15 * 60 * 1000),
	};
};

module.exports = {
	ROLE_MAP,
	emailPattern,
	normalizeText,
	parseBoolean,
	createToken,
	createVerificationToken,
	createPasswordResetToken,
};
