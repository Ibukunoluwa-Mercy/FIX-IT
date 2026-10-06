import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Dropdown, Spinner } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './MapAnalytics.css';

const SEVERITY_COLORS = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#eab308',
  'In Progress': '#3b82f6',
  Resolved: '#22c55e',
};

const CATEGORY_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'];

const TIMEFRAME_LABELS = {
  this_week: 'This Week',
  this_month: 'This Month',
  this_year: 'This Year',
  all_time: 'All Time',
};

const MapAnalytics = () => {
  const [timeframe, setTimeframe] = useState('this_month');
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
        const response = await fetch(`${apiBaseUrl}/api/reports/community-overview?timeframe=${timeframe}`);
        if (!response.ok) throw new Error('Failed to load overview data');
        const data = await response.json();
        setOverview(data);
      } catch (err) {
        console.warn('Could not fetch community-overview, using fallback stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, [timeframe]);

  // Derived metrics from live API response (with graceful fallbacks)
  const metrics = overview?.metrics || {
    totalReports: 0,
    verifiedReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    activeUsers: 0,
  };

  // Severity & status pie data from live response
  const rawSeverity = overview?.issuesBySeverity || [];
  const rawStatus = overview?.issuesByStatus || [];
  const severityData = [
    ...rawSeverity.map(s => ({
      name: s.name,
      value: s.count,
      percent: `${s.percentage}%`,
      color: SEVERITY_COLORS[s.name] || '#94a3b8',
    })),
    ...rawStatus.map(st => ({
      name: st.name,
      value: st.count,
      percent: `${st.percentage}%`,
      color: SEVERITY_COLORS[st.name] || '#3b82f6',
    })),
  ].filter(item => item.value > 0);

  // If live data empty, show default placeholder slice so chart renders cleanly
  const displayChartData = severityData.length > 0 ? severityData : [
    { name: 'Reported', value: 1, percent: '100%', color: '#3b82f6' }
  ];

  // Top categories from live API response
  const topCategories = (overview?.topIssueCategories || []).slice(0, 5);
  const maxCategoryCount = Math.max(...topCategories.map(c => c.count), 1);

  // Most active areas from live API response
  const activeAreas = (overview?.mostActiveAreas || []).slice(0, 5);

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return String(num);
  };

  return (
    <Card className="analytics-card mb-4 border-0 shadow-sm rounded-4">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1">Community Overview</h4>
            <p className="text-muted mb-0 small">Real-time overview of issues in the community.</p>
          </div>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" className="bg-white d-flex align-items-center gap-2" id="dropdown-basic">
              {isLoading && <Spinner animation="border" size="sm" />}
              {TIMEFRAME_LABELS[timeframe] || 'This Month'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setTimeframe('this_week')}>This Week</Dropdown.Item>
              <Dropdown.Item onClick={() => setTimeframe('this_month')}>This Month</Dropdown.Item>
              <Dropdown.Item onClick={() => setTimeframe('this_year')}>This Year</Dropdown.Item>
              <Dropdown.Item onClick={() => setTimeframe('all_time')}>All Time</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Row className="g-3 mb-5">
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-purple">
                  <i className="fa-solid fa-file-lines" style={{ fontSize: 22 }}></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{metrics.totalReports}</h3>
                  <div className="fw-semibold small">Total Issues</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>All reported</div>
                </div>
              </div>
            </div>
          </Col>
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-green-light">
                  <i className="fa-solid fa-clipboard-check" style={{ fontSize: 22 }}></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{metrics.verifiedReports}</h3>
                  <div className="fw-semibold small">Verified Issues</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Confirmed by community</div>
                </div>
              </div>
            </div>
          </Col>
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-orange">
                  <i className="fa-solid fa-wrench" style={{ fontSize: 22 }}></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{metrics.inProgressReports}</h3>
                  <div className="fw-semibold small">In Progress</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Being addressed</div>
                </div>
              </div>
            </div>
          </Col>
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-green">
                  <i className="fa-solid fa-circle-check" style={{ fontSize: 22 }}></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{metrics.resolvedReports}</h3>
                  <div className="fw-semibold small">Resolved</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Successfully fixed</div>
                </div>
              </div>
            </div>
          </Col>
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-red">
                  <i className="fa-solid fa-users" style={{ fontSize: 22 }}></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{formatNumber(metrics.activeUsers)}</h3>
                  <div className="fw-semibold small">Community Members</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Active participants</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={4}>
            <h6 className="fw-bold mb-4">Issues by Severity & Status</h6>
            <div className="d-flex align-items-center">
              <div style={{ width: '160px', height: '160px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {displayChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-grow-1 ms-2">
                {displayChartData.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 small">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: item.color }}></div>
                      <span className="fw-medium text-dark">{item.name}</span>
                    </div>
                    <div className="text-muted">
                      <span className="text-dark fw-medium me-1">{item.value}</span>
                      ({item.percent})
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Current live breakdown</span>
            </div>
          </Col>

          <Col lg={4} className="border-start border-end px-4">
            <h6 className="fw-bold mb-4">Top Issue Categories</h6>
            <div className="category-bars">
              {topCategories.length > 0 ? (
                topCategories.map((item, index) => (
                  <div key={index} className="mb-3 d-flex align-items-center">
                    <div style={{ width: '140px' }} className="small fw-medium text-dark text-truncate" title={item.category}>
                      {item.category}
                    </div>
                    <div className="flex-grow-1 mx-2 bg-light rounded-pill" style={{ height: '6px' }}>
                      <div
                        className="h-100 rounded-pill"
                        style={{
                          width: `${Math.min(100, Math.round((item.count / maxCategoryCount) * 100))}%`,
                          backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                        }}
                      ></div>
                    </div>
                    <div className="small fw-bold">{item.count}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted small py-3 text-center">No reported issues in this period</div>
              )}
            </div>
          </Col>

          <Col lg={4} className="ps-4">
            <h6 className="fw-bold mb-4">Most Active Areas</h6>
            <div className="active-areas-list">
              {activeAreas.length > 0 ? (
                activeAreas.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span className="small fw-medium text-dark text-truncate me-2" title={item.location}>
                      {item.location || 'Unknown Area'}
                    </span>
                    <span className="small text-muted flex-shrink-0">
                      <span className="text-dark fw-medium">{item.totalLoggedIssues}</span> {item.totalLoggedIssues === 1 ? 'issue' : 'issues'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-muted small py-3 text-center">No area activity in this period</div>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default MapAnalytics;
