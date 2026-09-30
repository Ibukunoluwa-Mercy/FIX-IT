const { locationCacheKey, validateCoordinates } = require('../utils/locationUtils');

const reverseCache = new Map();
const searchCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let lastProviderRequestAt = 0;

const provider = () => process.env.GEOCODING_PROVIDER || 'nominatim';
const providerBaseUrl = () => process.env.GEOCODING_BASE_URL || 'https://nominatim.openstreetmap.org';

const providerRequest = async (path, params) => {
	const elapsed = Date.now() - lastProviderRequestAt;
	if (provider() === 'nominatim' && elapsed < 1000) await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
	lastProviderRequestAt = Date.now();
	const url = new URL(path, providerBaseUrl());
	Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
			'Accept-Language': 'en',
			'User-Agent': process.env.GEOCODING_USER_AGENT || 'FixIt/1.0 (location support)',
		},
	});
	if (!response.ok) {
		const responseBody = await response.text().catch(() => '');
		const error = new Error(`Geocoding provider returned ${response.status}`);
		error.status = response.status;
		
		error.responseBody = responseBody.slice(0, 500);
		throw error;
	}
	return response.json();
};

const normalizeAddress = (result) => {
	const address = result.address || {};
	return {
		address: result.display_name || result.label || '',
		road: address.road || address.pedestrian || '',
		area: address.neighbourhood || address.suburb || address.city_district || '',
		city: address.city || address.town || address.village || '',
		state: address.state || '',
		country: address.country || '',
	};
};

const reverseGeocode = async (req, res) => {
	const coordinates = validateCoordinates(req.query.lat, req.query.lng);
	if (!coordinates.valid) return res.status(400).json({ error: coordinates.error });
	const key = locationCacheKey(coordinates.latitude, coordinates.longitude);
	const cached = reverseCache.get(key);
	if (cached && cached.expiresAt > Date.now()) return res.json(cached.value);
	if (cached) reverseCache.delete(key);
	try {
		const result = await providerRequest('/reverse', { format: 'jsonv2', addressdetails: 1, lat: coordinates.latitude, lon: coordinates.longitude });
		const normalized = normalizeAddress(result);
		reverseCache.set(key, { value: normalized, expiresAt: Date.now() + CACHE_TTL_MS });
		return res.json(normalized);
	} catch (error) {
		return res.status(502).json({ error: 'Address unavailable' });
	}
};

const fallbackSearch = (query) => {
	const url = new URL(process.env.GEOCODING_FALLBACK_URL || 'https://photon.komoot.io/api/');
	
	url.searchParams.set('q', `${query}, Nigeria`);
	url.searchParams.set('limit', '5');
	url.searchParams.set('lang', 'en');
	return fetch(url, {
		headers: { Accept: 'application/json', 'User-Agent': process.env.GEOCODING_USER_AGENT || 'FixIt/1.0 (location support)' },
	}).then((response) => response.text().then((body) => {
		if (!response.ok) {
			const error = new Error(`Photon returned ${response.status}`);
			error.status = response.status;
			error.responseBody = body.slice(0, 500);
			throw error;
		}
		const features = JSON.parse(body).features || [];
		return features
			.filter((feature) => {
				const address = feature.properties || {};
				return String(address.countrycode || '').toLowerCase() === 'ng'
					|| String(address.country || '').toLowerCase() === 'nigeria';
			})
			.map((feature) => {
				const address = feature.properties || {};
				const labelParts = [address.name, address.street, address.district, address.city, address.county, address.state, address.country]
					.filter(Boolean);
				const [longitude, latitude] = feature.geometry.coordinates;
				return { label: [...new Set(labelParts)].join(', '), latitude: Number(latitude), longitude: Number(longitude) };
			})
			.filter((result) => result.label && Number.isFinite(result.latitude) && Number.isFinite(result.longitude))
			.slice(0, 5);
	}));
};

const searchGeocode = (req, res) => {
	const query = String(req.query.q || '');
	if (query.trim().length < 3) return res.status(400).json({ error: 'Search must be at least 3 characters.' });
	const key = query.trim().replace(/\s+/g, ' ').toLowerCase();
	const cached = searchCache.get(key);
	if (cached && cached.expiresAt > Date.now()) return res.json(cached.value);
	if (cached) searchCache.delete(key);
	
	const primaryRequest = providerRequest('/search', {
		format: 'jsonv2', addressdetails: 1, limit: 5, countrycodes: 'ng', q: query,
	});
	const runFallback = (reason) => {
		console.warn('[geocode] Using Photon fallback for Nigeria location search.', { reason });
		return fallbackSearch(query).then((results) => {
			console.info('[geocode] Photon search response.', { resultCount: results.length });
			return results;
		});
	};
	return primaryRequest.then((results) => {
		const matches = Array.isArray(results) ? results : [];
		console.info('[geocode] Primary search response.', { provider: provider(), resultCount: matches.length });
		if (matches.length === 0) return runFallback('no-results');
		return matches.slice(0, 5).map((result) => ({
			label: result.display_name || result.label || '',
			latitude: Number(result.lat),
			longitude: Number(result.lon),
		}));
	}, (error) => {
		console.error('[geocode] Primary provider request failed.', {
			provider: provider(), status: error.status || null, message: error.message, response: error.responseBody || '',
		});
		return runFallback('provider-error');
	}).then((normalized) => {
		if (normalized.length > 0) searchCache.set(key, { value: normalized, expiresAt: Date.now() + CACHE_TTL_MS });
		return res.json(normalized);
	}).catch((error) => {
		console.error('[geocode] Fallback provider request failed.', {
			provider: 'photon', status: error.status || null, message: error.message, response: error.responseBody || '',
		});
		return res.status(502).json({ error: 'Unable to search locations right now.' });
	});
};

module.exports = { reverseGeocode, searchGeocode, reverseCache };
