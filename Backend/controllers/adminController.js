const path = require('path');
const fs = require('fs');
const ArtisanProfile = require('../models/ArtisanProfile');
const User = require('../models/User');

// GET /api/admin/artisans?status=pending
// List artisans for review
const getArtisans = (req, res) => {
	const status = req.query.status;
	const filter = status ? { verificationStatus: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() } : {};

	ArtisanProfile.find(filter)
		.populate('user', 'name email phone location')
		.lean()
		.then((artisans) => {
			return res.status(200).json({ artisans });
		})
		.catch((error) => {
			console.error('Failed to fetch artisans:', error.message);
			return res.status(500).json({ message: 'Unable to fetch artisans' });
		});
};

// GET /api/admin/artisans/:id/certificate
// Stream the private certificate file (Admin only)
const streamArtisanCertificate = (req, res) => {
	ArtisanProfile.findById(req.params.id)
		.lean()
		.then((profile) => {
			if (!profile || !profile.certificateUrl) {
				return res.status(404).json({ message: 'Certificate not found' });
			}

			// The certificateUrl is stored as e.g. "/private/artisan-certs/filename"
			const filename = path.basename(profile.certificateUrl);
			const filePath = path.join(__dirname, '..', 'private', 'artisan-certs', filename);

			fs.access(filePath, fs.constants.F_OK, (err) => {
				if (err) {
					return res.status(404).json({ message: 'Certificate file missing on server' });
				}
				// Stream the file directly to the response
				return res.sendFile(filePath);
			});
		})
		.catch((error) => {
			console.error('Failed to fetch certificate:', error.message);
			return res.status(500).json({ message: 'Unable to retrieve certificate' });
		});
};

// PATCH /api/admin/artisans/:id/verification
// Approve or reject an artisan (reason required if rejecting)
const updateArtisanVerification = (req, res) => {
	const { status, reason } = req.body;
	if (!['Approved', 'Rejected'].includes(status)) {
		return res.status(400).json({ message: 'Invalid status' });
	}
	if (status === 'Rejected' && !reason) {
		return res.status(400).json({ message: 'A reason is required when rejecting an artisan' });
	}

	ArtisanProfile.findById(req.params.id)
		.then((profile) => {
			if (!profile) return res.status(404).json({ message: 'Artisan profile not found' });

			profile.verificationStatus = status;
			return profile.save().then(() => {
				return res.status(200).json({
					message: `Artisan successfully ${status.toLowerCase()}`,
					profile,
				});
			});
		})
		.catch((error) => {
			console.error('Failed to update artisan verification:', error.message);
			return res.status(500).json({ message: 'Unable to update verification status' });
		});
};

module.exports = {
	getArtisans,
	streamArtisanCertificate,
	updateArtisanVerification,
};
