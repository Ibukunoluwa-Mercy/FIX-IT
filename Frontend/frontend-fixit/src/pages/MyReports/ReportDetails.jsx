import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getReportImageUrls, normalizeReportImageUrl } from '../../utils/reportImages';
import ReportStatusStepper from './ReportStatusStepper';
import './ReportDetails.css';

const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100').replace(/\/$/, '');
const NEW_REPORT_HOURS = 24;

const formatDate = (value, options = { dateStyle: 'medium', timeStyle: 'short' }) =>
  value ? new Intl.DateTimeFormat(undefined, options).format(new Date(value)) : 'Date unavailable';

const PersonAvatar = ({ name, imageUrl }) => (
  <span className="report-person-avatar">
    {imageUrl
      ? <img src={normalizeReportImageUrl(imageUrl)} alt="" />
      : (name || 'R').trim().charAt(0).toUpperCase()}
  </span>
);

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState({ id: null, report: null, reporter: null, comments: [], loading: true, error: '', isNew: false });
  const token = localStorage.getItem('fixitToken');

  useEffect(() => {
    let active = true;
    if (!token) {
      navigate('/login');
      return () => { active = false; };
    }

    
    const requestOptions = { headers: { Authorization: `Bearer ${token}` } };
    const detailRequest = axios.get(`${API_URL}/api/reports/${id}`, requestOptions);
    const commentsRequest = axios.get(`${API_URL}/api/reports/${id}/comments`, requestOptions)
      .then(({ data }) => data)
      .catch(() => ({ comments: [] }));

    
    Promise.all([detailRequest, commentsRequest])
      .then(([{ data: report }, commentData]) => {
        if (!active) return;
        
        const createdTime = report?.reportedAt || report?.createdAt ? new Date(report.reportedAt || report.createdAt).getTime() : NaN;
        const ageHours = (Date.now() - createdTime) / 3600000;
        setDetail({
          id,
          report,
          reporter: report.reportedBy,
          comments: Array.isArray(commentData.comments) ? commentData.comments : [],
          loading: false,
          error: '',
          isNew: ageHours >= 0 && ageHours <= NEW_REPORT_HOURS,
        });
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401) {
          localStorage.removeItem('fixitToken');
          navigate('/login');
          return;
        }
        setDetail({
          id,
          report: null,
          reporter: null,
          comments: [],
          loading: false,
          error: requestError.response?.data?.error || 'Unable to load this report.',
          isNew: false,
        });
      });

    return () => { active = false; };
  }, [id, navigate, token]);

  const isCurrentDetail = detail.id === id;
  const loading = !isCurrentDetail || detail.loading;
  const report = isCurrentDetail ? detail.report : null;
  const reporter = isCurrentDetail ? detail.reporter : null;
  const comments = isCurrentDetail ? detail.comments : [];
  const error = isCurrentDetail ? detail.error : '';

  if (loading) return <div className="report-detail-state" role="status">Loading report details...</div>;
  if (error || !report) {
    return (
      <div className="report-detail-state report-detail-error" role="alert">
        <p>{error || 'Report not found.'}</p>
        <Link to="/reports">Back to My Reports</Link>
      </div>
    );
  }

  
  const photos = getReportImageUrls(report);
  const createdAt = report.reportedAt || report.createdAt;
  const isNew = detail.isNew;
  const location = report.location || {};
  const address = location.addressText || location.address || 'Location unavailable';
  const latitude = Number(location.latitude ?? location.lat);
  const longitude = Number(location.longitude ?? location.lng);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapUrl = hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` : '';
  const mapBounds = hasCoordinates
    ? `${longitude - 0.015},${latitude - 0.01},${longitude + 0.015},${latitude + 0.01}`
    : '';
  const updates = (Array.isArray(report.updates) ? report.updates : []).map((update, index) => ({
    id: `update-${index}`,
    name: update.author || reporter?.name || 'FixIt',
    text: update.text,
    createdAt: update.timestamp,
    kind: 'update',
  }));
  const reportComments = comments.map((comment) => ({
    id: comment.id,
    name: comment.commenter?.name || 'Community member',
    imageUrl: comment.commenter?.avatar,
    text: comment.message,
    createdAt: comment.timestamp,
    kind: comment.type || 'comment',
  }));
  const activity = [...updates, ...reportComments]
    .filter((item) => item.text)
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

  return (
    <div className="report-details-page">
      <Link className="report-back-link" to="/reports">
        <i className="fa-solid fa-arrow-left" /> Back to My Reports
      </Link>

      <div className="report-details-layout">
        
        <div className="report-details-main-column">
          <section className="report-details-card report-overview-card">
            {photos[0] ? (
              <img className="report-cover-image" src={photos[0]} alt={`${report.title || report.category} report`} />
            ) : (
              <div className="report-cover-placeholder"><i className="fa-regular fa-image" /> No report photo</div>
            )}
            <div className="report-overview-copy">
              <div className="report-overview-tags">
                {isNew && <span className="report-new-badge">NEW</span>}
                <span className="report-category-tag">{report.category || 'Community report'}</span>
              </div>
              <h1>{report.title || report.category || 'Report details'}</h1>
              <p className="report-overview-location"><i className="fa-solid fa-location-dot" />{address}</p>
              <p className="report-overview-date"><i className="fa-regular fa-clock" />Reported on {formatDate(createdAt)}</p>
              <p className="report-overview-description">{report.description || 'No description was provided.'}</p>
            </div>
          </section>

          <section className="report-details-card report-facts-card">
            <div className="report-card-heading">
              <h2>Report Details</h2>
              <button className="report-edit-button" type="button" disabled title="Report editing is not available yet">
                <i className="fa-solid fa-pen" /> Edit Report
              </button>
            </div>
            <dl className="report-facts-grid">
              <div><dt>Reported by</dt><dd className="report-reporter"><PersonAvatar name={reporter?.name || 'Resident'} imageUrl={reporter?.avatar} />{reporter?.name || 'Resident'}</dd></div>
              <div><dt>Category</dt><dd>{report.category || 'Not specified'}</dd></div>
              <div><dt>Location</dt><dd>{address}</dd></div>
              <div className="report-fact-description"><dt>Description</dt><dd>{report.description || 'No description was provided.'}</dd></div>
            </dl>
            <div className="report-photo-section">
              <h3>Photos</h3>
              {photos.length ? (
                <div className="report-photo-gallery">
                  {photos.map((photo, index) => <img key={`${photo}-${index}`} src={photo} alt={`${report.title || 'Report'} photo ${index + 1}`} loading="lazy" />)}
                </div>
              ) : <p className="report-muted-copy">No photos were attached to this report.</p>}
            </div>
          </section>

          <section className="report-details-card report-activity-card">
            <div className="report-card-heading"><h2>Comments &amp; Updates</h2></div>
            <label className="report-comment-entry">
              <span className="visually-hidden">Add a comment</span>
              <input type="text" placeholder="Add a comment..." />
            </label>
            {activity.length ? (
              <ol className="report-activity-list">
                {activity.map((item) => (
                  <li className="report-activity-item" key={item.id}>
                    <PersonAvatar name={item.name} imageUrl={item.imageUrl} />
                    <div className="report-activity-copy">
                      <div className="report-activity-meta"><strong>{item.name}</strong><time>{formatDate(item.createdAt)}</time></div>
                      <p>{item.text}</p>
                      {item.kind === 'update' && <small>Report update</small>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="report-muted-copy">No comments or updates yet.</p>}
          </section>
        </div>

        
        <aside className="report-details-side-column">
          <section className="report-details-card report-status-card">
            <h2>Report Status</h2>
            <ReportStatusStepper
              status={report.status}
              timestamps={{
                Reported: report.reportedAt || createdAt,
                'In Progress': report.inProgressAt,
                Resolved: report.resolvedAt,
                Closed: report.closedAt,
              }}
            />
          </section>
          <section className="report-details-card report-location-card">
            <h2>Location</h2>
            {hasCoordinates ? (
              <iframe
                title="Report location map preview"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds}&layer=mapnik&marker=${latitude},${longitude}`}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : <div className="report-map-placeholder"><i className="fa-solid fa-map-location-dot" />Map preview unavailable</div>}
            <p><i className="fa-solid fa-location-dot" />{address}</p>
            {mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer">View on Map <i className="fa-solid fa-arrow-up-right-from-square" /></a>}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default ReportDetails;
