const LOCATION_SOURCES = new Set(['gps', 'manual', 'search']);

const parseCoordinate = (value, min, max) => {
	const number = Number(value);
	return Number.isFinite(number) && number >= min && number <= max ? number : null;
};

const validateCoordinates = (latitude, longitude) => {
	const parsedLatitude = parseCoordinate(latitude, -90, 90);
	const parsedLongitude = parseCoordinate(longitude, -180, 180);
	if (parsedLatitude === null || parsedLongitude === null || (parsedLatitude === 0 && parsedLongitude === 0)) {
		return { valid: false, error: 'Valid non-zero latitude and longitude are required.' };
	}
	return { valid: true, latitude: parsedLatitude, longitude: parsedLongitude };
};

const validateLocation = (location = {}) => {
	const coordinates = validateCoordinates(location.latitude, location.longitude);
	if (!coordinates.valid) return coordinates;
	const accuracy = Number(location.accuracy);
	if (!Number.isFinite(accuracy) || accuracy < 0) return { valid: false, error: 'Location accuracy must be a non-negative number.' };
	if (!LOCATION_SOURCES.has(location.source)) return { valid: false, error: 'Location source must be gps, manual, or search.' };
	const capturedAt = new Date(location.capturedAt);
	if (!location.capturedAt || Number.isNaN(capturedAt.getTime()) || capturedAt > new Date()) {
		return { valid: false, error: 'Location capturedAt must be a valid date that is not in the future.' };
	}
	return { valid: true, ...coordinates, accuracy, source: location.source, capturedAt };
};

const locationCacheKey = (latitude, longitude) => `${Number(latitude).toFixed(5)},${Number(longitude).toFixed(5)}`;

const isValidCapturedAt = (capturedAt, now = new Date()) => {
	if (typeof capturedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(capturedAt)) return false;
	const date = new Date(capturedAt);
	return Boolean(capturedAt) && !Number.isNaN(date.getTime()) && date <= now;
};

module.exports = { LOCATION_SOURCES, validateCoordinates, validateLocation, locationCacheKey, isValidCapturedAt };