const mongoose = require('mongoose');

const officialProfileSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
		department: { type: String, required: true, trim: true },
		position: { type: String, required: true, trim: true },
		lga: { type: String, required: true, trim: true },
		staffId: { type: String, trim: true, default: '' },
		idDocumentUrl: { type: String, required: true, trim: true },
		isConfirmed: { type: Boolean, required: true, default: false },
		verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('OfficialProfile', officialProfileSchema);