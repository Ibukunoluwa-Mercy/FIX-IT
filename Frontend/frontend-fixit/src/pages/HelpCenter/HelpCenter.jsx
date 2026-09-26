import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import logoWhite from '../../assets/fixit-white-logo.png';
import helpCenterImg from '../../assets/help-center.png';
import ReportWizard from '../ReportWizardPage/ReportWizard';
import {
  quickHelpOptions,
  categoriesList,
  quickGuides,
  faqsList,
  contactInfo
} from './helpCenterData';
import './HelpCenter.css';

const navGroups = [
  [
    { label: 'Dashboard', iconClass: 'fa-solid fa-grip', path: '/dashboard' },
    { label: 'Nearby Issues', iconClass: 'fa-solid fa-location-dot', path: '/map' },
    { label: 'My Reports', iconClass: 'fa-solid fa-file-lines', path: '/reports' },
    { label: 'Notifications', iconClass: 'fa-solid fa-bell', badge: 0 },
    { label: 'Community Discussions', iconClass: 'fa-solid fa-comments', path: '/community-map' },
    { label: 'Zonal Locations', iconClass: 'fa-solid fa-map-pin' },
  ],
  [
    { label: 'Help Center', iconClass: 'fa-solid fa-circle-question', path: '/help-center', active: true },
    { label: 'Settings', iconClass: 'fa-solid fa-gear' },
  ],
];

const HelpCenter = () => {
  const navigate = useNavigate();

  // Dashboard layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportWizard, setShowReportWizard] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Step modal state
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);

  // Contact support modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sendingMessage, setSendingMessage] = useState(false);

  // FAQ state: show 5 or all
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  // Current user info
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('fixitUser') || '{}');
    } catch {
      return {};
    }
  }, []);
  const userName = user.name || user.fullName || 'Resident';
  const firstName = userName.split(' ')[0];

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sign out handler
  const handleSignOut = () => {
    localStorage.removeItem('fixitToken');
    localStorage.removeItem('token');
    localStorage.removeItem('fixitUser');
    navigate('/login');
  };

  // Nav click handler
  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.label === 'Notifications') {
      setShowNotifications((prev) => !prev);
    } else if (item.label === 'Settings') {
      toast.info('Settings page is available in your profile menu.');
    } else {
      toast.info(`${item.label} section`);
    }
  };

  // Open step modal
  const handleOpenTopic = (topic) => {
    setSelectedTopic(topic);
    setShowStepModal(true);
  };

  // Close step modal
  const handleCloseStepModal = () => {
    setShowStepModal(false);
    setSelectedTopic(null);
  };

  // Handle Contact Form Submit
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.message.trim()) {
      toast.error('Please enter a message.');
      return;
    }
    setSendingMessage(true);
    setTimeout(() => {
      setSendingMessage(false);
      setShowContactModal(false);
      setContactForm({ name: '', email: '', message: '' });
      toast.success('Thank you! Our support team has received your message and will respond shortly.');
    }, 700);
  };

  // Filter items based on debounced search
  const filteredQuickHelp = useMemo(() => {
    if (!debouncedQuery) return quickHelpOptions;
    return quickHelpOptions.filter((item) =>
      item.title.toLowerCase().includes(debouncedQuery) ||
      item.description.toLowerCase().includes(debouncedQuery) ||
      (item.steps && item.steps.some((s) => s.title.toLowerCase().includes(debouncedQuery) || s.description.toLowerCase().includes(debouncedQuery)))
    );
  }, [debouncedQuery]);

  const filteredCategories = useMemo(() => {
    if (!debouncedQuery) return categoriesList;
    return categoriesList.filter((item) =>
      item.title.toLowerCase().includes(debouncedQuery) ||
      item.description.toLowerCase().includes(debouncedQuery) ||
      (item.steps && item.steps.some((s) => s.title.toLowerCase().includes(debouncedQuery) || s.description.toLowerCase().includes(debouncedQuery))) ||
      (item.content && item.content.some((c) => c.toLowerCase().includes(debouncedQuery)))
    );
  }, [debouncedQuery]);

  const filteredGuides = useMemo(() => {
    if (!debouncedQuery) return quickGuides;
    return quickGuides.filter((item) =>
      item.title.toLowerCase().includes(debouncedQuery) ||
      (item.steps && item.steps.some((s) => s.title.toLowerCase().includes(debouncedQuery) || s.description.toLowerCase().includes(debouncedQuery)))
    );
  }, [debouncedQuery]);

  const displayedFaqs = useMemo(() => {
    let list = faqsList;
    if (debouncedQuery) {
      list = list.filter((faq) =>
        faq.question.toLowerCase().includes(debouncedQuery) ||
        faq.answer.toLowerCase().includes(debouncedQuery)
      );
    }
    return showAllFaqs || debouncedQuery ? list : list.slice(0, 5);
  }, [debouncedQuery, showAllFaqs]);

  const hasSearchFilter = Boolean(debouncedQuery);

  return (
    <div className={`help-center-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="help-sidebar" aria-label="Dashboard navigation">
        <div className="help-brand-row">
          <Link to="/dashboard" className="help-brand" aria-label="FixIt dashboard">
            <img src={logoWhite} alt="FixIt" className="help-brand-img" />
            <span>
              Fix<span style={{ color: '#f59e0b' }}>It</span>
            </span>
          </Link>
          <button
            className="help-sidebar-toggle"
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            <i className={`fa-solid ${isSidebarCollapsed ? 'fa-bars' : 'fa-xmark'}`}></i>
          </button>
        </div>

        <nav className="help-nav" aria-label="Sidebar main navigation">
          {navGroups.map((group, groupIndex) => (
            <div className={`help-nav-group ${groupIndex ? 'help-nav-group-secondary' : ''}`} key={groupIndex}>
              {group.map((item) => (
                <button
                  key={item.label}
                  className={`help-nav-link ${item.active ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                >
                  <i className={item.iconClass} style={{ fontSize: 16 }}></i>
                  <span>{item.label}</span>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="help-nav-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Profile Card / Dropdown */}
        <div className="help-profile-wrap">
          {showProfileMenu && (
            <div className="help-profile-menu" role="menu">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/dashboard');
                }}
              >
                <i className="fa-solid fa-gear"></i> Account settings
              </button>
              <button type="button" onClick={handleSignOut}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign out
              </button>
            </div>
          )}
          <button
            className="help-profile-btn"
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
          >
            <span className="help-avatar-circle">{firstName.charAt(0).toUpperCase()}</span>
            <span className="help-profile-copy">
              <strong>{userName}</strong>
              <small>Resident</small>
            </span>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: 12, marginLeft: 'auto' }}></i>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="help-main">
        {/* Top Header */}
        <header className="help-header">
          <div className="help-mobile-brand">
            <button
              className="help-sidebar-toggle d-md-none"
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              aria-label="Open navigation menu"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <img src={logoWhite} alt="FixIt" style={{ height: '24px' }} />
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Fi<span style={{ color: '#f59e0b' }}>xIt</span>
            </span>
          </div>

          <div className="help-header-actions">
            <button
              className="help-btn-new-report"
              type="button"
              onClick={() => setShowReportWizard(true)}
            >
              <i className="fa-solid fa-plus"></i> New Report
            </button>

            {/* Notification Popover */}
            <div style={{ position: 'relative' }}>
              <button
                className="help-header-icon-btn"
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-label="Notifications"
              >
                <i className="fa-regular fa-bell" style={{ fontSize: 18 }}></i>
                <span className="help-notification-dot"></span>
              </button>
              {showNotifications && (
                <div className="help-notification-popover" role="dialog">
                  <strong>Notifications</strong>
                  <p>No new notifications at this time.</p>
                </div>
              )}
            </div>

            {/* Avatar Button */}
            <button
              className="help-header-avatar"
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-label="Open profile settings"
            >
              {firstName.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="help-content-container">
          {/* 1. Header Banner */}
          <section className="help-banner-card" aria-label="Help Center banner">
            <div className="help-banner-inner">
              <div className="help-banner-left">
                <div className="help-banner-icon-badge" aria-hidden="true">
                  <i className="fa-solid fa-headset"></i>
                </div>
                <div className="help-banner-text">
                  <h1>Help Center</h1>
                  <p>Find answers to common questions, get support, and learn how to make a bigger impact in your community.</p>
                </div>
              </div>
              <div className="help-banner-illustration-wrap" aria-hidden="true">
                <img
                  src={helpCenterImg}
                  alt="Customer Support Representative"
                  className="help-banner-illustration"
                />
              </div>
            </div>
          </section>

          {/* 2. Search Bar */}
          <div className="help-search-wrapper">
            <div className="help-search-bar">
              <i className="fa-solid fa-magnifying-glass help-search-icon" aria-hidden="true"></i>
              <input
                type="text"
                className="help-search-input"
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search help center"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="help-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
              <button
                type="button"
                className="help-search-btn"
                onClick={() => setDebouncedQuery(searchQuery.trim().toLowerCase())}
              >
                Search
              </button>
            </div>

            {hasSearchFilter && (
              <div className="help-search-status">
                <span>
                  Showing search results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </span>
                <button type="button" onClick={() => setSearchQuery('')}>
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Secondary Banner Strip */}
          <div className="help-secondary-banner">
            <div className="help-secondary-left">
              <div className="help-secondary-icon-badge" aria-hidden="true">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <div className="help-secondary-text">
                <strong>Need more help?</strong>
                <span>Our support team is here to assist you.</span>
              </div>
            </div>
            <button
              className="help-btn-contact-orange"
              type="button"
              onClick={() => setShowContactModal(true)}
            >
              <i className="fa-solid fa-envelope"></i> Contact Support <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* 3. Quick Help Options */}
          <section className="help-card-section" aria-label="Quick Help Options">
            <div className="help-section-header">
              <h2>Quick Help Options</h2>
              <p>Get started with the most common tasks and resources.</p>
            </div>
            <div className="help-rows-list">
              {filteredQuickHelp.length === 0 ? (
                <p className="text-muted small py-2 mb-0">No quick help options match your search.</p>
              ) : (
                filteredQuickHelp.map((item) => (
                  <div
                    key={item.id}
                    className="help-item-row"
                    onClick={() => handleOpenTopic(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenTopic(item)}
                    aria-label={`Open walkthrough for ${item.title}`}
                  >
                    <div className="help-row-left">
                      <div
                        className="help-row-icon-box"
                        style={{ backgroundColor: item.iconBg, color: item.iconColor }}
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

          {/* 4. Browse by Category */}
          <section className="help-card-section" aria-label="Browse by Category">
            <div className="help-section-header">
              <h2>Browse by Category</h2>
              <p>Quickly find help articles related to your needs.</p>
            </div>
            <div className="help-rows-list">
              {filteredCategories.length === 0 ? (
                <p className="text-muted small py-2 mb-0">No categories match your search.</p>
              ) : (
                filteredCategories.map((item) => (
                  <div
                    key={item.id}
                    className="help-item-row"
                    onClick={() => handleOpenTopic(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenTopic(item)}
                    aria-label={`Open topic ${item.title}`}
                  >
                    <div className="help-row-left">
                      <div
                        className="help-row-icon-box"
                        style={{ backgroundColor: item.iconBg, color: item.iconColor }}
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

          {/* 5. Quick Guides */}
          <section className="help-card-section" aria-label="Quick Guides">
            <div className="help-section-header">
              <h2>Quick Guides</h2>
              <p>Step-by-step guides to help you get started.</p>
            </div>
            <div className="help-rows-list">
              {filteredGuides.length === 0 ? (
                <p className="text-muted small py-2 mb-0">No guides match your search.</p>
              ) : (
                filteredGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="help-item-row"
                    onClick={() => handleOpenTopic(guide)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenTopic(guide)}
                    aria-label={`Open guide ${guide.title}`}
                  >
                    <div className="help-row-left">
                      <div className="help-guide-icon-box" aria-hidden="true">
                        <i className={guide.icon}></i>
                      </div>
                      <div className="help-row-text">
                        <h3 className="help-row-title">{guide.title}</h3>
                        <p className="help-row-desc">{guide.readTime}</p>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right help-row-arrow" aria-hidden="true"></i>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 6. Frequently Asked Questions */}
          <section className="help-card-section" aria-label="Frequently Asked Questions">
            <div className="help-section-header-row">
              <div>
                <h2>Frequently Asked Questions</h2>
                <p>Find quick answers to the most common questions.</p>
              </div>
              <button
                type="button"
                className="help-view-all-link"
                onClick={() => setShowAllFaqs((prev) => !prev)}
              >
                {showAllFaqs ? 'Show less FAQs' : 'View all FAQs'}
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <Accordion className="help-accordion" defaultActiveKey={null}>
              {displayedFaqs.length === 0 ? (
                <p className="text-muted small py-2 mb-0">No questions found matching your query.</p>
              ) : (
                displayedFaqs.map((faq, index) => (
                  <Accordion.Item eventKey={String(index)} key={faq.id}>
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>{faq.answer}</Accordion.Body>
                  </Accordion.Item>
                ))
              )}
            </Accordion>
          </section>

          {/* 7. Footer Support Strip */}
          <section className="help-footer-strip" aria-label="Still need help support section">
            <div className="help-footer-left">
              <div className="help-footer-icon-badge" aria-hidden="true">
                <i className="fa-solid fa-headset"></i>
              </div>
              <div className="help-footer-text">
                <h3>Still need help?</h3>
                <p>Get in touch with our support team.</p>
              </div>
            </div>

            <div className="help-footer-details">
              <a
                href={`mailto:${contactInfo.email}`}
                className="help-footer-detail-item"
                title="Send email to support"
              >
                <i className="fa-regular fa-envelope"></i>
                <span>{contactInfo.email}</span>
              </a>
              <a
                href={`tel:${contactInfo.phone}`}
                className="help-footer-detail-item"
                title="Call support hotline"
              >
                <i className="fa-solid fa-phone"></i>
                <span>{contactInfo.phone}</span>
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
                onClick={() => setShowContactModal(true)}
              >
                <i className="fa-solid fa-envelope"></i> Contact Support <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* CORE INTERACTION: Numbered Step-by-Step Modal */}
      <Modal
        show={showStepModal}
        onHide={handleCloseStepModal}
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
                    color: selectedTopic.iconColor || '#2563eb'
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
                onClick={handleCloseStepModal}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="help-step-modal-body">
              {selectedTopic.steps && selectedTopic.steps.length > 0 ? (
                <ol className="help-steps-ol">
                  {selectedTopic.steps.map((st) => (
                    <li key={st.number} className="help-step-item">
                      <span className="help-step-number">{st.number}</span>
                      <div className="help-step-details">
                        <strong>{st.title}</strong>
                        <p>{st.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="help-modal-article">
                  {selectedTopic.content && selectedTopic.content.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="help-step-modal-footer">
              <button
                type="button"
                className="help-btn-got-it"
                onClick={handleCloseStepModal}
              >
                Got it
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Contact Support Modal */}
      <Modal
        show={showContactModal}
        onHide={() => setShowContactModal(false)}
        centered
        dialogClassName="help-step-modal"
      >
        <div className="help-step-modal-header">
          <div className="help-step-modal-title">
            <div
              className="help-step-modal-icon"
              style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}
              aria-hidden="true"
            >
              <i className="fa-solid fa-headset"></i>
            </div>
            <h5>Contact Support</h5>
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
              <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
            </div>
            <div className="contact-modal-item">
              <span className="contact-modal-item-left">
                <i className="fa-regular fa-clock"></i> Working Hours
              </span>
              <span>{contactInfo.hours}</span>
            </div>
          </div>

          <form onSubmit={handleContactSubmit}>
            <div className="mb-3">
              <label className="contact-form-label" htmlFor="help-contact-name">Your Name</label>
              <input
                id="help-contact-name"
                type="text"
                className="contact-form-input"
                placeholder={userName}
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="contact-form-label" htmlFor="help-contact-email">Email Address</label>
              <input
                id="help-contact-email"
                type="email"
                className="contact-form-input"
                placeholder="your.email@example.com"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="contact-form-label" htmlFor="help-contact-msg">How can we assist you?</label>
              <textarea
                id="help-contact-msg"
                rows="3"
                className="contact-form-textarea"
                placeholder="Briefly describe what you need help with..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
              ></textarea>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowContactModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="help-btn-contact-orange"
                disabled={sendingMessage}
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Report Wizard Modal */}
      {showReportWizard && (
        <ReportWizard
          onClose={() => setShowReportWizard(false)}
          onSubmitted={() => {
            setShowReportWizard(false);
            toast.success('Your report has been submitted successfully!');
            navigate('/reports');
          }}
        />
      )}
    </div>
  );
};

export default HelpCenter;
