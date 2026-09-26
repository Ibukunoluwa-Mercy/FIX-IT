import { useNavigate } from 'react-router-dom';

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Just now';

const statusClass = (status = 'Pending') => status.toLowerCase().replace(/\s+/g, '-');

const DashboardRecentReports = ({
  loading,
  reports = [],
  onSelectReport,
  onCreateReport,
}) => {
  const navigate = useNavigate();

  return (
    <section className="dashboard-panel reports-panel">
      <div className="panel-heading">
        <h2>Recent Reports</h2>
        <button className="panel-header-link" onClick={() => navigate('/reports')}>
          View All <i className="fa-solid fa-chevron-right ms-1" style={{ fontSize: 12 }}></i>
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <span className="skeleton skeleton-line" />
          <span className="skeleton skeleton-line" />
        </div>
      ) : reports.length ? (
        <div className="reports-list">
          {reports.map((report) => (
            <button
              className="report-row"
              key={report._id || report.reportId}
              onClick={() => onSelectReport(report)}
            >
              <span className="report-thumb">
                {report.imageUrl ? (
                  <img src={report.imageUrl} alt="" />
                ) : (
                  <i className="fa-solid fa-file-lines" style={{ fontSize: 18, color: '#94a3b8' }}></i>
                )}
              </span>
              <span className="report-details">
                <small>{report.reportId || `#${String(report._id).slice(-8)}`}</small>
                <strong>{report.title}</strong>
                <span>
                  {formatDate(report.createdAt)} &nbsp;•&nbsp;{' '}
                  {report.location?.address || 'Location unavailable'}
                </span>
                <i className={`progress-line ${statusClass(report.status)}`} />
              </span>
              <span className={`status-pill ${statusClass(report.status)}`}>
                <i />
                {report.status}
              </span>
              <i className="fa-solid fa-chevron-right row-chevron" style={{ fontSize: 14 }}></i>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state empty-state-reports">
          <div className="empty-illustration-reports">
            <svg width="180" height="110" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="90" cy="70" rx="64" ry="34" fill="#FFF4EA" opacity="0.6" />
              <path d="M20 92C32 82 50 84 62 87" stroke="#FFE3CC" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M42 90V76" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="36" cy="73" r="4.5" fill="#74C69D" />
              <circle cx="48" cy="70" r="4.5" fill="#74C69D" />
              <circle cx="42" cy="64" r="5" fill="#52B788" />
              <path d="M142 90V78" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="137" cy="75" r="4" fill="#74C69D" />
              <circle cx="147" cy="73" r="4" fill="#74C69D" />
              <circle cx="142" cy="67" r="4.5" fill="#52B788" />
              <rect x="64" y="24" width="52" height="66" rx="8" fill="#FFFFFF" stroke="#8E857B" strokeWidth="2.5" />
              <rect x="79" y="19" width="22" height="9" rx="3.5" fill="#4B5563" />
              <circle cx="90" cy="17" r="3" fill="#D1D5DB" />
              <rect x="76" y="36" width="28" height="2.5" rx="1.25" fill="#9CA3AF" />
              <rect x="72" y="44" width="36" height="2.5" rx="1.25" fill="#CBD5E1" />
              <rect x="72" y="52" width="24" height="2.5" rx="1.25" fill="#CBD5E1" />
              <rect x="72" y="60" width="30" height="2.5" rx="1.25" fill="#CBD5E1" />
              <rect x="72" y="68" width="18" height="2.5" rx="1.25" fill="#CBD5E1" />
              <circle cx="102" cy="64" r="12" fill="#FFFFFF" stroke="#374151" strokeWidth="3" />
              <line x1="111" y1="73" x2="122" y2="84" stroke="#374151" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="empty-title">No reports yet</h3>
          <p className="empty-subtitle">You haven&apos;t submitted any community reports.</p>
          <button className="empty-cta-btn" onClick={onCreateReport}>
            Create Your First Report
          </button>
        </div>
      )}
    </section>
  );
};

export default DashboardRecentReports;
