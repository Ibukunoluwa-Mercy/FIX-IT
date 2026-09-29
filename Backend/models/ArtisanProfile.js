const mongoose = require('mongoose');

const artisanProfileSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
		businessName: { type: String, required: true, trim: true },
		certificateUrl: { type: String, required: true, trim: true },
		verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ArtisanProfile', artisanProfileSchema);
