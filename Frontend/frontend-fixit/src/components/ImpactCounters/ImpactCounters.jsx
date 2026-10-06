import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './ImpactCounters.css';

const ImpactCounters = ({ data }) => {
  return (
    <div className="impact-stats-row animate-slide-in delay-100">
      <Container>
        <Row className="g-4 justify-content-center">
          <Col md={4} sm={12}>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-resolved">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {data?.resolvedCount ?? data?.resolvedIssues ?? '10'}
                </div>
                <div className="stat-label">Issues Resolved</div>
              </div>
            </div>
          </Col>

          <Col md={4} sm={12}>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-members">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {data?.membersCount ?? (data?.communityMembers === '0.0k' ? '8' : (data?.communityMembers || '8'))}
                </div>
                <div className="stat-label">Community Members</div>
              </div>
            </div>
          </Col>

          <Col md={4} sm={12}>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-neighborhoods">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {data?.neighborhoodsCount ?? '5'}
                </div>
                <div className="stat-label">Neighborhoods Improved</div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ImpactCounters;
