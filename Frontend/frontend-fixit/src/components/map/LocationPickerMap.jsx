import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPickerMap.css';

// Custom marker icon
const defaultIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div class="marker-pin" style="background-color: #ea580c;">
      <div class="marker-dot"></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// Nearby report icon
const nearbyIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div class="marker-pin" style="background-color: #3b82f6;">
      <div class="marker-dot" style="background-color: white;"></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -32]
});

const NEARBY_RADIUS = 150;
const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: {
        'User-Agent': 'FixItApp/1.0 (contact@fixit.com)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) throw new Error('Geocode failed');
    const data = await res.json();
    return data.display_name;
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return null;
  }
};

// Component to handle smooth flying to new locations
const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

// Component to capture map clicks and update marker
const MapClickCapture = ({ onLocationSelected }) => {
  const map = useMap();
  useEffect(() => {
    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelected(lat, lng);
    };
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onLocationSelected]);
  return null;
};

// Draggable Marker Component
const DraggableMarker = ({ position, onDragEnd }) => {
  const markerRef = useRef(null);
  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }),
    [onDragEnd],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={defaultIcon}
    />
  );
};

const LocationPickerMap = ({ onLocationSelect, onNearbyReportsChange, initialLat, initialLng, initialAddress }) => {
  const [query, setQuery] = useState(initialAddress || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');
  
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [coordsLocked, setCoordsLocked] = useState(!!initialLat && !!initialLng);
  
  const [nearbyReports, setNearbyReports] = useState([]);

  // Default to a central location (e.g., center of a default city) if no initial lat/lng
  const [mapCenter, setMapCenter] = useState([initialLat || 6.5244, initialLng || 3.3792]); // Lagos default
  const [markerPos, setMarkerPos] = useState(initialLat && initialLng ? [initialLat, initialLng] : null);
  
  const lastRequestTime = useRef(0);
  const debounceTimer = useRef(null);

  const fetchNearbyReports = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(`${API_URL}/api/reports/nearby?lat=${lat}&lng=${lng}&radius=${NEARBY_RADIUS}`);
      if (response.ok) {
        const data = await response.json();
        const reports = Array.isArray(data) ? data : (data.reports || []);
        setNearbyReports(reports);
        if (onNearbyReportsChange) onNearbyReportsChange(reports);
      } else {
        setNearbyReports([]);
        if (onNearbyReportsChange) onNearbyReportsChange([]);
      }
    } catch (err) {
      console.error('Error fetching nearby reports:', err);
      // For demonstration if API isn't ready
      setNearbyReports([]);
      if (onNearbyReportsChange) onNearbyReportsChange([]);
    }
  }, [onNearbyReportsChange]);

  const setMapLocation = useCallback((lat, lng, address, recenter = true) => {
    setQuery(address);
    setMarkerPos([lat, lng]);
    if (recenter) {
      setMapCenter([lat, lng]);
    }
    setCoordsLocked(true);
    fetchNearbyReports(lat, lng);
    if (onLocationSelect) {
      onLocationSelect(lat, lng, address);
    }
  }, [onLocationSelect, fetchNearbyReports]);

  const updateLocationWithReverseGeocode = useCallback(async (lat, lng, recenter = true) => {
    // Optimistic UI update
    setQuery('Fetching address...');
    setMarkerPos([lat, lng]);
    if (recenter) {
      setMapCenter([lat, lng]);
    }
    setIsReverseGeocoding(true);
    setCoordsLocked(false);
    
    // Fetch nearby reports in parallel with reverse geocode
    fetchNearbyReports(lat, lng);

    const address = await reverseGeocode(lat, lng);
    const finalAddress = address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    
    setQuery(finalAddress);
    setIsReverseGeocoding(false);
    setCoordsLocked(true);

    if (onLocationSelect) {
      onLocationSelect(lat, lng, finalAddress);
    }
  }, [onLocationSelect, fetchNearbyReports]);

  const searchNominatim = useCallback(async (searchQuery) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setShowDropdown(false);
      setEmptyMessage('');
      return;
    }

    // Rate limiting: Ensure at least 1 second between requests
    const now = Date.now();
    const timeSinceLastReq = now - lastRequestTime.current;
    if (timeSinceLastReq < 1000) {
      // If we are too fast, wait and try again
      debounceTimer.current = setTimeout(() => searchNominatim(searchQuery), 1000 - timeSinceLastReq);
      return;
    }

    lastRequestTime.current = Date.now();
    setIsSearching(true);
    setEmptyMessage('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'User-Agent': 'FixItApp/1.0 (contact@fixit.com)',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        }
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      setResults(data);
      setShowDropdown(true);
      
      if (data.length === 0) {
        setEmptyMessage('No matching locations found.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setEmptyMessage('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Debounce 500ms
    debounceTimer.current = setTimeout(() => {
      searchNominatim(val);
    }, 500);
  };

  const handleResultSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    setShowDropdown(false);
    setResults([]);
    
    setMapLocation(lat, lon, result.display_name, true);
  };

  const handleMapClickSelection = useCallback((lat, lng) => {
    updateLocationWithReverseGeocode(lat, lng, true);
  }, [updateLocationWithReverseGeocode]);

  const handleMarkerDragEnd = useCallback((lat, lng) => {
    updateLocationWithReverseGeocode(lat, lng, false); // false = don't recenter on drag
  }, [updateLocationWithReverseGeocode]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsLocating(false);
        updateLocationWithReverseGeocode(latitude, longitude, true);
      },
      (error) => {
        setIsLocating(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please allow location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('The request to get your location timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while getting location.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Click outside to close dropdown
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="location-picker-container">
      <div className="location-search-wrapper" ref={dropdownRef}>
        <div className="search-controls-container d-flex gap-2 mb-2">
          <div className="search-input-box flex-grow-1 position-relative">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="form-control location-search-input"
              placeholder="Search for a street, landmark, or area..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            />
            <div className="search-status-indicators">
              {(isSearching || isReverseGeocoding) ? (
                <span className="spinner-border spinner-border-sm text-muted" role="status" />
              ) : coordsLocked ? (
                <i className="fa-solid fa-circle-check text-success" title="Coordinates locked"></i>
              ) : null}
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary current-location-btn d-flex align-items-center gap-2" 
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <i className="fa-solid fa-location-crosshairs"></i>
            )}
            <span className="d-none d-sm-inline">Use Current Location</span>
          </button>
        </div>
        
        {locationError && (
          <div className="location-empty-message mb-2">
            <i className="fa-solid fa-circle-exclamation"></i> {locationError}
          </div>
        )}
        
        {/* Dropdown Results */}
        {showDropdown && results.length > 0 && (
          <ul className="location-results-dropdown shadow-sm">
            {results.map((res) => (
              <li 
                key={res.place_id} 
                className="location-result-item"
                onClick={() => handleResultSelect(res)}
              >
                <i className="fa-solid fa-location-dot item-icon"></i>
                <span>{res.display_name}</span>
              </li>
            ))}
          </ul>
        )}
        
        {/* Empty State Message Inline */}
        {emptyMessage && query.length >= 3 && !isSearching && (
          <div className="location-empty-message">
            <i className="fa-solid fa-circle-exclamation"></i> {emptyMessage}
          </div>
        )}
      </div>

      <div className="map-picker-wrapper mt-3 rounded overflow-hidden border shadow-sm">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '300px', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapFlyTo center={mapCenter} zoom={16} />
          <MapClickCapture onLocationSelected={handleMapClickSelection} />
          
          {markerPos && coordsLocked && (
            <Circle 
              center={markerPos} 
              radius={NEARBY_RADIUS} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 2 }} 
            />
          )}

          {markerPos && coordsLocked && nearbyReports.map((report, idx) => (
            <Marker key={report.id || report._id || idx} position={[report.lat, report.lng]} icon={nearbyIcon}>
              <Popup className="nearby-report-popup">
                <div className="p-1">
                  <h6 className="fw-bold mb-1 text-dark">{report.title || 'Similar Report'}</h6>
                  <span className="badge bg-secondary mb-2">{report.category}</span>
                  <button 
                    className="btn btn-sm btn-outline-primary w-100 mt-1 d-flex align-items-center justify-content-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Upvote functionality would be triggered here!');
                    }}
                  >
                    <i className="fa-solid fa-arrow-up"></i> Upvote Instead
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {markerPos && (
            <DraggableMarker position={markerPos} onDragEnd={handleMarkerDragEnd} />
          )}
        </MapContainer>
        <div className="map-picker-hint">
          <small className="text-muted"><i className="fa-solid fa-hand-pointer"></i> You can drag the pin or click anywhere on the map to set the exact location.</small>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
