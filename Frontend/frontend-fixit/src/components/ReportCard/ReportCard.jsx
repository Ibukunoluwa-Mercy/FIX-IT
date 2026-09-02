import React from 'react';
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
          <i className="fa-solid fa-location-dot text-secondary" style={{ fontSize: 13 }}></i>
          <span>{data.location || 'Community Location'}</span>
        </div>
        <h5 className="report-card-title">{data.title || 'Untitled Issue'}</h5>
        <p className="report-card-desc">{data.description || 'No description provided.'}</p>
        <div className="report-card-footer">
          <span className="d-flex align-items-center gap-1">
            <i className="fa-solid fa-user" style={{ fontSize: 13 }}></i> {data.user || `${data.confirmations || 0} confirmations`}
          </span>
          <span className="d-flex align-items-center gap-1">
            <i className="fa-solid fa-clock" style={{ fontSize: 13 }}></i> {data.time || data.timeAgo || 'Recently'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
