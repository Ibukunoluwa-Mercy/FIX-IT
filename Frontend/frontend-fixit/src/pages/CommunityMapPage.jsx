import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Search, SlidersHorizontal } from 'lucide-react';
import InteractiveMap from '../components/map/InteractiveMap';
import MapAnalytics from '../components/map/MapAnalytics';
import MapFilters from '../components/map/MapFilters';
import '../index.css';

const CommunityMapPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([41.8781, -87.6298]); // Default Chicago

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // Geocoding simulation
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  const categories = ['All Issues', 'Infrastructure', 'Utilities', 'Public Safety', 'Environment', 'Other'];
  const [activeCategory, setActiveCategory] = useState('All Issues');

  return (
    <div className="community-map-page bg-light-gray py-5">
      <Container>
        <div className="map-header mb-4">
          <h1 className="page-title">Community Map</h1>
          <p className="page-subtitle text-muted">Explore reported issues across the community. Click on a marker to view details and track progress.</p>
          
          <div className="search-bar-container mt-4 d-flex gap-3">
            <form onSubmit={handleSearch} className="search-input-wrapper flex-grow-1 position-relative">
              <Search className="search-icon" size={20} color="#6b7280" />
              <input 
                type="text" 
                className="form-control map-search-input" 
                placeholder="Search by keyword, location or issue ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button className="btn btn-outline-secondary btn-settings">
              <SlidersHorizontal size={20} />
            </button>
          </div>

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

        <MapAnalytics />

        <div className="map-container-wrapper my-5">
          <InteractiveMap center={mapCenter} />
        </div>

        <MapFilters />

      </Container>
    </div>
  );
};

export default CommunityMapPage;
