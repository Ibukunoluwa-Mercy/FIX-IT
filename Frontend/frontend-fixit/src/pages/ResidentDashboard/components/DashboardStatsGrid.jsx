import { useNavigate } from 'react-router-dom';

const DashboardStatsGrid = ({ stats = {}, loading }) => {
  const navigate = useNavigate();

  const cards = [
    ['My Reports', stats.totalActiveReports ?? 0, 'Active', 'fa-solid fa-file-lines', 'orange', '/reports'],
    ['Resolved', stats.resolvedThisMonth ?? 0, 'This Month', 'fa-solid fa-chart-line', 'green', '/reports'],
    ['Impact Score', stats.impactScore ?? 0, 'Keep it going!', 'fa-solid fa-star', 'amber', null],
    ['Community Rank', stats.rank || 'Top 0%', 'In your city', 'fa-solid fa-users', 'blue', '/map'],
  ];

  return (
    <section className="row g-3 stats-grid" aria-label="Overview statistics">
      {cards.map(([label, value, note, iconClass, tone, path]) => (
        <article className="col-12 col-sm-6 col-xl-3" key={label}>
          <div className={`stat-card stat-${tone}`}>
            <span className="stat-icon">
              <i className={iconClass} style={{ fontSize: 17 }}></i>
            </span>
            <span className="stat-label">{label}</span>
            <strong className="stat-value">
              {loading ? <span className="skeleton skeleton-value" /> : value}
            </strong>
            <small>{note}</small>
            <button onClick={() => (path ? navigate(path) : console.info(`${label} details`))}>
              {label === 'Impact Score'
                ? 'Details'
                : label === 'Community Rank'
                ? 'View leaderboard'
                : 'View all'}
              <i className="fa-solid fa-chevron-right ms-1" style={{ fontSize: 11 }}></i>
            </button>
          </div>
        </article>
      ))}
    </section>
  );
};

export default DashboardStatsGrid;
