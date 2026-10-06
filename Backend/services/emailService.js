const nodemailer = require('nodemailer');



const escapeHtml = (value) => String(value)
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#039;');

/**
 * createTransporter
 * -----------------
 * Builds a Nodemailer SMTP transporter from environment variables.
 * Returns null when any required credential is missing so callers can
 * gracefully skip sending rather than throwing at runtime.
 *
 * All SMTP credentials (host, user, password) are read exclusively from
 * environment variables — never hardcoded — so they can be rotated in the
 * deployment environment without a code change.
 */
const createTransporter = () => {
	// Support both SMTP_PASSWORD and SMTP_PASS for backwards compatibility
	// with older .env files that used the shorter key name.
	const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
	if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !smtpPassword) return null;
	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT || 587),
		// SMTP_SECURE should be 'true' only for port 465 (implicit TLS);
		// port 587 uses STARTTLS and must have this set to false.
		secure: process.env.SMTP_SECURE === 'true',
		auth: {
			user: process.env.SMTP_USER,
			// Strip any accidental whitespace from the password — copy-paste
			// from a password manager sometimes introduces trailing spaces.
			pass: smtpPassword.replace(/\s/g, ''),
		},
		// Force IPv4 resolution.
		// Node.js resolves smtp.gmail.com to an IPv6 address (2a00:1450:...)
		// first. If the host network does not support IPv6 (common on Windows,
		// Render, Railway, etc.) this causes an ETIMEDOUT error. Pinning to
		// IPv4 (family: 4) makes the DNS lookup return a 142.250.x.x address
		// that works on all networks.
		family: 4,
		// Allow Gmail's certificate chain on all hosting environments.
		// Without this, some cloud providers (e.g. Render, Railway) reject
		// Gmail's STARTTLS handshake with CERT_HAS_EXPIRED or UNABLE_TO_VERIFY.
		tls: { rejectUnauthorized: false },
	});
};

/**
 * verifySmtpConnection
 * --------------------
 * Calls transporter.verify() once at startup and logs the result.
 * This surfaces SMTP credential problems (wrong password, blocked account,
 * 2FA not set up with an App Password) immediately in the server log rather
 * than only when the first email is attempted. It does NOT throw — a broken
 * SMTP config should degrade gracefully, not crash the server.
 */
const verifySmtpConnection = () => {
	const transporter = createTransporter();
	if (!transporter) {
		console.warn('[EmailService] SMTP not configured — email sending is disabled. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env to enable it.');
		return;
	}
	transporter.verify()
		.then(() => {
			console.log(`[EmailService] SMTP connection verified ✓ (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587} as ${process.env.SMTP_USER})`);
		})
		.catch((err) => {
			console.error('[EmailService] SMTP connection FAILED — emails will not be delivered.');
			console.error('[EmailService] Error:', err.message);
			console.error('[EmailService] Hint: for Gmail, make sure you are using an App Password (not your account password) and that 2-Step Verification is enabled on the sending account.');
		});
};


/**
 * sendVerificationEmail
 * Uses .then()/.catch() promise chaining — no async/await.
 */
const sendVerificationEmail = ({ email, fullName, verificationUrl }) => {
	const transporter = createTransporter();
	if (!transporter) return Promise.resolve({ sent: false, skipped: true });
	const safeName = escapeHtml(fullName);

	// Return the sendMail promise so the caller can chain .then()/.catch().
	return transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Verify your Fixit account',
		text: `Hi ${fullName}, verify your Fixit account here: ${verificationUrl}`,
		html: `<p>Hi ${safeName},</p><p>Verify your Fixit account by clicking the link below:</p><p><a href="${verificationUrl}">Verify my account</a></p><p>This link expires in 24 hours.</p>`,
	}).then(() => ({ sent: true, skipped: false }));
};

/**
 * sendWelcomeEmail
 * Uses .then()/.catch() promise chaining — no async/await.
 */
const sendWelcomeEmail = ({ email, fullName }) => {
	const transporter = createTransporter();
	if (!transporter) return Promise.resolve({ sent: false, skipped: true });
	const safeName = escapeHtml(fullName);

	return transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Welcome to Fixit',
		text: `Welcome to Fixit, ${fullName}! We are glad to have you on board. Together, we can make our community safer, cleaner, and better.`,
		html: `<p>Hi ${safeName},</p><p>Welcome to Fixit. We are delighted to have you on board!</p><p>Fixit gives you a voice in improving your community. Report local issues, follow their progress, and help create a safer, cleaner place for everyone.</p><p>We are glad you are here.</p>`,
	}).then(() => ({ sent: true, skipped: false }));
};

/**
 * sendLoginEmail
 * Uses .then()/.catch() promise chaining — no async/await.
 */
const sendLoginEmail = ({ email, fullName }) => {
	const transporter = createTransporter();
	if (!transporter) return Promise.resolve({ sent: false, skipped: true });
	const safeName = escapeHtml(fullName);

	return transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Welcome back to Fixit',
		text: `Welcome back to Fixit, ${fullName}! You have successfully signed in to your account.`,
		html: `<p>Hi ${safeName},</p><p>Welcome back to Fixit!</p><p>You have successfully signed in to your account. We are happy to have you continuing to help improve your community.</p><p>If this was not you, please reset your password and contact support.</p>`,
	}).then(() => ({ sent: true, skipped: false }));
};

/**
 * sendPasswordResetEmail
 * Uses .then()/.catch() promise chaining — no async/await.
 */
const sendPasswordResetEmail = ({ email, fullName, resetUrl }) => {
	const transporter = createTransporter();
	if (!transporter) return Promise.resolve({ sent: false, skipped: true });
	const safeName = escapeHtml(fullName);

	return transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Reset your Fixit password',
		text: `Hi ${fullName}, use this link to reset your Fixit password: ${resetUrl}. This link expires in 15 minutes.`,
		html: `<p>Hi ${safeName},</p><p>We received a request to reset your Fixit password.</p><p><a href="${resetUrl}">Reset my password</a></p><p>This link expires in 15 minutes and can only be used once. If you did not request this, you can safely ignore this email.</p>`,
	}).then(() => ({ sent: true, skipped: false }));
};

/**
 * sendAccountDeletionEmail
 * Uses .then()/.catch() promise chaining — no async/await.
 */
const sendAccountDeletionEmail = ({ email, fullName }) => {
	const transporter = createTransporter();
	if (!transporter) return Promise.resolve({ sent: false, skipped: true });
	const safeName = escapeHtml(fullName);

	return transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to: email,
		subject: 'Your Fixit account has been deleted',
		text: `Hi ${fullName}, your Fixit account has been deleted. Your community reports remain available without your profile information.`,
		html: `<p>Hi ${safeName},</p><p>Your Fixit account has been deleted. Your community reports remain available without your profile information.</p><p>If you did not request this, contact Fixit support.</p>`,
	}).then(() => ({ sent: true, skipped: false }));
};

/**
 * sendSupportTicketEmail
 * ----------------------
 * Emails a contact-form submission to the Fixit support inbox.
 * Uses .then()/.catch() promise chaining — no async/await.
 *
 * Key design decisions:
 *
 *  1. SUPPORT_EMAIL env var (required)
 *     The destination address is read exclusively from process.env.SUPPORT_EMAIL.
 *     There is intentionally no hardcoded fallback here: if the variable is not
 *     set in the deployment environment the function returns { sent: false } so
 *     the controller can surface a graceful warning to the user. This keeps
 *     credentials and routing out of the source code and makes them easy to
 *     rotate without a deployment.
 *
 *  2. Reply-To header
 *     The email is sent FROM the app's own SMTP address (MAIL_FROM / SMTP_USER)
 *     so it passes SPF / DKIM checks on our domain. However, we set Reply-To to
 *     the user's submitted address. This means when a support agent hits "Reply"
 *     in their mail client, the response goes directly to the resident — not back
 *     to the noreply inbox — without the agent having to manually copy-paste the
 *     email address from the body.
 *
 *  3. HTML escaping
 *     Every user-supplied field (name, email, subject, message) is passed through
 *     escapeHtml() before being embedded in the HTML body. This prevents an
 *     attacker from injecting arbitrary HTML or <script> tags via the form fields
 *     (stored-XSS via email). The plain-text fallback uses the raw values because
 *     plain-text clients do not parse HTML, so injection is not possible there.
 *
 *  4. Newline → <br> conversion
 *     After escaping, newline characters in the message body are converted to
 *     <br/> tags so multi-line messages render correctly in HTML mail clients.
 *     This is done AFTER escaping to avoid double-processing.
 */
const sendSupportTicketEmail = ({ name, email, subject, message, ticketId }) => {
	// Step 1: Build the Nodemailer transporter using the shared factory.
	// This reuses the same SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS)
	// as every other email in the app — no duplicate configuration.
	const transporter = createTransporter();

	// Step 2: Resolve the support inbox address from the environment.
	// SUPPORT_EMAIL must be set in the deployment environment (e.g. Render
	// dashboard or local .env). If it is missing we skip sending rather than
	// crashing — the ticket is already saved to the database at this point.
	const supportTargetEmail = process.env.SUPPORT_EMAIL;

	// If the transporter could not be created (missing SMTP credentials) or the
	// support address is not configured, skip silently and let the controller
	// handle the degraded-mode response to the client.
	if (!transporter || !supportTargetEmail) {
		if (!transporter) console.warn('[EmailService] sendSupportTicketEmail: SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing).');
		if (!supportTargetEmail) console.warn('[EmailService] sendSupportTicketEmail: SUPPORT_EMAIL env var is not set.');
		return Promise.resolve({ sent: false, skipped: true });
	}

	// Step 3: Sanitize every user-supplied string before embedding it in HTML.
	// escapeHtml() replaces &, <, >, ", ' with their HTML entity equivalents
	// so a user cannot inject markup or scripts through the form.
	const safeName = escapeHtml(name);
	const safeEmail = escapeHtml(email);   // shown in the body as display text
	const safeSubject = escapeHtml(subject || 'General Support Inquiry');
	// Convert newlines → <br/> AFTER escaping so the conversion itself cannot
	// be used to inject tags (escaping first turns any < from the user into &lt;).
	const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

	// Step 4: Build and send the email, returning a promise.
	return transporter.sendMail({
		// FROM: the app's own sending address so SPF/DKIM pass on our domain.

		from: process.env.MAIL_FROM || process.env.SMTP_USER,



		to: supportTargetEmail,





		replyTo: email,



		subject: `New Support Request from ${name}${ticketId ? ` [Ticket #${ticketId}]` : ''}`,




		text: [
			`New Support Request`,
			`${'─'.repeat(40)}`,
			`Name:    ${name}`,
			`Email:   ${email}`,
			`Subject: ${subject || 'General Support Inquiry'}`,
			ticketId ? `Ticket:  #${ticketId}` : '',
			`${'─'.repeat(40)}`,
			`Message:`,
			``,
			message,
			`${'─'.repeat(40)}`,
			`Reply directly to this email to respond to the resident.`,
		].filter(Boolean).join('\n'),



		html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Support Request</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#ea580c;padding:24px 32px;">
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">&#128222; New Support Request</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#fed7aa;">A resident has submitted a contact form on Fixit.</p>
          </td>
        </tr>

        <!-- Sender details -->
        <tr>
          <td style="padding:28px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
              <tr style="background:#f8fafc;">
                <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;border-bottom:1px solid #e2e8f0;" colspan="2">Sender Details</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#475569;width:90px;">Name</td>
                <td style="padding:12px 16px;font-size:13px;color:#0f172a;">${safeName}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#475569;">Email</td>
                <td style="padding:12px 16px;font-size:13px;"><a href="mailto:${safeEmail}" style="color:#2563eb;text-decoration:none;">${safeEmail}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#475569;">Subject</td>
                <td style="padding:12px 16px;font-size:13px;color:#0f172a;">${safeSubject}</td>
              </tr>
              ${ticketId ? `<tr>
                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#475569;">Ticket #</td>
                <td style="padding:12px 16px;font-size:13px;color:#0f172a;font-family:monospace;">${ticketId}</td>
              </tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Message body -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;">Message</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 18px;font-size:14px;line-height:1.65;color:#334155;">
              ${safeMessage}
            </div>
          </td>
        </tr>

        <!-- Reply-To notice -->
        <tr>
          <td style="padding:20px 32px;">
            <p style="margin:0;font-size:12.5px;color:#64748b;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 14px;">
              &#128073; <strong>To reply to this resident</strong>, simply hit <em>Reply</em> in your mail client —
              the Reply-To header is already set to <strong>${safeEmail}</strong>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11.5px;color:#94a3b8;">This email was generated automatically by the Fixit platform. Do not reply to the sender address.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
	}).then(() => ({ sent: true, skipped: false }));
};

/**
 * sendArtisanMessageEmail
 * ----------------------
 * Sends a message from a resident to an assigned artisan via the Fixit platform.
 * Keeps the artisan's email private from the resident while setting Reply-To to the resident.
 */
const sendArtisanMessageEmail = ({ artisanEmail, artisanName, residentName, residentEmail, reportTitle, reportId, subject, message }) => {
	const transporter = createTransporter();
	if (!transporter) {
		console.warn('[EmailService] SMTP not configured. Skipping artisan message email.');
		return Promise.resolve({ sent: false, skipped: true });
	}

	const safeArtisanName = escapeHtml(artisanName || 'Artisan');
	const safeResidentName = escapeHtml(residentName || 'Resident');
	const safeResidentEmail = escapeHtml(residentEmail || '');
	const safeReportTitle = escapeHtml(reportTitle || 'Report');
	const safeReportId = escapeHtml(reportId || '');
	const safeSubject = escapeHtml(subject || `New message regarding job: ${reportTitle || 'Community Report'}`);
	const safeMessage = escapeHtml(message || '').replace(/\n/g, '<br/>');

	return transporter.sendMail({
		from: `"Fixit Community" <${process.env.SMTP_USER}>`,
		to: artisanEmail,
		replyTo: residentEmail || process.env.SMTP_USER,
		subject: `Fixit: ${subject || `Message from ${residentName || 'Resident'} regarding "${reportTitle || 'Report'}"`}`,
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#fff;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;">
    <tr><td style="background:#0f172a;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#f8fafc;font-size:22px;">Fix<span style="color:#f59e0b;">It</span></h1>
      <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Resident Message Notification</p>
    </td></tr>
    <tr><td style="padding:28px 32px;">
      <p style="font-size:15px;color:#334155;">Hello <strong>${safeArtisanName}</strong>,</p>
      <p style="font-size:14px;color:#475569;line-height:1.6;">You have received a new message from resident <strong>${safeResidentName}</strong> regarding the job: <strong>${safeReportTitle}</strong>${safeReportId ? ` (ID: ${safeReportId})` : ''}.</p>
      
      <div style="background:#f8fafc;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:4px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f172a;">Subject: ${safeSubject}</p>
        <div style="font-size:14px;line-height:1.6;color:#334155;">${safeMessage}</div>
      </div>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:12px 16px;font-size:13px;color:#1e40af;">
        &#128073; <strong>To reply:</strong> Simply click <em>Reply</em> in your email client to respond directly to <strong>${safeResidentName}</strong> (${safeResidentEmail}).
      </div>
    </td></tr>
    <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
      This message was sent through FixIt Community Platform.
    </td></tr>
  </table>
</body>
</html>`
	}).then(() => ({ sent: true, skipped: false }));
};

/**
 * sendResolutionNoticeEmail
 * -------------------------
 * Notifies the resident that their reported issue has been marked resolved
 * by the assigned artisan, and invites them to leave a review to close the job.
 */
const sendResolutionNoticeEmail = ({ residentEmail, residentName, reportTitle, reportId, artisanName }) => {
	const transporter = createTransporter();
	if (!transporter) {
		console.warn('[EmailService] SMTP not configured. Skipping resolution notification email.');
		return Promise.resolve({ sent: false, skipped: true });
	}

	const safeResidentName = escapeHtml(residentName || 'Resident');
	const safeReportTitle = escapeHtml(reportTitle || 'Report');
	const safeReportId = escapeHtml(reportId || '');
	const safeArtisanName = escapeHtml(artisanName || 'Your assigned artisan');

	return transporter.sendMail({
		from: `"Fixit Community" <${process.env.SMTP_USER}>`,
		to: residentEmail,
		subject: `Fixit: "${reportTitle || 'Your issue'}" has been marked Resolved`,
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#fff;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;">
    <tr><td style="background:#0f172a;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#f8fafc;font-size:22px;">Fix<span style="color:#f59e0b;">It</span></h1>
      <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Issue Resolution Update</p>
    </td></tr>
    <tr><td style="padding:28px 32px;">
      <p style="font-size:15px;color:#334155;">Hello <strong>${safeResidentName}</strong>,</p>
      <p style="font-size:14px;color:#475569;line-height:1.6;">
        Great news! Artisan <strong>${safeArtisanName}</strong> has marked your report <strong>&ldquo;${safeReportTitle}&rdquo;</strong>${safeReportId ? ` (ID: ${safeReportId})` : ''} as <strong style="color:#059669;">Resolved</strong>.
      </p>
      
      <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:16px 20px;border-radius:4px;margin:20px 0;">
        <p style="margin:0 0 6px;font-size:13.5px;font-weight:700;color:#065f46;">Action Requested: Leave a Review</p>
        <p style="margin:0;font-size:13px;line-height:1.5;color:#047857;">
          Please log into your Fixit dashboard to inspect the resolution and leave a 1-5 star review. Submitting your review will officially close the report.
        </p>
      </div>
    </td></tr>
    <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
      Thank you for helping keep our community well-maintained and safe.
    </td></tr>
  </table>
</body>
</html>`
	}).then(() => ({ sent: true, skipped: false }));
};

module.exports = {
	verifySmtpConnection,
	sendVerificationEmail,
	sendWelcomeEmail,
	sendLoginEmail,
	sendPasswordResetEmail,
	sendAccountDeletionEmail,
	sendSupportTicketEmail,
	sendArtisanMessageEmail,
	sendResolutionNoticeEmail,
};
