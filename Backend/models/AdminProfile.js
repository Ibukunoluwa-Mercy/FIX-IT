const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
		permissions: { type: [String], default: ['manage_reports', 'manage_users'] },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('AdminProfile', adminProfileSchema);