const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');
const { createVerificationToken, normalizeText, emailPattern, createToken } = require('../utils/authUtils');
const { sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');

// POST /api/artisans/register
// Using promise chaining .then() / .catch() as required
const registerArtisan = (req, res) => {
	// 1. Extract and normalize input fields
	const fullName = normalizeText(req.body.fullName);
	const email = normalizeText(req.body.email).toLowerCase();
	const phone = normalizeText(req.body.phone);
	const neighborhood = normalizeText(req.body.neighborhood);
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	const businessName = normalizeText(req.body.businessName);

	// Helper to remove uploaded file if validation or saving fails
	const removeUploadedFile = () => {
		if (req.file && req.file.path) {
			// using sync version for simplicity inside promise catch, or wrapped fs.unlink
			fs.unlink(req.file.path, () => {});
		}
	};

	// 2. Server-side validation
	if (!fullName || !email || !phone || !password || !neighborhood || !businessName) {
		removeUploadedFile();
		return res.status(400).json({ message: 'All required fields must be provided' });
	}
	if (!req.file) {
		return res.status(400).json({ message: 'Certificate document is required' });
	}
	if (!emailPattern.test(email)) {
		removeUploadedFile();
		return res.status(400).json({ message: 'Please provide a valid email address' });
	}
	if (password.length < 8 || password.length > 128) {
		removeUploadedFile();
		return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
	}

	// 3. Check for duplicates (email or phone)
	User.findOne({ $or: [{ email }, { phone }] })
		.select('email phone')
		.lean()
		.then((duplicate) => {
			if (duplicate) {
				removeUploadedFile();
				const msg = duplicate.email === email ? 'An account with this email already exists' : 'An account with this phone number already exists';
				return res.status(409).json({ message: msg });
			}

			// 4. Create User first
			const verification = createVerificationToken();
			return User.create({
				name: fullName,
				email,
				phone,
				location: neighborhood,
				password, // bcrypt hash handled in User pre-save hook
				role: 'artisan',
				emailVerificationTokenHash: verification.hash,
				emailVerificationExpires: verification.expires,
			}).then((user) => {
				// 5. Create ArtisanProfile
				return ArtisanProfile.create({
					user: user._id,
					businessName,
					certificateUrl: `/private/artisan-certs/${req.file.filename}`,
					verificationStatus: 'Pending',
				}).then((profile) => {
					// 6. Send emails in the background
					setImmediate(() => {
						sendVerificationEmail({
							email,
							fullName,
							verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verification.rawToken}`,
						}).catch((err) => console.error('Artisan verify email failed:', err.message));
						
						sendWelcomeEmail({ email, fullName })
							.catch((err) => console.error('Artisan welcome email failed:', err.message));
					});

					// 7. Return success response (never return password hash)
					return res.status(201).json({
						message: 'Artisan account created successfully',
						token: createToken(user),
						profile: {
							...user.toSafeProfile(),
							phone: user.phone,
							role: 'artisan',
							artisanDetails: {
								businessName: profile.businessName,
								verificationStatus: profile.verificationStatus,
							},
						},
					});
				}).catch((profileError) => {
					// Rollback user creation and delete uploaded file if profile creation fails
					User.deleteOne({ _id: user._id }).catch(() => {});
					removeUploadedFile();
					console.error('Profile creation failed:', profileError.message);
					return res.status(500).json({ message: 'Unable to create Artisan profile' });
				});
			});
		})
		.catch((error) => {
			removeUploadedFile();
			console.error('Artisan registration failed:', error.message);
			return res.status(500).json({ message: 'Unable to register Artisan' });
		});
};

module.exports = { registerArtisan };
