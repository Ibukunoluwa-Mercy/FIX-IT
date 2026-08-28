const mongoose = require('mongoose');

const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fixit';
	await mongoose.connect(mongoUri);
	console.log('MongoDB connected');
};

module.exports = connectDB;
