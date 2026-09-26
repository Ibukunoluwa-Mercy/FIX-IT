import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const DashboardLocationPreview = ({ onOpen }) => {
  const [location, setLocation] = useState(null);
  const token = localStorage.getItem('fixitToken') || localStorage.getItem('token') || '';

  useEffect(() => {
    let active = true;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const loadSavedLocation = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/me/location`, { headers });
        const savedLocation = response.data?.location;
        if (active && savedLocation?.latitude != null && savedLocation?.longitude != null) {
          setLocation(savedLocation);
        }
      } catch {
        /* The placeholder remains when no saved location exists. */
      }
    };
    const loadQuietly = () => {
      if (!navigator.geolocation) return loadSavedLocation();
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (active) {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          }
        },
        () => loadSavedLocation(),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    };
    if (!navigator.permissions?.query) {
      loadSavedLocation();
    } else {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission) => {
          if (!active) return;
          if (permission.state === 'granted') loadQuietly();
          else loadSavedLocation();
        })
        .catch(loadSavedLocation);
    }
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <button
      type="button"
      className="issue-map-preview-button"
      onClick={onOpen}
      aria-label="Open my location map"
    >
      <span className="map-grid" />
      {location ? (
        <span className="dashboard-user-dot" aria-hidden="true" />
      ) : (
        <span className="location-preview-placeholder">Enable location to see where you are</span>
      )}
    </button>
  );
};

export default DashboardLocationPreview;
