const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, default: '' },
		status: { type: String, default: 'Reported' },
		location: {
			address: { type: String, default: '' },
			coordinates: { type: [Number], default: undefined },
		},
		images: { type: [String], default: [] },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		resolvedAt: { type: Date },
		completedAt: { type: Date },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
