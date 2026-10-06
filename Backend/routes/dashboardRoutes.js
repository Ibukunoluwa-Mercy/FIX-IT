const express = require('express');
const { getOverview, getResidentDashboardStats } = require('../controllers/dashboardController');
const { protect, requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/overview', protect, getOverview);
router.get('/stats', requireAuth, getResidentDashboardStats);

module.exports = router;
