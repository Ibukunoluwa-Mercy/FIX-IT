import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { nearbyIcon, MapFlyTo, MapClickCapture, DraggableMarker } from './LocationMapMarkers';
import LocationSearchControls from './LocationSearchControls';
import LocationPermissionModal from './LocationPermissionModal';
import useLocationPickerSearch from './useLocationPickerSearch';
import './LocationPickerMap.css';

import { NEARBY_RADIUS, API_URL, reverseGeocode } from './mapUtils';

const LocationPickerMap = ({ onLocationSelect, onNearbyReportsChange, initialLat, initialLng, initialAddress, initialAccuracy, initialSource }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [coordsLocked, setCoordsLocked] = useState(!!initialLat && !!initialLng);
  const [accuracy, setAccuracy] = useState(initialAccuracy ?? null);
  const [locationSource, setLocationSource] = useState(initialSource || (initialLat && initialLng ? 'manual' : null));
  const [permissionState, setPermissionState] = useState('prompt');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  const [nearbyReports, setNearbyReports] = useState([]);

  const [mapCenter, setMapCenter] = useState([initialLat || 6.5244, initialLng || 3.3792]);
  const [markerPos, setMarkerPos] = useState(initialLat && initialLng ? [initialLat, initialLng] : null);
  
  const watchId = useRef(null);
  const watchTimer = useRef(null);
  const bestReading = useRef(null);

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
      setNearbyReports([]);
      if (onNearbyReportsChange) onNearbyReportsChange([]);
    }
  }, [onNearbyReportsChange]);

  const setMapLocation = useCallback((lat, lng, address, source = 'search', accuracyValue = 0, recenter = true) => {
    setQuery(address);
    setMarkerPos([lat, lng]);
    if (recenter) {
      setMapCenter([lat, lng]);
    }
    setCoordsLocked(true);
    setLocationSource(source);
    setAccuracy(source === 'gps' ? accuracyValue : null);
    fetchNearbyReports(lat, lng);
    if (onLocationSelect) {
      onLocationSelect({ latitude: lat, longitude: lng, accuracy: accuracyValue, source, addressText: address, capturedAt: new Date().toISOString() });
    }
  }, [onLocationSelect, fetchNearbyReports]);

  const {
    query,
    setQuery,
    results,
    isSearching,
    showDropdown,
    setShowDropdown,
    emptyMessage,
    dropdownRef,
    handleInputChange,
    handleResultSelect,
  } = useLocationPickerSearch(initialAddress, (lat, lon, label) => {
    setMapLocation(lat, lon, label, 'search', 0, true);
  });

  const updateLocationWithReverseGeocode = useCallback(async (lat, lng, recenter = true, source = 'manual', accuracyValue = 0) => {
    setQuery('Fetching address...');
    setMarkerPos([lat, lng]);
    if (recenter) {
      setMapCenter([lat, lng]);
    }
    setIsReverseGeocoding(true);
    setCoordsLocked(false);
    setLocationSource(source);
    setAccuracy(source === 'gps' ? accuracyValue : null);
    
    fetchNearbyReports(lat, lng);

    const address = await reverseGeocode(lat, lng);
    const finalAddress = address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    
    setQuery(finalAddress);
    setIsReverseGeocoding(false);
    setCoordsLocked(true);

    if (onLocationSelect) onLocationSelect({ latitude: lat, longitude: lng, accuracy: source === 'gps' ? accuracyValue : 0, source, addressText: finalAddress, capturedAt: new Date().toISOString() });
  }, [onLocationSelect, fetchNearbyReports, setQuery]);

  const handleMapClickSelection = useCallback((lat, lng) => {
    setLocationSource('manual');
    setAccuracy(null);
    updateLocationWithReverseGeocode(lat, lng, true, 'manual', 0);
  }, [updateLocationWithReverseGeocode]);

  const handleMarkerDragEnd = useCallback((lat, lng) => {
    setLocationSource('manual');
    setAccuracy(null);
    updateLocationWithReverseGeocode(lat, lng, false, 'manual', 0);
  }, [updateLocationWithReverseGeocode]);

  useEffect(() => {
    let active = true;
    if (!navigator.permissions?.query) return undefined;
    navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
      if (!active) return;
      setPermissionState(permission.state);
      if (permission.state === 'denied') setLocationError('Location access is blocked. iPhone: Settings > Privacy > Location Services > Safari/Chrome. Android: Settings > Location, then Chrome site permissions. Desktop: select the lock icon in the address bar and allow Location.');
      permission.onchange = () => setPermissionState(permission.state);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (watchTimer.current) clearTimeout(watchTimer.current);
    if (watchId.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  const startLocationWatch = () => {
    setShowLocationPrompt(false);
    setLocationError('');
    const userAgent = navigator.userAgent || '';
    const isInAppBrowser = /FBAN|FBAV|Instagram|Line\/|; wv\)|WebView/i.test(userAgent);
    if (isInAppBrowser) {
      setLocationError('This in-app browser may block location. Open FixIt in Chrome or Safari, or drag the pin to the exact spot.');
      return;
    }
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationError('Precise device location needs HTTPS and a browser with location support. Open this page in Chrome or Safari, or drag the pin to the exact spot.');
      return;
    }
    setIsLocating(true);
    setAccuracy(null);
    bestReading.current = null;
    const finish = () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      if (watchTimer.current) clearTimeout(watchTimer.current);
      setIsLocating(false);
      if (bestReading.current) {
        const { latitude, longitude, accuracy: readingAccuracy } = bestReading.current.coords;
        updateLocationWithReverseGeocode(latitude, longitude, true, 'gps', readingAccuracy);
        setLocationError(readingAccuracy > 100 ? 'Your location is not very precise. Move outdoors or turn on GPS/high-accuracy mode, or drag the pin to the exact spot.' : '');
      }
    };
    watchId.current = navigator.geolocation.watchPosition((position) => {
      if (!bestReading.current || position.coords.accuracy < bestReading.current.coords.accuracy) bestReading.current = position;
      setAccuracy(position.coords.accuracy);
      if (position.coords.accuracy <= 30) finish();
    }, (geoError) => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setIsLocating(false);
      if (geoError.code === geoError.PERMISSION_DENIED) setLocationError('Location access is blocked. iPhone: Settings > Privacy > Location Services > Safari/Chrome. Android: Settings > Location, then Chrome site permissions. Desktop: select the lock icon in the address bar and allow Location.');
      else if (geoError.code === geoError.POSITION_UNAVAILABLE) setLocationError('Your device could not find a position. Turn on Location/GPS and try again.');
      else if (geoError.code === geoError.TIMEOUT) {
        if (bestReading.current) finish();
        else setLocationError('We could not get a precise reading in time. Move to an open area and retry.');
      }
      else setLocationError('We could not get your device location. You can drag the pin to the exact spot.');
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    watchTimer.current = setTimeout(finish, 15000);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationError(permissionState === 'denied' ? 'Location access is blocked. Update your browser or device location settings, then try again.' : '');
    setShowLocationPrompt(true);
  };

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
      <LocationSearchControls
        dropdownRef={dropdownRef}
        query={query}
        handleInputChange={handleInputChange}
        results={results}
        setShowDropdown={setShowDropdown}
        showDropdown={showDropdown}
        isSearching={isSearching}
        isReverseGeocoding={isReverseGeocoding}
        coordsLocked={coordsLocked}
        isLocating={isLocating}
        handleGetCurrentLocation={handleGetCurrentLocation}
        locationError={locationError}
        locationSource={locationSource}
        accuracy={accuracy}
        handleResultSelect={handleResultSelect}
        emptyMessage={emptyMessage}
      />

      <div className="map-picker-wrapper mt-3 rounded overflow-hidden border shadow-sm">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '300px', width: '100%' }} zoomControl={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapFlyTo center={mapCenter} zoom={16} />
          <MapClickCapture onLocationSelected={handleMapClickSelection} />
          
          {markerPos && coordsLocked && locationSource === 'gps' && accuracy != null && (
            <Circle 
              center={markerPos} 
              radius={accuracy} 
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

          {markerPos && <DraggableMarker position={markerPos} onDragEnd={handleMarkerDragEnd} />}
        </MapContainer>
        <div className="map-picker-hint">
          <small className="text-muted"><i className="fa-solid fa-hand-pointer"></i> You can drag the pin or click anywhere on the map to set the exact location.</small>
        </div>
      </div>
      {showLocationPrompt && (
        <LocationPermissionModal
          onCancel={() => setShowLocationPrompt(false)}
          onContinue={startLocationWatch}
        />
      )}
    </div>
  );
};

export default LocationPickerMap;
