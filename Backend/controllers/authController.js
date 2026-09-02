const crypto = require('crypto');
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ResidentProfile = require('../models/ResidentProfile');
const OfficialProfile = require('../models/OfficialProfile');
const AdminProfile = require('../models/AdminProfile');
const { sendVerificationEmail, sendWelcomeEmail, sendLoginEmail, sendPasswordResetEmail } = require('../services/emailService');

const ROLE_MAP = {
	resident: 'resident',
	official: 'admin',
	admin: 'admin',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const parseBoolean = (value) => value === true || value === 'true';

const createToken = (user) => jwt.sign(
	{ id: user._id.toString(), role: user.role },
	process.env.JWT_SECRET || 'fixit-development-secret',
	{ expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
);

const createVerificationToken = () => {
	const rawToken = crypto.randomBytes(32).toString('hex');
	return {
		rawToken,
		hash: crypto.createHash('sha256').update(rawToken).digest('hex'),
		expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
	};
};

const createPasswordResetToken = () => {
	const rawToken = crypto.randomBytes(32).toString('hex');
	return {
		rawToken,
		hash: crypto.createHash('sha256').update(rawToken).digest('hex'),
		expires: new Date(Date.now() + 15 * 60 * 1000),
	};
};

const register = async (req, res) => {
	const fullName = normalizeText(req.body.fullName);
	const email = normalizeText(req.body.email).toLowerCase();
	const location = normalizeText(req.body.location);
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	const roleKey = normalizeText(req.body.role).toLowerCase();
	const agreeToTerms = req.body.agreeToTerms === true;

	if (!fullName || !email || !location || !password || !roleKey) {
		return res.status(400).json({ message: 'Full name, email, location, password, and role are required' });
	}
	if (!agreeToTerms) return res.status(400).json({ message: 'You must agree to the Terms of Service and Privacy Policy' });
	if (!ROLE_MAP[roleKey]) return res.status(400).json({ message: 'Invalid role. Public registration is for residents or officials only' });
	if (roleKey === 'official') return res.status(400).json({ message: 'Local Officials must register through the official registration form' });
	if (!emailPattern.test(email)) return res.status(400).json({ message: 'Please provide a valid email address' });
	if (password.length < 8 || password.length > 128) return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });

	try {
		const existingUser = await User.findOne({ email }).select('_id').lean();
		if (existingUser) return res.status(409).json({ message: 'An account with this email already exists' });

		const verification = createVerificationToken();
		const user = await User.create({
			name: fullName,
			email,
			location,
			password,
			role: ROLE_MAP[roleKey] || 'resident',
			emailVerificationTokenHash: verification.hash,
			emailVerificationExpires: verification.expires,
		});

		try {
			if (roleKey === 'resident') await ResidentProfile.create({ user: user._id, neighborhood: location });
			if (roleKey === 'official') await OfficialProfile.create({ user: user._id, jurisdiction: location });
		} catch (profileError) {
			await User.deleteOne({ _id: user._id });
			throw profileError;
		}

		const verificationBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
		let emailStatus = { sent: false, skipped: true };
		try {
			emailStatus = await sendVerificationEmail({
				email,
				fullName,
				verificationUrl: `${verificationBaseUrl}/verify-email?token=${verification.rawToken}`,
			});
		} catch (emailError) {
			console.error('Verification email failed:', emailError.message);
			emailStatus = { sent: false, skipped: false };
		}
		let welcomeEmail = { sent: false, skipped: true };
		try {
			welcomeEmail = await sendWelcomeEmail({ email, fullName });
		} catch (emailError) {
			console.error('Welcome email failed:', emailError.message);
			welcomeEmail = { sent: false, skipped: false };
		}

		return res.status(201).json({
			message: 'Account created successfully',
			token: createToken(user),
			user: user.toSafeProfile(),
			emailVerification: emailStatus,
			welcomeEmail,
		});
	} catch (error) {
		if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists' });
		console.error('Registration failed:', error.message);
		return res.status(500).json({ message: 'Unable to create account' });
	}
};

const registerOfficial = async (req, res) => {
	const fullName = normalizeText(req.body.fullName);
	const email = normalizeText(req.body.email).toLowerCase();
	const phone = normalizeText(req.body.phone);
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	const department = normalizeText(req.body.department);
	const position = normalizeText(req.body.position);
	const lga = normalizeText(req.body.lga);
	const staffId = normalizeText(req.body.staffId);
	const isConfirmed = parseBoolean(req.body.isConfirmed);
	const removeUploadedFile = async () => {
		if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
	};

	if (!fullName || !email || !phone || !password || !department || !position || !lga) {
		await removeUploadedFile();
		return res.status(400).json({ message: 'Full name, email, phone, department, position, and LGA are required' });
	}
	if (!req.file) return res.status(400).json({ message: 'Official ID document is required' });
	if (!isConfirmed) {
		await removeUploadedFile();
		return res.status(400).json({ message: 'You must confirm that the information provided is true and accurate' });
	}
	if (!emailPattern.test(email)) { await removeUploadedFile(); return res.status(400).json({ message: 'Please provide a valid email address' }); }
	if (password.length < 8 || password.length > 128) { await removeUploadedFile(); return res.status(400).json({ message: 'Password must be between 8 and 128 characters' }); }

	try {
		const duplicate = await User.findOne({ $or: [{ email }, { phone }] }).select('email phone').lean();
		if (duplicate) {
			await removeUploadedFile();
			return res.status(409).json({ message: duplicate.email === email ? 'An account with this email already exists' : 'An account with this phone number already exists' });
		}

		const verification = createVerificationToken();
		const user = await User.create({
			name: fullName,
			email,
			phone,
			location: lga,
			password,
			role: 'admin',
			emailVerificationTokenHash: verification.hash,
			emailVerificationExpires: verification.expires,
		});
		let profile;
		try {
			profile = await OfficialProfile.create({
				user: user._id,
				department,
				position,
				lga,
				staffId,
				idDocumentUrl: `/uploads/official-ids/${req.file.filename}`,
				isConfirmed: true,
			});
		} catch (profileError) {
			await User.deleteOne({ _id: user._id });
			await removeUploadedFile();
			throw profileError;
		}

		try {
			await sendVerificationEmail({
				email,
				fullName,
				verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verification.rawToken}`,
			});
		} catch (emailError) {
			console.error('Official verification email failed:', emailError.message);
		}
		try {
			await sendWelcomeEmail({ email, fullName });
		} catch (emailError) {
			console.error('Official welcome email failed:', emailError.message);
		}

		return res.status(201).json({
			message: 'Local Official account created successfully',
			token: createToken(user),
			profile: {
				...user.toSafeProfile(),
				phone: user.phone,
				role: 'Issue Resolver',
				officialDetails: {
					department: profile.department,
					position: profile.position,
					lga: profile.lga,
					staffId: profile.staffId,
					idDocumentUrl: profile.idDocumentUrl,
					isConfirmed: profile.isConfirmed,
				},
			},
		});
	} catch (error) {
		await removeUploadedFile();
		if (error.code === 11000) return res.status(409).json({ message: 'An account with this email or phone number already exists' });
		console.error('Official registration failed:', error.message);
		return res.status(500).json({ message: 'Unable to create Local Official account' });
	}
};

const verifyEmail = async (req, res) => {
	const rawToken = normalizeText(req.query.token);
	if (!rawToken) return res.status(400).json({ message: 'Verification token is required' });
	const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

	try {
		const user = await User.findOne({
			emailVerificationTokenHash: tokenHash,
			emailVerificationExpires: { $gt: new Date() },
	}).select('+emailVerificationTokenHash +emailVerificationExpires');
		if (!user) return res.status(400).json({ message: 'Verification token is invalid or expired' });
		user.emailVerified = true;
		user.emailVerificationTokenHash = undefined;
		user.emailVerificationExpires = undefined;
		await user.save();
		return res.json({ message: 'Email verified successfully' });
	} catch (error) {
		return res.status(500).json({ message: 'Unable to verify email' });
	}
};

const forgotPassword = async (req, res) => {
	const email = normalizeText(req.body.email).toLowerCase();
	const genericMessage = 'If an account with that email exists, a password reset link has been sent.';
	if (!email || !emailPattern.test(email)) return res.status(200).json({ message: genericMessage });

	try {
		const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');
		if (!user) return res.status(200).json({ message: genericMessage });

		const resetToken = createPasswordResetToken();
		user.resetPasswordToken = resetToken.hash;
		user.resetPasswordExpire = resetToken.expires;
		await user.save({ validateModifiedOnly: true });

		try {
			await sendPasswordResetEmail({
				email: user.email,
				fullName: user.name || user.email,
				resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken.rawToken}`,
			});
		} catch (emailError) {
			user.resetPasswordToken = undefined;
			user.resetPasswordExpire = undefined;
			await user.save({ validateModifiedOnly: true });
			console.error('Password reset email failed:', emailError.message);
		}

		return res.status(200).json({ message: genericMessage });
	} catch (error) {
		console.error('Forgot password failed:', error.message);
		return res.status(500).json({ message: 'Unable to process password reset request' });
	}
};

const resetPassword = async (req, res) => {
	const rawToken = normalizeText(req.params.resetToken || req.body.token || req.query.token);
	const email = normalizeText(req.body.email).toLowerCase();
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	if (password.length < 8 || password.length > 128) {
		return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
	}

	try {
		let user = null;
		if (rawToken && rawToken !== 'dummy-token' && rawToken !== 'direct') {
			const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
			user = await User.findOne({
				resetPasswordToken: tokenHash,
				resetPasswordExpire: { $gt: Date.now() },
			}).select('+password +resetPasswordToken +resetPasswordExpire');
			if (!user) {
				return res.status(400).json({ message: 'Password reset token is invalid or expired' });
			}
		} else if (email) {
			if (!emailPattern.test(email)) {
				return res.status(400).json({ message: 'Please provide a valid email address' });
			}
			user = await User.findOne({ email }).select('+password +resetPasswordToken +resetPasswordExpire');
			if (!user) {
				return res.status(404).json({ message: 'No account found with this email address' });
			}
		} else {
			return res.status(400).json({ message: 'Email address or password reset token is required' });
		}

		user.password = password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save();

		return res.status(200).json({
			message: 'Password reset successful',
			token: createToken(user),
			user: user.toSafeProfile(),
		});
	} catch (error) {
		console.error('Password reset failed:', error.message);
		return res.status(500).json({ message: 'Unable to reset password' });
	}
};

const createAdmin = async (req, res) => {
	const fullName = normalizeText(req.body.fullName);
	const email = normalizeText(req.body.email).toLowerCase();
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	if (!fullName || !email || !password || !emailPattern.test(email) || password.length < 8) return res.status(400).json({ message: 'Valid full name, email, and password are required' });

	try {
		const user = await User.create({ name: fullName, email, password, role: 'admin', emailVerified: true });
		await AdminProfile.create({ user: user._id });
		return res.status(201).json({ message: 'Administrator created', user: user.toSafeProfile() });
	} catch (error) {
		if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists' });
		return res.status(500).json({ message: 'Unable to create administrator' });
	}
};

const login = async (req, res) => {
	const email = normalizeText(req.body.email).toLowerCase();
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password are required' });
	}

	try {
		const user = await User.findOne({ email }).select('+password');
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const isPasswordCorrect = await user.matchPassword(password);
		if (!isPasswordCorrect) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		if (user.isActive === false) {
			return res.status(403).json({ message: 'This account is inactive' });
		}

		const token = createToken(user);
		try {
			await sendLoginEmail({ email: user.email, fullName: user.name || user.email });
		} catch (emailError) {
			console.error('Login email failed:', emailError.message);
		}
		return res.status(200).json({
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				fullName: user.name,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error('Login failed:', error.message);
		return res.status(500).json({ message: 'Unable to sign in' });
	}
};

module.exports = { register, registerOfficial, verifyEmail, forgotPassword, resetPassword, createAdmin, login };
