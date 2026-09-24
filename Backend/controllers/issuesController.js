const mongoose = require('mongoose');
const Report = require('../models/Report');

const CATEGORY_GROUPS = {
	infrastructure: ['Road/Pothole', 'Drainage'],
	utilities: ['Streetlight', 'Water'],
	public_safety: ['Safety', 'Public Facility'],
	environment: ['Waste', 'Environment'],
};
const VALID_CATEGORIES = [...Object.keys(CATEGORY_GROUPS), 'other'];
const VALID_STATUSES = ['high', 'medium', 'low', 'in_progress', 'resolved', 'other'];
const CACHE_TTL_MS = 30 * 1000;
const mapCache = new Map();

const getCoordinates = (location = {}) => {
	if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
		return { lat: Number(location.coordinates[1]), lng: Number(location.coordinates[0]) };
	}
	if (location.coordinates && Number.isFinite(Number(location.coordinates.lat)) && Number.isFinite(Number(location.coordinates.lng))) {
		return { lat: Number(location.coordinates.lat), lng: Number(location.coordinates.lng) };
	}
	if (Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng))) {
		return { lat: Number(location.lat), lng: Number(location.lng) };
	}
	return null;
};

const toApiCategory = (category) => {
	const match = Object.entries(CATEGORY_GROUPS).find(([, values]) => values.includes(category));
	return match ? match[0] : 'other';
};

const toApiStatus = (status) => {
	if (status === 'In Progress') return 'in_progress';
	if (status === 'Resolved') return 'resolved';
	return 'other';
};

const toApiIssue = (report) => {
	const coordinates = getCoordinates(report.location);
	return {
		id: report._id.toString(),
		title: report.title || report.category || 'Reported issue',
		category: toApiCategory(report.category),
		severity: (report.severity || 'Medium').toLowerCase(),
		status: toApiStatus(report.status),
		location: {
			lat: coordinates.lat,
			lng: coordinates.lng,
			areaName: report.location?.address || report.location?.addressText || '',
		},
		reportedAt: report.createdAt,
		resolvedAt: report.resolvedAt || null,
		description: report.description || '',
		upvotes: Array.isArray(report.confirmedBy) ? report.confirmedBy.length : 0,
	};
};

const parseBbox = (value) => {
	if (!value) return null;
	const values = value.split(',').map(Number);
	if (values.length !== 4 || values.some((item) => !Number.isFinite(item))) {
		const error = new Error('bbox must be minLng,minLat,maxLng,maxLat');
		error.statusCode = 400;
		throw error;
	}
	const [minLng, minLat, maxLng, maxLat] = values;
	if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90 || minLng >= maxLng || minLat >= maxLat) {
		const error = new Error('bbox coordinates are outside valid bounds');
		error.statusCode = 400;
		throw error;
	}
	return { minLng, minLat, maxLng, maxLat };
};

const validateMapParams = (query) => {
	const category = query.category || null;
	const status = query.status || null;
	if (category && !VALID_CATEGORIES.includes(category)) {
		const error = new Error(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
		error.statusCode = 400;
		throw error;
	}
	if (status && !VALID_STATUSES.includes(status)) {
		const error = new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
		error.statusCode = 400;
		throw error;
	}
	return { category, status, search: query.search?.trim() || '', bbox: parseBbox(query.bbox) };
};

const buildMapQuery = ({ category, status, search, bbox }) => {
	const query = {};
	const filters = [];

	// Apply the indexed viewport constraint first so MongoDB can discard distant reports early.
	// Category, status, and text conditions then operate on the smaller candidate set.
	if (bbox) {
		const geoBox = {
			'location.geo': { $geoWithin: { $box: [[bbox.minLng, bbox.minLat], [bbox.maxLng, bbox.maxLat]] } },
		};
		const legacyBox = {
			'location.lng': { $gte: bbox.minLng, $lte: bbox.maxLng },
			'location.lat': { $gte: bbox.minLat, $lte: bbox.maxLat },
		};
		filters.push({ $or: [geoBox, legacyBox] });
	}
	if (category) {
		filters.push(category === 'other'
			? { category: { $nin: Object.values(CATEGORY_GROUPS).flat() } }
			: { category: { $in: CATEGORY_GROUPS[category] } });
	}
	if (status) {
		if (['high', 'medium', 'low'].includes(status)) filters.push({ severity: status[0].toUpperCase() + status.slice(1) });
		else if (status === 'in_progress') filters.push({ status: 'In Progress' });
		else if (status === 'resolved') filters.push({ status: 'Resolved' });
		else filters.push({ status: { $nin: ['In Progress', 'Resolved'] } });
	}
	if (search) {
		const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const searchConditions = [
			{ title: { $regex: escaped, $options: 'i' } },
			{ description: { $regex: escaped, $options: 'i' } },
			{ 'location.address': { $regex: escaped, $options: 'i' } },
			{ 'location.addressText': { $regex: escaped, $options: 'i' } },
			{ reportId: { $regex: escaped, $options: 'i' } },
		];
		if (mongoose.Types.ObjectId.isValid(search)) searchConditions.push({ _id: search });
		filters.push({ $or: searchConditions });
	}
	if (filters.length) query.$and = filters;
	return query;
};

const getCached = (key) => {
	const entry = mapCache.get(key);
	if (!entry || entry.expiresAt <= Date.now()) {
		mapCache.delete(key);
		return null;
	}
	return entry.value;
};

const setCached = (key, value) => {
	mapCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
	return value;
};

const getMapIssues = (params) => {
	const cacheKey = `issues-map:${JSON.stringify(params)}`;
	const cached = getCached(cacheKey);
	if (cached) return Promise.resolve(cached);
	return Report.find(buildMapQuery(params))
		.select('_id title description category severity status location createdAt resolvedAt confirmedBy reportId')
		.sort({ createdAt: -1 })
		.lean()
		.then((reports) => reports
			.map((report) => getCoordinates(report.location) ? toApiIssue(report) : null)
			.filter(Boolean))
		.then((issues) => setCached(cacheKey, issues));
};

const getMap = (req, res) => {
	let params;
	try {
		params = validateMapParams(req.query);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
	return getMapIssues(params)
		.then((issues) => res.json(issues))
		.catch((error) => {
			console.error('Map issues fetch failed:', error);
			return res.status(500).json({ error: 'Unable to load map data' });
		});
};

const getMapClusters = (req, res) => {
	let params;
	const zoom = Number(req.query.zoom);
	try {
		params = validateMapParams(req.query);
		if (!Number.isInteger(zoom) || zoom < 0 || zoom > 22) throw new Error('zoom must be an integer from 0 to 22');
		if (!params.bbox) throw new Error('bbox is required for clusters');
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
	return getMapIssues(params)
		.then((issues) => {
			// A grid is deterministic and cheap at map scale; increasing cell size at low zoom
			// keeps thousands of points server-aggregated before the browser renders markers.
			const cellSize = 360 / (Math.pow(2, zoom) * 4);
			const cells = new Map();
			issues.forEach((issue) => {
				const cellLng = Math.floor(issue.location.lng / cellSize);
				const cellLat = Math.floor(issue.location.lat / cellSize);
				const key = `${cellLat}:${cellLng}`;
				const cell = cells.get(key) || { lat: 0, lng: 0, count: 0, statuses: {} };
				cell.lat += issue.location.lat;
				cell.lng += issue.location.lng;
				cell.count += 1;
				cell.statuses[issue.status] = (cell.statuses[issue.status] || 0) + 1;
				cells.set(key, cell);
			});
			return [...cells.values()].map((cell) => ({
				lat: cell.lat / cell.count,
				lng: cell.lng / cell.count,
				count: cell.count,
				dominantStatus: Object.entries(cell.statuses).sort((a, b) => b[1] - a[1])[0][0],
			}));
		})
		.then((clusters) => res.json(clusters))
		.catch((error) => {
			console.error('Map cluster fetch failed:', error);
			return res.status(500).json({ error: 'Unable to load map clusters' });
		});
};

const getIssueById = (req, res) => {
	const id = req.params.id;
	if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid issue id' });
	return Report.findById(id)
		.select('_id title description category severity status location createdAt resolvedAt confirmedBy')
		.lean()
		.then((report) => {
			if (!report || !getCoordinates(report.location)) return res.status(404).json({ error: 'Issue not found' });
			return res.json(toApiIssue(report));
		})
		.catch((error) => {
			console.error('Issue detail fetch failed:', error);
			return res.status(500).json({ error: 'Unable to load issue details' });
		});
};

module.exports = { getMap, getMapClusters, getIssueById };
