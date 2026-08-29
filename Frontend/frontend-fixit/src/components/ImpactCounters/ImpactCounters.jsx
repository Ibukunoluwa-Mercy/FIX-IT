import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { CheckCircle, Users, Map } from 'lucide-react';
import './ImpactCounters.css';

const ImpactCounters = ({ data }) => {
  return (
    <div className="impact-stats-row animate-slide-in delay-100">
      <Container>
        <Row className="g-4 justify-content-center">
          <Col md={4}>
            <div className="stat-card text-center">
              <div className="stat-icon-wrapper">
                <CheckCircle size={32} />
              </div>
              <div className="stat-number">{data?.resolvedIssues || '1240'}</div>
              <div className="stat-label">Issues Resolved</div>
            </div>
          </Col>

          <Col md={4}>
            <div className="stat-card text-center">
              <div className="stat-icon-wrapper">
                <Users size={32} />
              </div>
              <div className="stat-number">{data?.communityMembers || '0.0k'}</div>
              <div className="stat-label">Community Members</div>
            </div>
          </Col>

          <Col md={4}>
            <div className="stat-card text-center">
              <div className="stat-icon-wrapper">
                <Map size={32} />
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
