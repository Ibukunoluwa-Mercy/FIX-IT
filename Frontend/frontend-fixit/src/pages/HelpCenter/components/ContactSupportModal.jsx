import React from 'react';
import { Modal } from 'react-bootstrap';

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
      
      <div className="help-step-modal-header">
        <div className="help-step-modal-title">
          <div
            className="help-step-modal-icon"
            style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}
            aria-hidden="true"
          >
            <i className="fa-solid fa-headset"></i>
          </div>
          
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

        
        {submitSuccess ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 12px',
            }}
            role="status"
            aria-live="polite"
          >
            
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
            
            <button
              type="button"
              className="help-btn-contact-orange"
              onClick={onDismissSuccess}
            >
              Close
            </button>
          </div>
        ) : (
          
          <form onSubmit={onSubmit} noValidate>
            

            
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
                
                onChange={(e) => onFormChange({ ...contactForm, name: e.target.value })}
                autoComplete="name"
                
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                style={fieldErrors.name ? { borderColor: '#ef4444' } : {}}
              />
              
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

            
            <div className="d-flex justify-content-end gap-2">
              
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={onClose}
                

              >
                Cancel
              </button>

              
              <button
                id="contact-support-send-btn"
                type="submit"
                className="help-btn-contact-orange"
                disabled={sendingMessage}
                aria-busy={sendingMessage}
                style={sendingMessage ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
              >
                {sendingMessage ? (
                  
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
