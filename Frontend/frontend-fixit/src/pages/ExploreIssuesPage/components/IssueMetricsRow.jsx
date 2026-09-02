import React from 'react';
import { Row, Col } from 'react-bootstrap';

const metrics = [
  { label: 'Total Issues', value: '128', iconClass: 'fa-solid fa-file-lines', color: 'icon-purple' },
  { label: 'Verified Issues', value: '42', iconClass: 'fa-solid fa-clipboard-check', color: 'icon-green-light' },
  { label: 'In Progress', value: '24', iconClass: 'fa-solid fa-wrench', color: 'icon-orange' },
  { label: 'Resolved', value: '44', iconClass: 'fa-solid fa-circle-check', color: 'icon-green' },
];

export const IssueMetricsRow = () => {
  return (
    <Row className="g-3 mb-4">
      {metrics.map(({ label, value, iconClass, color }) => (
        <Col xs={6} md={3} key={label}>
          <div className="metric-box bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
            <div className={`icon-wrapper ${color}`}>
              <i className={iconClass} style={{ fontSize: 20 }}></i>
            </div>
            <div>
              <h4 className="mb-0 fw-bold">{value}</h4>
              <div className="small text-muted">{label}</div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
};
