import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const THEME_STORAGE_KEY = 'fixitTheme';
const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
});

export const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyThemeToDom = (preference) => {
  if (typeof document === 'undefined') return 'light';
  const resolved = preference === 'system' ? getSystemTheme() : (preference || 'light');
  const root = document.documentElement;

  // Set data-theme on html element (standard)
  root.setAttribute('data-theme', resolved);
  // Also sync dataset properties for backwards compatibility
  root.dataset.theme = resolved;
  root.dataset.dashboardTheme = resolved;

  return resolved;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'light';
  });

  const [systemPreference, setSystemPreference] = useState(getSystemTheme);

  const resolvedTheme = useMemo(() => {
    return theme === 'system' ? systemPreference : theme;
  }, [theme, systemPreference]);

  // Keep DOM attribute in sync with resolvedTheme
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme, resolvedTheme]);

  // Listen for OS prefers-color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const newSys = e.matches ? 'dark' : 'light';
      setSystemPreference(newSys);
      if (theme === 'system') {
        applyThemeToDom('system');
        window.dispatchEvent(new Event('fixit-theme-change'));
      }
    };

    mediaQuery.addEventListener?.('change', handleChange);
    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
    };
  }, [theme]);

  // Reconcile with backend user profile on initial mount
  useEffect(() => {
    const token = localStorage.getItem('fixitToken') || localStorage.getItem('token');
    if (!token) return;

    let isMounted = true;
    axios.get(`${API_URL}/api/settings/appearance`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      if (!isMounted) return;
      const backendPref = response.data?.theme || response.data?.appearancePreference;
      if (backendPref && ['system', 'light', 'dark'].includes(backendPref)) {
        const localPref = localStorage.getItem(THEME_STORAGE_KEY);
        // If backend preference is different, reconcile
        if (backendPref !== localPref) {
          localStorage.setItem(THEME_STORAGE_KEY, backendPref);
          setThemeState(backendPref);
          applyThemeToDom(backendPref);
          window.dispatchEvent(new Event('fixit-theme-change'));
        }
      }
    })
    .catch(() => {
      // Fallback: try account endpoint if appearance route had an issue
      axios.get(`${API_URL}/api/settings/account`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((accountRes) => {
        if (!isMounted) return;
        const pref = accountRes.data?.appearance?.theme || accountRes.data?.appearancePreference;
        if (pref && ['system', 'light', 'dark'].includes(pref)) {
          const localPref = localStorage.getItem(THEME_STORAGE_KEY);
          if (pref !== localPref) {
            localStorage.setItem(THEME_STORAGE_KEY, pref);
            setThemeState(pref);
            applyThemeToDom(pref);
            window.dispatchEvent(new Event('fixit-theme-change'));
          }
        }
      })
      .catch(() => {});
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Set theme function
  const setTheme = useCallback((newTheme) => {
    if (!['system', 'light', 'dark'].includes(newTheme)) return;

    // 1. Immediately apply locally to eliminate lag
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
    applyThemeToDom(newTheme);
    window.dispatchEvent(new Event('fixit-theme-change'));

    // 2. Persist to backend if user is authenticated
    const token = localStorage.getItem('fixitToken') || localStorage.getItem('token');
    if (token) {
      axios.patch(`${API_URL}/api/settings/appearance`, {
        theme: newTheme,
        appearance: newTheme,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch((err) => {
        console.warn('Could not sync theme preference to backend:', err?.message || err);
      });
    }
  }, []);

  const contextValue = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme,
  }), [theme, resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
