const express = require('express');
const { getHomeData, getCommunityOverview, getMapReports } = require('../controllers/reportDataController');
const { submitReport } = require('../controllers/dashboardController');
const { getExploreData, toggleConfirmReport } = require('../controllers/exploreController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/home-data', getHomeData);
router.get('/community-overview', getCommunityOverview);
router.get('/map-data', getMapReports);
router.get('/explore', getExploreData);
router.post('/', requireAuth, submitReport);
router.post('/:id/confirm', requireAuth, toggleConfirmReport);

module.exports = router;
