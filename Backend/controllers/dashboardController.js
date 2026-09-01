const Report = require('../models/Report');
const User = require('../models/User');

const getAuthenticatedUserId = (req) => req.user?.id || req.user?._id;

const getNextReportId = async () => {
	const year = new Date().getFullYear();
	const latestResult = await Report.aggregate([
		{ $match: { reportId: new RegExp(`^#CF-${year}-\\d+$`) } },
		{ $project: { sequence: { $toInt: { $arrayElemAt: [{ $split: ['$reportId', '-'] }, 2] } } } },
		{ $group: { _id: null, latestNumber: { $max: '$sequence' } } },
	]);
	const latestNumber = latestResult[0]?.latestNumber || 0;
	return `#CF-${year}-${String(latestNumber + 1).padStart(2, '0')}`;
};

const formatLocation = (location) => {
	if (!location) return { address: '', coordinates: null };
	const coordinates = location.coordinates || {
		lat: location.lat,
		lng: location.lng,
	};
	if (Array.isArray(location.coordinates)) {
		return { address: location.address || '', coordinates: { lat: location.coordinates[1], lng: location.coordinates[0] } };
	}
	return { address: location.address || '', coordinates: coordinates && (Number.isFinite(coordinates.lat) || Number.isFinite(coordinates.lng)) ? coordinates : null };
};

const normalizePhotoUrls = (payload) => {
	const incomingPhotos = Array.isArray(payload) ? payload : [];
	const normalized = incomingPhotos
		.map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
		.filter(Boolean);
	return [...new Set(normalized)];
};

const uploadReportPhotos = async (req, res) => {
	try {
		if (!req.files || !req.files.length) {
			return res.status(400).json({ success: false, message: 'At least one photo is required.' });
		}
		const publicBaseUrl = (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}` || 'http://localhost:5100').replace(/\/$/, '');
		const urls = req.files.map((file) => `${publicBaseUrl}/uploads/reports/${file.filename}`);
		return res.status(200).json({ success: true, urls });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Unable to upload report photos', error: error.message });
	}
};

const geocodeReportLocation = async (req, res) => {
	try {
		const { address, lat, lng } = req.query;
		if (address) {
			const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
			searchUrl.searchParams.set('format', 'jsonv2');
			searchUrl.searchParams.set('limit', '1');
			searchUrl.searchParams.set('q', String(address));
			const response = await fetch(searchUrl, { headers: { 'Accept-Language': 'en', 'User-Agent': 'FixIt-Backend/1.0' } });
			if (!response.ok) throw new Error('Address lookup failed');
			const [result] = await response.json();
			if (!result) return res.status(404).json({ success: false, message: 'No matching address was found.' });
			return res.status(200).json({
				success: true,
				result: {
					formattedAddress: result.display_name,
					location: { lat: Number(result.lat), lng: Number(result.lon) },
				},
			});
		}
		if (lat !== undefined && lng !== undefined && lat !== '' && lng !== '') {
			const latitude = Number(lat);
			const longitude = Number(lng);
			if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
				return res.status(400).json({ success: false, message: 'Valid lat and lng values are required.' });
			}
			const reverseUrl = new URL('https://nominatim.openstreetmap.org/reverse');
			reverseUrl.searchParams.set('format', 'jsonv2');
			reverseUrl.searchParams.set('lat', String(latitude));
			reverseUrl.searchParams.set('lon', String(longitude));
			const response = await fetch(reverseUrl, { headers: { 'Accept-Language': 'en', 'User-Agent': 'FixIt-Backend/1.0' } });
			if (!response.ok) throw new Error('Reverse geocoding failed');
			const result = await response.json();
			return res.status(200).json({
				success: true,
				result: {
					formattedAddress: result.display_name || 'Address unavailable',
					location: { lat: latitude, lng: longitude },
				},
			});
		}
		return res.status(400).json({ success: false, message: 'Provide either an address or both lat and lng query params.' });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Unable to look up the provided location', error: error.message });
	}
};

const getOverview = async (req, res) => {
	try {
		const userId = getAuthenticatedUserId(req);
		if (!userId) return res.status(401).json({ message: 'Authentication required' });
		const user = await User.findById(userId).select('name avatarUrl impactScore cityRank').lean();
		if (!user) return res.status(404).json({ message: 'User not found' });

		const userReportFilter = { $or: [{ user: userId }, { createdBy: userId }] };
		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);
		const [totalActiveReports, resolvedThisMonth, recentReports, recentUpdates, mapReports] = await Promise.all([
			Report.countDocuments({ ...userReportFilter, status: { $ne: 'Resolved' } }),
			Report.countDocuments({ ...userReportFilter, status: 'Resolved', updatedAt: { $gte: startOfMonth } }),
			Report.find(userReportFilter).sort({ createdAt: -1 }).limit(5).lean(),
			Report.aggregate([
				{ $match: { ...userReportFilter, status: { $ne: 'Resolved' } } },
				{ $unwind: '$updates' },
				{ $sort: { 'updates.timestamp': -1 } },
				{ $limit: 5 },
				{ $replaceRoot: { newRoot: '$updates' } },
			]),
			Report.find({ status: { $ne: 'Resolved' } }).select('_id title location status').lean(),
		]);

		return res.json({
			userInfo: { name: user.name, email: user.email, avatarUrl: user.avatarUrl, impactScore: user.impactScore, cityRank: user.cityRank },
			stats: { totalActiveReports, resolvedThisMonth, impactScore: user.impactScore, rank: user.cityRank },
			recentReports,
			recentUpdates,
			mapIssues: mapReports.map((report) => ({ id: report.reportId || report._id, title: report.title, location: formatLocation(report.location), status: report.status })),
		});
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load dashboard overview', error: error.message });
	}
};

const submitWizardReport = async (req, res) => {
	try {
		const userId = getAuthenticatedUserId(req);
		if (!userId) return res.status(401).json({ message: 'Authentication required' });

		const rawCategory = String(req.body.category || '').trim();
		const rawDescription = String(req.body.description || '').trim();
		const rawAddress = String(req.body.address || req.body.location?.address || '').trim();
		const rawSeverity = String(req.body.severity || 'Medium').trim();
		const validSeverities = ['Low', 'Medium', 'High'];
		const normalizedSeverity = validSeverities.includes(rawSeverity) ? rawSeverity : 'Medium';
		const normalizedLat = req.body.location?.lat ?? req.body.lat;
		const normalizedLng = req.body.location?.lng ?? req.body.lng;
		const parsedLat = Number(normalizedLat);
		const parsedLng = Number(normalizedLng);
		const location = {
			address: rawAddress,
			...(Number.isFinite(parsedLat) ? { lat: parsedLat } : {}),
			...(Number.isFinite(parsedLng) ? { lng: parsedLng } : {}),
		};

		if (!rawCategory) return res.status(400).json({ message: 'Category is required.' });
		if (!rawDescription) return res.status(400).json({ message: 'Description is required.' });
		if (!rawAddress) return res.status(400).json({ message: 'Address is required.' });
		if (!normalizedSeverity) return res.status(400).json({ message: 'Severity is required.' });

		const user = await User.findById(userId).select('name impactScore');
		if (!user) return res.status(404).json({ message: 'User not found.' });

		const reportId = await getNextReportId();
		const photoList = normalizePhotoUrls(req.body.photos || req.body.images || (req.body.imageUrl ? [req.body.imageUrl] : []));
		const report = await Report.create({
			reportId,
			user: userId,
			createdBy: userId,
			title: rawCategory,
			category: rawCategory,
			description: rawDescription.slice(0, 500),
			severity: normalizedSeverity,
			status: 'New',
			location,
			photos: photoList,
			images: photoList,
			imageUrl: photoList[0] || '',
			updates: [{ type: 'SUBMITTED', text: 'Report created via web wizard', author: req.user?.name || user.name, timestamp: new Date() }],
		});

		await User.findByIdAndUpdate(userId, { $inc: { impactScore: 10 } }, { new: true });
		return res.status(201).json(report);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to submit report', error: error.message });
	}
};

const submitReport = async (req, res) => {
	const { title, description = '', address = '', lat, lng, imageUrl = '' } = req.body;
	if (!title || !address) {
		return res.status(400).json({ message: 'Title and address are required' });
	}
	try {
		const userId = getAuthenticatedUserId(req);
		const reportId = await getNextReportId();
		const hasCoordinates = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
		const report = await Report.create({
			reportId, user: userId, createdBy: userId, title, description,
			location: { address, ...(hasCoordinates ? { coordinates: { lat: Number(lat), lng: Number(lng) } } : {}) },
			status: 'New', imageUrl, images: imageUrl ? [imageUrl] : [],
			updates: [{ type: 'SUBMITTED', text: 'Report submitted and pending review.', author: req.user?.name || '', timestamp: new Date() }],
		});
		return res.status(201).json(report);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to submit report', error: error.message });
	}
};

module.exports = { getOverview, submitReport, submitWizardReport, uploadReportPhotos, geocodeReportLocation };
