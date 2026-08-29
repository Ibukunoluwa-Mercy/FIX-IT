const express = require('express');
const { register, registerOfficial, verifyEmail, createAdmin, login } = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { officialIdUpload } = require('../middleware/officialUpload');

const router = express.Router();

router.post('/register', register);
router.post('/register-official', (req, res, next) => {
	officialIdUpload.single('officialIdFile')(req, res, (error) => {
		if (!error) return next();
		if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Official ID file must be 5MB or smaller' });
		return res.status(400).json({ message: 'Official ID must be a PDF, JPG, or PNG file' });
	});
}, registerOfficial);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/admin', requireAuth, requireRole('Administrator'), createAdmin);

module.exports = router;
