const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ResidentProfile = require('../models/ResidentProfile');
const OfficialProfile = require('../models/OfficialProfile');
const { uploadDirectory } = require('../middleware/avatarUpload');
const { sendVerificationEmail, sendAccountDeletionEmail } = require('../services/emailService');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const notificationKeys = ['issueUpdates', 'communityMessages', 'promotions'];

const formatAccount = (user, officialProfile = null) => {
	const account = {
		fullName: user.name || '',
		email: user.email || '',
		phone: user.phone || '',
		location: user.location || user.lastKnownLocation?.address || '',
		avatarUrl: user.avatarUrl || '',
		isVerified: Boolean(user.emailVerified),
		role: user.role || 'resident',
		notificationPrefs: {
			issueUpdates: user.notificationPrefs?.issueUpdates ?? user.notificationPreferences?.issueUpdates ?? true,
			communityMessages: user.notificationPrefs?.communityMessages ?? user.notificationPreferences?.communityMessages ?? true,
			promotions: user.notificationPrefs?.promotions ?? user.notificationPreferences?.promotionsNews ?? false,
		},
	};
	if (officialProfile || user.role === 'admin') {
		const docUrl = officialProfile?.idDocumentUrl || '';
		account.isOfficial = true;
		account.office = officialProfile?.department || '';
		account.department = officialProfile?.department || '';
		account.position = officialProfile?.position || '';
		account.lga = officialProfile?.lga || user.location || '';
		account.staffId = officialProfile?.staffId || '';
		account.idDocumentUrl = docUrl;
		account.officialIdName = docUrl ? path.basename(docUrl) : '';
		account.verificationStatus = officialProfile?.verificationStatus || 'Pending';
	}
	return account;
};

const getAccount = async (req, res) => {
	try {
		const officialProfile = await OfficialProfile.findOne({ user: req.user._id }).lean();
		return res.json(formatAccount(req.user, officialProfile));
	} catch {
		return res.json(formatAccount(req.user));
	}
};

const updateAccount = (req, res) => {
	const updates = {};
	const officialUpdates = {};
	const { fullName, email, phone, location, office, department, position, lga, staffId } = req.body || {};
	if (fullName !== undefined) {
		if (typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 120) {
			return res.status(400).json({ code: 'INVALID_FULL_NAME', message: 'Full name must contain 1 to 120 characters' });
		}
		updates.name = fullName.trim();
	}
	if (email !== undefined) {
		if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
			return res.status(400).json({ code: 'INVALID_EMAIL', message: 'Please provide a valid email address' });
		}
		updates.email = email.trim().toLowerCase();
	}
	if (phone !== undefined) {
		if (typeof phone !== 'string' || phone.length > 30) return res.status(400).json({ code: 'INVALID_PHONE', message: 'Phone number is invalid' });
		const normalizedPhone = phone.trim();
		const digitCount = normalizedPhone.replace(/\D/g, '').length;
		if (normalizedPhone && (!/^[+\d().\-\s]+$/.test(normalizedPhone) || digitCount < 7 || digitCount > 15)) {
			return res.status(400).json({ code: 'INVALID_PHONE', message: 'Enter a valid phone number with 7 to 15 digits' });
		}
		updates.phone = normalizedPhone;
	}
	if (location !== undefined) {
		if (typeof location !== 'string' || location.length > 200) return res.status(400).json({ code: 'INVALID_LOCATION', message: 'Location must be 200 characters or fewer' });
		updates.location = location.trim();
	}
	const deptVal = office !== undefined ? office : department;
	if (deptVal !== undefined) {
		if (typeof deptVal !== 'string' || deptVal.length > 120) return res.status(400).json({ code: 'INVALID_OFFICE', message: 'Office must be 120 characters or fewer' });
		officialUpdates.department = deptVal.trim();
	}
	if (position !== undefined) {
		if (typeof position !== 'string' || position.length > 120) return res.status(400).json({ code: 'INVALID_POSITION', message: 'Position must be 120 characters or fewer' });
		officialUpdates.position = position.trim();
	}
	if (lga !== undefined) {
		if (typeof lga !== 'string' || lga.length > 120) return res.status(400).json({ code: 'INVALID_LGA', message: 'Local Government Area must be 120 characters or fewer' });
		officialUpdates.lga = lga.trim();
		if (location === undefined && updates.location === undefined) updates.location = lga.trim();
	}
	if (staffId !== undefined) {
		if (typeof staffId !== 'string' || staffId.length > 100) return res.status(400).json({ code: 'INVALID_STAFF_ID', message: 'Staff ID must be 100 characters or fewer' });
		officialUpdates.staffId = staffId.trim();
	}
	if (!Object.keys(updates).length && !Object.keys(officialUpdates).length) {
		return res.status(400).json({ code: 'NO_FIELDS', message: 'No account fields were provided' });
	}

	const emailChanged = Boolean(updates.email && updates.email !== req.user.email);
	const verification = emailChanged ? {
		rawToken: crypto.randomBytes(32).toString('hex'),
		expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
	} : null;
	if (emailChanged) {
		verification.hash = crypto.createHash('sha256').update(verification.rawToken).digest('hex');
		updates.emailVerified = false;
		updates.emailVerificationTokenHash = verification.hash;
		updates.emailVerificationExpires = verification.expires;
	}

	return Promise.resolve()
		.then(() => emailChanged
			? User.findOne({ email: updates.email, _id: { $ne: req.user._id } }).select('_id').lean()
			: null)
		.then((duplicate) => {
			if (duplicate) return res.status(409).json({ code: 'EMAIL_IN_USE', message: 'An account with this email already exists' });
			const saveProfile = Object.keys(officialUpdates).length && req.user?._id
				? OfficialProfile.findOneAndUpdate({ user: req.user._id }, { $set: officialUpdates }, { new: true, upsert: true }).lean().catch(() => null)
				: (req.user?.role === 'admin' ? OfficialProfile.findOne({ user: req.user?._id }).lean().catch(() => null) : Promise.resolve(null));
			const saveUser = Object.keys(updates).length
				? User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true }).lean()
				: User.findById(req.user._id).lean();
			return Promise.all([saveUser, saveProfile]);
		})
		.then(([user, profile]) => {
			if (res.headersSent) return undefined;
			if (!user) return res.status(404).json({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' });
			if (!emailChanged) return res.json(formatAccount(user, profile));

			const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verification.rawToken}`;
			return sendVerificationEmail({ email: user.email, fullName: user.name, verificationUrl })
				.catch((error) => {
					console.error('Settings email verification message failed:', error.message);
					return { sent: false };
				})
				.then(() => res.json(formatAccount(user, profile)));
		})
		.catch((error) => {
			if (error.code === 11000) return res.status(409).json({ code: 'EMAIL_IN_USE', message: 'An account with this email already exists' });
			console.error('Settings account update failed:', error);
			return res.status(500).json({ code: 'ACCOUNT_UPDATE_FAILED', message: 'Unable to update account information' });
		});
};

const updatePassword = (req, res) => {
	const { currentPassword, newPassword, confirmPassword } = req.body || {};
	if (typeof currentPassword !== 'string' || !currentPassword || typeof newPassword !== 'string' || !newPassword || typeof confirmPassword !== 'string') {
		return res.status(400).json({ code: 'PASSWORD_FIELDS_REQUIRED', message: 'Current, new, and confirmation passwords are required' });
	}
	if (newPassword !== confirmPassword) return res.status(400).json({ code: 'PASSWORD_MISMATCH', message: 'New passwords do not match' });
	if (newPassword.length < 8 || newPassword.length > 128 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
		return res.status(400).json({ code: 'WEAK_PASSWORD', message: 'Password must be 8 to 128 characters and include a letter and a number' });
	}
	if (newPassword === currentPassword) return res.status(400).json({ code: 'PASSWORD_UNCHANGED', message: 'New password must be different from the current password' });

	return User.findById(req.user._id).select('+password')
		.then((user) => {
			if (!user) return res.status(404).json({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' });
			// Verify the current hash before setting the new password; the User save hook
			// hashes the replacement only after this proves the requester knows the old password.
			return user.matchPassword(currentPassword).then((matches) => {
				if (!matches) return res.status(401).json({ code: 'CURRENT_PASSWORD_INCORRECT', message: 'Current password is incorrect' });
				user.password = newPassword;
				return user.save().then(() => res.json({ message: 'Password updated successfully' }));
			});
		})
		.catch((error) => {
			console.error('Settings password update failed:', error);
			return res.status(500).json({ code: 'PASSWORD_UPDATE_FAILED', message: 'Unable to update password' });
		});
};

const updateNotifications = (req, res) => {
	const body = req.body || {};
	const preferences = {};
	notificationKeys.forEach((key) => {
		if (body[key] !== undefined) preferences[key] = body[key];
	});
	if (body.promotionsNews !== undefined && preferences.promotions === undefined) preferences.promotions = body.promotionsNews;
	if (body.key && body.enabled !== undefined) {
		const legacyKey = body.key === 'promotionsNews' ? 'promotions' : body.key;
		if (notificationKeys.includes(legacyKey)) preferences[legacyKey] = body.enabled;
	}
	if (!Object.keys(preferences).length || Object.values(preferences).some((value) => typeof value !== 'boolean')) {
		return res.status(400).json({ code: 'INVALID_NOTIFICATION_PREFS', message: 'Provide one or more notification preferences as booleans' });
	}
	const updates = Object.fromEntries(Object.entries(preferences).map(([key, value]) => [`notificationPrefs.${key}`, value]));
	return User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true })
		.lean()
		.then((user) => user ? res.json({ notificationPrefs: formatAccount(user).notificationPrefs }) : res.status(404).json({ message: 'Account not found' }))
		.catch((error) => {
			console.error('Settings notification update failed:', error);
			return res.status(500).json({ code: 'NOTIFICATION_UPDATE_FAILED', message: 'Unable to update notification preferences' });
		});
};

const uploadAvatar = (req, res) => {
	if (!req.file) return res.status(400).json({ message: 'Choose a PNG, JPEG, or WebP image to upload' });
	const avatarUrl = `/uploads/avatars/${req.file.filename}`;
	const previousAvatarUrl = req.user.avatarUrl;
	return User.findByIdAndUpdate(req.user._id, { $set: { avatarUrl } }, { new: true })
		.then((user) => {
			if (!user) return fs.unlink(req.file.path).catch(() => {}).then(() => res.status(404).json({ message: 'Account not found' }));
			const oldPath = previousAvatarUrl && previousAvatarUrl !== avatarUrl && previousAvatarUrl.startsWith('/uploads/avatars/')
				? path.join(uploadDirectory, path.basename(previousAvatarUrl))
				: null;
			return (oldPath ? fs.unlink(oldPath).catch(() => {}) : Promise.resolve()).then(() => res.json({ avatarUrl }));
		})
		.catch((error) => fs.unlink(req.file.path).catch(() => {}).then(() => {
			console.error('Settings avatar upload failed:', error);
			return res.status(500).json({ message: 'Unable to update profile picture' });
		}));
};

const uploadOfficialIdDocument = (req, res) => {
	if (!req.file) return res.status(400).json({ message: 'Choose a PDF, JPG, or PNG document to upload' });
	const idDocumentUrl = `/uploads/official-ids/${req.file.filename}`;
	return OfficialProfile.findOneAndUpdate({ user: req.user._id }, { $set: { idDocumentUrl } }, { new: true, upsert: true })
		.lean()
		.then(() => res.json({ idDocumentUrl, officialIdName: req.file.originalname || path.basename(idDocumentUrl) }))
		.catch((error) => fs.unlink(req.file.path).catch(() => {}).then(() => {
			console.error('Settings official ID upload failed:', error);
			return res.status(500).json({ message: 'Unable to update official ID document' });
		}));
};

const deleteAccount = (req, res) => {
	const { password } = req.body || {};
	if (typeof password !== 'string' || !password) return res.status(400).json({ code: 'DELETE_PASSWORD_REQUIRED', message: 'Enter your password to confirm account deletion' });
	return User.findById(req.user._id).select('+password +emailVerificationTokenHash +emailVerificationExpires +resetPasswordToken +resetPasswordExpire')
		.then((user) => {
			if (!user) return res.status(404).json({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' });
			// An active JWT proves prior login, not present intent. Rechecking the password
			// prevents a left-open or stolen session from deleting the resident's account.
			return user.matchPassword(password).then((matches) => matches ? user : null);
		})
		.then((user) => {
			if (res.headersSent) return undefined;
			if (!user) return res.status(401).json({ code: 'CURRENT_PASSWORD_INCORRECT', message: 'Password is incorrect' });
			const farewell = { email: user.email, fullName: user.name };
			const avatarPath = user.avatarUrl?.startsWith('/uploads/avatars/')
				? path.join(uploadDirectory, path.basename(user.avatarUrl))
				: null;

			// Preserve each report's reference to this now-anonymized account so public
			// community records remain intact while the resident's profile PII is erased.
			user.deletedAt = new Date();
			user.isActive = false;
			user.name = 'Deleted Resident';
			user.firstName = undefined;
			user.lastName = undefined;
			user.email = `deleted-${user._id}@deleted.fixit.invalid`;
			user.phone = undefined;
			user.location = '';
			user.avatarUrl = '';
			user.emailVerified = false;
			user.emailVerificationTokenHash = undefined;
			user.emailVerificationExpires = undefined;
			user.resetPasswordToken = undefined;
			user.resetPasswordExpire = undefined;
			user.lastKnownLocation = undefined;
			user.notificationPrefs = { issueUpdates: false, communityMessages: false, promotions: false };
			user.password = crypto.randomBytes(48).toString('hex');

			return user.save()
				.then(() => Promise.all([
					ResidentProfile.deleteOne({ user: user._id }).catch(() => null),
					user.role === 'admin' ? OfficialProfile.deleteOne({ user: user._id }).catch(() => null) : Promise.resolve(),
				]))
				.then(() => avatarPath ? fs.unlink(avatarPath).catch(() => {}) : undefined)
				.then(() => sendAccountDeletionEmail(farewell).catch((error) => {
					console.error('Account deletion farewell email failed:', error.message);
					return { sent: false };
				}))
				.then(() => res.status(200).json({ message: 'Account deleted successfully' }));
		})
		.catch((error) => {
			console.error('Settings account deletion failed:', error);
			return res.status(500).json({ code: 'ACCOUNT_DELETE_FAILED', message: 'Unable to delete account' });
		});
};

module.exports = { getAccount, updateAccount, updatePassword, updateNotifications, uploadAvatar, uploadOfficialIdDocument, deleteAccount, formatAccount };