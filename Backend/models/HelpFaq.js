const mongoose = require('mongoose');

/**
 * HelpFaq Schema
 * Stores Frequently Asked Questions and their comprehensive answers.
 * Sorted by 'order' ascending for predictable presentation in the accordion.
 */
const helpFaqSchema = new mongoose.Schema(
	{
		question: {
			type: String,
			required: true,
			trim: true,
		},
		answer: {
			type: String,
			required: true,
			trim: true,
		},
		order: {
			type: Number,
			default: 0,
			index: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
			transform: (doc, ret) => {
				ret.id = ret._id ? ret._id.toString() : ret.id;
				delete ret.__v;
				return ret;
			},
		},
	}
);

// Full-text index for FAQ search queries
helpFaqSchema.index({
	question: 'text',
	answer: 'text',
});

module.exports = mongoose.model('HelpFaq', helpFaqSchema);
