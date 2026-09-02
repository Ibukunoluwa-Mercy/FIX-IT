import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './ImpactCounters.css';

const ImpactCounters = ({ data }) => {
  return (
    <div className="impact-stats-row animate-slide-in delay-100">
      <Container>
        <Row className="g-4 justify-content-center">
          <Col md={4}>
            <div className="stat-card text-center">
              <div className="stat-icon-wrapper">
                <i className="fa-solid fa-circle-check" style={{ fontSize: 28 }}></i>
              </div>
              <div className="stat-number">{data?.resolvedIssues || '1240'}</div>
              <div className="stat-label">Issues Resolved</div>
            </div>
          </Col>

          <Col md={4}>
            <div className="stat-card text-center">
              <div className="stat-icon-wrapper">
                <i className="fa-solid fa-users" style={{ fontSize: 28 }}></i>
              </div>
              <div className="stat-number">{data?.communityMembers || '0.0k'}</div>
              <div className="stat-label">Community Members</div>
            </div>
          </Col>

          <Col md={4}>
            <div className="stat-card text-center">
              <div className="stat-icon-wrapper">
                <i className="fa-solid fa-map-location-dot" style={{ fontSize: 28 }}></i>
              </div>
              <div className="stat-number">{data?.neighborhoodsCount || '15'}</div>
              <div className="stat-label">Neighborhoods Improved</div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ImpactCounters;
