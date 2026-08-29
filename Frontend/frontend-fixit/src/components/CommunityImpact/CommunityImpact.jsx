import React from 'react';
import { Container, Row, Col, ProgressBar } from 'react-bootstrap';
import './CommunityImpact.css';

const CommunityImpact = () => {
  return (
    <section className="community-impact-section animate-slide-in delay-100">
      <Container>
        <div className="mb-4">
          <h2 className="section-title">Our Community Impact</h2>
          <p className="section-subtitle">Real numbers. Real change.</p>
        </div>

        <div className="impact-card">
          <Row className="align-items-center">
            <Col md={5} className="border-md-end text-center text-md-start mb-4 mb-md-0 p-md-4">
              <div className="resolution-rate">82%</div>
              <div className="resolution-label">Resolution Rate</div>
              <ProgressBar now={82} className="custom-progress" />
            </Col>
            
            <Col md={7} className="p-md-4">
              <div className="stat-row">
                <span className="stat-name">Issues reported this month</span>
                <span className="stat-number">246</span>
              </div>
              <hr className="stat-divider" />
              <div className="stat-row">
                <span className="stat-name">Issues resolved this month</span>
                <span className="stat-number">201</span>
              </div>
              <hr className="stat-divider" />
              <div className="stat-row">
                <span className="stat-name">Currently in progress</span>
                <span className="stat-number">31</span>
              </div>
              <hr className="stat-divider" />
              <div className="stat-row">
                <span className="stat-name">Average resolution time</span>
                <span className="stat-number">4.2 days</span>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  );
};

export default CommunityImpact;
