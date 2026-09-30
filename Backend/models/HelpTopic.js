const mongoose = require('mongoose');

const helpTopicSchema = new mongoose.Schema(
	{
		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			index: true,
		},
		section: {
			type: String,
			required: true,
			enum: ['quick_help', 'category', 'guide'],
			index: true,
		},
		icon: {
			type: String,
			required: true,
			trim: true,
		},
		iconBg: {
			type: String,
			trim: true,
			default: '#eff6ff',
		},
		iconColor: {
			type: String,
			trim: true,
			default: '#2563eb',
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
			default: '',
		},
		readTime: {
			type: String,
			trim: true,
			default: null, 
		},
		hasSteps: {
			type: Boolean,
			default: false,
		},
		body: {
			type: String,
			default: null, 
		},
		content: {
			type: [String],
			default: [], 
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

helpTopicSchema.index({
	title: 'text',
	description: 'text',
	body: 'text',
});

module.exports = mongoose.model('HelpTopic', helpTopicSchema);
