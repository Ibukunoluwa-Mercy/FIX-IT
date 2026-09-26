const LocationSearchControls = ({
  dropdownRef,
  query,
  handleInputChange,
  results,
  setShowDropdown,
  showDropdown,
  isSearching,
  isReverseGeocoding,
  coordsLocked,
  isLocating,
  handleGetCurrentLocation,
  locationError,
  locationSource,
  accuracy,
  handleResultSelect,
  emptyMessage,
}) => {
  return (
    <div className="location-search-wrapper" ref={dropdownRef}>
      <div className="search-controls-container d-flex gap-2 mb-2">
        <div className="search-input-box location-search-grow position-relative">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="form-control location-search-input"
            placeholder="Search for a street, landmark, or area..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
          />
          <div className="search-status-indicators">
            {isSearching || isReverseGeocoding ? (
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
        <div className="location-empty-message location-error-message mb-2" role="alert">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{locationError}</span>
          <button type="button" onClick={handleGetCurrentLocation}>
            Try Again
          </button>
        </div>
      )}
      {isLocating && (
        <div className="location-status" role="status">
          <span className="spinner-border spinner-border-sm"></span>
          <span>Getting your exact location...</span>
          {accuracy != null && <small>Accuracy: ±{Math.round(accuracy)} m</small>}
        </div>
      )}
      {!isLocating && locationSource === 'gps' && accuracy != null && !locationError && (
        <div className="location-status location-success" role="status">
          <i className="fa-solid fa-circle-check"></i>
          <span>Location captured</span>
          <small>Accuracy: ±{Math.round(accuracy)} m</small>
        </div>
      )}

      {/* Dropdown Results */}
      {showDropdown && results.length > 0 && (
        <ul className="location-results-dropdown shadow-sm">
          {results.map((res) => (
            <li
              key={`${res.latitude}-${res.longitude}-${res.label}`}
              className="location-result-item"
              onClick={() => handleResultSelect(res)}
            >
              <i className="fa-solid fa-location-dot item-icon"></i>
              <span>{res.label}</span>
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
  );
};

export default LocationSearchControls;
