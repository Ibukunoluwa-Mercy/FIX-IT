const express = require('express');
const { registerArtisan } = require('../controllers/artisanController');
const { artisanUpload } = require('../middleware/artisanUpload');

const router = express.Router();

const uploadCertificate = (req, res, next) => {
	const upload = artisanUpload.single('certificate');
	upload(req, res, (error) => {
		if (error) {
			if (error.code === 'LIMIT_FILE_SIZE') {
				return res.status(413).json({ message: 'Certificate file must be 5MB or smaller' });
			}
			if (error.code === 'LIMIT_UNEXPECTED_FILE') {
				return res.status(400).json({ message: 'Certificate must be a PDF, JPG, or PNG file' });
			}
			return next(error);
		}
		return next();
	});
};

const rateLimit = require('express-rate-limit');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { getDashboardSummary, getArtisanDashboardStats, getArtisanReports, applyForReport, updateReportStatus, resolveReport } = require('../controllers/artisanController');

// Rate limiter for dashboard summary endpoint
const summaryRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // Limit each IP to 10 requests per windowMs
	message: 'Too many requests from this IP, please try again after a minute'
});

router.post('/register', uploadCertificate, registerArtisan);

// Dashboard stats & summary routes
router.get('/dashboard/summary', requireAuth, requireRole('artisan'), summaryRateLimiter, getDashboardSummary);
router.get('/dashboard/stats', requireAuth, requireRole('artisan'), getArtisanDashboardStats);

// Reports feed and management for artisans
router.get('/reports', requireAuth, requireRole('artisan'), getArtisanReports);
router.post('/reports/:id/apply', requireAuth, requireRole('artisan'), applyForReport);
router.patch('/reports/:id/status', requireAuth, requireRole('artisan'), updateReportStatus);
router.post('/reports/:id/resolve', requireAuth, requireRole('artisan'), resolveReport);

module.exports = router;
