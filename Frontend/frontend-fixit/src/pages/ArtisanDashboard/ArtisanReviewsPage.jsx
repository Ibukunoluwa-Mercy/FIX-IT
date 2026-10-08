import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './ArtisanReviewsPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const formatDate = (value) => {
    if (!value) return 'Recently';
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

const ArtisanReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0 });
    const [ratingFilter, setRatingFilter] = useState('all'); // all, 5, 4, 3, 2, 1
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('fixitToken');

    const fetchReviews = () => {
        setLoading(true);
        fetch(`${API_URL}/api/artisans/reviews`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load reviews');
                return res.json();
            })
            .then((data) => {
                setReviews(data.reviews || []);
                if (data.stats) {
                    setStats(data.stats);
                } else if (data.reviews) {
                    const total = data.reviews.length;
                    const avg = total > 0 ? (data.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / total).toFixed(1) : 0;
                    setStats({ totalReviews: total, avgRating: Number(avg) });
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching reviews:', err);
                toast.error(err.message || 'Could not load reviews');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Helper for Star rating rendering
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating || 0);
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<i key={i} className="fa-solid fa-star star-filled"></i>);
            } else {
                stars.push(<i key={i} className="fa-regular fa-star star-empty"></i>);
            }
        }
        return stars;
    };

    // Calculate rating counts
    const ratingBreakdown = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
    };

    // Filter reviews
    const filteredReviews = reviews.filter((rev) => {
        const matchesRating = ratingFilter === 'all' || rev.rating === Number(ratingFilter);
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch =
            !query ||
            rev.comment?.toLowerCase().includes(query) ||
            rev.resident?.name?.toLowerCase().includes(query) ||
            rev.report?.title?.toLowerCase().includes(query) ||
            rev.report?.category?.toLowerCase().includes(query);
        return matchesRating && matchesSearch;
    });

    return (
        <div className="artisan-reviews-page">
            {/* Header */}
            <div className="reviews-header">
                <div>
                    <h1 className="reviews-title">Resident Reviews & Feedback</h1>
                    <p className="reviews-subtitle">
                        See what residents are saying about your repairs, problem resolutions, and craftsmanship.
                    </p>
                </div>
                <button className="btn-refresh-reviews" onClick={fetchReviews} disabled={loading} title="Refresh reviews">
                    <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''} me-1`}></i> Refresh
                </button>
            </div>

            {/* Overview Scorecard */}
            <div className="reviews-overview-card">
                <div className="overview-score-box">
                    <span className="big-score-number">{stats.avgRating || '0.0'}</span>
                    <div className="overview-stars">{renderStars(stats.avgRating)}</div>
                    <span className="overview-total-count">
                        Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                    </span>
                </div>

                <div className="overview-bars-container">
                    {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ratingBreakdown[stars];
                        const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                        return (
                            <button
                                key={stars}
                                className={`rating-bar-row ${ratingFilter === String(stars) ? 'active' : ''}`}
                                onClick={() => setRatingFilter(ratingFilter === String(stars) ? 'all' : String(stars))}
                                title={`Filter by ${stars} star reviews`}
                            >
                                <span className="bar-star-label">
                                    {stars} <i className="fa-solid fa-star text-warning"></i>
                                </span>
                                <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <span className="bar-count-label">{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="reviews-controls-bar">
                <div className="filter-chips">
                    <button
                        className={`filter-chip ${ratingFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setRatingFilter('all')}
                    >
                        All ({reviews.length})
                    </button>
                    {[5, 4, 3, 2, 1].map((star) => (
                        <button
                            key={star}
                            className={`filter-chip ${ratingFilter === String(star) ? 'active' : ''}`}
                            onClick={() => setRatingFilter(String(star))}
                        >
                            {star} ★ ({ratingBreakdown[star]})
                        </button>
                    ))}
                </div>

                <div className="search-input-wrapper">
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    <input
                        type="text"
                        placeholder="Search by resident, report, or comment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search-btn" onClick={() => setSearchTerm('')} title="Clear">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Reviews Feed */}
            {loading ? (
                <div className="reviews-loading-state">
                    <div className="spinner-border text-warning" role="status"></div>
                    <p className="mt-2 text-muted">Loading resident reviews...</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="reviews-empty-state">
                    <div className="empty-icon-circle">
                        <i className="fa-regular fa-comment-dots"></i>
                    </div>
                    <h3>No reviews found</h3>
                    <p>
                        {reviews.length === 0
                            ? 'You have not received any resident reviews yet. Completed and resolved reports that residents confirm will show up here.'
                            : 'No reviews match your selected filter criteria.'}
                    </p>
                    {ratingFilter !== 'all' || searchTerm ? (
                        <button
                            className="btn-reset-filters"
                            onClick={() => {
                                setRatingFilter('all');
                                setSearchTerm('');
                            }}
                        >
                            Reset filters
                        </button>
                    ) : null}
                </div>
            ) : (
                <div className="reviews-grid">
                    {filteredReviews.map((rev) => {
                        const avatarSrc = rev.resident?.avatarUrl
                            ? rev.resident.avatarUrl.startsWith('http')
                                ? rev.resident.avatarUrl
                                : `${API_URL}${rev.resident.avatarUrl.startsWith('/') ? '' : '/'}${rev.resident.avatarUrl}`
                            : null;

                        const residentInitials = (rev.resident?.name || 'Resident')
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();

                        return (
                            <article key={rev.id || rev._id} className="review-card">
                                <div className="review-card-top">
                                    <div className="resident-meta">
                                        {avatarSrc ? (
                                            <img
                                                src={avatarSrc}
                                                alt={rev.resident?.name}
                                                className="resident-avatar-img"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="resident-avatar-fallback">{residentInitials}</div>
                                        )}
                                        <div className="resident-info">
                                            <h4 className="resident-name">{rev.resident?.name || 'Resident'}</h4>
                                            <span className="review-date">{formatDate(rev.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="review-rating-stars">{renderStars(rev.rating)}</div>
                                </div>

                                <div className="review-card-body">
                                    <p className="review-comment">
                                        {rev.comment ? (
                                            `"${rev.comment}"`
                                        ) : (
                                            <span className="text-muted fst-italic">No written comment provided.</span>
                                        )}
                                    </p>
                                </div>

                                {rev.report && (
                                    <div className="review-report-badge">
                                        <div className="report-badge-left">
                                            <i className="fa-solid fa-wrench report-icon"></i>
                                            <div className="report-text-group">
                                                <span className="report-label">Resolved Issue:</span>
                                                <span className="report-title-text" title={rev.report.title}>
                                                    {rev.report.title}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="report-badge-right">
                                            <span className="report-chip-code">{rev.report.reportId}</span>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ArtisanReviewsPage;
