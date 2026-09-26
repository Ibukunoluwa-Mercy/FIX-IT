import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { publishResidentAvatar } from '../../components/residentAvatarEvents';
import { setResidentAvatar } from '../../components/ResidentAvatar';
import SettingsSidebar from './components/SettingsSidebar';
import SettingsHeader from './components/SettingsHeader';
import AccountInfoCard from './components/AccountInfoCard';
import ChangePasswordCard from './components/ChangePasswordCard';
import NotificationsCard from './components/NotificationsCard';
import DeleteAccountModal from './components/DeleteAccountModal';
import {
  navGroups,
  settingsSections,
  emptyAccount,
  normalizeSettingsAccount,
  getErrorMessage,
} from './settingsConstants';
import '../ResidentDashboard/ResidentDashboard.css';
import './SettingsPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

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
      publishResidentAvatar(data.avatarUrl);
      setResidentAvatar(data.avatarUrl);
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
        userName={userName}
      />
      <main className="resident-main settings-main">
        <SettingsHeader
          onNotificationsClick={() => setActiveSection('Notifications')}
          showHeaderProfileMenu={showHeaderProfileMenu}
          setShowHeaderProfileMenu={setShowHeaderProfileMenu}
          userName={userName}
          signOut={signOut}
        />
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
