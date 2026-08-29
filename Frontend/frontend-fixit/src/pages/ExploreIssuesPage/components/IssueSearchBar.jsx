import React from 'react';
import { Card, Row, Col, Form, Badge } from 'react-bootstrap';
import { Search, X } from 'lucide-react';

export const IssueSearchBar = ({
  searchInput,
  setSearchInput,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  handleSearchSubmit,
  updateParams,
  currentSort,
  handleSortChange,
}) => {
  return (
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
                  onClick={() => {
                    setSearchInput('');
                    updateParams({ q: '' });
                  }}
                >
                  <X size={16} />
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown shadow-lg rounded-3">
                  {suggestions.map((item) => (
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
  );
};
