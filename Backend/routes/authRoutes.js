const express = require('express');
const { register, registerOfficial, verifyEmail, forgotPassword, resetPassword, createAdmin, login } = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { officialIdUpload } = require('../middleware/officialUpload');

const router = express.Router();

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
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/verify-email', verifyEmail);
router.post('/admin', requireAuth, requireRole('admin'), createAdmin);

module.exports = router;
