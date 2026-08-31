import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ReportWizard from '../ReportWizardPage/ReportWizard';
import {
  Activity, Bell, Bookmark, ChevronDown, ChevronRight, CircleHelp, FileText, Grid2X2,
  LogOut, MapPin, Menu, MessageSquare, MoreHorizontal, Plus, Search,
  Settings, ShieldCheck, Star, UserCircle, Users, X
} from 'lucide-react';
import './ResidentDashboard.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const navGroups = [
  [{ label: 'Dashboard', icon: Grid2X2, active: true }, { label: 'My Reports', icon: FileText }, { label: 'Nearby Issues', icon: MapPin }, { label: 'Notifications', icon: Bell, badge: 3 }, { label: 'Messages', icon: MessageSquare }, { label: 'Saved Locations', icon: Bookmark }],
  [{ label: 'Help Center', icon: CircleHelp }, { label: 'Settings', icon: Settings }],
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
            <span className="brand-mark"><ShieldCheck size={20} /></span><span className="brand-word">Fixit</span>
          </Link>
          <button className="icon-button sidebar-toggle" onClick={() => setIsSidebarCollapsed((value) => !value)} aria-label="Toggle sidebar" title="Toggle sidebar">
            {isSidebarCollapsed ? <Menu size={19} /> : <X size={18} />}
          </button>
        </div>

        <nav className="resident-nav" aria-label="Dashboard navigation">
          {navGroups.map((group, groupIndex) => (
            <div className={`nav-group ${groupIndex ? 'nav-group-secondary' : ''}`} key={groupIndex}>
              {group.map(({ label, icon: Icon, badge, active }) => (
                  <button key={label} className={`resident-nav-link ${(activeNav === label || active && activeNav === 'Dashboard') ? 'active' : ''}`} onClick={() => goToNav(label)} title={label}>
                  <Icon size={17} /><span>{label}</span>{badge && <b className="nav-badge">{badge}</b>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="resident-profile-wrap">
          {showProfileMenu && <div className="profile-menu"><button onClick={() => setActiveNav('Settings')}><Settings size={15} /> Account settings</button><button onClick={logout}><LogOut size={15} /> Sign out</button></div>}
          <button className="resident-profile" onClick={() => setShowProfileMenu((value) => !value)}>
            <span className="avatar avatar-photo">{firstName.charAt(0)}</span><span className="profile-copy"><strong>{userName}</strong><small>Resident</small></span><ChevronDown size={15} />
          </button>
        </div>
      </aside>

      <main className="resident-main">
        <header className="resident-header">
          <div className="mobile-brand"><span className="brand-mark"><ShieldCheck size={18} /></span><strong>Fixit</strong></div>
          <div className="header-actions">
            <button className="new-report-button" onClick={() => setShowReportWizard(true)}><Plus size={16} /> New Report</button>
            <div className="header-popover-wrap"><button className="icon-button header-icon" onClick={() => setShowNotifications((value) => !value)} aria-label="Notifications"><Bell size={19} /><b>3</b></button>{showNotifications && <div className="notification-popover"><strong>Notifications</strong><p>City Works added a comment to your report.</p><p>Your streetlight report is now in progress.</p></div>}</div>
            <button className="icon-button header-icon profile-icon" onClick={() => setShowProfileMenu((value) => !value)} aria-label="Open profile"><UserCircle size={21} /></button>
          </div>
        </header>

        <div className="resident-content">
          <section className="dashboard-intro"><div><h1>{greeting}, {userName}! <span aria-hidden="true">👋</span></h1><p>Here&apos;s an overview of what&apos;s happening in your community.</p></div><div className="intro-search"><Search size={16} /><input aria-label="Search dashboard" placeholder="Search reports..." /></div></section>
          {error && <div className="dashboard-alert" role="alert">{error}</div>}

          <section className="row g-3 stats-grid" aria-label="Overview statistics">
            {[['My Reports', stats.totalActiveReports ?? 0, 'Active', FileText, 'orange', '/reports'], ['Resolved', stats.resolvedThisMonth ?? 0, 'This Month', Activity, 'green', '/reports'], ['Impact Score', stats.impactScore ?? 0, 'Keep it going!', Star, 'amber', null], ['Community Rank', stats.rank || 'N/A', 'In your city', Users, 'blue', '/map']].map(([label, value, note, Icon, tone, path]) => <article className="col-12 col-sm-6 col-xl-3" key={label}><div className={`stat-card stat-${tone}`}><span className="stat-icon"><Icon size={18} /></span><span className="stat-label">{label}</span><strong className="stat-value">{loading ? <span className="skeleton skeleton-value" /> : value}</strong><small>{note}</small><button onClick={() => path ? navigate(path) : console.info(`${label} details`)}>{label === 'Impact Score' ? 'Details' : label === 'Community Rank' ? 'View leaderboard' : 'View all'} <ChevronRight size={14} /></button></div></article>)}
          </section>

          <section className="report-cta"><div className="cta-icon"><Plus size={26} /></div><div><h2>Report a New Problem</h2><p>Help keep our community safe and clean.</p></div><button onClick={() => setShowReportWizard(true)}>Report Now <ChevronRight size={17} /></button></section>

          <div className="row g-3 dashboard-lower">
            <section className="col-12 col-xl-7"><div className="dashboard-panel reports-panel"><div className="panel-heading"><h2>Recent Reports</h2><div className="report-filter"><button className={filter === 'All' ? 'selected' : ''} onClick={() => setFilter('All')}>All</button>{['In Progress', 'New', 'Resolved'].map((status) => <button className={filter === status ? 'selected' : ''} key={status} onClick={() => setFilter(status)}>{status}</button>)}</div></div>{loading ? <div className="empty-state"><span className="skeleton skeleton-line" /><span className="skeleton skeleton-line" /></div> : visibleReports.length ? visibleReports.map((report) => <button className="report-row" key={report._id || report.reportId} onClick={() => setSelectedReport(report)}><span className="report-thumb">{report.imageUrl ? <img src={report.imageUrl} alt="" /> : <FileText size={20} />}</span><span className="report-details"><small>{report.reportId || `#${String(report._id).slice(-8)}`}</small><strong>{report.title}</strong><span>{formatDate(report.createdAt)} &nbsp;•&nbsp; {report.location?.address || 'Location unavailable'}</span><i className={`progress-line ${statusClass(report.status)}`} /></span><span className={`status-pill ${statusClass(report.status)}`}><i />{report.status}</span><ChevronRight size={17} className="row-chevron" /></button>) : <div className="empty-state"><FileText size={42} /><strong>No reports yet</strong><span>You haven&apos;t submitted any community reports.</span><button onClick={() => setShowReportWizard(true)}>Create Your First Report</button></div>}<button className="panel-link" onClick={() => navigate('/reports')}>View All <ChevronRight size={14} /></button></div></section>
            <section className="col-12 col-xl-5"><div className="dashboard-panel updates-panel"><div className="panel-heading"><h2>Recent Updates</h2><button className="more-button" aria-label="More updates"><MoreHorizontal size={19} /></button></div>{loading ? <div className="empty-state compact"><span className="skeleton skeleton-line" /><span className="skeleton skeleton-line" /></div> : dashboard.recentUpdates?.length ? <div className="timeline">{dashboard.recentUpdates.map((update, index) => <div className="timeline-item" key={`${update.timestamp}-${index}`}><span className={`timeline-dot ${index % 2 ? 'grey' : 'orange'}`}><Activity size={13} /></span><div><small>{update.type?.replace('_', ' ')}</small><p>{update.text}</p><time>{formatDate(update.timestamp)}</time></div></div>)}</div> : <div className="empty-state compact"><span className="empty-icon"><Bell size={24} /></span><strong>No updates available</strong><span>Updates related to your reports will appear here.</span></div>}</div></section>
          </div>

          <section className="dashboard-panel issue-map-panel"><div className="panel-heading"><h2>Issue Map</h2><button className="panel-link" onClick={() => navigate('/map')}>View Map <ChevronRight size={14} /></button></div><div className="issue-map"><div className="map-grid" />{dashboard.mapIssues?.slice(0, 12).map((issue, index) => <button className={`map-pin pin-${['orange', 'green', 'red'][index % 3]}`} style={{ left: `${12 + ((index * 23) % 76)}%`, top: `${22 + ((index * 31) % 54)}%` }} aria-label={issue.title} key={issue.id} onClick={() => setSelectedReport(issue)}><MapPin size={26} /></button>)}<span className="map-label"><i className="orange" /> In progress <i className="green" /> Resolved <i className="red" /> New</span></div></section>
        </div>
      </main>

      {showReportWizard && <ReportWizard onClose={() => setShowReportWizard(false)} onSubmitted={() => { setShowReportWizard(false); loadDashboard(); }} />}
      {selectedReport && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedReport(null)}><div className="report-modal detail-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedReport(null)} aria-label="Close"><X size={18} /></button><small>{selectedReport.reportId || selectedReport.id}</small><h2>{selectedReport.title}</h2><p>{selectedReport.location?.address || 'Location unavailable'}</p><span className={`status-pill ${statusClass(selectedReport.status)}`}><i />{selectedReport.status}</span></div></div>}
    </div>
  );
};

export default ResidentDashboard;