const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { avatarUpload } = require('../middleware/avatarUpload');
const {
	getAccount,
	updateAccount,
	updatePassword,
	updateNotifications,
	uploadAvatar,
	deleteAccount,
} = require('../controllers/settingsController');

const router = express.Router();

router.use(requireAuth);
router.get('/account', getAccount);
router.patch('/account', updateAccount);
router.patch('/password', updatePassword);
router.patch('/notifications', updateNotifications);
router.post('/avatar', avatarUpload.single('avatar'), uploadAvatar);
router.delete('/account', deleteAccount);

module.exports = router;