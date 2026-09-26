import React from 'react';

const HelpQuickOptions = ({ items, onSelectTopic }) => {
  return (
    <section className="help-card-section" aria-label="Quick Help Options">
      <div className="help-section-header">
        <h2>Quick Help Options</h2>
        <p>Get started with the most common tasks and resources.</p>
      </div>
      <div className="help-rows-list">
        {items.length === 0 ? (
          <p className="text-muted small py-2 mb-0">No quick help options match your search.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id || item.slug}
              className="help-item-row"
              onClick={() => onSelectTopic(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectTopic(item)}
              aria-label={`Open walkthrough for ${item.title}`}
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

export default HelpQuickOptions;
