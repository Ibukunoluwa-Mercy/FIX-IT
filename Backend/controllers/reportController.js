// Backwards-compatible controller entry point.
module.exports = {
	...require('./reportDataController'),
	...require('./exploreController'),
};
