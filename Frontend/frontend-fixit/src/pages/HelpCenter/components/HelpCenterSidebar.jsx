import React from 'react';
import { Link } from 'react-router-dom';
import ResidentAvatar from '../../../components/ResidentAvatar';
import logoWhite from '../../../assets/fixit-white-logo.png';

const HelpCenterSidebar = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  navGroups,
  onNavClick,
  userName,
  showProfileMenu,
  onToggleProfileMenu,
  onSignOut,
  onSettingsClick,
}) => {
  return (
    <>
      {isMobileOpen && (
        <div
          className="help-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside className={`help-sidebar ${isMobileOpen ? 'mobile-open' : ''}`} aria-label="Dashboard navigation">
        <div className="help-brand-row">
          <Link to="/dashboard" className="help-brand" aria-label="FixIt dashboard" onClick={onCloseMobile}>
            <img src={logoWhite} alt="FixIt" className="help-brand-img" />
            <span>
              Fix<span style={{ color: '#f59e0b' }}>It</span>
            </span>
          </Link>
          <button
            className="help-sidebar-toggle"
            type="button"
            onClick={isMobileOpen ? onCloseMobile : onToggleCollapse}
            aria-label="Toggle sidebar"
          >
            <i className={`fa-solid ${isMobileOpen ? 'fa-xmark' : isCollapsed ? 'fa-bars' : 'fa-xmark'}`}></i>
          </button>
        </div>

      <nav className="help-nav" aria-label="Sidebar main navigation">
        {navGroups.map((group, groupIndex) => (
          <div
            className={`help-nav-group ${groupIndex ? 'help-nav-group-secondary' : ''}`}
            key={groupIndex}
          >
            {group.map((item) => (
              <button
                key={item.label}
                className={`help-nav-link ${item.active ? 'active' : ''}`}
                onClick={() => {
                  onNavClick(item);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={item.label}
              >
                <i className={item.iconClass} style={{ fontSize: 16 }}></i>
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="help-nav-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Profile Card / Dropdown */}
      <div className="help-profile-wrap">
        {showProfileMenu && (
          <div className="help-profile-menu" role="menu">
            <button type="button" onClick={onSettingsClick}>
              <i className="fa-solid fa-gear"></i> Account settings
            </button>
            <button type="button" onClick={onSignOut}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign out
            </button>
          </div>
        )}
        <button
          className="help-profile-btn"
          type="button"
          onClick={onToggleProfileMenu}
          aria-haspopup="true"
          aria-expanded={showProfileMenu}
        >
          <ResidentAvatar className="help-avatar-circle" name={userName} />
          <span className="help-profile-copy">
            <strong>{userName}</strong>
            <small>Resident</small>
          </span>
          <i className="fa-solid fa-chevron-down" style={{ fontSize: 12, marginLeft: 'auto' }}></i>
        </button>
      </div>
    </aside>
  </>
  );
};

export default HelpCenterSidebar;
