import { useState, useRef, useCallback, useEffect } from 'react';
import { API_URL, getAuthHeaders } from './mapUtils';

export const useLocationPickerSearch = (initialAddress, onSelectLocation) => {
  const [query, setQuery] = useState(initialAddress || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');

  const lastRequestTime = useRef(0);
  const debounceTimer = useRef(null);
  const dropdownRef = useRef(null);

  const searchNominatim = useCallback(async (searchQuery) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setShowDropdown(false);
      setEmptyMessage('');
      return;
    }

    const now = Date.now();
    const timeSinceLastReq = now - lastRequestTime.current;
    if (timeSinceLastReq < 1000) {
      debounceTimer.current = setTimeout(() => searchNominatim(searchQuery), 1000 - timeSinceLastReq);
      return;
    }

    lastRequestTime.current = Date.now();
    setIsSearching(true);
    setEmptyMessage('');

    try {
      const response = await fetch(
        `${API_URL}/api/geocode/search?q=${encodeURIComponent(searchQuery)}`,
        { headers: getAuthHeaders() }
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
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchNominatim(val);
    }, 500);
  };

  const handleResultSelect = (result) => {
    const lat = parseFloat(result.latitude);
    const lon = parseFloat(result.longitude);
    setShowDropdown(false);
    setResults([]);
    if (onSelectLocation) {
      onSelectLocation(lat, lon, result.label);
    }
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

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  return {
    query,
    setQuery,
    results,
    setResults,
    isSearching,
    showDropdown,
    setShowDropdown,
    emptyMessage,
    dropdownRef,
    handleInputChange,
    handleResultSelect,
  };
};

export default useLocationPickerSearch;
