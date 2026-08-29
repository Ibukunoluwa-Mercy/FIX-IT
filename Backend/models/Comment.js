const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
	{
		report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true, index: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		text: { type: String, required: true, trim: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
