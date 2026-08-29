const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'official-ids');
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const storage = multer.diskStorage({
	destination: uploadDirectory,
	filename: (req, file, callback) => {
		const extension = path.extname(file.originalname).toLowerCase();
		callback(null, `${Date.now()}-${require('crypto').randomBytes(12).toString('hex')}${extension}`);
	},
});

const officialIdUpload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024, files: 1 },
	fileFilter: (req, file, callback) => {
		if (!allowedMimeTypes.has(file.mimetype)) return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'officialIdFile'));
		return callback(null, true);
	},
});

module.exports = { officialIdUpload, uploadDirectory };