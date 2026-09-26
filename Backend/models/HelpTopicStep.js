const mongoose = require('mongoose');

/**
 * HelpTopicStep Schema
 * Represents an individual numbered step within a HelpTopic walkthrough.
 *
 * Linked via topicId (referencing HelpTopic) and topicSlug for rapid queries.
 * Ordered by the 'order' field (1, 2, 3...) so the frontend modal can render
 * step sequences accurately reflecting the real application workflows.
 */
const helpTopicStepSchema = new mongoose.Schema(
	{
		topicId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'HelpTopic',
			required: true,
			index: true,
		},
		topicSlug: {
			type: String,
			trim: true,
			index: true,
		},
		order: {
			type: Number,
			required: true,
			default: 1,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
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

// Compound index to guarantee unique ordering per topic and rapid sort operations
helpTopicStepSchema.index({ topicId: 1, order: 1 });
helpTopicStepSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('HelpTopicStep', helpTopicStepSchema);
