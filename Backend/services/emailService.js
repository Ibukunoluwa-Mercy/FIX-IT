const nodemailer = require('nodemailer');

const createTransporter = () => {
	if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT || 587),
		secure: process.env.SMTP_SECURE === 'true',
		auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
	});
};

const sendVerificationEmail = async ({ email, fullName, verificationUrl }) => {
	const transporter = createTransporter();
	if (!transporter) return { sent: false, skipped: true };

	await transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Verify your Fixit account',
		text: `Hi ${fullName}, verify your Fixit account here: ${verificationUrl}`,
		html: `<p>Hi ${fullName},</p><p>Verify your Fixit account by clicking the link below:</p><p><a href="${verificationUrl}">Verify my account</a></p><p>This link expires in 24 hours.</p>`,
	});
	return { sent: true, skipped: false };
};

module.exports = { sendVerificationEmail };