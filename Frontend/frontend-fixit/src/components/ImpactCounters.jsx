import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { CheckCircle, Users, Map } from 'lucide-react';
import './ImpactCounters.css';

const ImpactCounters = ({ data }) => {
  return (
    <Container className="stats-container animate-slide-in delay-100">
      <Row className="g-4">
        <Col md={4}>
          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle size={32} />
            </div>
            <div className="stat-value">{data?.resolved || '1240'}</div>
            <div className="stat-label">Issues Resolved</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={32} />
            </div>
            <div className="stat-value">{data?.members || '0.0k'}</div>
            <div className="stat-label">Community Members</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="stat-card">
            <div className="stat-icon">
              <Map size={32} />
            </div>
            <div className="stat-value">{data?.neighborhoods || '15'}</div>
            <div className="stat-label">Neighborhoods Improved</div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ImpactCounters;
