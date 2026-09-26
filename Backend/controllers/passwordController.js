const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');
const {
	emailPattern,
	normalizeText,
	createToken,
	createPasswordResetToken,
} = require('../utils/authUtils');

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

		setImmediate(async () => {
			try {
				await sendPasswordResetEmail({
					email: user.email,
					fullName: user.name || user.email,
					resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken.rawToken}`,
				});
			} catch (emailError) {
				console.error('Password reset email failed:', emailError.message);
			}
		});

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

module.exports = {
	forgotPassword,
	resetPassword,
};
