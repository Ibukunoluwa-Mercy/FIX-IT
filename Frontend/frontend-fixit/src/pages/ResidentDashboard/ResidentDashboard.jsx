import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ReportWizard from '../ReportWizardPage/ReportWizard';
import DashboardLocationPreview from './components/DashboardLocationPreview';
import DashboardStatsGrid from './components/DashboardStatsGrid';
import DashboardRecentReports from './components/DashboardRecentReports';
import DashboardRecentUpdates from './components/DashboardRecentUpdates';
import logoWhite from '../../assets/fixit-white-logo.png';
import './ResidentDashboard.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const navGroups = [
  [
    { label: 'Dashboard', iconClass: 'fa-solid fa-grip', active: true },
    { label: 'My Reports', iconClass: 'fa-solid fa-file-lines' },
    { label: 'Nearby Issues', iconClass: 'fa-solid fa-location-dot' },
    { label: 'Notifications', iconClass: 'fa-solid fa-bell', badge: 0 },
    { label: 'Messages', iconClass: 'fa-solid fa-message' },
    { label: 'Saved Locations', iconClass: 'fa-solid fa-bookmark' },
  ],
  [
    { label: 'Help Center', iconClass: 'fa-solid fa-circle-question' },
    { label: 'Settings', iconClass: 'fa-solid fa-gear' },
  ],
];

const statusClass = (status = 'Pending') => status.toLowerCase().replace(/\s+/g, '-');

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportWizard, setShowReportWizard] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState({ userInfo: {}, stats: {}, recentReports: [], recentUpdates: [], mapIssues: [] });

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('fixitUser') || '{}'); } catch { return {}; }
  }, []);
  const token = localStorage.getItem('fixitToken');
  const userInfo = dashboard.userInfo.name ? dashboard.userInfo : user;
  const userName = userInfo.name || userInfo.fullName || 'Resident';
  const firstName = userName.split(' ')[0];
  const greeting = localStorage.getItem('fixitDashboardGreeting') === 'welcome' ? 'Welcome' : 'Welcome back';

  const loadDashboard = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true); setError('');
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/overview`, { headers: { Authorization: `Bearer ${token}` } });
      setDashboard(response.data);
    } catch (requestError) {
      if (requestError.response?.status === 401) { localStorage.removeItem('fixitToken'); navigate('/login'); return; }
      setError(requestError.response?.data?.message || 'Unable to load your dashboard.');
    } finally { setLoading(false); }
  }, [navigate, token]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const reports = dashboard.recentReports || [];
  const visibleReports = filter === 'All' ? reports : reports.filter((report) => report.status === filter);
  const stats = dashboard.stats || {};

  const logout = () => {
    localStorage.removeItem('fixitToken');
    localStorage.removeItem('fixitUser');
    navigate('/login');
  };

  const goToNav = (label) => { 
    setActiveNav(label); 
    if (label === 'Dashboard') navigate('/dashboard');
    if (label === 'My Reports') navigate('/reports'); 
    if (label === 'Nearby Issues') navigate('/map'); 
    if (label === 'Help Center') navigate('/help-center');
    if (label === 'Settings') navigate('/settings');
  };

  return (
    <div className={`resident-dashboard ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="resident-sidebar">
        <div className="resident-brand-row">
          <Link to="/dashboard" className="resident-brand" aria-label="Fixit dashboard">
            <img src={logoWhite} alt="FixIt" className="brand-logo-img" />
            <span className="brand-word">
              Fix<span style={{ color: '#f59e0b' }}>It</span>
            </span>
          </Link>
          <button className="icon-button sidebar-toggle" onClick={() => setIsSidebarCollapsed((value) => !value)} aria-label="Toggle sidebar" title="Toggle sidebar">
            {isSidebarCollapsed ? <i className="fa-solid fa-bars" style={{ fontSize: 18 }}></i> : <i className="fa-solid fa-xmark" style={{ fontSize: 18 }}></i>}
          </button>
        </div>

        <nav className="resident-nav" aria-label="Dashboard navigation">
          {navGroups.map((group, groupIndex) => (
            <div className={`nav-group ${groupIndex ? 'nav-group-secondary' : ''}`} key={groupIndex}>
              {group.map(({ label, iconClass, badge, active }) => (
                <button key={label} className={`resident-nav-link ${(activeNav === label || (active && activeNav === 'Dashboard')) ? 'active' : ''}`} onClick={() => goToNav(label)} title={label}>
                  <i className={`${iconClass}`} style={{ fontSize: 16 }}></i>
                  <span>{label}</span>
                  {Boolean(badge && badge > 0) && <b className="nav-badge">{badge}</b>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="resident-profile-wrap">
          {showProfileMenu && (
            <div className="profile-menu">
              <button onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}>
                <i className="fa-solid fa-gear" style={{ fontSize: 14 }}></i> Account settings
              </button>
              <button onClick={logout}>
                <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 14 }}></i> Sign out
              </button>
            </div>
          )}
          <button className="resident-profile" onClick={() => setShowProfileMenu((value) => !value)}>
            <span className="avatar avatar-photo">{firstName.charAt(0)}</span>
            <span className="profile-copy"><strong>{userName}</strong><small>Resident</small></span>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: 12 }}></i>
          </button>
        </div>
      </aside>

      <main className="resident-main">
        <header className="resident-header">
          <div className="mobile-brand">
            <img src={logoWhite} alt="FixIt" className="brand-logo-img" style={{ height: '28px' }} />
            <span className="brand-word" style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Fi<span style={{ color: '#f59e0b' }}>xIt</span>
            </span>
          </div>
          <div className="header-actions">
            <button className="new-report-button" onClick={() => setShowReportWizard(true)}>
              <i className="fa-solid fa-plus me-1" style={{ fontSize: 14 }}></i> New Report
            </button>
            <div className="header-popover-wrap">
              <button className="icon-button header-icon" onClick={() => setShowNotifications((value) => !value)} aria-label="Notifications">
                <i className="fa-solid fa-bell" style={{ fontSize: 18 }}></i>
                {dashboard.recentUpdates?.length > 0 && <b>{dashboard.recentUpdates.length}</b>}
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <strong>Notifications</strong>
                  {dashboard.recentUpdates?.length ? (
                    dashboard.recentUpdates.slice(0, 3).map((u, i) => (
                      <p key={i}>{u.text}</p>
                    ))
                  ) : (
                    <p>No new notifications.</p>
                  )}
                </div>
              )}
            </div>
            <button className="icon-button header-icon profile-icon" onClick={() => setShowProfileMenu((value) => !value)} aria-label="Open profile">
              <i className="fa-solid fa-circle-user" style={{ fontSize: 20 }}></i>
            </button>
          </div>
        </header>

        <div className="resident-content">
          <section className="dashboard-intro">
            <div>
              <h1>{greeting}, {userName}! <span aria-hidden="true">👋</span></h1>
              <p>Here&apos;s an overview of what&apos;s happening in your community.</p>
            </div>
            <div className="intro-search">
              <i className="fa-solid fa-magnifying-glass" style={{ color: '#9ca3af', fontSize: 15 }}></i>
              <input aria-label="Search dashboard" placeholder="Search reports..." />
            </div>
          </section>
          {error && <div className="dashboard-alert" role="alert">{error}</div>}

          <DashboardStatsGrid stats={stats} loading={loading} />

          <section className="report-cta">
            <div className="cta-icon"><i className="fa-solid fa-plus" style={{ fontSize: 24 }}></i></div>
            <div>
              <h2>Report a New Problem</h2>
              <p>Help keep our community safe and clean.</p>
            </div>
            <button onClick={() => setShowReportWizard(true)}>
              Report Now <i className="fa-solid fa-chevron-right ms-1" style={{ fontSize: 14 }}></i>
            </button>
          </section>

          <div className="dashboard-panels-stacked">
            <DashboardRecentReports
              loading={loading}
              reports={visibleReports}
              onSelectReport={setSelectedReport}
              onCreateReport={() => setShowReportWizard(true)}
            />

            <DashboardRecentUpdates
              loading={loading}
              updates={dashboard.recentUpdates}
            />
          </div>

          <section className="dashboard-panel issue-map-panel">
            <div className="panel-heading">
              <h2>Issue Map</h2>
              <button className="panel-link" onClick={() => navigate('/map')}>
                View Map <i className="fa-solid fa-chevron-right ms-1" style={{ fontSize: 12 }}></i>
              </button>
            </div>
            <DashboardLocationPreview onOpen={() => navigate('/map')} />
          </section>
        </div>
      </main>

      {showReportWizard && <ReportWizard onClose={() => setShowReportWizard(false)} onSubmitted={() => { setShowReportWizard(false); loadDashboard(); }} />}
      {selectedReport && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedReport(null)}>
          <div className="report-modal detail-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedReport(null)} aria-label="Close">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <small>{selectedReport.reportId || selectedReport.id}</small>
            <h2>{selectedReport.title}</h2>
            <p>{selectedReport.location?.address || 'Location unavailable'}</p>
            <span className={`status-pill ${statusClass(selectedReport.status)}`}><i />{selectedReport.status}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;