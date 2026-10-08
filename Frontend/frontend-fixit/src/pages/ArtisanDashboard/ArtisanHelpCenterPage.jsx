import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Accordion, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import helpCenterImg from '../../assets/help-center.png';
import '../HelpCenter/HelpCenterHeader.css';
import '../HelpCenter/HelpCenterSearch.css';
import '../HelpCenter/HelpCenterSections.css';
import '../HelpCenter/HelpCenterModals.css';
import './ArtisanHelpCenterPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const contactInfo = {
  email: 'ibukunojedapo2022@gmail.com',
  phone: '09134640553',
  displayPhone: '+234 913 464 0553',
  hours: 'Mon - Fri, 8am - 6pm (WAT)',
};

const ArtisanHelpCenterPage = () => {
  // User context from localStorage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('fixitUser') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [topics, setTopics] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  // Step Walkthrough Modal
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [loadingTopicDetail, setLoadingTopicDetail] = useState(false);

  // Contact Support Modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user.name || user.fullName || '',
    email: user.email || '',
    subject: '',
    message: '',
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial fetch of topics and FAQs
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('fixitToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${API_URL}/api/help/topics`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/api/help/faqs?all=true`, { headers }).then((r) => r.json()),
    ])
      .then(([topicsData, faqsData]) => {
        setTopics(Array.isArray(topicsData) ? topicsData : []);
        setFaqs(Array.isArray(faqsData) ? faqsData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load artisan help content:', err);
        setLoading(false);
      });
  }, []);

  // Live search fetch
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    const token = localStorage.getItem('token') || localStorage.getItem('fixitToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_URL}/api/help/search?q=${encodeURIComponent(debouncedQuery)}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        setSearchResults(data.results || { articles: data.topics || [], faqs: data.faqs || [] });
        setIsSearching(false);
      })
      .catch(() => {
        setIsSearching(false);
      });
  }, [debouncedQuery]);

  // Group topics by section
  const quickHelpOptions = useMemo(() => {
    const list = searchResults ? searchResults.articles.filter((t) => t.section === 'quick_help') : topics.filter((t) => t.section === 'quick_help');
    return list;
  }, [topics, searchResults]);

  const categoryOptions = useMemo(() => {
    const list = searchResults ? searchResults.articles.filter((t) => t.section === 'category') : topics.filter((t) => t.section === 'category');
    return list;
  }, [topics, searchResults]);

  const guideOptions = useMemo(() => {
    const list = searchResults ? searchResults.articles.filter((t) => t.section === 'guide') : topics.filter((t) => t.section === 'guide');
    return list;
  }, [topics, searchResults]);

  const displayedFaqs = useMemo(() => {
    const list = searchResults ? searchResults.faqs : faqs;
    return showAllFaqs ? list : list.slice(0, 5);
  }, [faqs, searchResults, showAllFaqs]);

  // Open Step Modal for any topic row
  const handleOpenTopic = useCallback((topicItem) => {
    setSelectedTopic(topicItem);
    setShowStepModal(true);

    // If steps or body are missing, fetch detailed topic
    if (!topicItem.steps && !topicItem.body && topicItem.slug) {
      setLoadingTopicDetail(true);
      const token = localStorage.getItem('token') || localStorage.getItem('fixitToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      fetch(`${API_URL}/api/help/topics/${topicItem.slug}`, { headers })
        .then((r) => r.json())
        .then((fullData) => {
          setSelectedTopic(fullData);
          setLoadingTopicDetail(false);
        })
        .catch(() => {
          setLoadingTopicDetail(false);
        });
    }
  }, []);

  // Submit Contact Support Form
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSendingMessage(true);
    const token = localStorage.getItem('token') || localStorage.getItem('fixitToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    fetch(`${API_URL}/api/support/contact`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...contactForm,
        role: 'artisan',
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to send support request');
        return res.json();
      })
      .then(() => {
        setSendingMessage(false);
        setSubmitSuccess(true);
        toast.success('Your message has been sent to our support team!');
      })
      .catch((err) => {
        setSendingMessage(false);
        toast.error(err.message || 'Unable to send message. Please try again.');
      });
  };

  return (
    <div className="artisan-help-page">
      {/* 1. Header Banner */}
      <section className="help-banner-card" aria-label="Help Center banner">
        <div className="help-banner-inner">
          <div className="help-banner-left">
            <div className="help-banner-icon-badge" aria-hidden="true">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div className="help-banner-text">
              <h1>Artisan Help Center</h1>
              <p>
                Find answers about claiming reports, updating job statuses, getting verified, and managing your artisan profile.
              </p>
            </div>
          </div>
          <div className="help-banner-illustration-wrap" aria-hidden="true">
            <img src={helpCenterImg} alt="Help Center Representative" className="help-banner-illustration" />
          </div>
        </div>
      </section>

      {/* 2. Search Bar */}
      <div className="help-search-wrapper" role="search">
        <div className="help-search-inner">
          <i className="fa-solid fa-magnifying-glass help-search-icon" aria-hidden="true"></i>
          <input
            type="text"
            className="help-search-input"
            placeholder="Search artisan guides, claiming reports, verification, FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search help center"
          />
          {searchQuery && (
            <button
              type="button"
              className="help-search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
        {isSearching && (
          <div className="text-center py-2 text-muted small">
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Searching artisan articles...
          </div>
        )}
      </div>

      {/* 3. Need more help? Strip */}
      <div className="help-secondary-banner">
        <div className="help-secondary-left">
          <div className="help-secondary-icon-badge" aria-hidden="true">
            <i className="fa-solid fa-lightbulb"></i>
          </div>
          <div className="help-secondary-text">
            <strong>Need more help?</strong>
            <span>Our support team is on standby to assist you with your trade account.</span>
          </div>
        </div>
        <button
          className="help-btn-contact-orange"
          type="button"
          onClick={() => {
            setSubmitSuccess(false);
            setShowContactModal(true);
          }}
        >
          <i className="fa-solid fa-envelope"></i> Contact Support <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      {/* 4. Quick Help Options */}
      <section className="help-card-section" aria-label="Quick Help Options">
        <div className="help-section-header">
          <h2>Quick Help Options</h2>
          <p>Get started with the most common artisan workflows and tasks.</p>
        </div>
        <div className="help-rows-list">
          {quickHelpOptions.length === 0 ? (
            <p className="text-muted small py-2 mb-0">No quick help options match your search.</p>
          ) : (
            quickHelpOptions.map((item) => (
              <div
                key={item.id || item.slug}
                className="help-item-row"
                onClick={() => handleOpenTopic(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenTopic(item)}
              >
                <div className="help-row-left">
                  <div
                    className="help-row-icon-box"
                    style={{ backgroundColor: item.iconBg || '#eff6ff', color: item.iconColor || '#2563eb' }}
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

      {/* 5. Browse by Category */}
      <section className="help-card-section" aria-label="Browse by Category">
        <div className="help-section-header">
          <h2>Browse by Category</h2>
          <p>Quickly find help articles related to your artisan dashboard and trade tools.</p>
        </div>
        <div className="help-rows-list">
          {categoryOptions.length === 0 ? (
            <p className="text-muted small py-2 mb-0">No categories match your search.</p>
          ) : (
            categoryOptions.map((item) => (
              <div
                key={item.id || item.slug}
                className="help-item-row"
                onClick={() => handleOpenTopic(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenTopic(item)}
              >
                <div className="help-row-left">
                  <div
                    className="help-row-icon-box"
                    style={{ backgroundColor: item.iconBg || '#eff6ff', color: item.iconColor || '#2563eb' }}
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

      {/* 6. Quick Guides */}
      <section className="help-card-section" aria-label="Quick Guides">
        <div className="help-section-header">
          <h2>Quick Guides</h2>
          <p>Step-by-step guides with estimated read times to master your artisan workspace.</p>
        </div>
        <div className="help-rows-list">
          {guideOptions.length === 0 ? (
            <p className="text-muted small py-2 mb-0">No guides match your search.</p>
          ) : (
            guideOptions.map((guide) => (
              <div
                key={guide.id || guide.slug}
                className="help-item-row"
                onClick={() => handleOpenTopic(guide)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenTopic(guide)}
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

      {/* 7. FAQs Accordion */}
      <section className="help-card-section" aria-label="Frequently Asked Questions">
        <div className="help-section-header-row">
          <div>
            <h2>Frequently Asked Questions</h2>
            <p>Direct answers reflecting real artisan application and report handling flows.</p>
          </div>
          <button
            type="button"
            className="help-view-all-link"
            onClick={() => setShowAllFaqs((prev) => !prev)}
          >
            {showAllFaqs ? 'Show less FAQs' : 'View all FAQs →'}
          </button>
        </div>

        <Accordion className="help-accordion" defaultActiveKey={null}>
          {displayedFaqs.length === 0 ? (
            <p className="text-muted small py-2 mb-0">No questions found matching your query.</p>
          ) : (
            displayedFaqs.map((faq, index) => (
              <Accordion.Item eventKey={String(index)} key={faq.id || index}>
                <Accordion.Header>{faq.question}</Accordion.Header>
                <Accordion.Body>{faq.answer}</Accordion.Body>
              </Accordion.Item>
            ))
          )}
        </Accordion>
      </section>

      {/* 8. Footer Support Strip */}
      <section className="help-footer-strip" aria-label="Still need help support section">
        <div className="help-footer-left">
          <div className="help-footer-icon-badge" aria-hidden="true">
            <i className="fa-solid fa-headset"></i>
          </div>
          <div className="help-footer-text">
            <h3>Still need help?</h3>
            <p>Get in touch with our artisan support team.</p>
          </div>
        </div>

        <div className="help-footer-details">
          <a href={`mailto:${contactInfo.email}`} className="help-footer-detail-item" title="Send email to support">
            <i className="fa-regular fa-envelope"></i>
            <span>{contactInfo.email}</span>
          </a>
          <a href={`tel:${contactInfo.phone}`} className="help-footer-detail-item" title="Call support hotline">
            <i className="fa-solid fa-phone"></i>
            <span>{contactInfo.displayPhone}</span>
          </a>
          <div className="help-footer-detail-item">
            <i className="fa-regular fa-clock"></i>
            <span>{contactInfo.hours}</span>
          </div>
        </div>

        <div className="help-footer-right">
          <button
            className="help-btn-contact-orange"
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              setShowContactModal(true);
            }}
          >
            <i className="fa-solid fa-envelope"></i> Contact Support <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </section>

      {/* CORE STEP MODAL */}
      <Modal
        show={showStepModal}
        onHide={() => {
          setShowStepModal(false);
          setSelectedTopic(null);
        }}
        centered
        dialogClassName="help-step-modal"
      >
        {selectedTopic && (
          <>
            <div className="help-step-modal-header">
              <div className="help-step-modal-title">
                <div
                  className="help-step-modal-icon"
                  style={{
                    backgroundColor: selectedTopic.iconBg || '#eff6ff',
                    color: selectedTopic.iconColor || '#2563eb',
                  }}
                  aria-hidden="true"
                >
                  <i className={selectedTopic.icon || 'fa-solid fa-circle-info'}></i>
                </div>
                <h5>{selectedTopic.title}</h5>
              </div>
              <button
                type="button"
                className="help-step-modal-close"
                onClick={() => {
                  setShowStepModal(false);
                  setSelectedTopic(null);
                }}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="help-step-modal-body">
              {loadingTopicDetail ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                  <span className="text-muted small">Loading walkthrough...</span>
                </div>
              ) : selectedTopic.steps && selectedTopic.steps.length > 0 ? (
                <ol className="help-steps-ol">
                  {selectedTopic.steps.map((st, index) => (
                    <li key={st.id || st.order || index} className="help-step-item">
                      <span className="help-step-number">{st.order || index + 1}</span>
                      <div className="help-step-details">
                        <strong>{st.title}</strong>
                        <p>{st.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : selectedTopic.body ? (
                <div className="help-step-body-text">
                  <p>{selectedTopic.body}</p>
                </div>
              ) : (
                <div className="help-step-body-text">
                  <p>{selectedTopic.description || 'Details will be updated shortly.'}</p>
                </div>
              )}
            </div>

            <div className="help-step-modal-footer">
              <button
                type="button"
                className="btn btn-primary px-4 py-2"
                style={{ borderRadius: '8px', fontWeight: '600' }}
                onClick={() => {
                  setShowStepModal(false);
                  setSelectedTopic(null);
                }}
              >
                Got it
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* CONTACT SUPPORT MODAL */}
      <Modal
        show={showContactModal}
        onHide={() => setShowContactModal(false)}
        centered
        dialogClassName="help-step-modal"
      >
        <div className="help-step-modal-header">
          <div className="help-step-modal-title">
            <div className="help-step-modal-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }} aria-hidden="true">
              <i className="fa-solid fa-headset"></i>
            </div>
            <h5>Contact Artisan Support</h5>
          </div>
          <button
            type="button"
            className="help-step-modal-close"
            onClick={() => setShowContactModal(false)}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="help-step-modal-body">
          <div className="contact-modal-info-card">
            <div className="contact-modal-item">
              <span className="contact-modal-item-left">
                <i className="fa-regular fa-envelope"></i> Email Support
              </span>
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </div>
            <div className="contact-modal-item">
              <span className="contact-modal-item-left">
                <i className="fa-solid fa-phone"></i> Direct Line
              </span>
              <a href={`tel:${contactInfo.phone}`}>{contactInfo.displayPhone}</a>
            </div>
          </div>

          {submitSuccess ? (
            <div className="alert alert-success mt-3 p-3 text-center" style={{ borderRadius: '10px' }}>
              <i className="fa-solid fa-circle-check fs-4 mb-2 d-block text-success"></i>
              <strong>Support Ticket Created!</strong>
              <p className="mb-0 small text-muted">
                Our support team has received your inquiry and will follow up with you at {contactForm.email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="mt-3">
              <div className="mb-2">
                <label className="form-label small fw-semibold">Your Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small fw-semibold">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small fw-semibold">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Account Verification / Report Issue"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Message *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  required
                  placeholder="Explain how our team can help you..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowContactModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-warning text-dark fw-semibold"
                  style={{ backgroundColor: '#f97316', borderColor: '#f97316', color: '#fff' }}
                  disabled={sendingMessage}
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ArtisanHelpCenterPage;
