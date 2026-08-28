import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Dropdown } from 'react-bootstrap';
import { Calendar } from 'lucide-react';

const categories = ['Roads & Potholes', 'Waste & Dumping', 'Streetlights', 'Water Problems', 'Flooding & Drainage', 'Public Facilities', 'Safety Hazards', 'Environment', 'Other'];

const MapFilters = () => {
  const [filters, setFilters] = useState({
    status: { Verified: true, InProgress: true, Resolved: true, Pending: false },
    severity: { High: true, Medium: true, Low: true },
    categories: { 'Roads & Potholes': true, 'Waste & Dumping': true },
    sortBy: 'Most Recent',
    view: 'list'
  });

  const toggleStatus = (key) => setFilters(p => ({ ...p, status: { ...p.status, [key]: !p.status[key] } }));
  const toggleSeverity = (key) => setFilters(p => ({ ...p, severity: { ...p.severity, [key]: !p.severity[key] } }));
  const toggleCategory = (key) => setFilters(p => ({ ...p, categories: { ...p.categories, [key]: !p.categories[key] } }));

  const statusCounts = { Verified: 42, InProgress: 24, Resolved: 62, Pending: 18 };
  const severityCounts = { High: 38, Medium: 45, Low: 29 };

  return (
    <Card className="filters-card border-0 shadow-sm rounded-4">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">Filters</h5>
          <button className="btn btn-link text-primary text-decoration-none p-0 small fw-semibold" onClick={() => {}}>
            Clear All Filters
          </button>
        </div>

        <Row className="g-4">
          {/* Date Reported */}
          <Col lg={2} md={6}>
            <div className="fw-semibold small mb-3">Date Reported</div>
            <div className="input-group">
              <Form.Select className="form-select-sm border-1 text-muted small rounded-3">
                <option>Any time</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </Form.Select>
            </div>
          </Col>

          {/* Issue Status */}
          <Col lg={2} md={6}>
            <div className="fw-semibold small mb-3">Issue Status</div>
            {Object.entries({ Verified: 'Verified', InProgress: 'In Progress', Resolved: 'Resolved', Pending: 'Pending' }).map(([key, label]) => (
              <Form.Check
                key={key}
                className="d-flex align-items-center gap-2 mb-2 small filter-checkbox"
                label={<span className="d-flex justify-content-between w-100"><span>{label}</span><span className="ms-2 text-muted">{statusCounts[key]}</span></span>}
                checked={filters.status[key]}
                onChange={() => toggleStatus(key)}
                id={`status-${key}`}
              />
            ))}
          </Col>

          {/* Severity */}
          <Col lg={2} md={6}>
            <div className="fw-semibold small mb-3">Severity</div>
            {['High', 'Medium', 'Low'].map(sev => (
              <Form.Check
                key={sev}
                className="d-flex align-items-center gap-2 mb-2 small filter-checkbox"
                label={<span className="d-flex justify-content-between w-100"><span>{sev}</span><span className="ms-2 text-muted">{severityCounts[sev]}</span></span>}
                checked={filters.severity[sev]}
                onChange={() => toggleSeverity(sev)}
                id={`severity-${sev}`}
              />
            ))}
          </Col>

          {/* Categories */}
          <Col lg={3} md={6}>
            <div className="fw-semibold small mb-3">Categories</div>
            <div className="row g-2">
              {categories.map(cat => (
                <div className="col-6" key={cat}>
                  <Form.Check
                    className="small filter-checkbox"
                    label={cat}
                    checked={!!filters.categories[cat]}
                    onChange={() => toggleCategory(cat)}
                    id={`cat-${cat}`}
                  />
                </div>
              ))}
            </div>
          </Col>

          {/* Sort & View */}
          <Col lg={3} md={6}>
            <div>
              <div className="fw-semibold small mb-2">Sort By</div>
              <Form.Select
                className="form-select-sm rounded-3 mb-4 small"
                value={filters.sortBy}
                onChange={(e) => setFilters(p => ({ ...p, sortBy: e.target.value }))}
              >
                <option>Most Recent</option>
                <option>Oldest First</option>
                <option>Most Confirmed</option>
                <option>Severity</option>
              </Form.Select>
            </div>
            <div>
              <div className="fw-semibold small mb-2">View</div>
              <div className="d-flex gap-2">
                <button
                  className={`view-toggle-btn ${filters.view === 'list' ? 'active' : ''}`}
                  onClick={() => setFilters(p => ({ ...p, view: 'list' }))}
                >
                  <i className="fas fa-th-list me-1"></i> List View
                </button>
                <button
                  className={`view-toggle-btn ${filters.view === 'heatmap' ? 'active' : ''}`}
                  onClick={() => setFilters(p => ({ ...p, view: 'heatmap' }))}
                >
                  <i className="fas fa-fire me-1"></i> Heatmap View
                </button>
              </div>
            </div>
          </Col>
        </Row>

        <div className="d-flex align-items-center justify-content-between mt-4 pt-3 border-top">
          <Button variant="dark" className="rounded-3 px-4 py-2 btn-sm fw-semibold">
            Apply Filters
          </Button>
          <span className="text-muted small"><span className="fw-bold text-dark">128</span> issues match your filters</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MapFilters;
