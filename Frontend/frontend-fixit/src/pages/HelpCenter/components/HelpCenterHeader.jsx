import React from 'react';
import logoWhite from '../../../assets/fixit-white-logo.png';

const HelpCenterHeader = ({
  onToggleSidebar,
  onOpenReportWizard,
  showNotifications,
  onToggleNotifications,
  onToggleProfileMenu,
  firstName,
}) => {
  return (
    <header className="help-header">
      <div className="help-mobile-brand">
        <button
          className="help-sidebar-toggle d-md-none"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <img src={logoWhite} alt="FixIt" style={{ height: '24px' }} />
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Fi<span style={{ color: '#f59e0b' }}>xIt</span>
        </span>
      </div>

      <div className="help-header-actions">
        <button
          className="help-btn-new-report"
          type="button"
          onClick={onOpenReportWizard}
        >
          <i className="fa-solid fa-plus"></i> New Report
        </button>

        {/* Notification Popover */}
        <div style={{ position: 'relative' }}>
          <button
            className="help-header-icon-btn"
            type="button"
            onClick={onToggleNotifications}
            aria-label="Notifications"
          >
            <i className="fa-regular fa-bell" style={{ fontSize: 18 }}></i>
            <span className="help-notification-dot"></span>
          </button>
          {showNotifications && (
            <div className="help-notification-popover" role="dialog">
              <strong>Notifications</strong>
              <p>No new notifications at this time.</p>
            </div>
          )}
        </div>

        {/* Avatar Button */}
        <button
          className="help-header-avatar"
          type="button"
          onClick={onToggleProfileMenu}
          aria-label="Open profile settings"
        >
          {firstName.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
};

export default HelpCenterHeader;
