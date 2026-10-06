const mongoose = require('mongoose');

/**
 * Message Schema
 * Provides an audit trail for messages sent between residents and artisans.
 */
const messageSchema = new mongoose.Schema(
	{
		reportId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Report',
			required: true,
			index: true,
		},
		fromUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		toArtisanId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		subject: {
			type: String,
			trim: true,
			default: '',
		},
		message: {
			type: String,
			required: true,
			trim: true,
		},
		sentAt: {
			type: Date,
			default: Date.now,
		},
		emailDeliveryStatus: {
			type: String,
			enum: ['sent', 'failed', 'skipped', 'pending'],
			default: 'pending',
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Message', messageSchema);
