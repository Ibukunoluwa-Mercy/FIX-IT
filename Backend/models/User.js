const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		avatarUrl: { type: String, trim: true, default: '' },
		impactScore: { type: Number, default: 85 },
		cityRank: { type: String, default: 'Top 20%' },
		firstName: { type: String, trim: true },
		lastName: { type: String, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
		},
		phone: { type: String, trim: true, index: true, sparse: true },
		password: { type: String, required: true, minlength: 8, select: false },
		role: { type: String, enum: ['resident', 'admin', 'Community Member', 'Issue Resolver', 'Administrator'], default: 'resident', required: true },
		location: { type: String, trim: true, default: '' },
		isActive: { type: Boolean, default: true },
		emailVerified: { type: Boolean, default: false },
		emailVerificationTokenHash: { type: String, select: false },
		emailVerificationExpires: { type: Date, select: false },
		resetPasswordToken: { type: String, select: false },
		resetPasswordExpire: { type: Date, select: false },
	},
	{ timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	return next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeProfile = function toSafeProfile() {
	return {
		id: this._id,
		fullName: this.name,
		email: this.email,
		phone: this.phone,
		location: this.location,
		role: this.role,
		emailVerified: this.emailVerified,
		createdAt: this.createdAt,
	};
};

module.exports = mongoose.model('User', userSchema);
