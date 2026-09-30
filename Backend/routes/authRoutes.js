const express = require('express');
const { register, registerOfficial, verifyEmail, forgotPassword, resetPassword, createAdmin, login, getMe, logout } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { officialIdUpload } = require('../middleware/officialUpload');

const router = express.Router();

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 10, 
	message: { message: 'Too many login attempts. Please try again later.' }
});

const uploadOfficialId = (req, res, next) => {
	const upload = officialIdUpload.single('officialIdFile');
	upload(req, res, (error) => {
		if (error) {
			if (error.code === 'LIMIT_FILE_SIZE') {
				return res.status(413).json({ message: 'Official ID file must be 5MB or smaller' });
			}
			if (error.code === 'LIMIT_UNEXPECTED_FILE') {
				return res.status(400).json({ message: 'Official ID must be a PDF, JPG, or PNG file' });
			}
			return next(error);
		}
		return next();
	});
};

router.post('/register', register);
router.post('/register-official', uploadOfficialId, registerOfficial);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);
router.post('/admin', requireAuth, requireRole('admin'), createAdmin);

module.exports = router;
