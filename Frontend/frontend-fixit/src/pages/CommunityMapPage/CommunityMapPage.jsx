import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import InteractiveMap from '../../components/map/InteractiveMap';
import MapAnalytics from '../../components/map/MapAnalytics';
import MapFilters from '../../components/map/MapFilters';
import './CommunityMapPage.css';

const categories = ['All Issues', 'Infrastructure', 'Utilities', 'Public Safety', 'Environment', 'Other'];

const CommunityMapPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([41.8781, -87.6298]); // Default: Chicago
  const [activeCategory, setActiveCategory] = useState('All Issues');
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const loadIssues = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
        const response = await fetch(`${apiBaseUrl}/api/issues/map`);
        if (!response.ok) throw new Error('Unable to load map issues');
        const data = await response.json();
        setIssues(data.map((issue) => ({
          ...issue,
          id: issue._id,
          lat: Number(issue.location?.lat),
          lng: Number(issue.location?.lng),
        })).filter((issue) => Number.isFinite(issue.lat) && Number.isFinite(issue.lng)));
      } catch (error) {
        setLoadError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadIssues();
  }, []);

  const filteredIssues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return issues.filter((issue) => {
      const matchesCategory = activeCategory === 'All Issues' ||
        (activeCategory === 'Infrastructure' && ['Road/Pothole', 'Drainage'].includes(issue.category)) ||
        (activeCategory === 'Utilities' && ['Streetlight', 'Water'].includes(issue.category)) ||
        (activeCategory === 'Public Safety' && ['Safety', 'Public Facility'].includes(issue.category)) ||
        (activeCategory === 'Environment' && ['Waste', 'Environment'].includes(issue.category)) ||
        (activeCategory === 'Other' && !['Road/Pothole', 'Drainage', 'Streetlight', 'Water', 'Safety', 'Public Facility', 'Waste', 'Environment'].includes(issue.category));
      const searchableText = `${issue.title} ${issue.category} ${issue.description} ${issue.location?.address}`.toLowerCase();
      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [activeCategory, issues, searchQuery]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_GEOCODING_URL}/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        setSearchError(`No results found for "${query}"`);
      }
    } catch {
      setSearchError('Search failed. Please check your connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchError('');
    inputRef.current?.focus();
  };

  return (
    <div className="community-map-page bg-light-gray">
      <Container className="py-5">
        {/* Header */}
        <div className="map-header mb-4 animate-slide-in">
          <h1 className="page-title">Community Map</h1>
          <p className="page-subtitle">
            Explore reported issues across the community. Click on a marker to view details and track progress.
          </p>

          {/* Search Row */}
          <form onSubmit={handleSearch} className="search-bar-container mt-4 d-flex gap-2 align-items-center">
            <div className="search-input-wrapper map-search-grow position-relative">
              <i className="fa-solid fa-magnifying-glass search-icon" style={{ color: '#9ca3af' }}></i>
              <input
                ref={inputRef}
                type="text"
                className={`form-control map-search-input ${searchError ? 'is-invalid-search' : ''}`}
                placeholder="Search by keyword, location or issue ID..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                disabled={isSearching}
              />
              {searchQuery && (
                <button type="button" className="search-clear-btn" onClick={clearSearch}>
                  <i className="fa-solid fa-xmark" style={{ color: '#9ca3af' }}></i>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-dark search-submit-btn"
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <span className="spinner-border spinner-border-sm" role="status" />
              ) : (
                <i className="fa-solid fa-magnifying-glass"></i>
              )}
            </button>

            <button
              type="button"
              className={`btn btn-settings ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(v => !v)}
              title="Toggle Filters"
            >
              <i className="fa-solid fa-sliders"></i>
            </button>
          </form>

          {searchError && (
            <div className="mt-2 small text-danger d-flex align-items-center gap-1">
              <i className="fas fa-exclamation-circle"></i> {searchError}
            </div>
          )}

          {/* Category Pills */}
          <div className="category-pills mt-3 d-flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                className={`pill-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loadError && <div className="alert alert-warning py-2 small">{loadError}</div>}

        {/* Analytics */}
        <MapAnalytics />

        {/* Map */}
        <div className="map-container-wrapper my-5">
          <InteractiveMap center={mapCenter} issues={filteredIssues} isLoading={isLoading} />
        </div>

        {/* Filters — toggled by the settings button */}
        {showFilters && <MapFilters onClose={() => setShowFilters(false)} />}

      </Container>
    </div>
  );
};

export default CommunityMapPage;