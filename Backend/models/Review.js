const mongoose = require('mongoose');

/**
 * Review Schema
 * Stores 1-5 star reviews submitted by residents upon job resolution.
 */
const reviewSchema = new mongoose.Schema(
	{
		reportId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Report',
			required: true,
			unique: true, // Only one review per report
			index: true,
		},
		residentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		artisanId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		comment: {
			type: String,
			trim: true,
			default: '',
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Review', reviewSchema);
