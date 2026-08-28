require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/reports', reportRoutes);

if (require.main === module) {
	connectDB()
		.then(() => app.listen(port, () => console.log(`Server running on port ${port}`)))
		.catch((error) => {
			console.error('Database connection failed:', error.message);
			process.exit(1);
		});
}

module.exports = app;
