const mongoose = require('mongoose');

/**
 * HelpTopic Schema
 * Defines help center topics across three core sections:
 * - 'quick_help': Primary onboarding and core flow topics
 * - 'category': Browse by Category items
 * - 'guide': Step-by-step reading guides with read times
 *
 * Each topic either contains structured interactive steps (hasSteps: true)
 * linked to HelpTopicStep records, or plain explanatory written copy (body/content).
 */
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
			default: null, // Nullable, primarily for 'guide' section
		},
		hasSteps: {
			type: Boolean,
			default: false,
		},
		body: {
			type: String,
			default: null, // Explanatory text for non-step topics
		},
		content: {
			type: [String],
			default: [], // Paragraphs or bullet points for rich display
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

// Full-text index for keyword searching across topic metadata and content
helpTopicSchema.index({
	title: 'text',
	description: 'text',
	body: 'text',
});

module.exports = mongoose.model('HelpTopic', helpTopicSchema);
