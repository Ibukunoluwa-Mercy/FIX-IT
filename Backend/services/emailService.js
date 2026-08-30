const nodemailer = require('nodemailer');

const escapeHtml = (value) => String(value)
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#039;');

const createTransporter = () => {
	const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
	if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !smtpPassword) return null;
	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT || 587),
		secure: process.env.SMTP_SECURE === 'true',
		auth: { user: process.env.SMTP_USER, pass: smtpPassword.replace(/\s/g, '') },
	});
};

const sendVerificationEmail = async ({ email, fullName, verificationUrl }) => {
	const transporter = createTransporter();
	if (!transporter) return { sent: false, skipped: true };
	const safeName = escapeHtml(fullName);

	await transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Verify your Fixit account',
		text: `Hi ${fullName}, verify your Fixit account here: ${verificationUrl}`,
		html: `<p>Hi ${safeName},</p><p>Verify your Fixit account by clicking the link below:</p><p><a href="${verificationUrl}">Verify my account</a></p><p>This link expires in 24 hours.</p>`,
	});
	return { sent: true, skipped: false };
};

const sendWelcomeEmail = async ({ email, fullName }) => {
	const transporter = createTransporter();
	if (!transporter) return { sent: false, skipped: true };
	const safeName = escapeHtml(fullName);

	await transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Welcome to Fixit',
		text: `Welcome to Fixit, ${fullName}! We are glad to have you on board. Together, we can make our community safer, cleaner, and better.`,
		html: `<p>Hi ${safeName},</p><p>Welcome to Fixit. We are delighted to have you on board!</p><p>Fixit gives you a voice in improving your community. Report local issues, follow their progress, and help create a safer, cleaner place for everyone.</p><p>We are glad you are here.</p>`,
	});
	return { sent: true, skipped: false };
};

const sendLoginEmail = async ({ email, fullName }) => {
	const transporter = createTransporter();
	if (!transporter) return { sent: false, skipped: true };
	const safeName = escapeHtml(fullName);

	await transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Welcome back to Fixit',
		text: `Welcome back to Fixit, ${fullName}! You have successfully signed in to your account.`,
		html: `<p>Hi ${safeName},</p><p>Welcome back to Fixit!</p><p>You have successfully signed in to your account. We are happy to have you continuing to help improve your community.</p><p>If this was not you, please reset your password and contact support.</p>`,
	});
	return { sent: true, skipped: false };
};

const sendPasswordResetEmail = async ({ email, fullName, resetUrl }) => {
	const transporter = createTransporter();
	if (!transporter) return { sent: false, skipped: true };
	const safeName = escapeHtml(fullName);

	await transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Reset your Fixit password',
		text: `Hi ${fullName}, use this link to reset your Fixit password: ${resetUrl}. This link expires in 15 minutes.`,
		html: `<p>Hi ${safeName},</p><p>We received a request to reset your Fixit password.</p><p><a href="${resetUrl}">Reset my password</a></p><p>This link expires in 15 minutes and can only be used once. If you did not request this, you can safely ignore this email.</p>`,
	});
	return { sent: true, skipped: false };
};

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendLoginEmail, sendPasswordResetEmail };