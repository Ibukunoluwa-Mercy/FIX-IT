import React from 'react';
import helpCenterImg from '../../../assets/help-center.png';

const HelpBanner = () => {
  return (
    <section className="help-banner-card" aria-label="Help Center banner">
      <div className="help-banner-inner">
        <div className="help-banner-left">
          <div className="help-banner-icon-badge" aria-hidden="true">
            <i className="fa-solid fa-headset"></i>
          </div>
          <div className="help-banner-text">
            <h1>Help Center</h1>
            <p>
              Find answers to common questions, get support, and learn how to make a
              bigger impact in your community.
            </p>
          </div>
        </div>
        <div className="help-banner-illustration-wrap" aria-hidden="true">
          <img
            src={helpCenterImg}
            alt="Customer Support Representative"
            className="help-banner-illustration"
          />
        </div>
      </div>
    </section>
  );
};

export default HelpBanner;
