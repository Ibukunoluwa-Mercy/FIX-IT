const path = require('path');
const fs = require('fs');
const dns = require('dns');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '.env') });
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = require('./config/db');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const geocodeRoutes = require('./routes/geocodeRoutes');
const userRoutes = require('./routes/userRoutes');
const issuesRoutes = require('./routes/issuesRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const helpRoutes = require('./routes/helpRoutes');
const supportRoutes = require('./routes/supportRoutes');
const HelpTopic = require('./models/HelpTopic');
const { seedHelpCenter } = require('./seed/seedHelpCenter');

const app = express();
const port = process.env.PORT || 5100;
const uploadDirectory = path.join(__dirname, 'uploads');
const configuredOrigins = (process.env.FRONTEND_URL || '')
	.split(',')
	.map((origin) => origin.trim().replace(/\/$/, ''))
	.filter(Boolean);
const allowedOrigins = [...new Set([
	...configuredOrigins,
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:5174',
	'http://127.0.0.1:5174',
	'http://localhost:5175',
	'http://127.0.0.1:5175',
])];

fs.mkdirSync(uploadDirectory, { recursive: true });
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error('Origin is not allowed by CORS'));
	},
	credentials: true
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '2mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_BODY_LIMIT || '2mb' }));
app.use('/uploads', express.static(uploadDirectory, { maxAge: '1d' }));

app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
	status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
	database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/support', supportRoutes);

const startServer = async () => {
	const server = app.listen(port, () => console.log(`Server running on port ${port}`));
	// Start accepting requests before database retries finish so local clients get
	// a useful API response instead of a browser-level network error.
	const connected = await connectDB();
	if (!connected) {
		console.error('Database unavailable. API started, but database-backed requests will return an error until MongoDB reconnects.');
	} else {
		// Verify and seed help content if empty
		HelpTopic.countDocuments()
			.then((count) => {
				if (count === 0) {
					console.log('No help topics found. Initializing seed data...');
					return seedHelpCenter();
				}
			})
			.catch((err) => {
				console.error('Help topic initialization check deferred:', err.message);
			});
	}
	const shutdown = async () => {
		server.close();
		if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
	};
	process.once('SIGINT', shutdown);
	process.once('SIGTERM', shutdown);
};

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((error, req, res, next) => {
	if (res.headersSent) return next(error);
	if (error.message === 'Origin is not allowed by CORS') return res.status(403).json({ message: error.message });
	if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request payload is too large' });
	if (error && error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'File is too large' });
	if (error && error.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ message: 'Unsupported file type' });
	console.error('Unhandled API error:', error);
	return res.status(500).json({ message: 'Internal server error' });
});

if (require.main === module) {
	startServer();
}

module.exports = app;
