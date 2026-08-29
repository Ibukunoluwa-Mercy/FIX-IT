const mongoose = require('mongoose');

const connectDB = async () => {
	const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fixit';
	const maxAttempts = Number(process.env.MONGO_CONNECT_RETRIES || 5);

	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		try {
			await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
			console.log('MongoDB connected');
			return true;
		} catch (error) {
			console.error(`MongoDB connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
			if (attempt < maxAttempts) await new Promise((resolve) => setTimeout(resolve, Math.min(attempt * 2000, 10000)));
		}
	}

	return false;
};

module.exports = connectDB;
