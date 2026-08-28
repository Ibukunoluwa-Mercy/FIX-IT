import React from 'react';
import { MapPin, Check, Clock, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Resolved':
      return (
        <div className="status-badge status-resolved">
          <Check size={14} /> Resolved
        </div>
      );
    case 'In Progress':
      return (
        <div className="status-badge status-in-progress">
          <Clock size={14} /> In Progress
        </div>
      );
    case 'Verified':
      return (
        <div className="status-badge status-verified">
          <AlertTriangle size={14} /> Verified
        </div>
      );
    default:
      return null;
  }
};

const ReportCard = ({ item, index }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className={`report-card animate-slide-in delay-${(index + 1) * 100}`}>
      <div className="report-image-container">
        <img src={item.image} alt={item.title} className="report-image" />
        <StatusBadge status={item.status} />
      </div>
      <div className="report-content">
        <div className="location-tag">
          <MapPin size={12} /> {item.location}
        </div>
        <h3 className="report-title">{item.title}</h3>
        <p className="report-desc">{item.description}</p>
        
        <div className="report-footer">
          <div className="user-info">
            <div className="user-avatar">{getInitials(item.user)}</div>
            <span className="user-name">{item.user}</span>
          </div>
          <span className="time-ago">{item.time}</span>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
