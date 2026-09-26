const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { avatarUpload } = require('../middleware/avatarUpload');
const { createRateLimiter } = require('../middleware/rateLimiter');
const {
	getAccount,
	updateAccount,
	updatePassword,
	updateNotifications,
	uploadAvatar,
	deleteAccount,
} = require('../controllers/settingsController');

const router = express.Router();

// These counters are keyed by authenticated user id so changing IPs cannot bypass
// protection around credential changes or destructive account deletion.
const passwordChangeLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	keyGenerator: (req) => String(req.user._id),
	message: 'Too many password change attempts. Please try again later.',
});
const accountDeletionLimiter = createRateLimiter({
	windowMs: 60 * 60 * 1000,
	max: 3,
	keyGenerator: (req) => String(req.user._id),
	message: 'Too many account deletion attempts. Please try again later.',
});

router.use(requireAuth);
router.get('/account', getAccount);
router.patch('/account', updateAccount);
router.post('/account/change-password', passwordChangeLimiter, updatePassword);
router.patch('/password', passwordChangeLimiter, updatePassword);
router.patch('/notifications', updateNotifications);
router.post('/account/avatar', avatarUpload.single('avatar'), uploadAvatar);
router.post('/avatar', avatarUpload.single('avatar'), uploadAvatar);
router.delete('/account', accountDeletionLimiter, deleteAccount);

module.exports = router;