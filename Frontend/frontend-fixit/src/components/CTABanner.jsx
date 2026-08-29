import React from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ctaImg from '../assets/community_cta_illustration.png';
import './CTABanner.css';

const CTABanner = () => {
  const navigate = useNavigate();
  
  return (
    <section className="cta-banner-section animate-slide-in delay-200">
      <Container>
        <div className="cta-banner">
          <div className="cta-illustration d-none d-md-flex">
            <img src={ctaImg} alt="Community members with map pin" className="cta-img" />
          </div>
          
          <div className="cta-content py-5">
            <h2 className="cta-title">See a problem? Help get it fixed.</h2>
            <p className="cta-subtitle">Your report can make a real difference in your community.</p>
            <button 
              className="btn-report-now" 
              onClick={() => navigate('/register')}
            >
              <div className="btn-icon-wrapper">
                <div className="inner-dot"></div>
              </div>
              Report a Problem Now
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTABanner;
