import React from 'react';
import { Modal } from 'react-bootstrap';

/**
 * ContactSupportModal
 * -------------------
 * Renders the "Contact Support" modal with:
 *  - Static contact info card (email / phone / hours) — unchanged
 *  - Controlled form: Your Name, Email Address, How can we assist you?
 *  - Per-field inline validation error messages (fieldErrors prop)
 *  - A Send button that locks during submission (sendingMessage prop)
 *  - An inline network/server error strip at the bottom of the form (submitError prop)
 *  - A success confirmation banner that replaces the form after a 2xx response (submitSuccess prop)
 *
 * Props
 * -----
 * show           {boolean}   — controls Modal visibility
 * onClose        {function}  — called when the × or Cancel is clicked
 * contactInfo    {object}    — { email, phone, displayPhone, hours }
 * contactForm    {object}    — { name, email, message } — controlled form state
 * onFormChange   {function}  — setter for contactForm (receives the full updated object)
 * onSubmit       {function}  — form onSubmit handler from useHelpCenterData
 * sendingMessage {boolean}   — true while the POST is in-flight
 * fieldErrors    {object}    — { name, email, message } per-field error strings
 * submitError    {string}    — network/server error shown below the form on failure
 * submitSuccess  {boolean}   — true after a successful 2xx response
 * onDismissSuccess {function}— called when the resident clicks "Close" on the banner
 * userName       {string}    — pre-fill placeholder for the Name field
 */
const ContactSupportModal = ({
  show,
  onClose,
  contactInfo,
  contactForm,
  onFormChange,
  onSubmit,
  sendingMessage,
  fieldErrors = { name: '', email: '', message: '' },
  submitError = '',
  submitSuccess = false,
  onDismissSuccess,
  userName,
}) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="help-step-modal"
    >
      {/* ── Modal header — always visible ─────────────────────────────────── */}
      <div className="help-step-modal-header">
        <div className="help-step-modal-title">
          <div
            className="help-step-modal-icon"
            style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}
            aria-hidden="true"
          >
            <i className="fa-solid fa-headset"></i>
          </div>
          {/* Requirement §4: keep the existing "Contact Support" header */}
          <h5>Contact Support</h5>
        </div>
        <button
          type="button"
          className="help-step-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="help-step-modal-body">
        {/* ── Static contact info block — kept exactly as before (§4) ─────── */}
        <div className="contact-modal-info-card">
          <div className="contact-modal-item">
            <span className="contact-modal-item-left">
              <i className="fa-regular fa-envelope"></i> Email Support
            </span>
            <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
          </div>
          <div className="contact-modal-item">
            <span className="contact-modal-item-left">
              <i className="fa-solid fa-phone"></i> Direct Line
            </span>
            <a href={`tel:${contactInfo.phone}`}>{contactInfo.displayPhone || contactInfo.phone}</a>
          </div>
          <div className="contact-modal-item">
            <span className="contact-modal-item-left">
              <i className="fa-regular fa-clock"></i> Working Hours
            </span>
            <span>{contactInfo.hours}</span>
          </div>
        </div>

        {/* ── Success confirmation banner (replaces form after 2xx) ─────────
            Shown when submitSuccess === true so the resident gets clear
            visual feedback without the modal vanishing immediately.       */}
        {submitSuccess ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 12px',
            }}
            role="status"
            aria-live="polite"
          >
            {/* Green checkmark circle */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#dcfce7',
                border: '2px solid #86efac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontSize: 24,
                color: '#16a34a',
              }}
              aria-hidden="true"
            >
              <i className="fa-solid fa-check"></i>
            </div>
            <p
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: '#0f172a',
                margin: '0 0 6px',
              }}
            >
              Message sent — we&apos;ll get back to you shortly!
            </p>
            <p
              style={{
                fontSize: 13,
                color: '#475569',
                margin: '0 0 20px',
              }}
            >
              Our support team has received your inquiry. You can also reach us
              directly at{' '}
              <a href={`mailto:${contactInfo.email}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                {contactInfo.email}
              </a>
              .
            </p>
            {/* Dismiss button — calls onDismissSuccess to reset state + close */}
            <button
              type="button"
              className="help-btn-contact-orange"
              onClick={onDismissSuccess}
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Contact form — visible while submitSuccess is false ────────── */
          <form onSubmit={onSubmit} noValidate>
            {/* noValidate disables the browser's default bubble-tooltips so
                our custom inline messages are the only validation UI shown.  */}

            {/* ── Your Name ──────────────────────────────────────────────── */}
            <div className="mb-3">
              <label className="contact-form-label" htmlFor="help-contact-name">
                Your Name
              </label>
              <input
                id="help-contact-name"
                type="text"
                className="contact-form-input"
                placeholder={userName || 'Enter your name'}
                value={contactForm.name}
                /* Update only the name key; spread keeps the rest intact */
                onChange={(e) => onFormChange({ ...contactForm, name: e.target.value })}
                autoComplete="name"
                /* aria-invalid lets screen-readers announce the error state */
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                style={fieldErrors.name ? { borderColor: '#ef4444' } : {}}
              />
              {/* Per-field inline error — only rendered when there is a message */}
              {fieldErrors.name && (
                <p
                  id="contact-name-error"
                  role="alert"
                  style={{
                    fontSize: 12,
                    color: '#ef4444',
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* ── Email Address ──────────────────────────────────────────── */}
            <div className="mb-3">
              <label className="contact-form-label" htmlFor="help-contact-email">
                Email Address
              </label>
              <input
                id="help-contact-email"
                type="email"
                className="contact-form-input"
                placeholder="name@example.com"
                value={contactForm.email}
                onChange={(e) => onFormChange({ ...contactForm, email: e.target.value })}
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                style={fieldErrors.email ? { borderColor: '#ef4444' } : {}}
              />
              {fieldErrors.email && (
                <p
                  id="contact-email-error"
                  role="alert"
                  style={{
                    fontSize: 12,
                    color: '#ef4444',
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* ── How can we assist you? ─────────────────────────────────── */}
            <div className="mb-3">
              <label className="contact-form-label" htmlFor="help-contact-msg">
                How can we assist you?
              </label>
              <textarea
                id="help-contact-msg"
                rows="3"
                className="contact-form-textarea"
                placeholder="Briefly describe what you need help with..."
                value={contactForm.message}
                onChange={(e) => onFormChange({ ...contactForm, message: e.target.value })}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'contact-msg-error' : undefined}
                style={fieldErrors.message ? { borderColor: '#ef4444' } : {}}
              ></textarea>
              {fieldErrors.message && (
                <p
                  id="contact-msg-error"
                  role="alert"
                  style={{
                    fontSize: 12,
                    color: '#ef4444',
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  {fieldErrors.message}
                </p>
              )}
            </div>

            {/* ── Inline network/server error strip ─────────────────────────
                Displayed when the .catch() handler fires. The form stays open
                so the resident's text is preserved and they can retry.     */}
            {submitError && (
              <div
                role="alert"
                aria-live="assertive"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 12,
                  fontSize: 13,
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 1, flexShrink: 0 }}></i>
                <span>{submitError}</span>
              </div>
            )}

            {/* ── Action buttons ─────────────────────────────────────────────
                Cancel (§4 requirement: behaviour unchanged) sits left of Send.
                Send uses help-btn-contact-orange — the app's primary orange   */}
            <div className="d-flex justify-content-end gap-2">
              {/* Requirement §4: Cancel button behaviour unchanged */}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={onClose}
                /* Keep Cancel enabled even while sending so the user can
                   always bail out (their text stays in state for next open). */
              >
                Cancel
              </button>

              {/* Send button — disabled + label change while in-flight (§3) */}
              <button
                id="contact-support-send-btn"
                type="submit"
                className="help-btn-contact-orange"
                disabled={sendingMessage}
                aria-busy={sendingMessage}
                style={sendingMessage ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
              >
                {sendingMessage ? (
                  /* Loading state: spinner icon + label change */
                  <>
                    <i
                      className="fa-solid fa-circle-notch fa-spin"
                      aria-hidden="true"
                      style={{ fontSize: 12 }}
                    ></i>
                    Sending…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane" aria-hidden="true" style={{ fontSize: 12 }}></i>
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ContactSupportModal;
