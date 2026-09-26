import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import SettingsSidebar from './components/SettingsSidebar';
import SettingsHeader from './components/SettingsHeader';
import AccountInfoCard from './components/AccountInfoCard';
import ChangePasswordCard from './components/ChangePasswordCard';
import NotificationsCard from './components/NotificationsCard';
import DeleteAccountModal from './components/DeleteAccountModal';
import { LocationTab, AppearanceTab, HelpTab } from './components/SettingsSimpleTabs';
import { navGroups, settingsSections } from './settingsConstants';
import { useSettingsAccount } from './hooks/useSettingsAccount';
import '../ResidentDashboard/ResidentDashboard.css';
import './SettingsPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const SettingsPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('fixitToken') || localStorage.getItem('token') || '';
  const [activeSection, setActiveSection] = useState('Account');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHeaderProfileMenu, setShowHeaderProfileMenu] = useState(false);
  const [appearance, setAppearance] = useState(() => localStorage.getItem('fixitTheme') || 'system');

  const {
    avatarInput,
    account,
    loadingAccount,
    accountError,
    editingAccount,
    setEditingAccount,
    accountForm,
    setAccountForm,
    savingAccount,
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
    handleAvatarSelect,
    uploadAvatar,
    cancelAvatar,
    changePassword,
    toggleNotification,
    deleteAccount,
  } = useSettingsAccount(token, navigate);

  const userName = account.fullName || 'Resident';
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'R';
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

  const signOut = () => {
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
        <>
          <AccountInfoCard
            account={account}
            editingAccount={editingAccount}
            setEditingAccount={setEditingAccount}
            accountForm={accountForm}
            setAccountForm={setAccountForm}
            savingAccount={savingAccount}
            onSaveAccount={saveAccount}
            onBeginEdit={beginAccountEdit}
            avatarSource={avatarSource}
            userName={userName}
            userInitial={userInitial}
            avatarInput={avatarInput}
            onAvatarSelect={handleAvatarSelect}
            avatarFile={avatarFile}
            uploadAvatar={uploadAvatar}
            uploadingAvatar={uploadingAvatar}
            cancelAvatar={cancelAvatar}
          />
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
          <NotificationsCard
            account={account}
            savingNotification={savingNotification}
            onToggleNotification={toggleNotification}
            onManageClick={() => setActiveSection('Notifications')}
          />
          <section className="settings-card settings-delete-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon delete-icon"><i className="fa-regular fa-trash-can" /></div>
              <div><h2>Delete Account</h2><p>Permanently delete your account and remove your personal profile data.</p></div>
              <Button variant="outline-danger" size="sm" className="settings-action" onClick={() => setShowDeleteModal(true)}><i className="fa-regular fa-trash-can" /> Delete Account</Button>
            </div>
          </section>
        </>
      );
    }

    if (activeSection === 'Notifications') {
      return (
        <NotificationsCard
          account={account}
          savingNotification={savingNotification}
          onToggleNotification={toggleNotification}
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
          <section className="settings-card settings-delete-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon delete-icon"><i className="fa-regular fa-trash-can" /></div>
              <div><h2>Delete Account</h2><p>Permanently delete your account and remove your personal profile data.</p></div>
              <Button variant="outline-danger" size="sm" className="settings-action" onClick={() => setShowDeleteModal(true)}><i className="fa-regular fa-trash-can" /> Delete Account</Button>
            </div>
          </section>
        </>
      );
    }

    if (activeSection === 'Location') return <LocationTab location={account.location} onEditAccount={beginAccountEdit} />;
    if (activeSection === 'Appearance') return <AppearanceTab appearance={appearance} onSaveAppearance={saveAppearance} />;
    return <HelpTab onOpenHelpCenter={() => navigate('/help-center')} />;
  };

  return (
    <div className={`resident-dashboard settings-dashboard ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`} data-settings-theme={appearance}>
      <SettingsSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        navGroups={navGroups}
        navigate={navigate}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        signOut={signOut}
        userInitial={userInitial}
        userName={userName}
      />
      <main className="resident-main settings-main">
        <SettingsHeader
          onNotificationsClick={() => setActiveSection('Notifications')}
          showHeaderProfileMenu={showHeaderProfileMenu}
          setShowHeaderProfileMenu={setShowHeaderProfileMenu}
          userInitial={userInitial}
          userName={userName}
          signOut={signOut}
        />
        <div className="settings-page-content">
          <div className="settings-page-heading">
            <span className="settings-page-icon"><i className="fa-solid fa-gear" /></span>
            <div><h1>Settings</h1><p>Manage your account, preferences and app settings.</p></div>
          </div>
          <div className="settings-layout">
            <nav className="settings-subnav" aria-label="Settings sections">
              {settingsSections.map(([label, icon]) => (
                <button
                  type="button"
                  key={label}
                  className={activeSection === label ? 'active' : ''}
                  onClick={() => setActiveSection(label)}
                >
                  <i className={icon} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
            <div className="settings-panels">{renderActiveSection()}</div>
          </div>
        </div>
      </main>
      <DeleteAccountModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        deletingAccount={deletingAccount}
        deletePassword={deletePassword}
        setDeletePassword={setDeletePassword}
        onDeleteAccount={deleteAccount}
      />
    </div>
  );
};

export default SettingsPage;
