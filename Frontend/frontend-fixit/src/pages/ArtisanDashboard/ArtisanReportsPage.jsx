import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './ArtisanReportsPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const formatDate = (value) => {
    if (!value) return 'Recently';
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

const ArtisanReportsPage = ({ onReportStatusChanged }) => {
    const [reports, setReports] = useState([]);
    const [totalReportsCount, setTotalReportsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unclaimed, my_jobs, resolved
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Confirmation Modals State
    const [applyModalReport, setApplyModalReport] = useState(null);
    const [resolveModalReport, setResolveModalReport] = useState(null);

    const token = localStorage.getItem('fixitToken');

    const fetchReports = (isSilent = false) => {
        if (!isSilent) setLoading(true);

        fetch(`${API_URL}/api/artisans/reports?filter=${filter}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load reports feed');
                return res.json();
            })
            .then((data) => {
                setReports(data.reports || []);
                if (typeof data.totalAllReports === 'number') {
                    setTotalReportsCount(data.totalAllReports);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching artisan reports:', err);
                if (!isSilent) toast.error(err.message || 'Could not load reports');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchReports();
        // Polling interval every 20 seconds for real-time responsiveness
        const timer = setInterval(() => {
            fetchReports(true);
        }, 20000);

        return () => clearInterval(timer);
    }, [filter]);

    // Handle Confirm Apply
    const handleConfirmApply = () => {
        if (!applyModalReport) return;
        const reportId = applyModalReport.id;
        setActionLoadingId(reportId);

        fetch(`${API_URL}/api/artisans/reports/${reportId}/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.status === 409) {
                    throw new Error(data.message || 'This report has already been claimed by another artisan.');
                }
                if (!res.ok) {
                    throw new Error(data.error || data.message || 'Failed to claim this report');
                }
                return data;
            })
            .then((data) => {
                toast.success(data.message || 'Report claimed! It is now in progress.');
                // Immediately update local state to reflect In Progress
                setReports((prev) =>
                    prev.map((r) =>
                        r.id === reportId
                            ? {
                                  ...r,
                                  status: 'in_progress',
                                  isClaimedByMe: true,
                                  isClaimedByOther: false,
                                  isUnclaimed: false,
                              }
                            : r
                    )
                );
                setApplyModalReport(null);
                if (onReportStatusChanged) onReportStatusChanged();
            })
            .catch((err) => {
                toast.error(err.message);
                // Refresh list to update claimed statuses
                fetchReports(true);
                setApplyModalReport(null);
            })
            .finally(() => {
                setActionLoadingId(null);
            });
    };

    // Handle Confirm Resolve
    const handleConfirmResolve = () => {
        if (!resolveModalReport) return;
        const reportId = resolveModalReport.id;
        setActionLoadingId(reportId);

        fetch(`${API_URL}/api/artisans/reports/${reportId}/resolve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || data.message || 'Failed to mark job as resolved');
                }
                return data;
            })
            .then((data) => {
                toast.success(data.message || 'Job marked as resolved!');
                // Immediately update local state
                setReports((prev) =>
                    prev.map((r) =>
                        r.id === reportId
                            ? {
                                  ...r,
                                  status: 'resolved',
                                  resolvedAt: data.report?.resolvedAt || new Date().toISOString(),
                              }
                            : r
                    )
                );
                setResolveModalReport(null);
                if (onReportStatusChanged) onReportStatusChanged();
            })
            .catch((err) => {
                toast.error(err.message);
                setResolveModalReport(null);
            })
            .finally(() => {
                setActionLoadingId(null);
            });
    };

    return (
        <div className="artisan-reports-page">
            {/* Page Header */}
            <div className="reports-page-header">
                <div>
                    <h1 className="page-title">Community Reports Feed</h1>
                    <p className="page-subtitle">
                        Discover open issues submitted by residents, claim jobs in your skill area, and update progress.
                    </p>
                </div>
                <div className="reports-summary-chip">
                    <span className="chip-label">Total System Reports:</span>
                    <strong className="chip-count">{totalReportsCount || reports.length}</strong>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="reports-filter-bar">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Reports
                </button>
                <button
                    className={`filter-tab ${filter === 'unclaimed' ? 'active' : ''}`}
                    onClick={() => setFilter('unclaimed')}
                >
                    <i className="fa-solid fa-bolt me-1" style={{ color: '#f59e0b' }}></i>
                    Open to Claim
                </button>
                <button
                    className={`filter-tab ${filter === 'my_jobs' ? 'active' : ''}`}
                    onClick={() => setFilter('my_jobs')}
                >
                    <i className="fa-solid fa-briefcase me-1"></i>
                    My Active Jobs
                </button>
                <button
                    className={`filter-tab ${filter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setFilter('resolved')}
                >
                    <i className="fa-solid fa-circle-check me-1" style={{ color: '#10b981' }}></i>
                    Resolved Jobs
                </button>
            </div>

            {/* Reports List */}
            {loading ? (
                <div className="reports-feed-loading">
                    <div className="feed-skeleton-card"></div>
                    <div className="feed-skeleton-card"></div>
                    <div className="feed-skeleton-card"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="reports-feed-empty">
                    <div className="empty-feed-icon">
                        <i className="fa-regular fa-folder-open"></i>
                    </div>
                    <h3>No reports found</h3>
                    <p>
                        {filter === 'unclaimed'
                            ? 'Great job! There are currently no open unclaimed reports.'
                            : filter === 'my_jobs'
                            ? "You haven't claimed any active jobs yet. Browse open reports to apply!"
                            : 'There are no reports matching this filter.'}
                    </p>
                    {filter !== 'all' && (
                        <button className="reset-filter-btn" onClick={() => setFilter('all')}>
                            View All Reports
                        </button>
                    )}
                </div>
            ) : (
                <div className="reports-cards-grid">
                    {reports.map((report) => {
                        const isActionDisabled = actionLoadingId === report.id;

                        return (
                            <article className={`report-feed-card ${report.isClaimedByOther ? 'is-claimed-other' : ''}`} key={report.id}>
                                <div className="card-top-row">
                                    <div className="category-meta">
                                        <span className="category-pill">{report.category}</span>
                                        <span className="report-code">{report.reportId}</span>
                                    </div>
                                    <div className="status-badge-wrapper">
                                        {report.status === 'reported' && (
                                            <span className="badge-custom badge-orange">
                                                <i className="fa-solid fa-circle-dot me-1"></i> Reported
                                            </span>
                                        )}
                                        {report.status === 'in_progress' && (
                                            <span className="badge-custom badge-blue">
                                                <i className="fa-solid fa-spinner fa-spin me-1"></i> In Progress
                                            </span>
                                        )}
                                        {report.status === 'resolved' && (
                                            <span className="badge-custom badge-green">
                                                <i className="fa-solid fa-circle-check me-1"></i> Resolved
                                            </span>
                                        )}
                                        {report.status === 'closed' && (
                                            <span className="badge-custom badge-gray">
                                                <i className="fa-solid fa-lock me-1"></i> Closed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="card-body-content">
                                    <h3 className="report-card-title">{report.title}</h3>
                                    <p className="report-card-desc">
                                        {report.description
                                            ? report.description.length > 130
                                                ? `${report.description.slice(0, 130)}...`
                                                : report.description
                                            : 'No additional description provided.'}
                                    </p>
                                </div>

                                <div className="card-footer-info">
                                    <div className="info-item">
                                        <i className="fa-solid fa-location-dot"></i>
                                        <span title={report.location?.address}>{report.location?.address || 'Community Area'}</span>
                                    </div>
                                    <div className="info-item">
                                        <i className="fa-regular fa-calendar"></i>
                                        <span>{formatDate(report.reportedAt)}</span>
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className="card-action-bar">
                                    {/* 1. Unclaimed: Orange Apply Button */}
                                    {report.isUnclaimed && (
                                        <button
                                            className="btn-apply-claim"
                                            onClick={() => setApplyModalReport(report)}
                                            disabled={isActionDisabled}
                                        >
                                            <i className="fa-solid fa-hand-holding-hand me-1"></i>
                                            {isActionDisabled ? 'Claiming...' : 'Apply'}
                                        </button>
                                    )}

                                    {/* 2. Claimed By Current Artisan */}
                                    {report.isClaimedByMe && report.status === 'in_progress' && (
                                        <div className="claimed-artisan-action">
                                            <div className="mini-stepper">
                                                <span className="mini-step completed">
                                                    <i className="fa-solid fa-check"></i> Reported
                                                </span>
                                                <span className="step-arrow">→</span>
                                                <span className="mini-step active">
                                                    <i className="fa-solid fa-wrench"></i> In Progress
                                                </span>
                                            </div>
                                            <button
                                                className="btn-mark-resolved"
                                                onClick={() => setResolveModalReport(report)}
                                                disabled={isActionDisabled}
                                            >
                                                <i className="fa-solid fa-circle-check me-1"></i>
                                                {isActionDisabled ? 'Updating...' : 'Mark as Resolved'}
                                            </button>
                                        </div>
                                    )}

                                    {/* 3. Already Resolved / Closed by this artisan */}
                                    {report.isClaimedByMe && (report.status === 'resolved' || report.status === 'closed') && (
                                        <div className="resolved-status-box">
                                            <div className="mini-stepper">
                                                <span className="mini-step completed">
                                                    <i className="fa-solid fa-check"></i> In Progress
                                                </span>
                                                <span className="step-arrow">→</span>
                                                <span className="mini-step completed-green">
                                                    <i className="fa-solid fa-circle-check"></i> {report.status === 'closed' ? 'Closed' : 'Resolved'}
                                                </span>
                                            </div>
                                            <span className="status-completed-notice">
                                                <i className="fa-solid fa-lock me-1"></i> Job Completed
                                            </span>
                                        </div>
                                    )}

                                    {/* 4. Claimed by another artisan: Greyed out notice */}
                                    {report.isClaimedByOther && (
                                        <div className="claimed-by-other-badge" title="This report was claimed by another artisan">
                                            <i className="fa-solid fa-user-lock me-1"></i> Assigned to another artisan
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* CONFIRM APPLY MODAL (Bootstrap-consistent modal design) */}
            {applyModalReport && (
                <div
                    className="modal fade show custom-modal-backdrop"
                    tabIndex="-1"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px', width: '90%' }}>
                        <div className="modal-content custom-modal-box">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fs-5 fw-bold text-dark">
                                    <i className="fa-solid fa-hand-holding-hand me-2 text-warning"></i>
                                    Apply to resolve report?
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={() => setApplyModalReport(null)}
                                ></button>
                            </div>
                            <div className="modal-body py-3">
                                <p className="text-secondary mb-2" style={{ fontSize: '14.5px', lineHeight: 1.5 }}>
                                    You are applying to resolve <strong>&ldquo;{applyModalReport.title}&rdquo;</strong> located at <strong>{applyModalReport.location?.address}</strong>.
                                </p>
                                <div className="alert alert-warning py-2 px-3 mb-0" style={{ fontSize: '13px' }}>
                                    <i className="fa-solid fa-triangle-exclamation me-1"></i> Once confirmed, this report will immediately transition to <strong>In Progress</strong> and be assigned to your workspace.
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0 d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light px-3 py-2"
                                    style={{ fontSize: '14px', borderRadius: '8px' }}
                                    onClick={() => setApplyModalReport(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning px-4 py-2 text-dark fw-semibold"
                                    style={{ fontSize: '14px', borderRadius: '8px', backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                                    onClick={handleConfirmApply}
                                    disabled={actionLoadingId === applyModalReport.id}
                                >
                                    {actionLoadingId === applyModalReport.id ? 'Claiming...' : 'Yes, Apply'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM RESOLVE MODAL */}
            {resolveModalReport && (
                <div
                    className="modal fade show custom-modal-backdrop"
                    tabIndex="-1"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px', width: '90%' }}>
                        <div className="modal-content custom-modal-box">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fs-5 fw-bold text-dark">
                                    <i className="fa-solid fa-circle-check me-2 text-success"></i>
                                    Mark Job as Resolved?
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={() => setResolveModalReport(null)}
                                ></button>
                            </div>
                            <div className="modal-body py-3">
                                <p className="text-secondary mb-2" style={{ fontSize: '14.5px', lineHeight: 1.5 }}>
                                    Mark this job for <strong>&ldquo;{resolveModalReport.title}&rdquo;</strong> as successfully completed?
                                </p>
                                <div className="alert alert-success py-2 px-3 mb-0" style={{ fontSize: '13px' }}>
                                    <i className="fa-solid fa-info-circle me-1"></i> The resident will be notified that the issue has been resolved and prompted to submit a review.
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0 d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light px-3 py-2"
                                    style={{ fontSize: '14px', borderRadius: '8px' }}
                                    onClick={() => setResolveModalReport(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success px-4 py-2 text-white fw-semibold"
                                    style={{ fontSize: '14px', borderRadius: '8px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                                    onClick={handleConfirmResolve}
                                    disabled={actionLoadingId === resolveModalReport.id}
                                >
                                    {actionLoadingId === resolveModalReport.id ? 'Updating...' : 'Confirm Resolved'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtisanReportsPage;
