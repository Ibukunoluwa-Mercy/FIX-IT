const express = require('express');
const { getArtisans, streamArtisanCertificate, updateArtisanVerification } = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes in this file require admin authentication
router.use(requireAuth, requireRole('admin'));

router.get('/artisans', getArtisans);
router.get('/artisans/:id/certificate', streamArtisanCertificate);
router.patch('/artisans/:id/verification', updateArtisanVerification);

module.exports = router;
