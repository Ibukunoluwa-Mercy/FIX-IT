import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ReportWizard from '../ReportWizardPage/ReportWizard';
import logoWhite from '../../assets/fixit-logo-white.png';
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

const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Just now';
const statusClass = (status = 'New') => status.toLowerCase().replace(/\s+/g, '-');

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
  const goToNav = (label) => { setActiveNav(label); if (label === 'My Reports') navigate('/reports'); if (label === 'Nearby Issues') navigate('/map'); };

  return (
    <div className={`resident-dashboard ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="resident-sidebar">
        <div className="resident-brand-row">
          <Link to="/dashboard" className="resident-brand" aria-label="Fixit dashboard">
            <img src={logoWhite} alt="FixIt" className="brand-logo-img" />
            <span className="brand-word">
              Fi<span style={{ color: '#f59e0b' }}>xIt</span>
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
              <button onClick={() => setActiveNav('Settings')}>
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

          <section className="row g-3 stats-grid" aria-label="Overview statistics">
            {[
              ['My Reports', stats.totalActiveReports ?? 0, 'Active', 'fa-solid fa-file-lines', 'orange', '/reports'],
              ['Resolved', stats.resolvedThisMonth ?? 0, 'This Month', 'fa-solid fa-chart-line', 'green', '/reports'],
              ['Impact Score', stats.impactScore ?? 0, 'Keep it going!', 'fa-solid fa-star', 'amber', null],
              ['Community Rank', stats.rank || 'Top 0%', 'In your city', 'fa-solid fa-users', 'blue', '/map']
            ].map(([label, value, note, iconClass, tone, path]) => (
              <article className="col-12 col-sm-6 col-xl-3" key={label}>
                <div className={`stat-card stat-${tone}`}>
                  <span className="stat-icon"><i className={iconClass} style={{ fontSize: 17 }}></i></span>
                  <span className="stat-label">{label}</span>
                  <strong className="stat-value">{loading ? <span className="skeleton skeleton-value" /> : value}</strong>
                  <small>{note}</small>
                  <button onClick={() => path ? navigate(path) : console.info(`${label} details`)}>
                    {label === 'Impact Score' ? 'Details' : label === 'Community Rank' ? 'View leaderboard' : 'View all'}
                    <i className="fa-solid fa-chevron-right ms-1" style={{ fontSize: 11 }}></i>
                  </button>
                </div>
              </article>
            ))}
          </section>

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
            <section className="dashboard-panel reports-panel">
              <div className="panel-heading">
                <h2>Recent Reports</h2>
                <button className="panel-header-link" onClick={() => navigate('/reports')}>
                  View All <i className="fa-solid fa-chevron-right ms-1" style={{ fontSize: 12 }}></i>
                </button>
              </div>
              {loading ? (
                <div className="empty-state">
                  <span className="skeleton skeleton-line" />
                  <span className="skeleton skeleton-line" />
                </div>
              ) : visibleReports.length ? (
                <div className="reports-list">
                  {visibleReports.map((report) => (
                    <button className="report-row" key={report._id || report.reportId} onClick={() => setSelectedReport(report)}>
                      <span className="report-thumb">
                        {report.imageUrl ? <img src={report.imageUrl} alt="" /> : <i className="fa-solid fa-file-lines" style={{ fontSize: 18, color: '#94a3b8' }}></i>}
                      </span>
                      <span className="report-details">
                        <small>{report.reportId || `#${String(report._id).slice(-8)}`}</small>
                        <strong>{report.title}</strong>
                        <span>{formatDate(report.createdAt)} &nbsp;•&nbsp; {report.location?.address || 'Location unavailable'}</span>
                        <i className={`progress-line ${statusClass(report.status)}`} />
                      </span>
                      <span className={`status-pill ${statusClass(report.status)}`}><i />{report.status}</span>
                      <i className="fa-solid fa-chevron-right row-chevron" style={{ fontSize: 14 }}></i>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state empty-state-reports">
                  <div className="empty-illustration-reports">
                    <svg width="180" height="110" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="90" cy="70" rx="64" ry="34" fill="#FFF4EA" opacity="0.6"/>
                      <path d="M20 92C32 82 50 84 62 87" stroke="#FFE3CC" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/>
                      <path d="M42 90V76" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="36" cy="73" r="4.5" fill="#74C69D"/>
                      <circle cx="48" cy="70" r="4.5" fill="#74C69D"/>
                      <circle cx="42" cy="64" r="5" fill="#52B788"/>
                      <path d="M142 90V78" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="137" cy="75" r="4" fill="#74C69D"/>
                      <circle cx="147" cy="73" r="4" fill="#74C69D"/>
                      <circle cx="142" cy="67" r="4.5" fill="#52B788"/>
                      <rect x="64" y="24" width="52" height="66" rx="8" fill="#FFFFFF" stroke="#8E857B" strokeWidth="2.5"/>
                      <rect x="79" y="19" width="22" height="9" rx="3.5" fill="#4B5563"/>
                      <circle cx="90" cy="17" r="3" fill="#D1D5DB"/>
                      <rect x="76" y="36" width="28" height="2.5" rx="1.25" fill="#9CA3AF"/>
                      <rect x="72" y="44" width="36" height="2.5" rx="1.25" fill="#CBD5E1"/>
                      <rect x="72" y="52" width="24" height="2.5" rx="1.25" fill="#CBD5E1"/>
                      <rect x="72" y="60" width="30" height="2.5" rx="1.25" fill="#CBD5E1"/>
                      <rect x="72" y="68" width="18" height="2.5" rx="1.25" fill="#CBD5E1"/>
                      <circle cx="102" cy="64" r="12" fill="#FFFFFF" stroke="#374151" strokeWidth="3"/>
                      <line x1="111" y1="73" x2="122" y2="84" stroke="#374151" strokeWidth="3.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="empty-title">No reports yet</h3>
                  <p className="empty-subtitle">You haven&apos;t submitted any community reports.</p>
                  <button className="empty-cta-btn" onClick={() => setShowReportWizard(true)}>
                    Create Your First Report
                  </button>
                </div>
              )}
            </section>

            <section className="dashboard-panel updates-panel">
              <div className="panel-heading">
                <h2>Recent Updates</h2>
              </div>
              {loading ? (
                <div className="empty-state compact">
                  <span className="skeleton skeleton-line" />
                  <span className="skeleton skeleton-line" />
                </div>
              ) : dashboard.recentUpdates?.length ? (
                <div className="timeline">
                  {dashboard.recentUpdates.map((update, index) => (
                    <div className="timeline-item" key={`${update.timestamp}-${index}`}>
                      <span className={`timeline-dot ${index % 2 ? 'grey' : 'orange'}`}>
                        <i className="fa-solid fa-chart-line" style={{ fontSize: 12 }}></i>
                      </span>
                      <div>
                        <small>{update.type?.replace('_', ' ')}</small>
                        <p>{update.text}</p>
                        <time>{formatDate(update.timestamp)}</time>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-updates">
                  <div className="empty-bell-circle">
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 11C17.5817 11 14 14.5817 14 19V24.5C14 25.5 13 26.5 11.5 27.5C10.8 27.97 11.15 29 12 29H32C32.85 29 33.2 27.97 32.5 27.5C31 26.5 30 25.5 30 24.5V19C30 14.5817 26.4183 11 22 11Z" fill="#FDBA74"/>
                      <circle cx="22" cy="8.5" r="2.5" fill="#FB923C"/>
                      <ellipse cx="22" cy="31" rx="3.5" ry="2" fill="#F97316"/>
                      <line x1="8" y1="17" x2="10" y2="18.5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="36" y1="17" x2="34" y2="18.5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="9" y1="23" x2="6.5" y2="23.5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="35" y1="23" x2="37.5" y2="23.5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="empty-updates-text">
                    <strong>No updates available</strong>
                    <span>Updates related to your reports will appear here.</span>
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="dashboard-panel issue-map-panel">
            <div className="panel-heading">
              <h2>Issue Map</h2>
              <button className="panel-link" onClick={() => navigate('/map')}>
                View Map <i className="fa-solid fa-chevron-right ms-1" style={{ fontSize: 12 }}></i>
              </button>
            </div>
            <div className="issue-map">
              <div className="map-grid" />
              {dashboard.mapIssues?.slice(0, 12).map((issue, index) => (
                <button
                  className={`map-pin pin-${['orange', 'green', 'red'][index % 3]}`}
                  style={{ left: `${12 + ((index * 23) % 76)}%`, top: `${22 + ((index * 31) % 54)}%` }}
                  aria-label={issue.title}
                  key={issue.id}
                  onClick={() => setSelectedReport(issue)}
                >
                  <i className="fa-solid fa-location-dot" style={{ fontSize: 24 }}></i>
                </button>
              ))}
              <span className="map-label"><i className="orange" /> In progress <i className="green" /> Resolved <i className="red" /> New</span>
            </div>
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