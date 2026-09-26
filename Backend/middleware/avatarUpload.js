const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
	destination: uploadDirectory,
	filename: (req, file, callback) => {
		const extension = path.extname(file.originalname).toLowerCase();
		callback(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`);
	},
});

const fileFilter = (req, file, callback) => {
	const extension = path.extname(file.originalname).toLowerCase();
	const validType = (file.mimetype === 'image/jpeg' && ['.jpg', '.jpeg'].includes(extension))
		|| (file.mimetype === 'image/png' && extension === '.png');
	if (validType) return callback(null, true);
	return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'avatar'));
};

const avatarUpload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

module.exports = { avatarUpload, uploadDirectory };