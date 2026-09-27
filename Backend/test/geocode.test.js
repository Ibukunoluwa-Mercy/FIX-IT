const test = require('node:test');
const assert = require('node:assert/strict');
const { searchGeocode } = require('../controllers/geocodeController');

test('search preserves the typed query and falls back to Nigeria results', async () => {
	const originalFetch = global.fetch;
	const originalInfo = console.info;
	const originalWarn = console.warn;
	const originalError = console.error;
	const calls = [];
	const query = `  Ogbomoso-${Date.now()}  `;
	let responseBody;

	global.fetch = (requestUrl) => {
		const url = new URL(requestUrl);
		calls.push(url);
		if (calls.length === 1) {
			return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) });
		}
		return Promise.resolve({
			ok: true,
			status: 200,
			text: () => Promise.resolve(JSON.stringify({
				features: [{
					geometry: { coordinates: [4.1333, 8.1333] },
					properties: { name: 'Ogbomoso', city: 'Ogbomoso', state: 'Oyo', country: 'Nigeria', countrycode: 'ng' },
				}],
			})),
		});
	};
	console.info = () => {};
	console.warn = () => {};
	console.error = () => {};

	try {
		const res = {
			statusCode: 200,
			status(code) { this.statusCode = code; return this; },
			json(body) { responseBody = body; return this; },
		};
		await searchGeocode({ query: { q: query } }, res);

		assert.equal(res.statusCode, 200);
		assert.equal(calls.length, 2);
		assert.equal(calls[0].searchParams.get('q'), query);
		assert.equal(calls[0].searchParams.get('countrycodes'), 'ng');
		assert.equal(calls[0].searchParams.has('viewbox'), false);
		assert.equal(calls[1].searchParams.get('q'), `${query}, Nigeria`);
		assert.equal(responseBody[0].label, 'Ogbomoso, Oyo, Nigeria');
		assert.equal(responseBody[0].latitude, 8.1333);
		assert.equal(responseBody[0].longitude, 4.1333);
	} finally {
		global.fetch = originalFetch;
		console.info = originalInfo;
		console.warn = originalWarn;
		console.error = originalError;
	}
});