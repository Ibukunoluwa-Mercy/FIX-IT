import { Link } from 'react-router-dom';
import logoWhite from '../../../assets/fixit-white-logo.png';
import ResidentAvatar from '../../../components/ResidentAvatar';

const SettingsSidebar = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileOpen,
  onCloseMobile,
  navGroups,
  navigate,
  showProfileMenu,
  setShowProfileMenu,
  signOut,
  userName,
}) => {
  return (
    <>
      {isMobileOpen && (
        <div
          className="resident-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside className={`resident-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="resident-brand-row">
          <Link to="/dashboard" className="resident-brand" aria-label="FixIt dashboard" onClick={onCloseMobile}>
            <img src={logoWhite} alt="FixIt" className="brand-logo-img" />
            <span className="brand-word">
              Fix<span className="settings-brand-orange">It</span>
            </span>
          </Link>
          <button
            className="icon-button sidebar-toggle"
            type="button"
            onClick={() => {
              if (isMobileOpen) {
                onCloseMobile();
              } else {
                setIsSidebarCollapsed((value) => !value);
              }
            }}
            aria-label="Toggle sidebar"
          >
            {isMobileOpen ? (
              <i className="fa-solid fa-xmark" />
            ) : isSidebarCollapsed ? (
              <i className="fa-solid fa-bars" />
            ) : (
              <i className="fa-solid fa-xmark" />
            )}
          </button>
        </div>
      <nav className="resident-nav" aria-label="Dashboard navigation">
        {navGroups.map((group, groupIndex) => (
          <div
            className={`nav-group ${groupIndex ? 'nav-group-secondary' : ''}`}
            key={groupIndex}
          >
            {group.map(({ label, iconClass, path }) => (
              <button
                type="button"
                key={label}
                className={`resident-nav-link ${label === 'Settings' ? 'active' : ''}`}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  if (path) navigate(path);
                }}
                title={label}
              >
                <i className={iconClass} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="resident-profile-wrap">
        {showProfileMenu && (
          <div className="profile-menu">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(false);
                if (onCloseMobile) onCloseMobile();
              }}
            >
              <i className="fa-solid fa-gear" /> Account settings
            </button>
            <button type="button" onClick={signOut}>
              <i className="fa-solid fa-arrow-right-from-bracket" /> Sign out
            </button>
          </div>
        )}
        <button
          type="button"
          className="resident-profile"
          onClick={() => setShowProfileMenu((value) => !value)}
        >
          <ResidentAvatar className="avatar avatar-photo" name={userName} />
          <span className="profile-copy">
            <strong>{userName}</strong>
            <small>Resident</small>
          </span>
          <i className="fa-solid fa-chevron-down" />
        </button>
      </div>
    </aside>
  </>
  );
};

export default SettingsSidebar;
