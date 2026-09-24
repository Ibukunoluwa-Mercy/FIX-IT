const test = require('node:test');
const assert = require('node:assert/strict');
const { locationCacheKey, validateCoordinates, validateLocation, isValidCapturedAt } = require('../utils/locationUtils');
const { updateTimes } = require('../controllers/userLocationController');

test('rejects invalid and zero coordinates', () => {
	assert.equal(validateCoordinates(91, 3).valid, false);
	assert.equal(validateCoordinates('NaN', 3).valid, false);
	assert.equal(validateCoordinates(6, -181).valid, false);
	assert.equal(validateCoordinates(0, 0).valid, false);
	assert.equal(validateCoordinates(6.5244, 3.3792).valid, true);
});

test('validates submitted location fields', () => {
	const valid = validateLocation({ latitude: 6.5244, longitude: 3.3792, accuracy: 25, source: 'gps', capturedAt: new Date().toISOString() });
	assert.equal(valid.valid, true);
	assert.equal(validateLocation({ ...valid, capturedAt: new Date(Date.now() + 60_000).toISOString() }).valid, false);
});

test('rounds reverse cache keys to five decimals', () => {
	assert.equal(locationCacheKey(6.524401, 3.379204), '6.52440,3.37920');
});

test('rejects future and malformed capture dates', () => {
	assert.equal(isValidCapturedAt(new Date(Date.now() + 60_000).toISOString()), false);
	assert.equal(isValidCapturedAt('not-a-date'), false);
	assert.equal(isValidCapturedAt('2026-09-24'), false);
	assert.equal(isValidCapturedAt(new Date().toISOString()), true);
});

test('tracks update throttles per user and allows separate users', () => {
	updateTimes.clear();
	updateTimes.set('user-a', Date.now());
	assert.equal(Date.now() - updateTimes.get('user-a') < 10_000, true);
	assert.equal(updateTimes.has('user-b'), false);
});