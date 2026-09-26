import React from 'react';

const HelpSearchBar = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onSearchSubmit,
  hasSearchFilter,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  return (
    <div className="help-search-wrapper">
      <div className="help-search-bar">
        <i className="fa-solid fa-magnifying-glass help-search-icon" aria-hidden="true"></i>
        <input
          type="text"
          className="help-search-input"
          placeholder="Search for help articles, FAQs, or topics..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search help center"
        />
        {searchQuery && (
          <button
            type="button"
            className="help-search-clear-btn"
            onClick={onClearSearch}
            aria-label="Clear search query"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
        <button
          type="button"
          className="help-search-btn"
          onClick={onSearchSubmit}
        >
          Search
        </button>
      </div>

      {hasSearchFilter && (
        <div className="help-search-status">
          <span>
            Showing search results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
          </span>
          <button type="button" onClick={onClearSearch}>
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default HelpSearchBar;
