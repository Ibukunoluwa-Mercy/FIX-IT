const mongoose = require('mongoose');

/**
 * SupportTicket Schema
 * Records user support inquiries, contact submissions, and issue reports.
 */
const supportTicketSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
			index: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			maxlength: 150,
			match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
		},
		subject: {
			type: String,
			trim: true,
			default: 'General Support Inquiry',
			maxlength: 200,
		},
		message: {
			type: String,
			required: true,
			trim: true,
			maxlength: 3000,
		},
		status: {
			type: String,
			enum: ['open', 'in_progress', 'resolved', 'closed'],
			default: 'open',
			index: true,
		},
		ip: {
			type: String,
			trim: true,
			default: '',
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

supportTicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
