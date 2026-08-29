import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { MapPin, ThumbsUp, MessageSquare, ArrowRight, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export const IssueFeedCard = ({ issue, isConfirmed, onConfirm }) => {
  const totalConfirmations = issue.confirmations + (isConfirmed ? 1 : 0);

  return (
    <Card key={issue.id} className="issue-feed-card border-0 shadow-sm rounded-4 overflow-hidden">
      <Row className="g-0">
        <Col sm={4} className="position-relative issue-img-col">
          <img src={issue.image} alt={issue.title} className="issue-feed-img" />
          <Badge className={`severity-badge severity-${issue.severity.toLowerCase()}`}>
            {issue.severity}
          </Badge>
          <div className="photo-count-badge">
            <Camera size={13} className="me-1" /> {issue.photoCount}
          </div>
        </Col>

        <Col sm={8} className="p-3 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex justify-content-between align-items-start mb-1">
              <h5 className="issue-feed-title fw-bold mb-0">{issue.title}</h5>
              <span className={`status-pill status-${issue.status.toLowerCase().replace(' ', '-')}`}>
                {issue.status}
              </span>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-2">
              <span className="d-flex align-items-center gap-1">
                <MapPin size={14} className="text-secondary" /> {issue.location}
              </span>
              <span>•</span>
              <span>{issue.category}</span>
              <span>•</span>
              <span>{issue.createdAt}</span>
            </div>

            <p className="issue-feed-desc text-muted small mb-3">
              {issue.description}
            </p>
          </div>

          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
            <div className="d-flex align-items-center gap-3">
              <button
                className={`btn-confirm-action ${isConfirmed ? 'active' : ''}`}
                onClick={() => onConfirm(issue.id)}
              >
                <ThumbsUp size={14} className="me-1" />
                {totalConfirmations} Confirmed
              </button>
              <span className="text-muted small d-flex align-items-center gap-1">
                <MessageSquare size={14} /> {issue.commentsCount}
              </span>
            </div>
            <Link to={`/explore`} className="btn-view-details text-decoration-none">
              View Details <ArrowRight size={14} className="ms-1" />
            </Link>
          </div>
        </Col>
      </Row>
    </Card>
  );
};
