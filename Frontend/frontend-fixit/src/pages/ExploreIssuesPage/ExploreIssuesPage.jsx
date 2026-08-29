import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Badge, Pagination, Spinner } from 'react-bootstrap';
import { 
  Search, SlidersHorizontal, MapPin, ThumbsUp, MessageSquare, 
  ArrowRight, X, List, Map as MapIcon, ChevronLeft, ChevronRight,
  FileText, ClipboardCheck, Wrench, CheckCircle, AlertTriangle,
  Flame, Calendar, Check, Camera
} from 'lucide-react';
import axios from 'axios';
import './ExploreIssuesPage.css';

// Import Exact Asset Images for Cards & Widgets
import potholeImg from '../../assets/massive pothole on main St.png';
import dumpingParkImg from '../../assets/illegal dumping in park.png';
import streetlightImg from '../../assets/streetlight outage.png';
import flooding3rdImg from '../../assets/flooding in third avenue.png';
import playgroundImg from '../../assets/homepage one.jpeg';

import trendFloodingImg from '../../assets/05_flooding_at_central_road.png';
import trendStreetlightImg from '../../assets/06_broken_streetlight_park_entrance.png';
import trendDumpingImg from '../../assets/07_illegal_dumping_downtown_alley.png';
import trendManholeImg from '../../assets/08_open_manhole_near_school.png';

// Initial Mock Data for Explore Issues using exact asset files
const MOCK_ISSUES = [
  {
    id: 'ISS-001',
    title: 'Massive Pothole on Main St.',
    description: 'Large pothole in the right lane causing vehicles to swerve dangerously. Needs immediate attention.',
    location: '1200 Block, Main St.',
    category: 'Roads & Potholes',
    status: 'Verified',
    severity: 'High',
    photoCount: 3,
    image: potholeImg,
    confirmations: 24,
    commentsCount: 5,
    createdAt: '2d ago',
    dateReported: '2026-08-27'
  },
  {
    id: 'ISS-002',
    title: 'Illegal Dumping in Park',
    description: 'Large pile of construction debris and household waste dumped near the park entrance.',
    location: 'Centennial Park, North Entrance',
    category: 'Waste & Dumping',
    status: 'Verified',
    severity: 'Medium',
    photoCount: 4,
    image: dumpingParkImg,
    confirmations: 12,
    commentsCount: 3,
    createdAt: '5h ago',
    dateReported: '2026-08-29'
  },
  {
    id: 'ISS-003',
    title: 'Streetlight Outage',
    description: 'Streetlight has been out for over a week, area is very dark at night and causes safety concerns.',
    location: 'Corner of 8th St. & 4th Ave',
    category: 'Streetlights',
    status: 'In Progress',
    severity: 'Low',
    photoCount: 2,
    image: streetlightImg,
    confirmations: 6,
    commentsCount: 1,
    createdAt: '1w ago',
    dateReported: '2026-08-20'
  },
  {
    id: 'ISS-004',
    title: 'Flooding on 3rd Avenue',
    description: 'Heavy flooding after rain, water stays for hours making the road impassable for pedestrians.',
    location: '3rd Avenue, Downtown',
    category: 'Flooding & Drainage',
    status: 'Pending',
    severity: 'High',
    photoCount: 5,
    image: flooding3rdImg,
    confirmations: 31,
    commentsCount: 7,
    createdAt: '3d ago',
    dateReported: '2026-08-26'
  },
  {
    id: 'ISS-005',
    title: 'Damaged Playground Swing',
    description: 'Broken chain on children swings at local recreational park.',
    location: 'Riverside Community Park',
    category: 'Public Facilities',
    status: 'Resolved',
    severity: 'Medium',
    photoCount: 1,
    image: playgroundImg,
    confirmations: 18,
    commentsCount: 2,
    createdAt: '2w ago',
    dateReported: '2026-08-15'
  }
];

const TRENDING_ISSUES = [
  {
    id: 'TR-1',
    title: 'Flooding at Central Road',
    location: 'Central District',
    confirmations: 87,
    severity: 'High',
    image: trendFloodingImg
  },
  {
    id: 'TR-2',
    title: 'Broken Streetlight - Park Entrance',
    location: 'Riverside Park',
    confirmations: 54,
    severity: 'Medium',
    image: trendStreetlightImg
  },
  {
    id: 'TR-3',
    title: 'Illegal Dumping - Downtown Alley',
    location: 'Downtown Alley 4',
    confirmations: 113,
    severity: 'High',
    image: trendDumpingImg
  },
  {
    id: 'TR-4',
    title: 'Open Manhole Near School',
    location: 'Lincoln High School',
    confirmations: 28,
    severity: 'High',
    image: trendManholeImg
  }
];

const CATEGORY_LIST = [
  { name: 'Roads & Potholes', count: 36, icon: 'fa-road', color: '#ef4444' },
  { name: 'Waste & Dumping', count: 22, icon: 'fa-trash', color: '#16a34a' },
  { name: 'Flooding & Drainage', count: 18, icon: 'fa-water', color: '#3b82f6' },
  { name: 'Streetlights', count: 14, icon: 'fa-lightbulb', color: '#f59e0b' },
  { name: 'Water Problems', count: 9, icon: 'fa-tint', color: '#0ea5e9' },
  { name: 'Public Facilities', count: 12, icon: 'fa-building', color: '#8b5cf6' },
  { name: 'Safety Hazards', count: 8, icon: 'fa-exclamation-triangle', color: '#dc2626' },
  { name: 'Environment', count: 7, icon: 'fa-leaf', color: '#10b981' },
  { name: 'Other', count: 2, icon: 'fa-ellipsis-h', color: '#6b7280' },
];

const ExploreIssuesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search, Sort & Filters synced from URL params
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'Most Recent';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const statusFilter = searchParams.get('status') ? searchParams.get('status').split(',') : ['Verified'];
  const categoryFilter = searchParams.get('category') ? searchParams.get('category').split(',') : ['Roads & Potholes', 'Waste & Dumping'];
  const severityFilter = searchParams.get('severity') ? searchParams.get('severity').split(',') : ['High', 'Medium'];
  const dateFilter = searchParams.get('date') || 'Any time';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedIssues, setConfirmedIssues] = useState({});
  const [issuesData, setIssuesData] = useState(MOCK_ISSUES);

  // Debounced auto-complete suggestion calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim().length > 1) {
        const matches = MOCK_ISSUES.filter(
          i => i.title.toLowerCase().includes(searchInput.toLowerCase()) || 
               i.location.toLowerCase().includes(searchInput.toLowerCase())
        );
        setSuggestions(matches);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch from API or fallback gracefully
  useEffect(() => {
    const fetchExploreData = async () => {
      setLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const queryParams = new URLSearchParams(searchParams);
        const res = await axios.get(`${baseUrl}/api/reports/explore?${queryParams.toString()}`);
        if (res.data && Array.isArray(res.data.issues)) {
          setIssuesData(res.data.issues);
        }
      } catch (err) {
        // Use Mock data gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, [searchParams]);

  // Helpers to update URL search parameters
  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setShowSuggestions(false);
    updateParams({ q: searchInput, page: 1 });
  };

  const handleSortChange = (e) => {
    updateParams({ sort: e.target.value, page: 1 });
  };

  const toggleFilterItem = (filterType, item, currentList) => {
    let updated;
    if (currentList.includes(item)) {
      updated = currentList.filter(x => x !== item);
    } else {
      updated = [...currentList, item];
    }
    updateParams({ [filterType]: updated, page: 1 });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  // Optimistic confirmation/upvote handling
  const handleConfirm = (issueId) => {
    setConfirmedIssues(prev => {
      const isCurrentlyConfirmed = !!prev[issueId];
      return { ...prev, [issueId]: !isCurrentlyConfirmed };
    });
  };

  // Filter local data based on queries for client-side preview
  const filteredIssues = useMemo(() => {
    return issuesData.filter(issue => {
      const matchesSearch = !currentSearch || 
        issue.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
        issue.location.toLowerCase().includes(currentSearch.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(issue.status);
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(issue.category);
      const matchesSeverity = severityFilter.length === 0 || severityFilter.includes(issue.severity);
      return matchesSearch && matchesStatus && matchesCategory && matchesSeverity;
    });
  }, [issuesData, currentSearch, statusFilter, categoryFilter, severityFilter]);

  return (
    <div className="explore-page-wrapper py-4">
      <Container className="animate-slide-in">
        {/* 1. Header & Navigation Controls */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="page-title">Explore Issues</h1>
            <p className="page-subtitle mb-0">
              Browse reported community problems, confirm issues you've seen, and track their resolution progress.
            </p>
          </div>
          <div className="d-flex gap-2 align-self-start align-self-md-center">
            <button className="view-mode-btn active">
              <List size={16} className="me-1" /> List View
            </button>
            <button className="view-mode-btn" onClick={() => navigate('/map')}>
              <MapIcon size={16} className="me-1" /> Map View
            </button>
          </div>
        </div>

        {/* Search Bar & Sort */}
        <Card className="border-0 shadow-sm rounded-4 mb-3 animate-slide-in delay-100">
          <Card.Body className="p-3">
            <Row className="g-2 align-items-center">
              <Col md={8} lg={9}>
                <div className="position-relative">
                  <Search size={18} className="search-icon-explore" />
                  <input
                    type="text"
                    className="form-control search-input-explore"
                    placeholder="Search by keyword, address, or issue ID..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {searchInput && (
                    <button 
                      className="search-clear-explore" 
                      onClick={() => { setSearchInput(''); updateParams({ q: '' }); }}
                    >
                      <X size={16} />
                    </button>
                  )}
                  {/* Autocomplete Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown shadow-lg rounded-3">
                      {suggestions.map(item => (
                        <div 
                          key={item.id} 
                          className="suggestion-item p-2 border-bottom d-flex justify-content-between align-items-center"
                          onClick={() => {
                            setSearchInput(item.title);
                            setShowSuggestions(false);
                            updateParams({ q: item.title });
                          }}
                        >
                          <div>
                            <div className="fw-semibold small">{item.title}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.location}</div>
                          </div>
                          <Badge bg="light" text="dark" className="border">{item.category}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Col>
              <Col sm={6} md={2} lg={1}>
                <button className="btn btn-dark w-100 search-btn-explore fw-semibold" onClick={handleSearchSubmit}>
                  Search
                </button>
              </Col>
              <Col sm={6} md={2} lg={2}>
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted text-nowrap">Sort by:</span>
                  <Form.Select 
                    size="sm" 
                    className="rounded-3 border-light-subtle shadow-none"
                    value={currentSort}
                    onChange={handleSortChange}
                  >
                    <option>Most Recent</option>
                    <option>Most Upvoted</option>
                    <option>Highest Severity</option>
                    <option>Oldest</option>
                  </Form.Select>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Active Filters Pill Bar */}
        {(statusFilter.length > 0 || categoryFilter.length > 0 || severityFilter.length > 0 || currentSearch) && (
          <div className="active-filters-bar d-flex flex-wrap align-items-center gap-2 mb-4">
            <span className="small text-muted fw-semibold me-1">Active Filters:</span>
            {statusFilter.map(s => (
              <span key={s} className="filter-tag tag-status">
                Status: {s} 
                <X size={14} className="ms-1 cursor-pointer" onClick={() => toggleFilterItem('status', s, statusFilter)} />
              </span>
            ))}
            {categoryFilter.map(c => (
              <span key={c} className="filter-tag tag-category">
                Category: {c}
                <X size={14} className="ms-1 cursor-pointer" onClick={() => toggleFilterItem('category', c, categoryFilter)} />
              </span>
            ))}
            {severityFilter.map(sev => (
              <span key={sev} className="filter-tag tag-severity">
                {sev} Severity
                <X size={14} className="ms-1 cursor-pointer" onClick={() => toggleFilterItem('severity', sev, severityFilter)} />
              </span>
            ))}
            <button className="btn btn-link text-primary text-decoration-none p-0 small fw-semibold ms-2" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>
        )}

        {/* 2. Metric Summary Bar */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <div className="metric-box bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
              <div className="icon-wrapper icon-purple">
                <FileText size={22} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">128</h4>
                <div className="small text-muted">Total Issues</div>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="metric-box bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
              <div className="icon-wrapper icon-green-light">
                <ClipboardCheck size={22} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">42</h4>
                <div className="small text-muted">Verified Issues</div>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="metric-box bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
              <div className="icon-wrapper icon-orange">
                <Wrench size={22} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">24</h4>
                <div className="small text-muted">In Progress</div>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="metric-box bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
              <div className="icon-wrapper icon-green">
                <CheckCircle size={22} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">44</h4>
                <div className="small text-muted">Resolved</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Main Section: Feed + Sidebar */}
        <Row className="g-4 mb-5">
          {/* 3. Issue Cards Feed */}
          <Col lg={8}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="dark" />
              </div>
            ) : filteredIssues.length === 0 ? (
              <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                <Card.Body>
                  <AlertTriangle size={48} className="text-warning mb-3" />
                  <h5 className="fw-bold">No Issues Found</h5>
                  <p className="text-muted small">No issues match the selected filters or search terms.</p>
                  <button className="btn btn-dark rounded-3 btn-sm px-4 mt-2" onClick={clearAllFilters}>
                    Reset Filters
                  </button>
                </Card.Body>
              </Card>
            ) : (
              <div className="issue-feed d-flex flex-column gap-3">
                {filteredIssues.map((issue) => {
                  const isConfirmed = !!confirmedIssues[issue.id];
                  const totalConfirmations = issue.confirmations + (isConfirmed ? 1 : 0);

                  return (
                    <Card key={issue.id} className="issue-feed-card border-0 shadow-sm rounded-4 overflow-hidden">
                      <Row className="g-0">
                        {/* Left image container */}
                        <Col sm={4} className="position-relative issue-img-col">
                          <img src={issue.image} alt={issue.title} className="issue-feed-img" />
                          <Badge className={`severity-badge severity-${issue.severity.toLowerCase()}`}>
                            {issue.severity}
                          </Badge>
                          <div className="photo-count-badge">
                            <Camera size={13} className="me-1" /> {issue.photoCount}
                          </div>
                        </Col>

                        {/* Main Details */}
                        <Col sm={8} className="p-3 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h5 className="issue-feed-title fw-bold mb-0">{issue.title}</h5>
                              <span className={`status-pill status-${issue.status.toLowerCase().replace(' ', '-')}`}>
                                {issue.status}
                              </span>
                            </div>

                            <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-2">
                              <span className="d-flex align-items-center gap-1">
                                <MapPin size={14} className="text-secondary" /> {issue.location}
                              </span>
                              <span>•</span>
                              <span>{issue.category}</span>
                              <span>•</span>
                              <span>{issue.createdAt}</span>
                            </div>

                            <p className="issue-feed-desc text-muted small mb-3">
                              {issue.description}
                            </p>
                          </div>

                          {/* Footer Bar */}
                          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                            <div className="d-flex align-items-center gap-3">
                              <button 
                                className={`btn-confirm-action ${isConfirmed ? 'active' : ''}`}
                                onClick={() => handleConfirm(issue.id)}
                              >
                                <ThumbsUp size={14} className="me-1" />
                                {totalConfirmations} Confirmed
                              </button>
                              <span className="text-muted small d-flex align-items-center gap-1">
                                <MessageSquare size={14} /> {issue.commentsCount}
                              </span>
                            </div>
                            <Link to={`/explore`} className="btn-view-details text-decoration-none">
                              View Details <ArrowRight size={14} className="ms-1" />
                            </Link>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
                  <div className="d-flex gap-1 pagination-custom">
                    <button className="page-nav-btn"><ChevronLeft size={16} /></button>
                    <button className="page-num-btn active">1</button>
                    <button className="page-num-btn">2</button>
                    <button className="page-num-btn">3</button>
                    <button className="page-num-btn">4</button>
                    <button className="page-num-btn">5</button>
                    <span className="px-2 align-self-center text-muted">...</span>
                    <button className="page-num-btn">9</button>
                    <button className="page-nav-btn"><ChevronRight size={16} /></button>
                  </div>
                  <span className="text-muted small">Showing 1–10 of 128 issues</span>
                </div>
              </div>
            )}
          </Col>

          {/* 4. Secondary Sidebar Sections */}
          <Col lg={4}>
            {/* Trending Issues Widget */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Trending Issues</h6>
                  <a href="#" className="small text-primary text-decoration-none fw-semibold">
                    View All <ArrowRight size={13} />
                  </a>
                </div>
                <div className="d-flex flex-column gap-3">
                  {TRENDING_ISSUES.map(item => (
                    <div key={item.id} className="d-flex align-items-center gap-3 pb-2 border-bottom">
                      <img src={item.image} alt={item.title} className="trending-mini-img rounded-3" />
                      <div className="flex-grow-1">
                        <div className="fw-bold small line-clamp-1">{item.title}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{item.location}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold small">{item.confirmations}</div>
                        <span className={`badge-trending-sev sev-${item.severity.toLowerCase()}`}>
                          {item.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Community Impact Widget */}
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="fw-bold mb-0">Community Impact</h6>
                  <a href="#" className="small text-primary text-decoration-none fw-semibold">
                    View Insights <ArrowRight size={13} />
                  </a>
                </div>
                <Row className="g-2 text-center mb-3">
                  <Col xs={6} className="p-2 border rounded-3 bg-light-subtle">
                    <div className="text-success mb-1"><CheckCircle size={20} /></div>
                    <h5 className="fw-bold mb-0">82%</h5>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Resolution Rate</div>
                  </Col>
                  <Col xs={6} className="p-2 border rounded-3 bg-light-subtle">
                    <div className="text-primary mb-1"><Wrench size={20} /></div>
                    <h5 className="fw-bold mb-0">4.2 days</h5>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Avg. Resolution Time</div>
                  </Col>
                  <Col xs={6} className="p-2 border rounded-3 bg-light-subtle">
                    <div className="text-warning mb-1"><Flame size={20} /></div>
                    <h5 className="fw-bold mb-0">246</h5>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Reported this month</div>
                  </Col>
                  <Col xs={6} className="p-2 border rounded-3 bg-light-subtle">
                    <div className="text-success mb-1"><CheckCircle size={20} /></div>
                    <h5 className="fw-bold mb-0">201</h5>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Resolved this month</div>
                  </Col>
                </Row>
                <div className="text-center text-muted small mt-3">
                  <span className="d-inline-flex align-items-center gap-1">
                    🔍 Together we're making our community better!
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 5. Comprehensive Bottom Filter Drawer / Panel */}
        <Card className="border-0 shadow-sm rounded-4 bottom-filter-card">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Filters</h5>
              <button className="btn btn-link text-primary text-decoration-none p-0 small fw-semibold" onClick={clearAllFilters}>
                Clear All
              </button>
            </div>

            <Row className="g-4">
              {/* Status */}
              <Col md={3}>
                <div className="fw-bold text-uppercase small text-muted mb-3" style={{ letterSpacing: '0.5px' }}>Status</div>
                <div className="d-flex flex-column gap-2">
                  <Form.Check 
                    type="checkbox"
                    id="status-all"
                    label={<div className="d-flex justify-content-between w-100"><span>All Statuses</span><span className="text-muted">128</span></div>}
                    checked={statusFilter.length === 0}
                    onChange={() => updateParams({ status: [] })}
                    className="small filter-checkbox"
                  />
                  {['Verified', 'Pending', 'In Progress', 'Resolved'].map(st => (
                    <Form.Check 
                      key={st}
                      type="checkbox"
                      id={`status-${st}`}
                      label={<div className="d-flex justify-content-between w-100"><span>{st}</span><span className="text-muted">{st === 'Verified' ? 42 : st === 'Pending' ? 18 : st === 'In Progress' ? 24 : 44}</span></div>}
                      checked={statusFilter.includes(st)}
                      onChange={() => toggleFilterItem('status', st, statusFilter)}
                      className="small filter-checkbox"
                    />
                  ))}
                </div>
              </Col>

              {/* Category */}
              <Col md={3}>
                <div className="fw-bold text-uppercase small text-muted mb-3" style={{ letterSpacing: '0.5px' }}>Category</div>
                <div className="d-flex flex-column gap-2">
                  {CATEGORY_LIST.map(cat => (
                    <Form.Check 
                      key={cat.name}
                      type="checkbox"
                      id={`cat-${cat.name}`}
                      label={
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span className="d-flex align-items-center gap-2">
                            <i className={`fas ${cat.icon}`} style={{ color: cat.color, width: 14 }}></i>
                            {cat.name}
                          </span>
                          <span className="text-muted">{cat.count}</span>
                        </div>
                      }
                      checked={categoryFilter.includes(cat.name)}
                      onChange={() => toggleFilterItem('category', cat.name, categoryFilter)}
                      className="small filter-checkbox"
                    />
                  ))}
                </div>
              </Col>

              {/* Severity */}
              <Col md={3}>
                <div className="fw-bold text-uppercase small text-muted mb-3" style={{ letterSpacing: '0.5px' }}>Severity</div>
                <div className="d-flex flex-column gap-2">
                  <Form.Check 
                    type="checkbox"
                    id="sev-all"
                    label={<div className="d-flex justify-content-between w-100"><span>All Severities</span><span className="text-muted">128</span></div>}
                    checked={severityFilter.length === 0}
                    onChange={() => updateParams({ severity: [] })}
                    className="small filter-checkbox"
                  />
                  {[
                    { label: 'High', color: '#ef4444', count: 32 },
                    { label: 'Medium', color: '#f97316', count: 51 },
                    { label: 'Low', color: '#eab308', count: 30 },
                    { label: 'Resolved', color: '#16a34a', count: 15 },
                  ].map(s => (
                    <Form.Check 
                      key={s.label}
                      type="checkbox"
                      id={`sev-${s.label}`}
                      label={
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span className="d-flex align-items-center gap-2">
                            <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: s.color }}></span>
                            {s.label}
                          </span>
                          <span className="text-muted">{s.count}</span>
                        </div>
                      }
                      checked={severityFilter.includes(s.label)}
                      onChange={() => toggleFilterItem('severity', s.label, severityFilter)}
                      className="small filter-checkbox"
                    />
                  ))}
                </div>
              </Col>

              {/* Date Reported & Actions */}
              <Col md={3} className="d-flex flex-column justify-content-between">
                <div>
                  <div className="fw-bold text-uppercase small text-muted mb-3" style={{ letterSpacing: '0.5px' }}>Date Reported</div>
                  <Form.Select 
                    className="rounded-3 border-light-subtle small mb-4"
                    value={dateFilter}
                    onChange={(e) => updateParams({ date: e.target.value })}
                  >
                    <option>Any time</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </Form.Select>
                </div>

                <div className="mt-4">
                  <button className="btn btn-dark w-100 rounded-3 py-2 fw-semibold" onClick={handleSearchSubmit}>
                    Apply Filters
                  </button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ExploreIssuesPage;
