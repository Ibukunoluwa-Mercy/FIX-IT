const express = require('express');
const { getHomeData } = require('../controllers/reportController');

const router = express.Router();

router.get('/home-data', getHomeData);

module.exports = router;
