import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
let profileCache = { token: '', avatarUrl: '', loaded: false, request: null };

const normalizeAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return '';
  return avatarUrl.startsWith('/uploads/') ? `${API_URL}${avatarUrl}` : avatarUrl;
};

export const loadResidentAvatar = (token) => {
  if (profileCache.token !== token) profileCache = { token, avatarUrl: '', loaded: false, request: null };
  if (profileCache.loaded) return Promise.resolve(profileCache.avatarUrl);
  if (profileCache.request) return profileCache.request;

  profileCache.request = axios.get(`${API_URL}/api/settings/account`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then(({ data }) => {
    profileCache.avatarUrl = normalizeAvatarUrl(data.avatarUrl);
    profileCache.loaded = true;
    return profileCache.avatarUrl;
  }).catch(() => {
    profileCache.loaded = true;
    return '';
  }).finally(() => {
    profileCache.request = null;
  });
  return profileCache.request;
};

export const publishResidentAvatar = (avatarUrl) => {
  profileCache.avatarUrl = normalizeAvatarUrl(avatarUrl);
  profileCache.loaded = true;
  profileCache.request = null;
  window.dispatchEvent(new CustomEvent('fixit-avatar-updated', { detail: profileCache.avatarUrl }));
};
