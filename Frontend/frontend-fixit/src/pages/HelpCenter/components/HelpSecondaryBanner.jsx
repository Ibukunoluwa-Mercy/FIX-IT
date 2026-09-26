import React from 'react';

const HelpSecondaryBanner = ({ onContactClick }) => {
  return (
    <div className="help-secondary-banner">
      <div className="help-secondary-left">
        <div className="help-secondary-icon-badge" aria-hidden="true">
          <i className="fa-solid fa-lightbulb"></i>
        </div>
        <div className="help-secondary-text">
          <strong>Need more help?</strong>
          <span>Our support team is here to assist you.</span>
        </div>
      </div>
      <button
        className="help-btn-contact-orange"
        type="button"
        onClick={onContactClick}
      >
        <i className="fa-solid fa-envelope"></i> Contact Support <i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  );
};

export default HelpSecondaryBanner;
