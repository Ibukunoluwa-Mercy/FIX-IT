const express = require('express');
const { getMap, getMapClusters, getIssueById } = require('../controllers/issuesController');

const router = express.Router();

// Register the specific map paths before /:id so Express never treats them as issue ids.
router.get('/map/clusters', getMapClusters);
router.get('/map', getMap);
router.get('/:id', getIssueById);

module.exports = router;
