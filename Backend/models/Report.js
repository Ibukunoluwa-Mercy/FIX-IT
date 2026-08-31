const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
	{
		reportId: { type: String, unique: true, index: true },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		title: { type: String, required: true, trim: true },
		description: { type: String, default: '' },
		category: { type: String, trim: true, default: 'Other' },
		severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
		status: { type: String, enum: ['New', 'In Progress', 'Resolved', 'Reported', 'Verified', 'Pending'], default: 'New' },
		location: {
			address: { type: String, default: '' },
			coordinates: { type: mongoose.Schema.Types.Mixed },
		},
		imageUrl: { type: String, trim: true, default: '' },
		images: { type: [String], default: [] },
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

module.exports = mongoose.model('Report', reportSchema);
