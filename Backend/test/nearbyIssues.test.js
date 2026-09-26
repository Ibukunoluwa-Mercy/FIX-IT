const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
const { getNearbyIssues, parseNearbyRequest, resolveResidentLocation, buildNearbyPipeline } = require('../controllers/nearbyIssuesController');
const { saveMyLocation, updateTimes } = require('../controllers/userLocationController');
const { rateLimitNearbyIssues, requestsByUser, MAX_REQUESTS } = require('../middleware/nearbyIssuesRateLimit');

const makeRequest = (query = {}) => ({
	query,
	user: {
		_id: new mongoose.Types.ObjectId(),
		lastKnownLocation: { latitude: 6.5244, longitude: 3.3792, address: 'Lagos' },
	},
});

test('prefers live coordinates and accepts valid zero coordinates', () => {
	const location = resolveResidentLocation(makeRequest({ lat: '0', lng: '0' }));
	assert.deepEqual(location, { lat: 0, lng: 0, source: 'geolocation' });
});

test('falls back to saved resident coordinates when live coordinates are absent', () => {
	const location = resolveResidentLocation(makeRequest());
	assert.deepEqual(location, { lat: 6.5244, lng: 3.3792, source: 'profile' });
});

test('combines filters and validates nearby pagination and sorting', () => {
	const request = parseNearbyRequest(makeRequest({
		lat: '6.5',
		lng: '3.3',
		radiusKm: '8',
		category: ['Road/Pothole', 'Water'],
		severity: 'high,Medium',
		status: 'Pending,Resolved',
		dateFrom: '2026-01-01',
		dateTo: '2026-01-31',
		sortBy: 'recent',
		page: '2',
		limit: '10',
	}));

	assert.equal(request.radiusKm, 8);
	assert.equal(request.sortBy, 'recent');
	assert.equal(request.page, 2);
	assert.equal(request.limit, 10);
	assert.deepEqual(request.filters.category, { $in: ['Road/Pothole', 'Water'] });
	assert.deepEqual(request.filters.severity, { $in: ['High', 'Medium'] });
	assert.deepEqual(request.filters.status, { $in: ['New', 'Resolved'] });
	assert.equal(request.filters.createdAt.$gte.toISOString(), '2026-01-01T00:00:00.000Z');
	assert.equal(request.filters.createdAt.$lte.toISOString(), '2026-01-31T23:59:59.999Z');
});

test('places combined filters and radius in the indexed geospatial stage', () => {
	const request = parseNearbyRequest(makeRequest({ lat: '6.5', lng: '3.3', category: 'Water', sortBy: 'severity' }));
	const pipeline = buildNearbyPipeline({ ...request, userId: makeRequest().user._id });

	assert.equal(pipeline[0].$geoNear.key, 'location.geo');
	assert.equal(pipeline[0].$geoNear.maxDistance, 5000);
	assert.deepEqual(pipeline[0].$geoNear.query.category, { $in: ['Water'] });
	assert.deepEqual(pipeline[1].$facet.issues[0].$addFields.severityRank.$switch.branches.map(({ then }) => then), [3, 2, 1]);
});

test('returns HTTP 200 with an empty issue list when no reports are in range', () => {
	const originalAggregate = Report.aggregate;
	Report.aggregate = () => Promise.resolve([{ metadata: [], issues: [] }]);
	const response = {
		statusCode: 0,
		body: null,
		status(code) { this.statusCode = code; return this; },
		json(body) { this.body = body; return this; },
	};

	return getNearbyIssues(makeRequest({ lat: '6.5', lng: '3.3' }), response)
		.then(() => {
			assert.equal(response.statusCode, 200);
			assert.deepEqual(response.body.issues, []);
			assert.equal(response.body.totalCount, 0);
		})
		.finally(() => { Report.aggregate = originalAggregate; });
});

test('rate-limits each resident independently', () => {
	const userId = `nearby-rate-${Date.now()}`;
	const otherUserId = `${userId}-other`;
	let allowedRequests = 0;
	const makeResponse = () => ({
		statusCode: 0,
		headers: {},
		body: null,
		set(name, value) { this.headers[name] = value; return this; },
		status(code) { this.statusCode = code; return this; },
		json(body) { this.body = body; return this; },
	});

	for (let index = 0; index < MAX_REQUESTS; index += 1) {
		rateLimitNearbyIssues({ user: { _id: userId } }, makeResponse(), () => { allowedRequests += 1; });
	}
	const limitedResponse = makeResponse();
	rateLimitNearbyIssues({ user: { _id: userId } }, limitedResponse, () => { allowedRequests += 1; });
	const otherUserResponse = makeResponse();
	rateLimitNearbyIssues({ user: { _id: otherUserId } }, otherUserResponse, () => {});

	assert.equal(allowedRequests, MAX_REQUESTS);
	assert.equal(limitedResponse.statusCode, 429);
	assert.ok(Number(limitedResponse.headers['Retry-After']) > 0);
	assert.equal(otherUserResponse.statusCode, 0);
	requestsByUser.delete(userId);
	requestsByUser.delete(otherUserId);
});

test('saves a profile address and converts the capture timestamp to a Date', () => {
	const originalUpdate = User.findByIdAndUpdate;
	const userId = new mongoose.Types.ObjectId();
	const userKey = String(userId);
	let storedLocation;
	User.findByIdAndUpdate = (id, update) => {
		assert.equal(String(id), userKey);
		storedLocation = update.$set.lastKnownLocation;
		return Promise.resolve({});
	};
	const response = { body: null, json(body) { this.body = body; return this; } };

	return saveMyLocation({
		user: { _id: userId, location: 'Lagos' },
		body: { latitude: 6.5244, longitude: 3.3792, accuracy: 20, capturedAt: new Date().toISOString() },
	}, response)
		.then(() => {
			assert.equal(storedLocation.address, 'Lagos');
			assert.ok(storedLocation.capturedAt instanceof Date);
			assert.deepEqual(response.body, { ok: true });
		})
		.finally(() => {
			User.findByIdAndUpdate = originalUpdate;
			updateTimes.delete(userKey);
		});
});