const test = require('node:test');
const assert = require('node:assert/strict');
const { locationCacheKey, validateCoordinates, validateLocation } = require('../utils/locationUtils');

test('rejects invalid and zero coordinates', () => {
	assert.equal(validateCoordinates(91, 3).valid, false);
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