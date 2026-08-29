const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: { type: String, trim: true },
		firstName: { type: String, trim: true },
		lastName: { type: String, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
		password: { type: String, required: true, select: false },
		role: { type: String, enum: ['Community Member', 'Issue Resolver', 'Administrator'], required: true, default: 'Community Member' },
		location: { type: String, trim: true, default: '' },
		isActive: { type: Boolean, default: true },
		emailVerified: { type: Boolean, default: false },
		emailVerificationTokenHash: { type: String, select: false },
		emailVerificationExpires: { type: Date, select: false },
	},
	{ timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) return next();
	const bcrypt = require('bcryptjs');
	this.password = await bcrypt.hash(this.password, 12);
	return next();
});

userSchema.methods.toSafeProfile = function toSafeProfile() {
	return {
		id: this._id,
		fullName: this.name,
		email: this.email,
		location: this.location,
		role: this.role,
		emailVerified: this.emailVerified,
		createdAt: this.createdAt,
	};
};

module.exports = mongoose.model('User', userSchema);
