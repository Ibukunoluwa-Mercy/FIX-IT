const User = require('../models/User');
const { validateCoordinates, isValidCapturedAt } = require('../utils/locationUtils');
const updateTimes = new Map();
const UPDATE_INTERVAL_MS = 10_000;

const getMyLocation = async (req, res) => {
	const location = req.user?.lastKnownLocation;
	if (location?.latitude == null || location?.longitude == null) return res.json({ location: null });
	return res.json({ location: { latitude: location.latitude, longitude: location.longitude, address: location.address || req.user.location || '', accuracy: location.accuracy, capturedAt: location.capturedAt } });
};

const saveMyLocation = async (req, res) => {
	const { latitude, longitude, address, accuracy, capturedAt } = req.body || {};
	const coordinates = validateCoordinates(latitude, longitude);
	const parsedAccuracy = Number(accuracy);
	if (!coordinates.valid || !Number.isFinite(parsedAccuracy) || parsedAccuracy < 0 || !isValidCapturedAt(capturedAt)) {
		return res.status(400).json({ error: 'A valid non-zero location, accuracy, and capturedAt are required.' });
	}
	const userKey = String(req.user._id);
	const now = Date.now();
	if (now - (updateTimes.get(userKey) || 0) < UPDATE_INTERVAL_MS) return res.status(429).json({ error: 'Location updates are limited to once every 10 seconds.' });
	const location = {
		latitude: coordinates.latitude,
		longitude: coordinates.longitude,
		address: typeof address === 'string' && address.trim() ? address.trim() : req.user.location || '',
		accuracy: parsedAccuracy,
		capturedAt: new Date(capturedAt),
	};
	await User.findByIdAndUpdate(req.user._id, { $set: { lastKnownLocation: location } });
	updateTimes.set(userKey, now);
	return res.json({ ok: true });
};

const deleteMyLocation = async (req, res) => {
	await User.findByIdAndUpdate(req.user._id, { $unset: { lastKnownLocation: 1 } });
	updateTimes.delete(String(req.user._id));
	return res.json({ ok: true });
};

module.exports = { getMyLocation, saveMyLocation, deleteMyLocation, updateTimes };