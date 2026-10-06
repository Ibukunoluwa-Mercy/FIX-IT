import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ReviewModal.css';

const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100').replace(/\/$/, '');

const ReviewModal = ({ report, onClose, onReviewed }) => {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!report) return null;

    const token = localStorage.getItem('fixitToken');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/reports/${report.id}/review`,
                {
                    rating,
                    comment,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success('Thank you! Your review has been submitted and the report is now Closed.');
            if (onReviewed) onReviewed(response.data.report);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit review.');
            setSubmitting(false);
        }
    };

    return (
        <div className="modal fade show custom-review-backdrop" role="dialog" aria-modal="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px', width: '92%' }}>
                <div className="modal-content review-modal-box">
                    <div className="modal-header border-0 pb-0">
                        <div>
                            <span className="badge bg-success-subtle text-success px-2 py-1 mb-1 rounded">
                                <i className="fa-solid fa-circle-check me-1"></i> Job Resolved
                            </span>
                            <h4 className="modal-title fs-5 fw-bold text-dark">Leave a Review</h4>
                        </div>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body py-3">
                            <p className="text-secondary mb-3" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                                How satisfied are you with the resolution of <strong>&ldquo;{report.title || report.category}&rdquo;</strong>?
                                Your review marks the job as <strong>Closed</strong>.
                            </p>

                            {/* Star Rating Widget */}
                            <div className="rating-selector-wrapper mb-3 text-center py-2">
                                <div className="stars-row">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isFilled = (hoverRating || rating) >= star;
                                        return (
                                            <button
                                                type="button"
                                                key={star}
                                                className={`star-btn ${isFilled ? 'filled' : ''}`}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                aria-label={`${star} star`}
                                            >
                                                <i className="fa-solid fa-star"></i>
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="rating-label">
                                    {rating === 5 && 'Outstanding Work'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 3 && 'Average'}
                                    {rating === 2 && 'Below Expectations'}
                                    {rating === 1 && 'Unsatisfactory'}
                                </span>
                            </div>

                            {/* Comment */}
                            <div className="mb-2">
                                <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                                    Feedback / Comment (Optional)
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Share details about the quality of repair, timeliness, etc."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer border-0 pt-0 d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light px-3 py-2" onClick={onClose} style={{ borderRadius: '8px' }}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-warning px-4 py-2 text-dark fw-bold"
                                style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b', borderRadius: '8px' }}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
