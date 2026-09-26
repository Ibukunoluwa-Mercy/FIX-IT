export const NEARBY_RADIUS = 150;
export const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('fixitToken') || localStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `${API_URL}/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error('Geocode failed');
    const data = await res.json();
    return data.address;
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return null;
  }
};
