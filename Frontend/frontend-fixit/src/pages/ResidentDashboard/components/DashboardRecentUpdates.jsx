const formatDate = (value) =>
  value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Just now';

const DashboardRecentUpdates = ({ loading, updates = [] }) => {
  return (
    <section className="dashboard-panel updates-panel">
      <div className="panel-heading">
        <h2>Recent Updates</h2>
      </div>
      {loading ? (
        <div className="empty-state compact">
          <span className="skeleton skeleton-line" />
          <span className="skeleton skeleton-line" />
        </div>
      ) : updates.length ? (
        <div className="timeline">
          {updates.map((update, index) => (
            <div className="timeline-item" key={`${update.timestamp}-${index}`}>
              <span className={`timeline-dot ${index % 2 ? 'grey' : 'orange'}`}>
                <i className="fa-solid fa-chart-line" style={{ fontSize: 12 }}></i>
              </span>
              <div>
                <small>{update.type?.replace('_', ' ')}</small>
                <p>{update.text}</p>
                <time>{formatDate(update.timestamp)}</time>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-updates">
          <div className="empty-bell-circle">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22 11C17.5817 11 14 14.5817 14 19V24.5C14 25.5 13 26.5 11.5 27.5C10.8 27.97 11.15 29 12 29H32C32.85 29 33.2 27.97 32.5 27.5C31 26.5 30 25.5 30 24.5V19C30 14.5817 26.4183 11 22 11Z"
                fill="#FDBA74"
              />
              <circle cx="22" cy="8.5" r="2.5" fill="#FB923C" />
              <ellipse cx="22" cy="31" rx="3.5" ry="2" fill="#F97316" />
              <line x1="8" y1="17" x2="10" y2="18.5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
              <line x1="36" y1="17" x2="34" y2="18.5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="23" x2="6.5" y2="23.5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
              <line x1="35" y1="23" x2="37.5" y2="23.5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="empty-updates-text">
            <strong>No updates available</strong>
            <span>Updates related to your reports will appear here.</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default DashboardRecentUpdates;
