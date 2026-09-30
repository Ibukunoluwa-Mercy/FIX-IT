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

router.post('/register', uploadCertificate, registerArtisan);

module.exports = router;
