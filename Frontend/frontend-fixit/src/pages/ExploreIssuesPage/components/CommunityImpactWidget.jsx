import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { ArrowRight, CheckCircle, Wrench, Flame } from 'lucide-react';

export const CommunityImpactWidget = () => {
  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="fw-bold mb-0">Community Impact</h6>
          <a href="#" className="small text-primary text-decoration-none fw-semibold">
            View Insights <ArrowRight size={13} />
          </a>
        </div>
        <Row className="g-2 text-center mb-3">
          <Col xs={6} className="p-2 border rounded-3 bg-light-subtle">
            <div className="text-success mb-1"><CheckCircle size={20} /></div>
            <h5 className="fw-bold mb-0">82%</h5>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Resolution Rate</div>
          </Col>
          <Col xs={6} className="p-2 border rounded-3 bg-light-subtle">
            <div className="text-primary mb-1"><Wrench size={20} /></div>
            <h5 className="fw-bold mb-0">4.2 days</h5>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Avg. Resolution Time</div>
          </Col>
          <Col xs={6} className="p-2 border rounded-3 bg-light-subtle">
            <div className="text-warning mb-1"><Flame size={20} /></div>
            <h5 className="fw-bold mb-0">246</h5>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Reported this month</div>
          </Col>
          <Col xs={6} className="p-2 border rounded-3 bg-light-subtle">
            <div className="text-success mb-1"><CheckCircle size={20} /></div>
            <h5 className="fw-bold mb-0">201</h5>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Resolved this month</div>
          </Col>
        </Row>
        <div className="text-center text-muted small mt-3">
          <span className="d-inline-flex align-items-center gap-1">
            🔍 Together we're making our community better!
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};
