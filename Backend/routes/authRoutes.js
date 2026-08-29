const express = require('express');
const { register, verifyEmail, createAdmin, login } = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/admin', requireAuth, requireRole('Administrator'), createAdmin);

module.exports = router;
