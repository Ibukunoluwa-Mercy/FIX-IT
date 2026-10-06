const express = require('express');
const {
	getHomeData,
	getCommunityOverview,
	getMapReports,
	getNearbyReports,
	getReportsByMe,
	getMyReport,
	getMyReportComments,
	sendMessageToArtisan,
	submitReportReview,
} = require('../controllers/reportDataController');
const { submitReport, submitWizardReport, uploadReportPhotos, geocodeReportLocation } = require('../controllers/dashboardController');
const { getExploreData, toggleConfirmReport } = require('../controllers/exploreController');
const { reportPhotosUpload } = require('../middleware/reportUpload');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/home-data', getHomeData);
router.get('/community-overview', getCommunityOverview);
router.get('/map-data', getMapReports);
router.get('/explore', getExploreData);
router.get('/nearby', getNearbyReports);
router.get('/geocode', geocodeReportLocation);
router.post('/upload-photos', requireAuth, reportPhotosUpload, uploadReportPhotos);
router.get('/me/:id', requireAuth, getMyReport);
router.get('/me', requireAuth, getReportsByMe);
router.get('/:id/comments', requireAuth, getMyReportComments);
router.post('/:id/message-artisan', requireAuth, sendMessageToArtisan);
router.post('/:id/message', requireAuth, sendMessageToArtisan);
router.post('/:id/review', requireAuth, submitReportReview);
router.get('/:id', requireAuth, getMyReport);
router.post('/submit', requireAuth, submitWizardReport);
router.post('/', requireAuth, submitReport);
router.post('/:id/confirm', requireAuth, toggleConfirmReport);

module.exports = router;
