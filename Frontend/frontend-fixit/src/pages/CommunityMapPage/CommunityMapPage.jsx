import React, { useState, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import InteractiveMap from '../../components/map/InteractiveMap';
import MapAnalytics from '../../components/map/MapAnalytics';
import MapFilters from '../../components/map/MapFilters';
import './CommunityMapPage.css';

const categories = ['All Issues', 'Infrastructure', 'Utilities', 'Public Safety', 'Environment', 'Other'];

const CommunityMapPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([41.8781, -87.6298]); // Default: Chicago
  const [activeCategory, setActiveCategory] = useState('All Issues');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const inputRef = useRef(null);

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
            <div className="search-input-wrapper flex-grow-1 position-relative">
              <Search className="search-icon" size={18} color="#9ca3af" />
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
                  <X size={16} color="#9ca3af" />
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
                <Search size={16} />
              )}
            </button>

            <button
              type="button"
              className={`btn btn-settings ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(v => !v)}
              title="Toggle Filters"
            >
              <SlidersHorizontal size={18} />
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

        {/* Analytics */}
        <MapAnalytics />

        {/* Map */}
        <div className="map-container-wrapper my-5">
          <InteractiveMap center={mapCenter} />
        </div>

        {/* Filters — toggled by the settings button */}
        {showFilters && <MapFilters onClose={() => setShowFilters(false)} />}

      </Container>
    </div>
  );
};

export default CommunityMapPage;
