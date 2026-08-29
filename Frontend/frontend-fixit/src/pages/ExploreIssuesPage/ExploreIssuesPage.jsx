import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { List, Map as MapIcon, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import './ExploreIssuesPage.css';

import { MOCK_ISSUES, TRENDING_ISSUES } from './data';
import { IssueSearchBar } from './components/IssueSearchBar';
import { IssueMetricsRow } from './components/IssueMetricsRow';
import { IssueFeedCard } from './components/IssueFeedCard';
import { TrendingIssuesWidget } from './components/TrendingIssuesWidget';
import { CommunityImpactWidget } from './components/CommunityImpactWidget';
import { FilterPanel } from './components/FilterPanel';

const ExploreIssuesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchExploreData = async () => {
      setLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2701';
        const queryParams = new URLSearchParams(searchParams);
        const res = await axios.get(`${baseUrl}/api/reports/explore?${queryParams.toString()}`);
        if (res.data && Array.isArray(res.data.issues)) {
          setIssuesData(res.data.issues);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, [searchParams]);

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

        <IssueSearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          handleSearchSubmit={handleSearchSubmit}
          updateParams={updateParams}
          currentSort={currentSort}
          handleSortChange={handleSortChange}
        />

        {(statusFilter.length > 0 || categoryFilter.length > 0 || severityFilter.length > 0 || currentSearch) && (
          <div className="active-filters-bar d-flex flex-wrap align-items-center gap-2 mb-4">
            <span className="small text-muted fw-semibold me-1">Active Filters:</span>
            {statusFilter.map((s) => (
              <span key={s} className="filter-tag tag-status">
                Status: {s}
                <X size={14} className="ms-1 cursor-pointer" onClick={() => toggleFilterItem('status', s, statusFilter)} />
              </span>
            ))}
            {categoryFilter.map((c) => (
              <span key={c} className="filter-tag tag-category">
                Category: {c}
                <X size={14} className="ms-1 cursor-pointer" onClick={() => toggleFilterItem('category', c, categoryFilter)} />
              </span>
            ))}
            {severityFilter.map((sev) => (
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

        <IssueMetricsRow />

        <Row className="g-4 mb-5">
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
                {filteredIssues.map((issue) => (
                  <IssueFeedCard
                    key={issue.id}
                    issue={issue}
                    isConfirmed={!!confirmedIssues[issue.id]}
                    onConfirm={handleConfirm}
                  />
                ))}

                <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
                  <div className="d-flex gap-1 pagination-custom">
                    <button className="page-nav-btn" type="button"><span className="visually-hidden">Previous</span>‹</button>
                    <button className="page-num-btn active" type="button">1</button>
                    <button className="page-num-btn" type="button">2</button>
                    <button className="page-num-btn" type="button">3</button>
                    <button className="page-num-btn" type="button">4</button>
                    <button className="page-num-btn" type="button">5</button>
                    <span className="px-2 align-self-center text-muted">...</span>
                    <button className="page-num-btn" type="button">9</button>
                    <button className="page-nav-btn" type="button"><span className="visually-hidden">Next</span>›</button>
                  </div>
                  <span className="text-muted small">Showing 1–10 of 128 issues</span>
                </div>
              </div>
            )}
          </Col>

          <Col lg={4}>
            <TrendingIssuesWidget issues={TRENDING_ISSUES} />
            <CommunityImpactWidget />
          </Col>
        </Row>

        <FilterPanel
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          severityFilter={severityFilter}
          dateFilter={dateFilter}
          updateParams={updateParams}
          toggleFilterItem={toggleFilterItem}
          clearAllFilters={clearAllFilters}
          handleSearchSubmit={handleSearchSubmit}
        />
      </Container>
    </div>
  );
};

export default ExploreIssuesPage;
