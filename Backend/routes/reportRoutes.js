const express = require('express');
const { getHomeData, getCommunityOverview, getMapReports } = require('../controllers/reportController');

const router = express.Router();

router.get('/home-data', getHomeData);
router.get('/community-overview', getCommunityOverview);
router.get('/map-data', getMapReports);

module.exports = router;
