import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReportStatusStepper from './ReportStatusStepper';
import './SeeDetailsModal.css';

const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100').replace(/\/$/, '');

const SeeDetailsModal = ({ report, onClose, onRefresh }) => {
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageSubject, setMessageSubject] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    if (!report) return null;

    const token = localStorage.getItem('fixitToken');
    const artisan = report.assignedArtisan;
    const isJobDone = report.status === 'resolved' || report.status === 'closed';

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageBody.trim()) {
            toast.error('Please enter a message.');
            return;
        }

        setSendingMessage(true);
        try {
            const response = await axios.post(
                `${API_URL}/api/reports/${report.id}/message-artisan`,
                {
                    subject: messageSubject,
                    message: messageBody,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success(response.data.message || `Your message has been sent to ${artisan?.name || 'the artisan'}!`);
            setShowMessageModal(false);
            setMessageSubject('');
            setMessageBody('');
            if (onRefresh) onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send message to artisan.');
        } finally {
            setSendingMessage(false);
        }
    };

    return (
        <>
            {/* Main See Details Modal */}
            <div className="modal fade show custom-details-backdrop" role="dialog" aria-modal="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="modal-dialog modal-dialog-centered modal-lg" style={{ width: '92%', maxWidth: '680px' }}>
                    <div className="modal-content details-modal-content">
                        {/* Header */}
                        <div className="modal-header border-0 pb-2">
                            <div>
                                <span className="report-id-chip">{report.reportId || `#${String(report.id).slice(-8)}`}</span>
                                <h4 className="modal-title fs-5 fw-bold text-dark mt-1">{report.title || report.category}</h4>
                            </div>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                        </div>

                        <div className="modal-body py-2">
                            {/* Top section: Status Stepper repeated for context */}
                            <div className="stepper-section-card mb-4">
                                <h6 className="section-label">Report Resolution Progress</h6>
                                <ReportStatusStepper
                                    status={report.status}
                                    timestamps={{
                                        Reported: report.reportedAt || report.createdAt,
                                        'In Progress': report.inProgressAt,
                                        Resolved: report.resolvedAt,
                                        Closed: report.closedAt,
                                    }}
                                />
                            </div>

                            {/* Artisan Info Section */}
                            {artisan ? (
                                <div className="artisan-info-card">
                                    <div className="artisan-header-row">
                                        <div className="artisan-left-meta">
                                            <div className="artisan-avatar-wrapper">
                                                {artisan.avatarUrl ? (
                                                    <img src={artisan.avatarUrl} alt={artisan.name} className="artisan-avatar-img" />
                                                ) : (
                                                    <div className="artisan-avatar-fallback">
                                                        <i className="fa-solid fa-user-gear"></i>
                                                    </div>
                                                )}
                                                <span className="artisan-verified-badge" title="Verified Artisan">
                                                    <i className="fa-solid fa-check"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <h5 className="artisan-name">{artisan.name}</h5>
                                                <span className="artisan-trade-badge">{artisan.qualifications || 'Registered Community Artisan'}</span>
                                            </div>
                                        </div>

                                        {/* Message button: available during in_progress, hidden once closed */}
                                        {!isJobDone && (
                                            <button
                                                className="btn-open-message"
                                                onClick={() => setShowMessageModal(true)}
                                            >
                                                <i className="fa-regular fa-comment-dots me-1"></i> Message Artisan
                                            </button>
                                        )}
                                    </div>

                                    <div className="artisan-contact-details">
                                        <div className="contact-detail-item">
                                            <i className="fa-solid fa-phone"></i>
                                            <div>
                                                <small>Phone Number</small>
                                                <strong>{artisan.phone || 'Provided upon request'}</strong>
                                            </div>
                                        </div>
                                        <div className="contact-detail-item">
                                            <i className="fa-solid fa-envelope"></i>
                                            <div>
                                                <small>Direct Inquiries</small>
                                                <span className="relay-secure-tag">
                                                    <i className="fa-solid fa-shield-halved me-1"></i> Routed via Secure FixIt Relay
                                                </span>
                                            </div>
                                        </div>
                                        {artisan.businessName && (
                                            <div className="contact-detail-item">
                                                <i className="fa-solid fa-building"></i>
                                                <div>
                                                    <small>Business Entity</small>
                                                    <strong>{artisan.businessName}</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="no-artisan-alert">
                                    <i className="fa-solid fa-hourglass-half me-2 text-warning"></i>
                                    An artisan has not claimed this report yet. You will be notified as soon as one begins working on it.
                                </div>
                            )}
                        </div>

                        <div className="modal-footer border-0 pt-2 pb-3">
                            <button type="button" className="btn btn-secondary px-4 py-2" onClick={onClose} style={{ borderRadius: '8px' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: Message Artisan Modal */}
            {showMessageModal && (
                <div className="modal fade show custom-message-backdrop" role="dialog" aria-modal="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px', width: '92%' }}>
                        <div className="modal-content message-modal-box">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fs-5 fw-bold text-dark">
                                    <i className="fa-solid fa-paper-plane me-2 text-primary"></i>
                                    Message {artisan?.name || 'Artisan'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={() => setShowMessageModal(false)}
                                ></button>
                            </div>

                            <form onSubmit={handleSendMessage}>
                                <div className="modal-body py-3">
                                    <p className="text-muted mb-3" style={{ fontSize: '13.5px' }}>
                                        Send a direct message or instructions. FixIt will deliver this to the artisan&apos;s registered inbox.
                                    </p>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Subject (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Gate code, best time to arrive"
                                            value={messageSubject}
                                            onChange={(e) => setMessageSubject(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-2">
                                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Message / Instructions *</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            placeholder="Write your message here..."
                                            required
                                            value={messageBody}
                                            onChange={(e) => setMessageBody(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="modal-footer border-0 pt-0 d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-light px-3 py-2"
                                        onClick={() => setShowMessageModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 py-2 fw-semibold"
                                        style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                                        disabled={sendingMessage}
                                    >
                                        {sendingMessage ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SeeDetailsModal;
