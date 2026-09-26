import React from 'react';

const HelpCategories = ({ categories, onSelectTopic }) => {
  return (
    <section className="help-card-section" aria-label="Browse by Category">
      <div className="help-section-header">
        <h2>Browse by Category</h2>
        <p>Quickly find help articles related to your needs.</p>
      </div>
      <div className="help-rows-list">
        {categories.length === 0 ? (
          <p className="text-muted small py-2 mb-0">No categories match your search.</p>
        ) : (
          categories.map((item) => (
            <div
              key={item.id || item.slug}
              className="help-item-row"
              onClick={() => onSelectTopic(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectTopic(item)}
              aria-label={`Open topic ${item.title}`}
            >
              <div className="help-row-left">
                <div
                  className="help-row-icon-box"
                  style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                  aria-hidden="true"
                >
                  <i className={item.icon}></i>
                </div>
                <div className="help-row-text">
                  <h3 className="help-row-title">{item.title}</h3>
                  <p className="help-row-desc">{item.description}</p>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right help-row-arrow" aria-hidden="true"></i>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default HelpCategories;
