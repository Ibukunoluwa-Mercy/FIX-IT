import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import CommunityMapPage from './pages/CommunityMapPage/CommunityMapPage'
import ExploreIssuesPage from './pages/ExploreIssuesPage/ExploreIssuesPage'
import AboutPage from './pages/AboutPage/AboutPage'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import ResidentDashboard from './pages/ResidentDashboard/ResidentDashboard'
import MyReports from './pages/MyReports/MyReports'
import UserLocationMapPage from './pages/UserLocationMapPage/UserLocationMapPage'
import HelpCenter from './pages/HelpCenter/HelpCenter'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import './dashboard-theme.css'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth-only routes that should render without the Navbar/Footer shell
const AUTH_ROUTES = ['/register', '/login', '/forgot-password', '/reset-password'];
const DASHBOARD_ROUTES = ['/dashboard', '/reports', '/my-reports', '/help-center', '/settings'];
const LOCATION_ROUTES = ['/map'];

function AppShell() {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/+$/, '') || '/';
  const isAuthPage = AUTH_ROUTES.includes(pathname);
  const isDashboard = DASHBOARD_ROUTES.includes(pathname);
  const isLocationPage = LOCATION_ROUTES.includes(pathname);

  useEffect(() => {
    const root = document.documentElement;
    if (!isDashboard && !isLocationPage) {
      delete root.dataset.dashboardTheme;
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const preference = localStorage.getItem('fixitTheme') || 'system';
      const resolvedTheme = preference === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : preference;
      root.dataset.dashboardTheme = resolvedTheme;
    };

    applyTheme();
    window.addEventListener('fixit-theme-change', applyTheme);
    mediaQuery.addEventListener?.('change', applyTheme);
    return () => {
      window.removeEventListener('fixit-theme-change', applyTheme);
      mediaQuery.removeEventListener?.('change', applyTheme);
    };
  }, [isDashboard, isLocationPage]);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    );
  }

  if (isDashboard) {
    return (
      <Routes>
        <Route path="/dashboard" element={<ResidentDashboard />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/reports" element={<MyReports />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    );
  }

  if (isLocationPage) return <Routes><Route path="/map" element={<UserLocationMapPage />} /></Routes>;

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<UserLocationMapPage />} />
          <Route path="/community-map" element={<CommunityMapPage />} />
          <Route path="/explore" element={<ExploreIssuesPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App
