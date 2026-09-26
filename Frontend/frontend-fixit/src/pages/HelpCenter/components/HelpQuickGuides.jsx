import React from 'react';

const HelpQuickGuides = ({ guides, onSelectTopic }) => {
  return (
    <section className="help-card-section" aria-label="Quick Guides">
      <div className="help-section-header">
        <h2>Quick Guides</h2>
        <p>Step-by-step guides to help you get started.</p>
      </div>
      <div className="help-rows-list">
        {guides.length === 0 ? (
          <p className="text-muted small py-2 mb-0">No guides match your search.</p>
        ) : (
          guides.map((guide) => (
            <div
              key={guide.id || guide.slug}
              className="help-item-row"
              onClick={() => onSelectTopic(guide)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectTopic(guide)}
              aria-label={`Open guide ${guide.title}`}
            >
              <div className="help-row-left">
                <div className="help-guide-icon-box" aria-hidden="true">
                  <i className={guide.icon || 'fa-solid fa-file-lines'}></i>
                </div>
                <div className="help-row-text">
                  <h3 className="help-row-title">{guide.title}</h3>
                  <p className="help-row-desc">{guide.readTime || '2 min read'}</p>
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

export default HelpQuickGuides;
