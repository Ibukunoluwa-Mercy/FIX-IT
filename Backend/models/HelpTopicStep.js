const mongoose = require('mongoose');

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

helpTopicStepSchema.index({ topicId: 1, order: 1 });
helpTopicStepSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('HelpTopicStep', helpTopicStepSchema);
