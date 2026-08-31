const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'reports');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
	destination: uploadDirectory,
	filename: (req, file, callback) => {
		const extension = path.extname(file.originalname).toLowerCase();
		callback(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`);
	},
});

const fileFilter = (req, file, callback) => {
	if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(null, true);
	return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'photos'));
};

const reportPhotosUpload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024, files: 5 },
}).array('photos', 5);

module.exports = { reportPhotosUpload };
