const mongoose = require('mongoose');
const dns = require('dns');

try {
	dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
	// fallback to default dns if not supported
}

const getMongoUris = () => {
	const configuredUris = [process.env.MONGODB_URI, process.env.MONGO_URI].filter(Boolean);
	const fallbackUris = ['mongodb://127.0.0.1:27017/fixit'];
	return [...new Set([...configuredUris, ...fallbackUris])];
};

const connectDB = async () => {
	const mongoUris = getMongoUris();
	const maxAttempts = Number(process.env.MONGO_CONNECT_RETRIES || 5);

	for (const mongoUri of mongoUris) {
		for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
			try {
				await mongoose.connect(mongoUri, {
					serverSelectionTimeoutMS: 10000,
					retryWrites: true,
					w: 'majority',
				});
				console.log(`MongoDB successfully connected `);
				return true;
			} catch (error) {
				console.error(`MongoDB connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
				if (attempt < maxAttempts) await new Promise((resolve) => setTimeout(resolve, Math.min(attempt * 2000, 10000)));
			}
		}
	}

	return false;
};

module.exports = connectDB;
