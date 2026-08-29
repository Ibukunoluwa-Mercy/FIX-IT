import React from 'react';
import { MapPin, Check, Clock, AlertTriangle } from 'lucide-react';
import './ReportCard.css';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'resolved':
      return <span className="status-badge status-resolved">Resolved</span>;
    case 'in-progress':
      return <span className="status-badge status-in-progress">In Progress</span>;
    default:
      return <span className="status-badge status-open">Open</span>;
  }
};

const ReportCard = ({ report }) => {
  return (
    <div className="report-card h-100">
      <div className="report-card-img-wrapper">
        <img src={report.image} alt={report.title} className="report-card-img" />
        <StatusBadge status={report.status} />
      </div>
      <div className="p-4">
        <h5 className="report-card-title">{report.title}</h5>
        <div className="report-card-location">
          <MapPin size={16} />
          <span>{report.location}</span>
        </div>
        <p className="report-card-desc">{report.description}</p>
        <div className="report-card-footer">
          <span>{report.confirmations || 0} confirmations</span>
          <span>{report.timeAgo || 'Recently'}</span>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
