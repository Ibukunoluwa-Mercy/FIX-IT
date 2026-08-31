const express = require('express');
const { getOverview } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/overview', protect, getOverview);

module.exports = router;
