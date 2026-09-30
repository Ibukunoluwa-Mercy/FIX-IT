const express = require('express');
const { getMap, getMapClusters, getIssueById } = require('../controllers/issuesController');
const { getNearbyIssues } = require('../controllers/nearbyIssuesController');
const { requireAuth } = require('../middleware/authMiddleware');
const { rateLimitNearbyIssues } = require('../middleware/nearbyIssuesRateLimit');

const router = express.Router();


router.get('/nearby', requireAuth, rateLimitNearbyIssues, getNearbyIssues);
router.get('/map/clusters', getMapClusters);
router.get('/map', getMap);
router.get('/:id', getIssueById);

module.exports = router;
