import { useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AccountInfoCard from '../SettingsPage/components/AccountInfoCard';
import ChangePasswordCard from '../SettingsPage/components/ChangePasswordCard';
import NotificationsCard from '../SettingsPage/components/NotificationsCard';
import DeleteAccountModal from '../SettingsPage/components/DeleteAccountModal';
import { LocationTab, AppearanceTab, HelpTab } from '../SettingsPage/components/SettingsSimpleTabs';
import { settingsSections } from '../SettingsPage/settingsConstants';
import { useSettingsAccount } from '../SettingsPage/hooks/useSettingsAccount';
import logoWhite from '../../assets/fixit-white-logo.png';
import '../ArtisanDashboard/ArtisanDashboard.css';
import '../SettingsPage/SettingsPage.css';
import './ArtisanSettingsPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const artisanNavItems = [
  { label: 'Dashboard', iconClass: 'fa-solid fa-house', path: '/dashboard/artisan' },
  { label: 'Reports', iconClass: 'fa-solid fa-file-lines', path: '/dashboard/artisan/reports' },
  { label: 'Messages', iconClass: 'fa-solid fa-envelope', path: '/dashboard/artisan/messages' },
  { label: 'Settings', iconClass: 'fa-solid fa-gear', path: '/dashboard/artisan/settings' },
  { label: 'Reviews', iconClass: 'fa-solid fa-star', path: '/dashboard/artisan/reviews' },
];

const ArtisanSettingsPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('fixitToken') || localStorage.getItem('token') || '';
  const [activeSection, setActiveSection] = useState('Account');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [appearance, setAppearance] = useState(() => localStorage.getItem('fixitTheme') || 'system');

  const {
    avatarInput,
    account,
    loadingAccount,
    accountError,
    editingAccount,
    setEditingAccount,
    editingOfficialAccount,
    setEditingOfficialAccount,
    accountForm,
    setAccountForm,
    savingAccount,
    savingOfficialAccount,
    avatarFile,
    avatarPreview,
    uploadingAvatar,
    passwordForm,
    setPasswordForm,
    passwordVisibility,
    setPasswordVisibility,
    passwordError,
    setPasswordError,
    changingPassword,
    savingNotification,
    showDeleteModal,
    setShowDeleteModal,
    deletePassword,
    setDeletePassword,
    deletingAccount,
    beginAccountEdit,
    saveAccount,
    beginOfficialEdit,
    saveOfficialAccount,
    handleAvatarSelect,
    uploadAvatar,
    cancelAvatar,
    officialIdInput,
    officialIdFile,
    uploadingOfficialId,
    handleOfficialIdSelect,
    uploadOfficialId,
    cancelOfficialId,
    changePassword,
    toggleNotification,
    deleteAccount,
  } = useSettingsAccount(token, navigate);

  const userName = account.fullName || 'Artisan';
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'A';
  const avatarSource = avatarPreview || (account.avatarUrl?.startsWith('/uploads/') ? `${API_URL}${account.avatarUrl}` : account.avatarUrl);

  const saveAppearance = (preference) => {
    const resolvedTheme = preference === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preference;
    setAppearance(preference);
    localStorage.setItem('fixitTheme', preference);
    document.documentElement.dataset.dashboardTheme = resolvedTheme;
    window.dispatchEvent(new Event('fixit-theme-change'));
    toast.success('Appearance preference saved.');
  };

  const handleLogout = () => {
    localStorage.removeItem('fixitToken');
    localStorage.removeItem('token');
    localStorage.removeItem('fixitUser');
    navigate('/login', { replace: true });
  };

  const renderActiveSection = () => {
    if (loadingAccount) return <div className="settings-loading"><Spinner animation="border" /><span>Loading account settings...</span></div>;
    if (accountError) return <div className="settings-load-error" role="alert">{accountError}<Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>Retry</Button></div>;
    
    if (activeSection === 'Account') {
      return (
        <AccountInfoCard
          account={account}
          editingAccount={editingAccount}
          setEditingAccount={setEditingAccount}
          editingOfficialAccount={editingOfficialAccount}
          setEditingOfficialAccount={setEditingOfficialAccount}
          accountForm={accountForm}
          setAccountForm={setAccountForm}
          savingAccount={savingAccount}
          savingOfficialAccount={savingOfficialAccount}
          onSaveAccount={saveAccount}
          onBeginEdit={beginAccountEdit}
          onSaveOfficialAccount={saveOfficialAccount}
          onBeginOfficialEdit={beginOfficialEdit}
          avatarSource={avatarSource}
          userName={userName}
          userInitial={userInitial}
          avatarInput={avatarInput}
          onAvatarSelect={handleAvatarSelect}
          avatarFile={avatarFile}
          uploadAvatar={uploadAvatar}
          uploadingAvatar={uploadingAvatar}
          cancelAvatar={cancelAvatar}
          officialIdInput={officialIdInput}
          onOfficialIdSelect={handleOfficialIdSelect}
          officialIdFile={officialIdFile}
          uploadingOfficialId={uploadingOfficialId}
          uploadOfficialId={uploadOfficialId}
          cancelOfficialId={cancelOfficialId}
          apiUrl={API_URL}
        />
      );
    }

    if (activeSection === 'Notifications') {
      return (
        <NotificationsCard
          account={account}
          savingNotification={savingNotification}
          toggleNotification={toggleNotification}
        />
      );
    }

    if (activeSection === 'Privacy & Security') {
      return (
        <>
          <ChangePasswordCard
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            passwordVisibility={passwordVisibility}
            setPasswordVisibility={setPasswordVisibility}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
            changingPassword={changingPassword}
            onSubmitPassword={changePassword}
          />
          <section className="settings-card settings-danger-zone">
            <h2>Danger Zone</h2>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
          </section>
        </>
      );
    }

    if (activeSection === 'Appearance') return <AppearanceTab appearance={appearance} saveAppearance={saveAppearance} />;
    if (activeSection === 'Location') return <LocationTab account={account} onBeginEdit={() => { setActiveSection('Account'); beginAccountEdit(); }} />;
    if (activeSection === 'Help & Support') return <HelpTab navigate={navigate} />;

    return null;
  };

  return (
    <div className="artisan-layout artisan-dashboard">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="artisan-sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dark Navy Sidebar matching Artisan Dashboard */}
      <aside className={`artisan-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/dashboard/artisan" className="artisan-brand" aria-label="Fixit dashboard" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}} onClick={() => setIsSidebarOpen(false)}>
            <img src={logoWhite} alt="FixIt" className="brand-logo-img" style={{height: '32px'}} />
            <span className="brand-word">
              Fix<span style={{ color: '#f59e0b' }}>It</span>
            </span>
          </Link>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main Navigation">
          <NavLink to="/dashboard/artisan" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end onClick={() => setIsSidebarOpen(false)}>
            <i className="fa-solid fa-house nav-icon"></i>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/dashboard/artisan/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => setIsSidebarOpen(false)}>
            <i className="fa-solid fa-file-lines nav-icon"></i>
            <span>Reports</span>
          </NavLink>
          <NavLink to="/dashboard/artisan/messages" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => setIsSidebarOpen(false)}>
            <div className="nav-icon-wrapper">
              <i className="fa-solid fa-envelope nav-icon"></i>
            </div>
            <span>Messages</span>
          </NavLink>
          <NavLink to="/dashboard/artisan/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => setIsSidebarOpen(false)}>
            <i className="fa-solid fa-gear nav-icon"></i>
            <span>Settings</span>
          </NavLink>
          <NavLink to="/dashboard/artisan/reviews" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => setIsSidebarOpen(false)}>
            <i className="fa-solid fa-star nav-icon"></i>
            <span>Reviews</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="need-help-card">
            <div className="help-header">
              <i className="fa-solid fa-headset help-icon" />
              <div>
                <strong>Need Help?</strong>
                <span>Contact our support team.</span>
              </div>
            </div>
            <button className="help-btn" onClick={() => navigate('/help-center')}>
              Help Center <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="artisan-main">
        <header className="artisan-topbar">
          <div className="topbar-left">
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen((prev) => !prev)} aria-label="Open sidebar">
              <i className="fa-solid fa-bars" />
            </button>
          </div>
          <div className="topbar-right">
            <button className="notification-btn" aria-label="Notifications" onClick={() => setActiveSection('Notifications')}>
              <i className="fa-regular fa-bell" />
            </button>
            <div className="profile-dropdown-wrapper">
              <button
                className="profile-trigger"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-expanded={isProfileMenuOpen}
              >
                {avatarSource ? (
                  <img src={avatarSource} alt={userName} className="avatar-img" />
                ) : (
                  <div className="avatar-initials">{userInitial}</div>
                )}
                <span className="profile-name">{userName}</span>
                <i className="fa-solid fa-chevron-down dropdown-icon" />
              </button>
              {isProfileMenuOpen && (
                <div className="artisan-profile-menu">
                  <button onClick={() => { setIsProfileMenuOpen(false); setActiveSection('Account'); }}>
                    Profile
                  </button>
                  <button onClick={() => { setIsProfileMenuOpen(false); setActiveSection('Account'); }}>
                    Settings
                  </button>
                  <button onClick={handleLogout} className="logout-btn">
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="artisan-content settings-page-content">
          <div className="settings-page-header">
            <h1>Artisan Settings</h1>
            <p>Manage your artisan account preferences, profile, security, and notification settings.</p>
          </div>

          <div className="settings-main-layout">
            <nav className="settings-section-tabs" aria-label="Settings categories">
              {settingsSections.map(([name, iconClass]) => (
                <button
                  key={name}
                  type="button"
                  className={`settings-section-tab ${activeSection === name ? 'active' : ''}`}
                  onClick={() => setActiveSection(name)}
                >
                  <i className={iconClass} />
                  <span>{name}</span>
                </button>
              ))}
            </nav>

            <div className="settings-section-content">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </main>

      <DeleteAccountModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        deletePassword={deletePassword}
        setDeletePassword={setDeletePassword}
        deletingAccount={deletingAccount}
        onDeleteAccount={deleteAccount}
      />
    </div>
  );
};

export default ArtisanSettingsPage;
