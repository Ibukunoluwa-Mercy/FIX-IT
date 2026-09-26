import React from 'react';

const HelpFooterSupport = ({ contactInfo, onContactClick }) => {
  return (
    <section className="help-footer-strip" aria-label="Still need help support section">
      <div className="help-footer-left">
        <div className="help-footer-icon-badge" aria-hidden="true">
          <i className="fa-solid fa-headset"></i>
        </div>
        <div className="help-footer-text">
          <h3>Still need help?</h3>
          <p>Get in touch with our support team.</p>
        </div>
      </div>

      <div className="help-footer-details">
        <a
          href={`mailto:${contactInfo.email}`}
          className="help-footer-detail-item"
          title="Send email to support"
        >
          <i className="fa-regular fa-envelope"></i>
          <span>{contactInfo.email}</span>
        </a>
        <a
          href={`tel:${contactInfo.phone}`}
          className="help-footer-detail-item"
          title="Call support hotline"
        >
          <i className="fa-solid fa-phone"></i>
          <span>{contactInfo.displayPhone || contactInfo.phone}</span>
        </a>
        <div className="help-footer-detail-item">
          <i className="fa-regular fa-clock"></i>
          <span>{contactInfo.hours}</span>
        </div>
      </div>

      <div className="help-footer-right">
        <button
          className="help-btn-contact-orange"
          type="button"
          onClick={onContactClick}
        >
          <i className="fa-solid fa-envelope"></i> Contact Support <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </section>
  );
};

export default HelpFooterSupport;
