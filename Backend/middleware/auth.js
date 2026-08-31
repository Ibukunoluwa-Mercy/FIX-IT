const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => process.env.JWT_SECRET || 'fixit-development-secret';

const protect = async (req, res, next) => {
	const authorization = req.headers.authorization || '';
	const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
	if (!token) return res.status(401).json({ message: 'Authentication required' });

	try {
		const decoded = jwt.verify(token, getJwtSecret());
		const userId = decoded.id || decoded._id || decoded.userId;
		if (!userId) return res.status(401).json({ message: 'Invalid authentication token' });
		const user = await User.findById(userId);
		if (!user || user.isActive === false) return res.status(401).json({ message: 'User account is unavailable' });
		req.user = user;
		return next();
	} catch (error) {
		if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') return next(error);
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};

module.exports = { protect };
