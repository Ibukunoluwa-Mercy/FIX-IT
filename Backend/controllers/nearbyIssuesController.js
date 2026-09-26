const mongoose = require('mongoose');
const Report = require('../models/Report');

const DEFAULT_RADIUS_KM = 5;
const DEFAULT_MAX_RADIUS_KM = 25;
const MAX_PAGE_SIZE = 100;
const SEVERITIES = { high: 'High', medium: 'Medium', low: 'Low' };
const STATUSES = {
	new: 'New',
	pending: 'New',
	'in progress': 'In Progress',
	in_progress: 'In Progress',
	resolved: 'Resolved',
};

const makeBadRequest = (message) => Object.assign(new Error(message), { statusCode: 400 });

const parseCoordinate = (value, minimum, maximum, label) => {
	if (typeof value !== 'string' && typeof value !== 'number') throw makeBadRequest(`${label} must be a valid coordinate`);
	if (String(value).trim() === '') throw makeBadRequest(`${label} must be a valid coordinate`);
	const number = Number(value);
	if (!Number.isFinite(number) || number < minimum || number > maximum) throw makeBadRequest(`${label} must be between ${minimum} and ${maximum}`);
	return number;
};

const parseList = (value, label) => {
	if (value === undefined) return [];
	const values = (Array.isArray(value) ? value : [value])
		.flatMap((item) => {
			if (typeof item !== 'string') throw makeBadRequest(`${label} must contain text values`);
			return item.split(',');
		})
		.map((item) => item.trim())
		.filter(Boolean);
	if (values.length > 20 || values.some((item) => item.length > 100)) throw makeBadRequest(`${label} contains too many or too-long values`);
	return [...new Set(values)];
};

const parseDate = (value, label, endOfDay = false) => {
	if (value === undefined || value === '') return null;
	if (typeof value !== 'string') throw makeBadRequest(`${label} must be a valid date`);
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) throw makeBadRequest(`${label} must be a valid date`);
	if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) date.setUTCHours(23, 59, 59, 999);
	return date;
};

const resolveResidentLocation = (req) => {
	const hasLatitude = req.query.lat !== undefined && String(req.query.lat).trim() !== '';
	const hasLongitude = req.query.lng !== undefined && String(req.query.lng).trim() !== '';
	if (hasLatitude !== hasLongitude) throw makeBadRequest('Both lat and lng are required when providing a location');

	if (hasLatitude && hasLongitude) {
		return {
			lat: parseCoordinate(req.query.lat, -90, 90, 'lat'),
			lng: parseCoordinate(req.query.lng, -180, 180, 'lng'),
			source: 'geolocation',
		};
	}

	// The authenticated user is loaded from MongoDB by requireAuth, so this fallback
	// uses the resident's last saved coordinates without another profile lookup.
	const savedLocation = req.user?.lastKnownLocation;
	if (savedLocation?.latitude == null || savedLocation?.longitude == null) {
		throw makeBadRequest('Provide lat and lng or save a location to your resident profile');
	}
	return {
		lat: parseCoordinate(savedLocation.latitude, -90, 90, 'profile latitude'),
		lng: parseCoordinate(savedLocation.longitude, -180, 180, 'profile longitude'),
		source: 'profile',
	};
};

const getMaximumRadiusKm = () => {
	const configuredMaximum = Number(process.env.NEARBY_ISSUES_MAX_RADIUS_KM);
	return Number.isFinite(configuredMaximum) && configuredMaximum > 0 ? configuredMaximum : DEFAULT_MAX_RADIUS_KM;
};

const parseNearbyRequest = (req) => {
	const location = resolveResidentLocation(req);
	const maxRadiusKm = getMaximumRadiusKm();
	const radiusKm = req.query.radiusKm === undefined || req.query.radiusKm === ''
		? Math.min(DEFAULT_RADIUS_KM, maxRadiusKm)
		: Number(req.query.radiusKm);
	if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > maxRadiusKm) {
		throw makeBadRequest(`radiusKm must be greater than 0 and no more than ${maxRadiusKm}`);
	}

	const sortBy = req.query.sortBy === undefined ? 'nearest' : String(req.query.sortBy).toLowerCase();
	if (!['nearest', 'recent', 'severity'].includes(sortBy)) throw makeBadRequest('sortBy must be nearest, recent, or severity');

	const page = req.query.page === undefined ? 1 : Number(req.query.page);
	const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
	if (!Number.isInteger(page) || page < 1) throw makeBadRequest('page must be a positive integer');
	if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) throw makeBadRequest(`limit must be an integer from 1 to ${MAX_PAGE_SIZE}`);

	const filters = {};
	const categories = parseList(req.query.category, 'category');
	const severities = parseList(req.query.severity, 'severity').map((value) => SEVERITIES[value.toLowerCase()]);
	const requestedStatuses = parseList(req.query.status, 'status');
	const statuses = requestedStatuses.map((value) => STATUSES[value.toLowerCase()]);
	if (severities.some((value) => !value)) throw makeBadRequest('severity values must be High, Medium, or Low');
	if (statuses.some((value) => !value)) throw makeBadRequest('status values must be New, Pending, In Progress, or Resolved');
	if (categories.length) filters.category = { $in: categories };
	if (severities.length) filters.severity = { $in: severities };
	if (statuses.length) filters.status = { $in: statuses };

	const dateFrom = parseDate(req.query.dateFrom, 'dateFrom');
	const dateTo = parseDate(req.query.dateTo, 'dateTo', true);
	if (dateFrom && dateTo && dateFrom > dateTo) throw makeBadRequest('dateFrom must be on or before dateTo');
	if (dateFrom || dateTo) {
		filters.createdAt = {};
		if (dateFrom) filters.createdAt.$gte = dateFrom;
		if (dateTo) filters.createdAt.$lte = dateTo;
	}

	return { location, radiusKm, filters, sortBy, page, limit };
};

const buildNearbyPipeline = ({ location, radiusKm, filters, sortBy, page, limit, userId }) => {
	const issueStages = [];
	const sortOptions = {
		nearest: { distanceMeters: 1, _id: 1 },
		recent: { createdAt: -1, distanceMeters: 1, _id: 1 },
		severity: { severityRank: -1, distanceMeters: 1, _id: 1 },
	};

	if (sortBy === 'severity') {
		issueStages.push({
			$addFields: {
				severityRank: {
					$switch: {
						branches: [
							{ case: { $eq: ['$severity', 'High'] }, then: 3 },
							{ case: { $eq: ['$severity', 'Medium'] }, then: 2 },
							{ case: { $eq: ['$severity', 'Low'] }, then: 1 },
						],
						default: 0,
					},
				},
			},
		});
	}

	issueStages.push(
		{ $sort: sortOptions[sortBy] },
		{ $skip: (page - 1) * limit },
		{ $limit: limit },
		{
			$project: {
				_id: 0,
				id: { $toString: '$_id' },
				title: 1,
				category: 1,
				severity: 1,
				status: { $cond: [{ $eq: ['$status', 'New'] }, 'Pending', '$status'] },
				location: {
					lat: { $ifNull: ['$location.lat', { $arrayElemAt: ['$location.geo.coordinates', 1] }] },
					lng: { $ifNull: ['$location.lng', { $arrayElemAt: ['$location.geo.coordinates', 0] }] },
					areaName: {
						$cond: [
							{ $ne: [{ $ifNull: ['$location.address', ''] }, ''] },
							'$location.address',
							{ $ifNull: ['$location.addressText', ''] },
						],
					},
				},
				distanceKm: { $divide: ['$distanceMeters', 1000] },
				reportedAt: '$createdAt',
				resolvedAt: { $ifNull: ['$resolvedAt', '$completedAt'] },
				description: { $ifNull: ['$description', ''] },
				imageUrl: {
					$cond: [
						{ $ne: [{ $ifNull: ['$imageUrl', ''] }, ''] },
						'$imageUrl',
						{ $ifNull: [{ $arrayElemAt: ['$images', 0] }, { $ifNull: [{ $arrayElemAt: ['$photos', 0] }, null] }] },
					],
				},
				upvotes: { $size: { $ifNull: ['$confirmedBy', []] } },
				isOwnReport: { $or: [{ $eq: ['$user', userId] }, { $eq: ['$createdBy', userId] }] },
			},
		}
	);

	return [
		{
			$geoNear: {
				near: { type: 'Point', coordinates: [location.lng, location.lat] },
				key: 'location.geo',
				distanceField: 'distanceMeters',
				maxDistance: radiusKm * 1000,
				spherical: true,
				// $geoNear must be the first stage to use the Report 2dsphere index.
				// Putting category, severity, status, and date filters in its query keeps
				// MongoDB from loading distant or ineligible reports into application memory.
				query: filters,
			},
		},
		{
			// Both branches use the same geospatially filtered stream: metadata counts all
			// matches, while the issues branch sorts and returns only the requested page.
			$facet: {
				metadata: [{ $count: 'totalCount' }],
				issues: issueStages,
			},
		},
	];
};

const getNearbyIssues = (req, res) => {
	if (!req.user?._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	let request;
	try {
		request = parseNearbyRequest(req);
	} catch (error) {
		return res.status(error.statusCode || 400).json({ error: error.message });
	}

	const pipeline = buildNearbyPipeline({ ...request, userId: new mongoose.Types.ObjectId(req.user._id) });
	return Promise.resolve()
		.then(() => Report.aggregate(pipeline))
		.then((aggregationResult) => {
			const result = aggregationResult[0] || {};
			const totalCount = result.metadata?.[0]?.totalCount || 0;
			const issues = result.issues || [];

			// An empty geo result is an expected nearby-search outcome, not a failure.
			// Always return 200 with an empty list so the resident page can show its
			// dedicated "No nearby issues" state instead of rendering an error.
			return res.status(200).json({
				userLocation: request.location,
				radiusKm: request.radiusKm,
				totalCount,
				issues,
			});
		})
		.catch((error) => {
			console.error('Nearby issues fetch failed:', error);
			return res.status(500).json({ error: 'Unable to load nearby issues' });
		});
};

module.exports = { getNearbyIssues, parseNearbyRequest, resolveResidentLocation, buildNearbyPipeline };