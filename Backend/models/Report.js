const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
	{
		reportId: { type: String, unique: true, sparse: true, index: true },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		title: { type: String, trim: true, default: '' },
		description: { type: String, default: '', maxlength: 500, trim: true },
		category: { type: String, required: true, trim: true, default: 'Other' },
		severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
		status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' },
		location: {
			address: { type: String, default: '' },
			lat: { type: Number },
			lng: { type: Number },
			latitude: { type: Number },
			longitude: { type: Number },
			accuracy: { type: Number, min: 0 },
			source: { type: String, enum: ['gps', 'manual', 'search'] },
			addressText: { type: String, default: '' },
			capturedAt: { type: Date },
			lowAccuracy: { type: Boolean, default: false },
			coordinates: { type: mongoose.Schema.Types.Mixed },
			geo: {
				type: { type: String, enum: ['Point'] },
				coordinates: { type: [Number] },
			},
		},
		imageUrl: { type: String, trim: true, default: '' },
		images: { type: [String], default: [] },
		photos: { type: [String], default: [] },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		confirmedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		priorityScore: { type: Number, default: 0 },
		resolvedAt: { type: Date },
		completedAt: { type: Date },
		updates: [{
			type: { type: String, enum: ['STATUS_CHANGE', 'NEW_COMMENT', 'SUBMITTED'] },
			text: { type: String, default: '' },
			author: { type: String, default: '' },
			timestamp: { type: Date, default: Date.now },
		}],
	},
	{ timestamps: true }
);

reportSchema.index({ 'location.geo': '2dsphere' });

reportSchema.pre('save', function normalizeReportData() {
	const normalizedCategory = (this.category || '').trim();
	if (!this.title && normalizedCategory) this.title = normalizedCategory;
	if (!this.category && this.title) this.category = this.title;
	if (!this.images?.length && this.photos?.length) this.images = [...this.photos];
	if (!this.photos?.length && this.images?.length) this.photos = [...this.images];
	if (this.imageUrl && !this.images.includes(this.imageUrl)) this.images.unshift(this.imageUrl);
	if (this.location?.lat != null && this.location?.lng != null && !this.location.coordinates) {
		this.location.coordinates = { lat: this.location.lat, lng: this.location.lng };
	}
	if (this.location?.coordinates && this.location.lat == null && this.location.lng == null) {
		this.location.lat = this.location.coordinates.lat;
		this.location.lng = this.location.coordinates.lng;
	}
	const coordinates = this.location?.coordinates;
	const point = Array.isArray(coordinates) && coordinates.length >= 2
		? { lng: Number(coordinates[0]), lat: Number(coordinates[1]) }
		: coordinates && Number.isFinite(Number(coordinates.lat)) && Number.isFinite(Number(coordinates.lng))
			? { lng: Number(coordinates.lng), lat: Number(coordinates.lat) }
			: this.location?.lat != null && this.location?.lng != null
				? { lng: Number(this.location.lng), lat: Number(this.location.lat) }
				: null;
	if (point && Number.isFinite(point.lat) && Number.isFinite(point.lng)) {
		this.location.geo = { type: 'Point', coordinates: [point.lng, point.lat] };
	}
});

module.exports = mongoose.model('Report', reportSchema);
