const mongoose = require('mongoose');

const residentProfileSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
		neighborhood: { type: String, required: true, trim: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ResidentProfile', residentProfileSchema);