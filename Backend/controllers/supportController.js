const SupportTicket = require('../models/SupportTicket');
const { sendSupportTicketEmail } = require('../services/emailService');

/**
 * Basic HTML escaping helper for sanitizing input strings
 * before storage and notification generation to prevent XSS.
 */
const sanitizeText = (str) => {
	if (typeof str !== 'string') return '';
	return str
		.trim()
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
};

/**
 * Email format validation helper.
 */
const isValidEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return typeof email === 'string' && emailRegex.test(email.trim());
};

/**
 * POST /api/support/contact
 * Receives support form submissions from resident dashboard or help center.
 *
 * Implements validation, sanitization, database persistence, and automated
 * email alerting to the support team (ibukunoludapo2022@gmail.com).
 * Uses .then() / .catch() promise chaining throughout.
 */
const submitContactSupport = (req, res) => {
	const { name, email, subject, message, userId } = req.body || {};

	// Step 1: Input Validation
	const trimmedName = typeof name === 'string' ? name.trim() : '';
	const trimmedEmail = typeof email === 'string' ? email.trim() : '';
	const trimmedMessage = typeof message === 'string' ? message.trim() : '';
	const trimmedSubject = typeof subject === 'string' && subject.trim() ? subject.trim() : 'General Support Inquiry';

	if (!trimmedName) {
		return res.status(400).json({ error: 'Please provide your name.' });
	}

	if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
		return res.status(400).json({ error: 'Please provide a valid email address.' });
	}

	if (!trimmedMessage) {
		return res.status(400).json({ error: 'Please enter a message explaining how we can assist you.' });
	}

	if (trimmedMessage.length < 5) {
		return res.status(400).json({ error: 'Message must be at least 5 characters long.' });
	}

	// Capture client IP for audit logging and rate tracking
	const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

	// Step 2: Create Support Ticket record in Database
	SupportTicket.create({
		userId: userId || req.user?._id || null,
		name: sanitizeText(trimmedName),
		email: trimmedEmail.toLowerCase(),
		subject: sanitizeText(trimmedSubject),
		message: sanitizeText(trimmedMessage),
		ip: clientIp,
		status: 'open',
	})
		.then((ticket) => {
			// Step 3: Trigger background notification email to the support desk
			// Handled gracefully so email transport issues do not fail the user's ticket creation
			sendSupportTicketEmail({
				name: ticket.name,
				email: ticket.email,
				subject: ticket.subject,
				message: ticket.message,
				ticketId: ticket._id.toString(),
			})
				.then((mailResult) => {
					if (mailResult && mailResult.sent) {
						console.log(`Support ticket email successfully sent for Ticket #${ticket._id}`);
					}
				})
				.catch((mailErr) => {
					console.warn(`Support ticket email delivery deferred: ${mailErr.message}`);
				});

			// Step 4: Return 201 Created with ticket summary
			return res.status(201).json({
				success: true,
				message: 'Your support inquiry has been received. Our team will get back to you shortly.',
				ticket: {
					id: ticket._id.toString(),
					name: ticket.name,
					email: ticket.email,
					subject: ticket.subject,
					status: ticket.status,
					createdAt: ticket.createdAt,
				},
			});
		})
		.catch((err) => {
			console.error('Error creating support ticket:', err);
			return res.status(500).json({
				error: 'Failed to record your support inquiry. Please try again or reach out to us directly.',
			});
		});
};

module.exports = { submitContactSupport };
