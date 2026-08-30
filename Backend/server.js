const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 5100;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
	if (mongoose.connection.readyState === 1) return next();
	return res.status(503).json({ message: 'Database temporarily unavailable. Please try again shortly.' });
});
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

if (require.main === module) {
	connectDB()
		.then((connected) => {
			if (!connected) console.error('Database unavailable. API started, but database-backed requests will return an error until MongoDB reconnects.');
			app.listen(port, () => console.log(`Server running on port ${port}`));
		});
}

module.exports = app;
