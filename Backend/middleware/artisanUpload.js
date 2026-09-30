const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const uploadDirectory = path.join(__dirname, '..', 'private', 'artisan-certs');
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const storage = multer.diskStorage({
	destination: uploadDirectory,
	filename: (req, file, callback) => {
		
        
        const randomName = crypto.randomBytes(16).toString('hex');
		callback(null, randomName);
	},
});

const artisanUpload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024, files: 1 }, 
	fileFilter: (req, file, callback) => {
		if (!allowedMimeTypes.has(file.mimetype)) return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'certificate'));
		return callback(null, true);
	},
});

module.exports = { artisanUpload, uploadDirectory };
