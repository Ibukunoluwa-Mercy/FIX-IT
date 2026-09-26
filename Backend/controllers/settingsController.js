const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Report = require('../models/Report');
const ResidentProfile = require('../models/ResidentProfile');
const { uploadDirectory } = require('../middleware/avatarUpload');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const notificationKeys = ['issueUpdates', 'communityMessages', 'promotionsNews'];

const formatAccount = (user) => ({
	fullName: user.name || '',
	email: user.email || '',
	phone: user.phone || '',
	location: user.location || user.lastKnownLocation?.address || '',
	avatarUrl: user.avatarUrl || '',
	emailVerified: Boolean(user.emailVerified),
	notifications: {
		issueUpdates: user.notificationPreferences?.issueUpdates ?? true,
		communityMessages: user.notificationPreferences?.communityMessages ?? true,
		promotionsNews: user.notificationPreferences?.promotionsNews ?? false,
	},
});

const getAccount = (req, res) => res.json(formatAccount(req.user));

const updateAccount = (req, res) => {
	const updates = {};
	const { fullName, email, phone, location } = req.body || {};
	if (fullName !== undefined) {
		if (typeof fullName !== 'string' || !fullName.trim()) return res.status(400).json({ message: 'Full name is required' });
		updates.name = fullName.trim();
	}
	if (email !== undefined) {
		if (typeof email !== 'string' || !emailPattern.test(email.trim())) return res.status(400).json({ message: 'Please provide a valid email address' });
		updates.email = email.trim().toLowerCase();
	}
	for (const [field, value] of [['phone', phone], ['location', location]]) {
		if (value !== undefined) {
			if (typeof value !== 'string' || value.length > 200) return res.status(400).json({ message: `${field} must be 200 characters or fewer` });
			updates[field] = value.trim();
		}
	}
	if (!Object.keys(updates).length) return res.status(400).json({ message: 'No account fields were provided' });
	if (updates.email && updates.email !== req.user.email) updates.emailVerified = false;

	return Promise.resolve()
		.then(() => updates.email && updates.email !== req.user.email
			? User.findOne({ email: updates.email, _id: { $ne: req.user._id } }).select('_id').lean()
			: null)
		.then((duplicate) => {
			if (duplicate) return res.status(409).json({ message: 'An account with this email already exists' });
			return User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true }).lean();
		})
		.then((user) => {
			if (res.headersSent) return undefined;
			return res.json(formatAccount(user));
		})
		.catch((error) => {
			if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists' });
			console.error('Settings account update failed:', error);
			return res.status(500).json({ message: 'Unable to update account information' });
		});
};

const updatePassword = (req, res) => {
	const { currentPassword, newPassword, confirmPassword } = req.body || {};
	if (typeof currentPassword !== 'string' || !currentPassword || typeof newPassword !== 'string' || !newPassword) {
		return res.status(400).json({ message: 'Current and new passwords are required' });
	}
	if (newPassword.length < 8 || newPassword.length > 128) return res.status(400).json({ message: 'New password must be between 8 and 128 characters' });
	if (newPassword === currentPassword) return res.status(400).json({ message: 'New password must be different from the current password' });
	if (confirmPassword !== undefined && newPassword !== confirmPassword) return res.status(400).json({ message: 'New passwords do not match' });

	return User.findById(req.user._id).select('+password')
		.then((user) => {
			if (!user) return res.status(404).json({ message: 'Account not found' });
			return user.matchPassword(currentPassword).then((matches) => {
				if (!matches) return res.status(400).json({ message: 'Current password is incorrect' });
				user.password = newPassword;
				return user.save().then(() => res.json({ message: 'Password updated successfully' }));
			});
		})
		.catch((error) => {
			console.error('Settings password update failed:', error);
			return res.status(500).json({ message: 'Unable to update password' });
		});
};

const updateNotifications = (req, res) => {
	const { key, enabled } = req.body || {};
	if (!notificationKeys.includes(key) || typeof enabled !== 'boolean') {
		return res.status(400).json({ message: 'A valid notification key and boolean enabled value are required' });
	}
	return User.findByIdAndUpdate(req.user._id, { $set: { [`notificationPreferences.${key}`]: enabled } }, { new: true })
		.lean()
		.then((user) => user ? res.json({ notifications: formatAccount(user).notifications }) : res.status(404).json({ message: 'Account not found' }))
		.catch((error) => {
			console.error('Settings notification update failed:', error);
			return res.status(500).json({ message: 'Unable to update notification preferences' });
		});
};

const uploadAvatar = (req, res) => {
	if (!req.file) return res.status(400).json({ message: 'Choose a PNG or JPEG image to upload' });
	const avatarUrl = `/uploads/avatars/${req.file.filename}`;
	return User.findByIdAndUpdate(req.user._id, { $set: { avatarUrl } }, { new: true })
		.then((user) => {
			if (!user) return fs.unlink(req.file.path).catch(() => {}).then(() => res.status(404).json({ message: 'Account not found' }));
			const oldPath = user.avatarUrl && user.avatarUrl !== avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')
				? path.join(uploadDirectory, path.basename(user.avatarUrl))
				: null;
			return (oldPath ? fs.unlink(oldPath).catch(() => {}) : Promise.resolve()).then(() => res.json({ avatarUrl }));
		})
		.catch((error) => fs.unlink(req.file.path).catch(() => {}).then(() => {
			console.error('Settings avatar upload failed:', error);
			return res.status(500).json({ message: 'Unable to update profile picture' });
		}));
};

const deleteAccount = (req, res) => {
	const { password } = req.body || {};
	if (typeof password !== 'string' || !password) return res.status(400).json({ message: 'Enter your password to confirm account deletion' });
	return User.findById(req.user._id).select('+password')
		.then((user) => {
			if (!user) return res.status(404).json({ message: 'Account not found' });
			return user.matchPassword(password).then((matches) => matches ? user : null);
		})
		.then((user) => {
			if (!user) return res.status(400).json({ message: 'Password is incorrect' });
			// Keep public community reports available while removing account references that identify this resident.
			return Report.updateMany({ $or: [{ user: user._id }, { createdBy: user._id }] }, { $unset: { user: 1, createdBy: 1 } })
				.then(() => ResidentProfile.deleteOne({ user: user._id }))
				.then(() => User.deleteOne({ _id: user._id }).then(() => user));
		})
		.then((user) => {
			if (res.headersSent) return undefined;
			const avatarPath = user.avatarUrl?.startsWith('/uploads/avatars/')
				? path.join(uploadDirectory, path.basename(user.avatarUrl))
				: null;
			return (avatarPath ? fs.unlink(avatarPath).catch(() => {}) : Promise.resolve())
				.then(() => res.json({ message: 'Account deleted successfully' }));
		})
		.catch((error) => {
			console.error('Settings account deletion failed:', error);
			return res.status(500).json({ message: 'Unable to delete account' });
		});
};

module.exports = { getAccount, updateAccount, updatePassword, updateNotifications, uploadAvatar, deleteAccount, formatAccount };