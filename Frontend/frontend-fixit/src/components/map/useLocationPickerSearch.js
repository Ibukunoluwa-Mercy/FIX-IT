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
  const requestId = useRef(0);

  const executeSearch = useCallback((searchQuery, requestVersion) => {
    lastRequestTime.current = Date.now();
    setIsSearching(true);
    setEmptyMessage('');

    // Keep the typed text intact in the request; only URL-encode it for safe transport.
    fetch(`${API_URL}/api/geocode/search?q=${encodeURIComponent(searchQuery)}`, { headers: getAuthHeaders() })
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        // A slow response for an older query must never replace the newest query's results.
        if (requestVersion !== requestId.current) return;
        const matches = Array.isArray(data) ? data : [];
        setResults(matches);
        setShowDropdown(true);
        if (matches.length === 0) setEmptyMessage('No matching locations found.');
      })
      .catch((error) => {
        if (requestVersion !== requestId.current) return;
        console.error('Geocoding error:', error);
        setEmptyMessage('Search failed. Please try again.');
        setResults([]);
      })
      .finally(() => {
        if (requestVersion === requestId.current) setIsSearching(false);
      });
  }, []);

  const searchNominatim = useCallback((searchQuery, requestVersion) => {
    if (requestVersion !== requestId.current) return;
    if (searchQuery.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      setEmptyMessage('');
      return;
    }

    const timeSinceLastReq = Date.now() - lastRequestTime.current;
    if (timeSinceLastReq < 1000) {
      debounceTimer.current = setTimeout(
        () => executeSearch(searchQuery, requestVersion),
        1000 - timeSinceLastReq
      );
      return;
    }
    executeSearch(searchQuery, requestVersion);
  }, [executeSearch]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Invalidate in-flight results immediately, not after the debounce, so older responses cannot flash over new typing.
    const requestVersion = ++requestId.current;
    setQuery(val);
    setResults([]);
    setShowDropdown(false);
    setEmptyMessage('');
    setIsSearching(false);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    // Capture the complete current field value; a later keystroke replaces this timer with its own full query.
    debounceTimer.current = setTimeout(() => {
      searchNominatim(val, requestVersion);
    }, 500);
  };

  const retrySearch = () => {
    // Retry the visible query immediately while giving its response a fresh version token.
    const requestVersion = ++requestId.current;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    searchNominatim(query, requestVersion);
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
    requestId.current += 1;
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
    retrySearch,
  };
};

export default useLocationPickerSearch;
