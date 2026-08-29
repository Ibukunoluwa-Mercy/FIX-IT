import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { FileText, ClipboardCheck, Wrench, CheckCircle } from 'lucide-react';

const metrics = [
  { label: 'Total Issues', value: '128', icon: FileText, color: 'icon-purple' },
  { label: 'Verified Issues', value: '42', icon: ClipboardCheck, color: 'icon-green-light' },
  { label: 'In Progress', value: '24', icon: Wrench, color: 'icon-orange' },
  { label: 'Resolved', value: '44', icon: CheckCircle, color: 'icon-green' },
];

export const IssueMetricsRow = () => {
  return (
    <Row className="g-3 mb-4">
      {metrics.map(({ label, value, icon: Icon, color }) => (
        <Col xs={6} md={3} key={label}>
          <div className="metric-box bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
            <div className={`icon-wrapper ${color}`}>
              <Icon size={22} />
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
