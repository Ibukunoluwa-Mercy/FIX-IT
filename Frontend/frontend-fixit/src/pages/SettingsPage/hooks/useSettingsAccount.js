import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { publishResidentAvatar } from '../../../components/residentAvatarEvents';
import {
  emptyAccount,
  normalizeSettingsAccount,
  getErrorMessage,
} from '../settingsConstants';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const useSettingsAccount = (token, navigate) => {
  const avatarInput = useRef(null);
  const [account, setAccount] = useState(emptyAccount);
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

  const beginAccountEdit = () => {
    setAccountForm({ fullName: account.fullName, email: account.email, phone: account.phone, location: account.location });
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

  return {
    avatarInput,
    account,
    setAccount,
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
  };
};
