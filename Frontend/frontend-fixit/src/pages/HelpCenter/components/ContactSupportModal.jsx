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

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="contact-form-label" htmlFor="help-contact-name">
              Your Name
            </label>
            <input
              id="help-contact-name"
              type="text"
              className="contact-form-input"
              placeholder={userName}
              value={contactForm.name}
              onChange={(e) => onFormChange({ ...contactForm, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="contact-form-label" htmlFor="help-contact-email">
              Email Address
            </label>
            <input
              id="help-contact-email"
              type="email"
              className="contact-form-input"
              placeholder="your.email@example.com"
              value={contactForm.email}
              onChange={(e) => onFormChange({ ...contactForm, email: e.target.value })}
            />
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
              required
            ></textarea>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="help-btn-contact-orange"
              disabled={sendingMessage}
            >
              {sendingMessage ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ContactSupportModal;
