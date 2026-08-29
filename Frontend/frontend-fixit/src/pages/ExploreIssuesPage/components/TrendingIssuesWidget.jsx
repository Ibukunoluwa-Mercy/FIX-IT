import React from 'react';
import { Card } from 'react-bootstrap';
import { ArrowRight } from 'lucide-react';

export const TrendingIssuesWidget = ({ issues }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4 mb-4">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Trending Issues</h6>
          <a href="#" className="small text-primary text-decoration-none fw-semibold">
            View All <ArrowRight size={13} />
          </a>
        </div>
        <div className="d-flex flex-column gap-3">
          {issues.map((item) => (
            <div key={item.id} className="d-flex align-items-center gap-3 pb-2 border-bottom">
              <img src={item.image} alt={item.title} className="trending-mini-img rounded-3" />
              <div className="flex-grow-1">
                <div className="fw-bold small line-clamp-1">{item.title}</div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{item.location}</div>
              </div>
              <div className="text-end">
                <div className="fw-bold small">{item.confirmations}</div>
                <span className={`badge-trending-sev sev-${item.severity.toLowerCase()}`}>
                  {item.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};
