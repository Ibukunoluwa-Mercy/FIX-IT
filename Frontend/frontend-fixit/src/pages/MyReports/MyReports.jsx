import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoWhite from '../../assets/fixit-white-logo.png';
import './MyReports.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Just now';
const statusClass = (status = 'Pending') => status.toLowerCase().replace(/\s+/g, '-');

const navGroups = [
  [
    { label: 'Dashboard', iconClass: 'fa-solid fa-grip' },
    { label: 'My Reports', iconClass: 'fa-solid fa-file-lines', active: true },
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

const MyReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const token = localStorage.getItem('fixitToken');
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('fixitUser') || '{}'); } catch { return {}; }
  }, []);
  const userName = user.name || user.fullName || 'Resident';
  const firstName = userName.split(' ')[0];

  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusTab, setStatusTab] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadReports = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true); setError('');
    try {
      const page = searchParams.get('page') || 1;
      const limit = searchParams.get('limit') || 5;
      
      const response = await axios.get(`${API_URL}/api/reports/me`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusTab, q: debouncedQuery, page, limit }
      });
      setReports(response.data.data);
      setPagination(response.data.pagination);
      setCounts(response.data.counts);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('fixitToken'); navigate('/login'); return; }
      setError(err.response?.data?.error || 'Unable to load your reports.');
    } finally {
      setLoading(false);
    }
  }, [token, statusTab, debouncedQuery, location.search, navigate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleTabChange = (tab) => {
    setStatusTab(tab);
    searchParams.set('status', tab);
    searchParams.set('page', 1);
    navigate({ search: searchParams.toString() });
  };

  const handlePageChange = (newPage) => {
    searchParams.set('page', newPage);
    navigate({ search: searchParams.toString() });
  };

  const logout = () => {
    localStorage.removeItem('fixitToken');
    localStorage.removeItem('fixitUser');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <div className={`resident-dashboard ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="resident-sidebar">
        <div className="resident-brand-row">
          <Link to="/dashboard" className="resident-brand" aria-label="Fixit dashboard">
            <img src={logoWhite} alt="FixIt" className="brand-logo-img" />
            <span className="brand-word">Fix<span style={{ color: '#f59e0b' }}>It</span></span>
          </Link>
          <button className="icon-button sidebar-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <i className="fa-solid fa-bars"></i> : <i className="fa-solid fa-xmark"></i>}
          </button>
        </div>
        <nav className="resident-nav" aria-label="Dashboard navigation">
          {navGroups.map((group, groupIndex) => (
            <div className={`nav-group ${groupIndex ? 'nav-group-secondary' : ''}`} key={groupIndex}>
              {group.map(({ label, iconClass, badge, active }) => (
                <button 
                  key={label} 
                  className={`resident-nav-link ${active ? 'active' : ''}`} 
                  onClick={() => {
                    if (label === 'Dashboard') navigate('/dashboard');
                    if (label === 'My Reports') navigate('/reports');
                    if (label === 'Nearby Issues') navigate('/map');
                  }} 
                  title={label}
                >
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
              <button onClick={() => navigate('/dashboard')}>
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
             <span className="brand-word">Fi<span style={{ color: '#f59e0b' }}>xIt</span></span>
          </div>
          <div className="header-actions">
            <button className="new-report-button" onClick={() => navigate('/dashboard?new_report=true')}>
              <i className="fa-solid fa-plus me-1"></i> New Report
            </button>
          </div>
        </header>

        <div className="resident-content">
          <section className="dashboard-intro">
            <div>
              <h1>My Reports</h1>
              <p>Track and manage the issues you've reported in your community.</p>
            </div>
            <div className="intro-search">
              <i className="fa-solid fa-magnifying-glass" style={{ color: '#9ca3af' }}></i>
              <input 
                aria-label="Search reports" 
                placeholder="Search reports..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>

          {error && <div className="dashboard-alert">{error} <button onClick={loadReports}>Retry</button></div>}

          {!loading && counts.all === 0 && !debouncedQuery ? (
            <div className="empty-state empty-state-reports" style={{ marginTop: '2rem' }}>
              <h3 className="empty-title">You haven't reported any issues yet</h3>
              <p className="empty-subtitle">Help keep our community safe and clean.</p>
              <button className="empty-cta-btn" onClick={() => navigate('/dashboard?new_report=true')}>
                + New Report
              </button>
            </div>
          ) : (
            <>
              <div className="reports-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['all', 'pending', 'in_progress', 'resolved', 'rejected'].map(tab => (
                  <button 
                    key={tab} 
                    className={`tab-btn ${statusTab === tab ? 'active' : ''}`}
                    onClick={() => handleTabChange(tab)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', background: statusTab === tab ? '#f59e0b' : '#fff', color: statusTab === tab ? '#fff' : '#333' }}
                  >
                    {tab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    <span className="tab-count" style={{ marginLeft: '6px', fontSize: '12px' }}>({counts[tab] || 0})</span>
                  </button>
                ))}
              </div>

              <div className="reports-list">
                {loading ? (
                   <p>Loading...</p>
                ) : reports.length === 0 ? (
                  <div className="empty-state">
                    <p>No reports match your search</p>
                    <button onClick={() => { setSearchQuery(''); handleTabChange('all'); }}>Clear filters</button>
                  </div>
                ) : (
                  reports.map(report => (
                    <div className="report-card" key={report.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
                      <img src={report.thumbnailUrl || 'https://via.placeholder.com/60'} alt="Thumbnail" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{report.category}</h3>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}><i className="fa-solid fa-location-dot"></i> {report.addressText}</p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>{report.description}</p>
                        <small style={{ color: '#999' }}>Reported on {formatDate(report.createdAt)}</small>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <span className={`status-badge ${statusClass(report.status)}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: '#eee' }}>{report.status}</span>
                        <Link to={`/my-reports/${report.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>View Details</Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {reports.length > 0 && (
                <div className="pagination-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                  <span>Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports</span>
                  <div>
                    <button disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)} style={{ marginRight: '10px' }}>Prev</button>
                    <span style={{ marginRight: '10px' }}>Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyReports;
