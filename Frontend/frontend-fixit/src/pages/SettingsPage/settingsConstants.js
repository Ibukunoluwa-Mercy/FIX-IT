export const navGroups = [
  [
    { label: 'Dashboard', iconClass: 'fa-solid fa-grip', path: '/dashboard' },
    { label: 'My Reports', iconClass: 'fa-solid fa-file-lines', path: '/reports' },
    { label: 'Nearby Issues', iconClass: 'fa-solid fa-location-dot', path: '/map' },
    { label: 'Notifications', iconClass: 'fa-solid fa-bell' },
    { label: 'Messages', iconClass: 'fa-solid fa-message' },
    { label: 'Saved Locations', iconClass: 'fa-solid fa-bookmark' },
  ],
  [
    { label: 'Help Center', iconClass: 'fa-solid fa-circle-question', path: '/help-center' },
    { label: 'Settings', iconClass: 'fa-solid fa-gear', path: '/settings' },
  ],
];

export const settingsSections = [
  ['Account', 'fa-regular fa-user'],
  ['Notifications', 'fa-regular fa-bell'],
  ['Privacy & Security', 'fa-solid fa-shield-halved'],
  ['Appearance', 'fa-solid fa-palette'],
  ['Location', 'fa-solid fa-location-dot'],
  ['Help & Support', 'fa-regular fa-circle-question'],
];

export const emptyAccount = {
  fullName: '', email: '', phone: '', location: '', avatarUrl: '', emailVerified: false,
  notifications: { issueUpdates: true, communityMessages: true, promotionsNews: false },
};

export const normalizeSettingsAccount = (data) => ({
  ...emptyAccount,
  ...data,
  emailVerified: data.isVerified ?? data.emailVerified ?? false,
  notifications: {
    ...emptyAccount.notifications,
    ...(data.notifications || {}),
    ...(data.notificationPrefs ? {
      issueUpdates: data.notificationPrefs.issueUpdates,
      communityMessages: data.notificationPrefs.communityMessages,
      promotionsNews: data.notificationPrefs.promotions ?? data.notificationPrefs.promotionsNews,
    } : {}),
  },
});

export const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data?.error || fallback;
