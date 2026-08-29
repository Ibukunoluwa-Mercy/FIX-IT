import React from 'react';
import { MapPin, User, Clock } from 'lucide-react';
import './ReportCard.css';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'resolved':
      return <span className="status-badge status-resolved">Resolved</span>;
    case 'in progress':
    case 'in-progress':
      return <span className="status-badge status-in-progress">In Progress</span>;
    default:
      return <span className="status-badge status-open">{status || 'Open'}</span>;
  }
};

const ReportCard = ({ item, report, index = 0 }) => {
  // Support both 'item' or 'report' prop gracefully
  const data = item || report || {};

  return (
    <div className="report-card h-100 animate-slide-in" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
      <div className="report-card-img-wrapper">
        {data.image && (
          <img src={data.image} alt={data.title || 'Report item'} className="report-card-img" />
        )}
        <StatusBadge status={data.status} />
      </div>
      <div className="p-4">
        <div className="report-card-location">
          <MapPin size={14} className="text-secondary" />
          <span>{data.location || 'Community Location'}</span>
        </div>
        <h5 className="report-card-title">{data.title || 'Untitled Issue'}</h5>
        <p className="report-card-desc">{data.description || 'No description provided.'}</p>
        <div className="report-card-footer">
          <span className="d-flex align-items-center gap-1">
            <User size={14} /> {data.user || `${data.confirmations || 0} confirmations`}
          </span>
          <span className="d-flex align-items-center gap-1">
            <Clock size={14} /> {data.time || data.timeAgo || 'Recently'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
