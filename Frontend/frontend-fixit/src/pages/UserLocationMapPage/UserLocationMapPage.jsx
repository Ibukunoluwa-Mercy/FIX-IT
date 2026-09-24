import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Circle, MapContainer, Marker, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './UserLocationMapPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = import.meta.env.VITE_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const LAGOS_CENTER = [6.5244, 3.3792];
const locationIcon = L.divIcon({ className: 'user-location-icon', html: '<span class="user-location-dot"><i></i></span>', iconSize: [32, 32], iconAnchor: [16, 16] });

const distanceInMeters = (first, second) => {
  if (!first || !second) return Infinity;
  const earthRadius = 6371000;
  const latDelta = (second.latitude - first.latitude) * Math.PI / 180;
  const lngDelta = (second.longitude - first.longitude) * Math.PI / 180;
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(first.latitude * Math.PI / 180) * Math.cos(second.latitude * Math.PI / 180) * Math.sin(lngDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const MapViewport = ({ location, follow, onUserInteraction }) => {
  const map = useMap();
  const firstRender = useRef(true);

  useEffect(() => {
    map.invalidateSize();
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  useEffect(() => {
    if (!location) return;
    const center = [location.latitude, location.longitude];
    if (firstRender.current || follow) {
      map.flyTo(center, 17, { animate: !firstRender.current, duration: 0.7 });
      firstRender.current = false;
    }
  }, [location, follow, map]);

  useEffect(() => {
    const handleDragStart = () => onUserInteraction();
    map.on('dragstart', handleDragStart);
    return () => map.off('dragstart', handleDragStart);
  }, [map, onUserInteraction]);

  return null;
};

const PermissionMessage = ({ type, onRetry }) => {
  const isDenied = type === 'denied';
  return (
    <div className="location-page-message">
      <div className="location-message-icon"><i className="fa-solid fa-location-crosshairs"></i></div>
      <h1>{isDenied ? 'Location access is off' : 'Turn on your location'}</h1>
      <p>{isDenied ? 'Enable location access for FixIt to see your position.' : 'Please make sure Location/GPS is turned on on your device, then tap Enable Location and allow access when asked.'}</p>
      {isDenied && <div className="location-instructions"><p><strong>iPhone:</strong> Settings &gt; Privacy &amp; Location Services &gt; Safari/Chrome</p><p><strong>Android:</strong> Settings &gt; Location, plus Chrome site permissions</p><p><strong>Desktop:</strong> select the lock icon in the address bar and allow Location</p></div>}
      <button className="location-action-button" onClick={onRetry}>{isDenied ? 'Try Again' : 'Enable Location'}</button>
    </div>
  );
};

const UserLocationMapPage = () => {
  const [permission, setPermission] = useState('prompt');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Finding your address...');
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(true);
  const [follow, setFollow] = useState(true);
  const [isPreciseEnough, setIsPreciseEnough] = useState(true);
  const watchId = useRef(null);
  const fixTimer = useRef(null);
  const bestFix = useRef(null);
  const lastGeocoded = useRef(null);
  const reverseTimer = useRef(null);
  const lastSaved = useRef(null);
  const lastSavedAt = useRef(0);

  const token = localStorage.getItem('fixitToken') || localStorage.getItem('token') || '';

  const stopWatching = useCallback(() => {
    if (watchId.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    if (fixTimer.current) clearTimeout(fixTimer.current);
  }, []);

  const reverseGeocode = useCallback(async (nextLocation) => {
    if (distanceInMeters(lastGeocoded.current, nextLocation) <= 50) return;
    lastGeocoded.current = nextLocation;
    if (reverseTimer.current) clearTimeout(reverseTimer.current);
    reverseTimer.current = setTimeout(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/geocode/reverse`, { params: { lat: nextLocation.latitude, lng: nextLocation.longitude } });
        setAddress(response.data.address || 'Address unavailable');
      } catch { setAddress('Address unavailable'); }
    }, 500);
  }, []);

  const saveLocation = useCallback(async (nextLocation) => {
    const now = Date.now();
    if (now - lastSavedAt.current < 30000 || distanceInMeters(lastSaved.current, nextLocation) < 20) return;
    lastSavedAt.current = now;
    lastSaved.current = nextLocation;
    try { await axios.put(`${API_URL}/api/users/me/location`, nextLocation, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); } catch { /* Saving is best effort. */ }
  }, [token]);

  const handlePosition = useCallback((position) => {
    const nextLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      capturedAt: new Date().toISOString(),
    };
    if (!bestFix.current || nextLocation.accuracy < bestFix.current.accuracy) bestFix.current = nextLocation;
    setLocation(nextLocation);
    setIsPreciseEnough(nextLocation.accuracy <= 100);
    setIsLocating(false);
    reverseGeocode(nextLocation);
    saveLocation(nextLocation);
    if (nextLocation.accuracy <= 30) {
      if (fixTimer.current) clearTimeout(fixTimer.current);
      setIsLocating(false);
    }
  }, [reverseGeocode, saveLocation]);

  const handleError = useCallback((geoError) => {
    stopWatching();
    setIsLocating(false);
    if (geoError.code === geoError.PERMISSION_DENIED) { setPermission('denied'); setError(''); return; }
    if (geoError.code === geoError.POSITION_UNAVAILABLE) setError('Turn on Location/GPS on your device and try again.');
    else if (geoError.code === geoError.TIMEOUT) setError('We could not get your location in time. Move outdoors and try again.');
    else setError('We could not get your location. Try again or check your browser settings.');
  }, [stopWatching]);

  const startWatching = useCallback(() => {
    setError('');
    if (!window.isSecureContext) { setError('Precise location requires a secure HTTPS connection.'); setIsLocating(false); return; }
    if (!navigator.geolocation) { setError('This browser does not support device location.'); setIsLocating(false); return; }
    if (/FBAN|FBAV|Instagram|Line\/|; wv\)|WebView/i.test(navigator.userAgent || '')) { setError('This in-app browser may block location. Open FixIt in Chrome or Safari.'); setIsLocating(false); return; }
    setPermission('granted');
    setIsLocating(true);
    bestFix.current = null;
    stopWatching();
    watchId.current = navigator.geolocation.watchPosition(handlePosition, handleError, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    fixTimer.current = setTimeout(() => {
      setIsLocating(false);
      if (bestFix.current) handlePosition({ coords: bestFix.current });
    }, 15000);
  }, [handleError, handlePosition, stopWatching]);

  const loadSavedLocation = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/me/location`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const savedLocation = response.data?.location;
      if (savedLocation?.latitude != null && savedLocation?.longitude != null) {
        setLocation(savedLocation);
        reverseGeocode(savedLocation);
        setIsLocating(false);
      }
    } catch { /* The enable screen remains available. */ }
  }, [reverseGeocode, token]);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      if (!navigator.permissions?.query) { setPermission('prompt'); setIsLocating(false); return; }
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (!active) return;
        setPermission(result.state);
        if (result.state === 'granted') startWatching();
        else { setIsLocating(false); if (result.state !== 'denied') await loadSavedLocation(); }
        result.onchange = () => setPermission(result.state);
      } catch { setPermission('prompt'); setIsLocating(false); }
    };
    initialize();
    return () => { active = false; stopWatching(); if (reverseTimer.current) clearTimeout(reverseTimer.current); };
  }, [loadSavedLocation, startWatching, stopWatching]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) stopWatching();
      else if (permission === 'granted') startWatching();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [permission, startWatching, stopWatching]);

  const showEnableScreen = !location && !error && permission !== 'granted';
  const showDenied = permission === 'denied' && !location;
  const mapCenter = location ? [location.latitude, location.longitude] : LAGOS_CENTER;

  return (
    <div className="user-location-page" style={{ height: 'calc(100vh - 72px)' }}>
      <header className="user-location-header"><Link to="/dashboard" className="back-dashboard-link"><i className="fa-solid fa-arrow-left"></i> Back to Dashboard</Link><h1>My Location</h1></header>
      <div className="user-location-map-shell">
        <MapContainer center={mapCenter} zoom={location ? 17 : 12} zoomControl={false} className="user-location-map">
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ZoomControl position="bottomright" />
          <MapViewport location={location} follow={follow} onUserInteraction={() => setFollow(false)} />
          {location && <><Circle center={mapCenter} radius={location.accuracy} pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.18, weight: 2 }} /><Marker position={mapCenter} icon={locationIcon} /></>}
        </MapContainer>
        {location && <div className="location-address-chip"><i className="fa-solid fa-location-dot"></i><span>{address}<small>Accurate to ±{Math.round(location.accuracy)} m</small></span></div>}
        {location && <button className="my-location-button" aria-label="Center map on my location" title="My Location" onClick={() => { setFollow(true); setLocation((current) => current ? { ...current } : current); }}><i className="fa-solid fa-crosshairs"></i></button>}
        {showEnableScreen && <div className="location-page-overlay"><PermissionMessage type="prompt" onRetry={startWatching} /></div>}
        {showDenied && <div className="location-page-overlay"><PermissionMessage type="denied" onRetry={startWatching} /></div>}
        {error && <div className="location-page-overlay"><PermissionMessage type="error" onRetry={startWatching} /><p className="location-page-error">{error}</p></div>}
        {isLocating && <div className="locating-indicator"><span className="spinner-border spinner-border-sm"></span> Locating you...</div>}
        {location && !isPreciseEnough && <div className="precision-banner">Your location isn&apos;t very precise. Move outdoors or turn on high-accuracy/GPS mode.</div>}
      </div>
    </div>
  );
};

export default UserLocationMapPage;
