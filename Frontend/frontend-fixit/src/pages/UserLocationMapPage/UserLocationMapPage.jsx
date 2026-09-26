import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import InteractiveMap from '../../components/map/InteractiveMap';
import logoWhite from '../../assets/fixit-white-logo.png';
import './UserLocationMapPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
const DEFAULT_CENTER = [6.5244, 3.3792];
const RADIUS_METERS = 5000;
const categoryChips = [['All Issues', null], ['Road & Potholes', 'Road/Pothole'], ['Water Problems', 'Water'], ['Streetlights', 'Streetlight'], ['New Problems', 'New'], ['Flooding & Drainage', 'Drainage'], ['Public Facilities', 'Public Facility']];
const categoryOptions = ['Road/Pothole', 'Water', 'Streetlight', 'Drainage', 'Public Facility', 'Safety', 'Waste', 'Environment', 'Other'];
const statusOptions = ['Verified', 'In Progress', 'Resolved', 'Pending'];
const severityOptions = ['High', 'Medium', 'Low'];
const initialFilters = { from: '', to: '', statuses: [], severities: [], categories: [], sort: 'Most Recent' };

const formatDistance = (meters) => meters < 1000 ? `${Math.round(meters)} m away` : `${(meters / 1000).toFixed(1)} km away`;
const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Recently reported';
const normalizeStatus = (status) => status === 'New' ? 'Pending' : status || 'Pending';

const ResidentSidebar = ({ navigate, isCollapsed, onToggle, userName, showProfileMenu, onToggleProfileMenu, onSignOut }) => (
  <aside className={`nearby-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
    <div className="nearby-brand-row">
      <Link to="/dashboard" className="nearby-brand"><img src={logoWhite} alt="FixIt" /><span>Fix<span>It</span></span></Link>
      <button className="nearby-sidebar-toggle" type="button" onClick={onToggle} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <i className={`fa-solid ${isCollapsed ? 'fa-bars' : 'fa-xmark'}`} />
      </button>
    </div>
    <nav aria-label="Resident dashboard navigation" className="nearby-nav">
      {[['Dashboard', 'fa-grip', '/dashboard'], ['My Reports', 'fa-file-lines', '/reports'], ['Nearby Issues', 'fa-location-dot', '/map'], ['Notifications', 'fa-bell'], ['Messages', 'fa-message'], ['Saved Locations', 'fa-bookmark']].map(([label, icon, path]) => (
        <button key={label} className={`nearby-nav-link ${label === 'Nearby Issues' ? 'active' : ''}`} onClick={() => path && navigate(path)}><i className={`fa-solid ${icon}`} /><span>{label}</span></button>
      ))}
      <div className="nearby-nav-divider" />
      {[['Help Center', 'fa-circle-question', '/help-center'], ['Settings', 'fa-gear', '/settings']].map(([label, icon, path]) => (
        <button key={label} className="nearby-nav-link" onClick={() => path && navigate(path)}><i className={`fa-solid ${icon}`} /><span>{label}</span></button>
      ))}
    </nav>
    <div className="nearby-profile-wrap">
      {showProfileMenu && (
        <div className="nearby-profile-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => { navigate('/settings'); onToggleProfileMenu(); }}>
            <i className="fa-solid fa-gear" /> Account settings
          </button>
          <button type="button" role="menuitem" onClick={onSignOut}>
            <i className="fa-solid fa-arrow-right-from-bracket" /> Sign out
          </button>
        </div>
      )}
      <button className="nearby-sidebar-user" type="button" onClick={onToggleProfileMenu} title={userName} aria-haspopup="menu" aria-expanded={showProfileMenu}>
        <span className="nearby-avatar">{userName.charAt(0).toUpperCase()}</span>
        <span className="nearby-sidebar-user-copy"><strong>{userName}</strong><small>Resident</small></span>
        <i className="fa-solid fa-chevron-down" />
      </button>
    </div>
  </aside>
);

const CheckGroup = ({ title, options, selected, onToggle }) => (
  <fieldset className="nearby-filter-group"><legend>{title}</legend>{options.map((option) => <label key={option} className="nearby-check"><input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} /><span>{option}</span></label>)}</fieldset>
);

const NearbyIssueCard = ({ issue }) => (
  <article className="nearby-issue-card">
    {issue.thumbnailUrl ? <img src={issue.thumbnailUrl} alt="" className="nearby-issue-image" /> : <div className="nearby-issue-image nearby-image-placeholder"><i className="fa-solid fa-triangle-exclamation" /></div>}
    <div className="nearby-issue-body"><div className="nearby-issue-topline"><span className="nearby-category-tag">{issue.category}</span><span className={`nearby-severity ${issue.severity.toLowerCase()}`}>{issue.severity}</span></div><h3>{issue.title || 'Reported issue'}</h3><p className="nearby-issue-meta"><i className="fa-solid fa-location-dot" /> {formatDistance(issue.distance)} <span>•</span> {formatDate(issue.reportedAt)}</p><p className="nearby-issue-description">{issue.description || 'No description provided.'}</p><div className="nearby-issue-footer"><span className={`nearby-status ${issue.status.toLowerCase().replace(/\s+/g, '-')}`}>{issue.status}</span><button type="button"><i className="fa-regular fa-thumbs-up" /> Track <span>{issue.upvotes || 0}</span></button></div></div>
  </article>
);

const UserLocationMapPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('fixitUser') || '{}'); } catch { return {}; }
  }, []);
  const userName = user.name || user.fullName || 'Resident';
  const token = localStorage.getItem('fixitToken') || localStorage.getItem('token') || '';
  const signOut = () => {
    localStorage.removeItem('fixitToken');
    localStorage.removeItem('token');
    localStorage.removeItem('fixitUser');
    navigate('/login');
  };
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationMessage, setLocationMessage] = useState('');
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState('');
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(true);
  const [satellite, setSatellite] = useState(false);

  const loadSavedLocation = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/me/location`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const saved = response.data?.location;
      if (saved?.latitude != null && saved?.longitude != null) {
        setLocation({ latitude: Number(saved.latitude), longitude: Number(saved.longitude), accuracy: saved.accuracy || 100, source: 'profile' });
        setLocationMessage('Using your saved location.');
        return true;
      }
    } catch { /* The location notice offers a retry when no saved location exists. */ }
    return false;
  }, [token]);

  const resolveLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationMessage('');
    if (!navigator.geolocation) {
      loadSavedLocation().then((found) => { if (!found) setLocationMessage('Location is unavailable. Allow browser access or add a saved location.'); setLocationLoading(false); });
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, source: 'geolocation' });
      setLocationMessage('Using your current location.');
      setLocationLoading(false);
    }, async () => {
      const found = await loadSavedLocation();
      if (!found) setLocationMessage('We could not access your location. Allow location access or add a saved location.');
      setLocationLoading(false);
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 });
  }, [loadSavedLocation]);

  useEffect(() => { resolveLocation(); }, [resolveLocation]);
  useEffect(() => {
    if (!location) return undefined;
    let active = true;
    setIssuesLoading(true); setIssuesError('');
    const params = { radiusKm: RADIUS_METERS / 1000 };
    if (location.source !== 'profile') {
      params.lat = location.latitude;
      params.lng = location.longitude;
    }
    axios.get(`${API_URL}/api/issues/nearby`, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((response) => {
      if (!active) return;
      setIssues((response.data?.issues || []).map((issue) => ({
        ...issue,
        id: issue.id?.toString(),
        status: normalizeStatus(issue.status),
        severity: issue.severity || 'Medium',
        lat: issue.location.lat,
        lng: issue.location.lng,
        areaName: issue.location.areaName,
        distance: Number(issue.distanceKm || 0) * 1000,
        thumbnailUrl: issue.imageUrl,
      })));
    }).catch(() => { if (active) setIssuesError('Unable to load nearby issues. Please try again.'); }).finally(() => { if (active) setIssuesLoading(false); });
    return () => { active = false; };
  }, [location, token]);

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = issues.filter((issue) => {
      const reportedTime = issue.reportedAt ? new Date(issue.reportedAt).getTime() : 0;
      const categoryMatch = activeChip === null || issue.category === activeChip;
      const searchMatch = !query || `${issue.title} ${issue.description} ${issue.category} ${issue.areaName}`.toLowerCase().includes(query);
      const fromMatch = !filters.from || reportedTime >= new Date(filters.from).getTime();
      const toMatch = !filters.to || reportedTime <= new Date(`${filters.to}T23:59:59`).getTime();
      return categoryMatch && searchMatch && (!filters.statuses.length || filters.statuses.includes(issue.status)) && (!filters.severities.length || filters.severities.includes(issue.severity)) && (!filters.categories.length || filters.categories.includes(issue.category)) && fromMatch && toMatch;
    });
    return result.sort((a, b) => filters.sort === 'Nearest' ? a.distance - b.distance : filters.sort === 'Highest Severity' ? ['High', 'Medium', 'Low'].indexOf(a.severity) - ['High', 'Medium', 'Low'].indexOf(b.severity) : new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0));
  }, [activeChip, filters, issues, search]);

  const toggleDraft = (key, value) => setDraftFilters((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  const clearFilters = () => { setFilters(initialFilters); setDraftFilters(initialFilters); setActiveChip(null); setSearch(''); };
  const hasFilters = Boolean(search || activeChip || filters.from || filters.to || filters.statuses.length || filters.severities.length || filters.categories.length || filters.sort !== 'Most Recent');
  const mapIssues = filteredIssues.map((issue) => ({ ...issue, lat: Number(issue.lat), lng: Number(issue.lng) }));
  const center = location ? [location.latitude, location.longitude] : DEFAULT_CENTER;

  return <div className={`nearby-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}><ResidentSidebar navigate={navigate} isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed((value) => !value)} userName={userName} showProfileMenu={showProfileMenu} onToggleProfileMenu={() => setShowProfileMenu((value) => !value)} onSignOut={signOut} /><main className="nearby-main"><header className="nearby-header"><div className="nearby-mobile-brand"><img src={logoWhite} alt="FixIt" /><strong>Fix<span>It</span></strong></div><div className="nearby-header-actions"><button className="nearby-header-icon" aria-label="Notifications"><i className="fa-regular fa-bell" /></button><span className="nearby-header-avatar">{userName.charAt(0).toUpperCase()}</span></div></header><div className="nearby-content">
    <section className="nearby-page-intro"><div><p className="nearby-eyebrow">RESIDENT DASHBOARD</p><h1>Nearby Issues</h1><p>Explore issues around and update your nearest Zone/Ward. Click on a marker to view details and track progress.</p></div><div className="nearby-search"><i className="fa-solid fa-magnifying-glass" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search nearby issues..." aria-label="Search nearby issues" /></div></section>
    <div className="nearby-chips">{categoryChips.map(([label, value]) => <button key={label} className={activeChip === value ? 'active' : ''} onClick={() => setActiveChip(value)}>{label}</button>)}</div>
    {locationMessage && <div className="nearby-location-notice"><i className="fa-solid fa-location-dot" /><span>{locationMessage}</span><button onClick={resolveLocation}>Try again</button></div>}
    <section className="nearby-map-card"><div className="nearby-map-heading"><div><h2>Community map</h2><span>Reports within {RADIUS_METERS / 1000} km of your location</span></div><button className="nearby-filter-toggle" onClick={() => setShowFilters((value) => !value)}><i className="fa-solid fa-sliders" /> Filters {hasFilters && <b>{filteredIssues.length}</b>}</button></div><div className="nearby-map-wrap"><InteractiveMap center={center} issues={mapIssues} isLoading={locationLoading || issuesLoading} userLocation={location} satellite={satellite} onToggleSatellite={() => setSatellite((value) => !value)} /></div></section>
    <section className="nearby-list-section"><div className="nearby-section-heading"><div><h2>Issues near you</h2><span>{filteredIssues.length} of {issues.length} reports in your radius</span></div><button className="nearby-view-toggle active"><i className="fa-solid fa-list" /> List view</button></div>{issuesError && <div className="nearby-error">{issuesError}</div>}{!issuesLoading && !locationLoading && !issues.length && <div className="nearby-empty"><i className="fa-solid fa-location-dot" /><h3>No nearby issues</h3><p>There are currently no reports near your location.</p></div>}{!issuesLoading && issues.length > 0 && !filteredIssues.length && <div className="nearby-empty"><i className="fa-solid fa-filter-circle-xmark" /><h3>No issues match your filters</h3><p>Try changing your search or selected filters.</p><button onClick={clearFilters}>Clear filters</button></div>}<div className="nearby-issues-grid">{filteredIssues.map((issue) => <NearbyIssueCard key={issue.id} issue={issue} />)}</div></section>
    <section className={`nearby-filters-card ${showFilters ? 'open' : ''}`}><div className="nearby-filters-heading"><div><h2>Filter nearby issues</h2><span>Refine the same reports shown on the map.</span></div><button onClick={clearFilters}>Clear all filters</button></div><div className="nearby-filter-grid"><label className="nearby-select-label">Date reported<div className="nearby-date-fields"><input type="date" value={draftFilters.from} onChange={(event) => setDraftFilters({ ...draftFilters, from: event.target.value })} /><input type="date" value={draftFilters.to} onChange={(event) => setDraftFilters({ ...draftFilters, to: event.target.value })} /></div></label><CheckGroup title="Issue status" options={statusOptions} selected={draftFilters.statuses} onToggle={(value) => toggleDraft('statuses', value)} /><CheckGroup title="Severity" options={severityOptions} selected={draftFilters.severities} onToggle={(value) => toggleDraft('severities', value)} /><label className="nearby-select-label">Category<select multiple value={draftFilters.categories} onChange={(event) => setDraftFilters({ ...draftFilters, categories: [...event.target.selectedOptions].map((option) => option.value) })}>{categoryOptions.map((category) => <option key={category}>{category}</option>)}</select></label><label className="nearby-select-label">Sort by<select value={draftFilters.sort} onChange={(event) => setDraftFilters({ ...draftFilters, sort: event.target.value })}><option>Most Recent</option><option>Nearest</option><option>Highest Severity</option></select></label></div><button className="nearby-apply-button" onClick={() => { setFilters(draftFilters); setShowFilters(true); }}>Apply filters</button></section>
  </div></main></div>;
};

export default UserLocationMapPage;
