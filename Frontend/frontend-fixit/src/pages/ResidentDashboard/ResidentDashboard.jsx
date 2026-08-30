import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Bell, Bookmark, ChevronDown, ChevronRight, CircleHelp, FileText, Grid2X2,
  LockKeyhole, LogOut, MapPin, Menu, MessageSquare, MoreHorizontal, Plus, Search,
  Settings, ShieldCheck, Star, UserCircle, Users, X
} from 'lucide-react';
import potholeImage from '../../assets/massive pothole on main St.png';
import streetlightImage from '../../assets/06_broken_streetlight_park_entrance.png';
import crosswalkImage from '../../assets/homepage three.jpeg';
import './ResidentDashboard.css';

const reports = [
  { code: '#CF-2026-01', title: 'Massive Pothole on 5th Avenue', meta: '2 days ago  •  1200 Block, 5th Ave', status: 'In Progress', image: potholeImage, color: 'orange', width: '82%' },
  { code: '#CF-2026-02', title: 'Broken Streetlight', meta: '5 hours ago  •  Corner of Elm & Maple', status: 'New', image: streetlightImage, color: 'red', width: '28%' },
  { code: '#CF-2025-89', title: 'Faded Crosswalk Lines', meta: '1 week ago  •  3rd Street & Main Ave', status: 'Resolved', image: crosswalkImage, color: 'green', width: '64%' },
];

const navGroups = [
  [{ label: 'Dashboard', icon: Grid2X2, active: true }, { label: 'My Reports', icon: FileText }, { label: 'Nearby Issues', icon: MapPin }, { label: 'Notifications', icon: Bell, badge: 3 }, { label: 'Messages', icon: MessageSquare }, { label: 'Saved Locations', icon: Bookmark }],
  [{ label: 'Help Center', icon: CircleHelp }, { label: 'Settings', icon: Settings }],
];

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('All');

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('fixitUser') || '{}'); } catch { return {}; }
  }, []);
  const userName = user.name || user.fullName || 'Sarah Johnson';
  const firstName = userName.split(' ')[0];
  const visibleReports = filter === 'All' ? reports : reports.filter((report) => report.status === filter);

  const logout = () => {
    localStorage.removeItem('fixitToken');
    localStorage.removeItem('fixitUser');
    navigate('/login');
  };

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
                <button key={label} className={`resident-nav-link ${(activeNav === label || active && activeNav === 'Dashboard') ? 'active' : ''}`} onClick={() => setActiveNav(label)} title={label}>
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
            <button className="new-report-button" onClick={() => setShowReportModal(true)}><Plus size={16} /> New Report</button>
            <div className="header-popover-wrap"><button className="icon-button header-icon" onClick={() => setShowNotifications((value) => !value)} aria-label="Notifications"><Bell size={19} /><b>3</b></button>{showNotifications && <div className="notification-popover"><strong>Notifications</strong><p>City Works added a comment to your report.</p><p>Your streetlight report is now in progress.</p></div>}</div>
            <button className="icon-button header-icon profile-icon" onClick={() => setShowProfileMenu((value) => !value)} aria-label="Open profile"><UserCircle size={21} /></button>
          </div>
        </header>

        <div className="resident-content">
          <section className="dashboard-intro"><div><h1>Welcome back, {firstName}! <span aria-hidden="true">👋</span></h1><p>Here&apos;s an overview of what&apos;s happening in your community.</p></div><div className="intro-search"><Search size={16} /><input aria-label="Search dashboard" placeholder="Search reports..." /></div></section>

          <section className="row g-3 stats-grid" aria-label="Overview statistics">
            {[['My Reports', '4', 'Active', FileText, 'orange', 'View all'], ['Resolved', '12', 'This Month', Activity, 'green', 'View all'], ['Impact Score', '85', 'Great Work! 🎉', Star, 'amber', 'Details'], ['Community Rank', 'Top 20%', 'In your city', Users, 'blue', 'View leaderboard']].map(([label, value, note, Icon, tone, action]) => <article className="col-12 col-sm-6 col-xl-3" key={label}><div className={`stat-card stat-${tone}`}><span className="stat-icon"><Icon size={18} /></span><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><small>{note}</small><button onClick={() => setActiveNav(label)}>{action} <ChevronRight size={14} /></button></div></article>)}
          </section>

          <section className="report-cta"><div className="cta-icon"><Plus size={26} /></div><div><h2>Report a New Problem</h2><p>Help keep our community safe and clean.</p></div><button onClick={() => setShowReportModal(true)}>Report Now <ChevronRight size={17} /></button></section>

          <div className="row g-3 dashboard-lower">
            <section className="col-12 col-xl-7"><div className="dashboard-panel reports-panel"><div className="panel-heading"><h2>Recent Reports</h2><div className="report-filter"><button className={filter === 'All' ? 'selected' : ''} onClick={() => setFilter('All')}>All</button>{['In Progress', 'New', 'Resolved'].map((status) => <button className={filter === status ? 'selected' : ''} key={status} onClick={() => setFilter(status)}>{status}</button>)}</div></div>{visibleReports.map((report) => <button className="report-row" key={report.code} onClick={() => setSelectedReport(report)}><img src={report.image} alt="" /><span className="report-details"><small>{report.code}</small><strong>{report.title}</strong><span>{report.meta}</span><i className={`progress-line ${report.color}`} style={{ width: report.width }} /></span><span className={`status-pill ${report.color}`}><i />{report.status}</span><ChevronRight size={17} className="row-chevron" /></button>)}{!visibleReports.length && <p className="empty-state">No reports match this filter.</p>}<button className="panel-link" onClick={() => setActiveNav('My Reports')}>View All <ChevronRight size={14} /></button></div></section>
            <section className="col-12 col-xl-5"><div className="dashboard-panel updates-panel"><div className="panel-heading"><h2>Recent Updates</h2><button className="more-button" aria-label="More updates"><MoreHorizontal size={19} /></button></div><div className="timeline"><div className="timeline-item"><span className="timeline-dot orange"><Activity size={13} /></span><div><small>STATUS CHANGE</small><p><b>#CF-2026-01</b> updated to <em>In Progress</em>.</p><time>2 hours ago</time></div></div><div className="timeline-item"><span className="timeline-dot grey"><MessageSquare size={13} /></span><div><small>NEW COMMENT</small><p>City Works added a comment on <b>#CF-2026-01</b></p><blockquote>&quot;Crew dispatched to assess the damage...&quot;</blockquote><time>Yesterday</time></div></div><div className="timeline-item"><span className="timeline-dot blue"><FileText size={13} /></span><div><small>REPORT SUBMITTED</small><p><b>#CF-2026-02</b> received and pending review.</p><time>2 days ago</time></div></div></div></div></section>
          </div>

          <section className="dashboard-panel issue-map-panel"><div className="panel-heading"><h2>Issue Map</h2><button className="panel-link" onClick={() => navigate('/map')}>View Map <ChevronRight size={14} /></button></div><div className="issue-map"><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><div className="map-water" /><button className="map-pin pin-orange" aria-label="In progress report" onClick={() => setSelectedReport(reports[0])}><MapPin size={26} /></button><button className="map-pin pin-green" aria-label="Resolved report" onClick={() => setSelectedReport(reports[2])}><MapPin size={26} /></button><button className="map-pin pin-red" aria-label="New report" onClick={() => setSelectedReport(reports[1])}><MapPin size={26} /></button><span className="map-label"><i className="orange" /> In progress <i className="green" /> Resolved <i className="red" /> New</span></div></section>
        </div>
      </main>

      {showReportModal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowReportModal(false)}><div className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-modal-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowReportModal(false)} aria-label="Close"><X size={18} /></button>{reportSubmitted ? <div className="modal-success"><span><ShieldCheck size={25} /></span><h2>Report received</h2><p>Thanks for helping improve your community. We&apos;ll review your report shortly.</p><button onClick={() => { setReportSubmitted(false); setShowReportModal(false); }}>Done</button></div> : <><h2 id="report-modal-title">Report a New Problem</h2><p className="modal-subtitle">Tell us what needs attention in your community.</p><label>Problem title<input placeholder="e.g. Broken streetlight" /></label><label>Location<input placeholder="Street, landmark or area" /></label><label>Description<textarea rows="3" placeholder="Add a few details..." /></label><button className="modal-submit" onClick={() => setReportSubmitted(true)}>Submit Report <ChevronRight size={16} /></button></>}</div></div>}
      {selectedReport && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedReport(null)}><div className="report-modal detail-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedReport(null)} aria-label="Close"><X size={18} /></button><img src={selectedReport.image} alt="" /><small>{selectedReport.code}</small><h2>{selectedReport.title}</h2><p>{selectedReport.meta}</p><span className={`status-pill ${selectedReport.color}`}><i />{selectedReport.status}</span><button className="modal-submit" onClick={() => setSelectedReport(null)}>Close</button></div></div>}
    </div>
  );
};

export default ResidentDashboard;