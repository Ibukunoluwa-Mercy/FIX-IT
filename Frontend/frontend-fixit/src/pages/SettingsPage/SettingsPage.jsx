import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import logoWhite from '../../assets/fixit-white-logo.png';
import AccountInfoCard from './components/AccountInfoCard';
import ChangePasswordCard from './components/ChangePasswordCard';
import NotificationsCard from './components/NotificationsCard';
import DeleteAccountModal from './components/DeleteAccountModal';
import '../ResidentDashboard/ResidentDashboard.css';
import './SettingsPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
import {
  navGroups,
  settingsSections,
  emptyAccount,
  normalizeSettingsAccount,
  getErrorMessage,
} from './settingsConstants';

const SettingsPage = () => {
  const navigate = useNavigate();
  const avatarInput = useRef(null);
  const token = localStorage.getItem('fixitToken') || localStorage.getItem('token') || '';
  const [account, setAccount] = useState(emptyAccount);
  const [activeSection, setActiveSection] = useState('Account');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHeaderProfileMenu, setShowHeaderProfileMenu] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [accountError, setAccountError] = useState('');
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ fullName: '', email: '', phone: '', location: '' });
  const [savingAccount, setSavingAccount] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingNotification, setSavingNotification] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [appearance, setAppearance] = useState(() => localStorage.getItem('fixitTheme') || 'system');

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return undefined;
    }
    let mounted = true;
    axios.get(`${API_URL}/api/settings/account`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (!mounted) return;
        const nextAccount = normalizeSettingsAccount(data);
        setAccount(nextAccount);
        setAccountForm({ fullName: nextAccount.fullName, email: nextAccount.email, phone: nextAccount.phone, location: nextAccount.location });
        setAccountError('');
      })
      .catch((error) => {
        if (!mounted) return;
        if (error.response?.status === 401) {
          localStorage.removeItem('fixitToken');
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
          return;
        }
        setAccountError(getErrorMessage(error, 'Unable to load your account settings.'));
      })
      .finally(() => { if (mounted) setLoadingAccount(false); });
    return () => { mounted = false; };
  }, [navigate, token]);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };
  const userName = account.fullName || 'Resident';
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'R';
  const avatarSource = avatarPreview || (account.avatarUrl.startsWith('/uploads/') ? `${API_URL}${account.avatarUrl}` : account.avatarUrl);

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

  const beginAccountEdit = () => {
    setAccountForm({ fullName: account.fullName, email: account.email, phone: account.phone, location: account.location });
    setActiveSection('Account');
    setEditingAccount(true);
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    const changedFields = Object.fromEntries(Object.entries(accountForm).filter(([key, value]) => value !== account[key]));
    if (!Object.keys(changedFields).length) {
      setEditingAccount(false);
      return;
    }
    setSavingAccount(true);
    try {
      const { data } = await axios.patch(`${API_URL}/api/settings/account`, changedFields, authConfig);
      const updatedAccount = normalizeSettingsAccount(data);
      setAccount((current) => ({ ...current, ...updatedAccount }));
      setAccountForm({ fullName: updatedAccount.fullName, email: updatedAccount.email, phone: updatedAccount.phone, location: updatedAccount.location });
      setEditingAccount(false);
      if (changedFields.email) toast.info('Check your new email address for a verification link.');
      else toast.success('Account information updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update account information.'));
    } finally {
      setSavingAccount(false);
    }
  };

  const handleAvatarSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Choose an image smaller than 5 MB.');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile || uploadingAvatar) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      const { data } = await axios.post(`${API_URL}/api/settings/account/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccount((current) => ({ ...current, avatarUrl: data.avatarUrl }));
      setAvatarFile(null);
      setAvatarPreview('');
      toast.success('Profile picture updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update profile picture.'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError('New password must be different from the current password.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      await axios.post(`${API_URL}/api/settings/account/change-password`, passwordForm, authConfig);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully.');
    } catch (error) {
      setPasswordError(getErrorMessage(error, 'Unable to change password.'));
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleNotification = async (key, enabled) => {
    const previousValue = account.notifications[key];
    setAccount((current) => ({ ...current, notifications: { ...current.notifications, [key]: enabled } }));
    setSavingNotification(key);
    try {
      const preferenceKey = key === 'promotionsNews' ? 'promotions' : key;
      const { data } = await axios.patch(`${API_URL}/api/settings/notifications`, { [preferenceKey]: enabled }, authConfig);
      setAccount((current) => ({ ...current, notifications: { ...current.notifications, ...normalizeSettingsAccount({ notificationPrefs: data.notificationPrefs }).notifications } }));
    } catch (error) {
      setAccount((current) => ({ ...current, notifications: { ...current.notifications, [key]: previousValue } }));
      toast.error(getErrorMessage(error, 'Unable to save notification preference.'));
    } finally {
      setSavingNotification('');
    }
  };

  const deleteAccount = async (event) => {
    event.preventDefault();
    if (deletingAccount || !deletePassword) return;
    setDeletingAccount(true);
    try {
      await axios.delete(`${API_URL}/api/settings/account`, { ...authConfig, data: { password: deletePassword } });
      localStorage.removeItem('fixitToken');
      localStorage.removeItem('token');
      localStorage.removeItem('fixitUser');
      toast.success('Your account has been deleted.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete account.'));
    } finally {
      setDeletingAccount(false);
    }
  };

  const renderDeleteAccountCard = () => (
    <section className="settings-card settings-delete-card">
      <div className="settings-card-heading">
        <div className="settings-heading-icon delete-icon"><i className="fa-regular fa-trash-can" /></div>
        <div><h2>Delete Account</h2><p>Permanently delete your account and remove your personal profile data.</p></div>
        <Button variant="outline-danger" size="sm" className="settings-action" onClick={() => setShowDeleteModal(true)}><i className="fa-regular fa-trash-can" /> Delete Account</Button>
      </div>
    </section>
  );

  const renderAccountInfo = () => (
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
  );

  const renderChangePassword = () => (
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
  );

  const renderNotifications = () => (
    <NotificationsCard
      account={account}
      savingNotification={savingNotification}
      onToggleNotification={toggleNotification}
      onManageClick={() => setActiveSection('Notifications')}
    />
  );

  const renderActiveSection = () => {
    if (loadingAccount) return <div className="settings-loading"><Spinner animation="border" /><span>Loading account settings...</span></div>;
    if (accountError) return <div className="settings-load-error" role="alert">{accountError}<Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>Retry</Button></div>;
    if (activeSection === 'Account') return <>{renderAccountInfo()}{renderChangePassword()}{renderNotifications()}{renderDeleteAccountCard()}</>;
    if (activeSection === 'Notifications') return renderNotifications();
    if (activeSection === 'Privacy & Security') return <>{renderChangePassword()}{renderDeleteAccountCard()}</>;
    if (activeSection === 'Location') return <section className="settings-card"><div className="settings-card-heading"><div><h2>Location</h2><p>Your saved account location is used when nearby issues cannot access your live location.</p></div></div><div className="settings-location-value"><i className="fa-solid fa-location-dot" /><div><strong>{account.location || 'Location not provided'}</strong><span>{account.location ? 'Account location' : 'Add a location in Account Information.'}</span></div></div>{account.location && <Button variant="outline-primary" size="sm" onClick={beginAccountEdit}>Edit account details</Button>}</section>;
    if (activeSection === 'Appearance') return <section className="settings-card"><div className="settings-card-heading"><div><h2>Appearance</h2><p>Choose how FixIt looks on this device.</p></div></div><Form.Select aria-label="Theme" value={appearance} onChange={(event) => saveAppearance(event.target.value)}><option value="system">Use device setting</option><option value="light">Light</option><option value="dark">Dark</option></Form.Select></section>;
    return <section className="settings-card"><div className="settings-card-heading"><div><h2>Help &amp; Support</h2><p>Find answers and contact the FixIt support team.</p></div></div><Button variant="outline-primary" onClick={() => navigate('/help-center')}>Open Help Center</Button></section>;
  };

  return (
    <div className={`resident-dashboard settings-dashboard ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`} data-settings-theme={appearance}>
      <aside className="resident-sidebar">
        <div className="resident-brand-row">
          <Link to="/dashboard" className="resident-brand" aria-label="FixIt dashboard"><img src={logoWhite} alt="FixIt" className="brand-logo-img" /><span className="brand-word">Fix<span className="settings-brand-orange">It</span></span></Link>
          <button className="icon-button sidebar-toggle" type="button" onClick={() => setIsSidebarCollapsed((value) => !value)} aria-label="Toggle sidebar">{isSidebarCollapsed ? <i className="fa-solid fa-bars" /> : <i className="fa-solid fa-xmark" />}</button>
        </div>
        <nav className="resident-nav" aria-label="Dashboard navigation">
          {navGroups.map((group, groupIndex) => <div className={`nav-group ${groupIndex ? 'nav-group-secondary' : ''}`} key={groupIndex}>{group.map(({ label, iconClass, path }) => <button type="button" key={label} className={`resident-nav-link ${label === 'Settings' ? 'active' : ''}`} onClick={() => path && navigate(path)} title={label}><i className={iconClass} /><span>{label}</span></button>)}</div>)}
        </nav>
        <div className="resident-profile-wrap">
          {showProfileMenu && <div className="profile-menu"><button type="button" onClick={() => setShowProfileMenu(false)}><i className="fa-solid fa-gear" /> Account settings</button><button type="button" onClick={signOut}><i className="fa-solid fa-arrow-right-from-bracket" /> Sign out</button></div>}
          <button type="button" className="resident-profile" onClick={() => setShowProfileMenu((value) => !value)}><span className="avatar avatar-photo">{userInitial}</span><span className="profile-copy"><strong>{userName}</strong><small>Resident</small></span><i className="fa-solid fa-chevron-down" /></button>
        </div>
      </aside>
      <main className="resident-main settings-main">
        <header className="resident-header">
          <div className="mobile-brand"><img src={logoWhite} alt="FixIt" className="brand-logo-img" /><span className="brand-word">Fix<span className="settings-brand-orange">It</span></span></div>
          <div className="header-actions">
            <button type="button" className="icon-button header-icon" aria-label="Notifications" onClick={() => setActiveSection('Notifications')}><i className="fa-solid fa-bell" /></button>
            <div className="settings-header-profile-wrap">
              <button type="button" className="settings-header-profile" onClick={() => setShowHeaderProfileMenu((value) => !value)} aria-haspopup="menu" aria-expanded={showHeaderProfileMenu}><span className="avatar avatar-photo">{userInitial}</span><span>{userName}</span><i className="fa-solid fa-chevron-down" /></button>
              {showHeaderProfileMenu && <div className="settings-header-menu" role="menu"><button type="button" role="menuitem" onClick={() => setShowHeaderProfileMenu(false)}>Account settings</button><button type="button" role="menuitem" onClick={signOut}>Sign out</button></div>}
            </div>
          </div>
        </header>
        <div className="settings-page-content">
          <div className="settings-page-heading"><span className="settings-page-icon"><i className="fa-solid fa-gear" /></span><div><h1>Settings</h1><p>Manage your account, preferences and app settings.</p></div></div>
          <div className="settings-layout">
            <nav className="settings-subnav" aria-label="Settings sections">{settingsSections.map(([label, icon]) => <button type="button" key={label} className={activeSection === label ? 'active' : ''} onClick={() => setActiveSection(label)}><i className={icon} /><span>{label}</span></button>)}</nav>
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
