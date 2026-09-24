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
	if (!response.ok) throw new Error(`Geocoding provider returned ${response.status}`);
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

const searchGeocode = async (req, res) => {
	const query = String(req.query.q || '').trim();
	if (query.length < 3) return res.status(400).json({ error: 'Search must be at least 3 characters.' });
	const key = query.toLowerCase();
	const cached = searchCache.get(key);
	if (cached && cached.expiresAt > Date.now()) return res.json(cached.value);
	if (cached) searchCache.delete(key);
	try {
		const results = await providerRequest('/search', { format: 'jsonv2', addressdetails: 1, limit: 5, countrycodes: 'ng', viewbox: '3.0,6.8,3.8,6.3', bounded: 0, q: `${query}, Lagos, Nigeria` });
		const normalized = results.slice(0, 5).map((result) => ({ label: result.display_name, latitude: Number(result.lat), longitude: Number(result.lon) }));
		searchCache.set(key, { value: normalized, expiresAt: Date.now() + CACHE_TTL_MS });
		return res.json(normalized);
	} catch (error) {
		return res.status(502).json({ error: 'Unable to search locations right now.' });
	}
};

module.exports = { reverseGeocode, searchGeocode, reverseCache };