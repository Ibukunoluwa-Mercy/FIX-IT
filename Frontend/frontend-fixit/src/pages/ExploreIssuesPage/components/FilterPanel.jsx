import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';

export const FilterPanel = ({
  statusFilter,
  categoryFilter,
  severityFilter,
  dateFilter,
  updateParams,
  toggleFilterItem,
  clearAllFilters,
  handleSearchSubmit,
}) => {
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

  return (
    <Card className="border-0 shadow-sm rounded-4 bottom-filter-card">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">Filters</h5>
          <button className="btn btn-link text-primary text-decoration-none p-0 small fw-semibold" onClick={clearAllFilters}>
            Clear All
          </button>
        </div>

        <Row className="g-4">
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
              {['Verified', 'Pending', 'In Progress', 'Resolved'].map((st) => (
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

          <Col md={3}>
            <div className="fw-bold text-uppercase small text-muted mb-3" style={{ letterSpacing: '0.5px' }}>Category</div>
            <div className="d-flex flex-column gap-2">
              {CATEGORY_LIST.map((cat) => (
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
              ].map((s) => (
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
  );
};
