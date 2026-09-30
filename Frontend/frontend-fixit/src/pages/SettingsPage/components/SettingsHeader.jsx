import logoWhite from '../../../assets/fixit-white-logo.png';
import ResidentAvatar from '../../../components/ResidentAvatar';

const SettingsHeader = ({
  onToggleSidebar,
  onNotificationsClick,
  showHeaderProfileMenu,
  setShowHeaderProfileMenu,
  userName,
  signOut,
}) => {
  return (
    <header className="resident-header">
      <div className="mobile-brand">
        <button
          className="resident-mobile-sidebar-toggle"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <i className="fa-solid fa-bars" />
        </button>
      </div>
      <div className="header-actions">
        <button
          type="button"
          className="icon-button header-icon"
          aria-label="Notifications"
          onClick={onNotificationsClick}
        >
          <i className="fa-solid fa-bell" />
        </button>
        <div className="settings-header-profile-wrap">
          <button
            type="button"
            className="settings-header-profile"
            onClick={() => setShowHeaderProfileMenu((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={showHeaderProfileMenu}
          >
            <ResidentAvatar className="avatar avatar-photo" name={userName} />
            <span>{userName}</span>
            <i className="fa-solid fa-chevron-down" />
          </button>
          {showHeaderProfileMenu && (
            <div className="settings-header-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => setShowHeaderProfileMenu(false)}
              >
                Account settings
              </button>
              <button type="button" role="menuitem" onClick={signOut}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SettingsHeader;
