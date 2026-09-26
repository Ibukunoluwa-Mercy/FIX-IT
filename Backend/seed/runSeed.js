const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const { seedHelpCenter } = require('./seedHelpCenter');

connectDB()
	.then((connected) => {
		if (!connected) {
			console.error('Cannot seed: Database connection failed.');
			process.exit(1);
		}
		return seedHelpCenter();
	})
	.then(() => {
		console.log('Seeding process finished successfully.');
		process.exit(0);
	})
	.catch((err) => {
		console.error('Seeding process encountered an error:', err);
		process.exit(1);
	});
