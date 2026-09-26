import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReportWizard from '../ReportWizardPage/ReportWizard';

// Modular Data & Subcomponents
import {
  quickHelpOptions as fallbackQuickHelp,
  categoriesList as fallbackCategories,
  quickGuides as fallbackGuides,
  faqsList as fallbackFaqs,
  contactInfo,
} from './helpCenterData';

import HelpCenterSidebar from './components/HelpCenterSidebar';
import HelpCenterHeader from './components/HelpCenterHeader';
import HelpBanner from './components/HelpBanner';
import HelpSearchBar from './components/HelpSearchBar';
import HelpSecondaryBanner from './components/HelpSecondaryBanner';
import HelpQuickOptions from './components/HelpQuickOptions';
import HelpCategories from './components/HelpCategories';
import HelpQuickGuides from './components/HelpQuickGuides';
import HelpFaqsAccordion from './components/HelpFaqsAccordion';
import HelpFooterSupport from './components/HelpFooterSupport';
import HelpStepModal from './components/HelpStepModal';
import ContactSupportModal from './components/ContactSupportModal';

import './HelpCenter.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

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

  // Layout & UI states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportWizard, setShowReportWizard] = useState(false);

  // Content states from Backend API (with graceful fallback)
  const [topics, setTopics] = useState([]);
  const [faqs, setFaqs] = useState(fallbackFaqs);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Modal walkthrough & contact states
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [loadingTopicDetail, setLoadingTopicDetail] = useState(false);

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sendingMessage, setSendingMessage] = useState(false);

  // Current resident info
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('fixitUser') || '{}');
    } catch {
      return {};
    }
  }, []);
  const userName = user.name || user.fullName || 'Resident';
  const firstName = userName.split(' ')[0];

  // Fetch topics and FAQs on component mount
  useEffect(() => {
    let active = true;

    axios.get(`${API_URL}/api/help/topics`)
      .then((res) => {
        if (active && Array.isArray(res.data) && res.data.length > 0) {
          setTopics(res.data);
        }
      })
      .catch(() => {});

    axios.get(`${API_URL}/api/help/faqs`)
      .then((res) => {
        if (active && Array.isArray(res.data) && res.data.length > 0) {
          setFaqs(res.data);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Fetch all FAQs when toggle clicked
  useEffect(() => {
    if (showAllFaqs) {
      axios.get(`${API_URL}/api/help/faqs/all`)
        .then((res) => {
          if (Array.isArray(res.data)) setFaqs(res.data);
        })
        .catch(() => {});
    }
  }, [showAllFaqs]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Topic sections derived from API or fallback
  const allQuickHelp = useMemo(() => {
    const fromApi = topics.filter((t) => t.section === 'quick_help');
    return fromApi.length > 0 ? fromApi : fallbackQuickHelp;
  }, [topics]);

  const allCategories = useMemo(() => {
    const fromApi = topics.filter((t) => t.section === 'category');
    return fromApi.length > 0 ? fromApi : fallbackCategories;
  }, [topics]);

  const allGuides = useMemo(() => {
    const fromApi = topics.filter((t) => t.section === 'guide');
    return fromApi.length > 0 ? fromApi : fallbackGuides;
  }, [topics]);

  // Filtered lists based on search
  const filteredQuickHelp = useMemo(() => {
    if (!debouncedQuery) return allQuickHelp;
    return allQuickHelp.filter((item) =>
      item.title.toLowerCase().includes(debouncedQuery) ||
      (item.description && item.description.toLowerCase().includes(debouncedQuery)) ||
      (item.steps && item.steps.some((s) => s.title?.toLowerCase().includes(debouncedQuery) || s.description?.toLowerCase().includes(debouncedQuery)))
    );
  }, [allQuickHelp, debouncedQuery]);

  const filteredCategories = useMemo(() => {
    if (!debouncedQuery) return allCategories;
    return allCategories.filter((item) =>
      item.title.toLowerCase().includes(debouncedQuery) ||
      (item.description && item.description.toLowerCase().includes(debouncedQuery)) ||
      (item.steps && item.steps.some((s) => s.title?.toLowerCase().includes(debouncedQuery) || s.description?.toLowerCase().includes(debouncedQuery))) ||
      (item.content && item.content.some((c) => c.toLowerCase().includes(debouncedQuery))) ||
      (item.body && item.body.toLowerCase().includes(debouncedQuery))
    );
  }, [allCategories, debouncedQuery]);

  const filteredGuides = useMemo(() => {
    if (!debouncedQuery) return allGuides;
    return allGuides.filter((item) =>
      item.title.toLowerCase().includes(debouncedQuery) ||
      (item.readTime && item.readTime.toLowerCase().includes(debouncedQuery)) ||
      (item.steps && item.steps.some((s) => s.title?.toLowerCase().includes(debouncedQuery) || s.description?.toLowerCase().includes(debouncedQuery)))
    );
  }, [allGuides, debouncedQuery]);

  const displayedFaqs = useMemo(() => {
    let list = faqs && faqs.length > 0 ? faqs : fallbackFaqs;
    if (debouncedQuery) {
      list = list.filter((faq) =>
        faq.question.toLowerCase().includes(debouncedQuery) ||
        faq.answer.toLowerCase().includes(debouncedQuery)
      );
    }
    return showAllFaqs || debouncedQuery ? list : list.slice(0, 5);
  }, [faqs, debouncedQuery, showAllFaqs]);

  // Navigation click
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

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem('fixitToken');
    localStorage.removeItem('token');
    localStorage.removeItem('fixitUser');
    navigate('/login');
  };

  // Open step modal with live API lookup
  const handleOpenTopic = (topic) => {
    setSelectedTopic(topic);
    setShowStepModal(true);

    if (topic.slug) {
      setLoadingTopicDetail(true);
      axios.get(`${API_URL}/api/help/topics/${topic.slug}`)
        .then((res) => {
          if (res.data) setSelectedTopic(res.data);
        })
        .catch(() => {})
        .finally(() => setLoadingTopicDetail(false));
    }
  };

  // Contact support submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.message.trim()) {
      toast.error('Please enter a message.');
      return;
    }
    setSendingMessage(true);

    const payload = {
      name: contactForm.name.trim() || userName,
      email: contactForm.email.trim() || user.email || 'resident@fixit.app',
      subject: 'Help Center Inquiry',
      message: contactForm.message.trim(),
      userId: user._id || user.id || null,
    };

    axios.post(`${API_URL}/api/support/contact`, payload)
      .then((res) => {
        setSendingMessage(false);
        setShowContactModal(false);
        setContactForm({ name: '', email: '', message: '' });
        toast.success(res.data?.message || 'Thank you! Our support team has received your message and will respond shortly.');
      })
      .catch((err) => {
        setSendingMessage(false);
        toast.error(err.response?.data?.error || 'Unable to submit your support message. Please try again.');
      });
  };

  return (
    <div className={`help-center-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* 1. Sidebar Navigation */}
      <HelpCenterSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        navGroups={navGroups}
        onNavClick={handleNavClick}
        userName={userName}
        firstName={firstName}
        showProfileMenu={showProfileMenu}
        onToggleProfileMenu={() => setShowProfileMenu((prev) => !prev)}
        onSignOut={handleSignOut}
        onSettingsClick={() => {
          setShowProfileMenu(false);
          navigate('/dashboard');
        }}
      />

      {/* 2. Main Page Layout */}
      <main className="help-main">
        <HelpCenterHeader
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onOpenReportWizard={() => setShowReportWizard(true)}
          showNotifications={showNotifications}
          onToggleNotifications={() => setShowNotifications((prev) => !prev)}
          onToggleProfileMenu={() => setShowProfileMenu((prev) => !prev)}
          firstName={firstName}
        />

        <div className="help-content-container">
          {/* Top Banner */}
          <HelpBanner />

          {/* Search Bar */}
          <HelpSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            onSearchSubmit={() => setDebouncedQuery(searchQuery.trim().toLowerCase())}
            hasSearchFilter={Boolean(debouncedQuery)}
          />

          {/* Secondary Banner */}
          <HelpSecondaryBanner
            onContactClick={() => setShowContactModal(true)}
          />

          {/* Quick Help Options */}
          <HelpQuickOptions
            items={filteredQuickHelp}
            onSelectTopic={handleOpenTopic}
          />

          {/* Browse by Category */}
          <HelpCategories
            categories={filteredCategories}
            onSelectTopic={handleOpenTopic}
          />

          {/* Quick Guides */}
          <HelpQuickGuides
            guides={filteredGuides}
            onSelectTopic={handleOpenTopic}
          />

          {/* Frequently Asked Questions */}
          <HelpFaqsAccordion
            faqs={displayedFaqs}
            showAllFaqs={showAllFaqs}
            onToggleShowAll={() => setShowAllFaqs((prev) => !prev)}
          />

          {/* Footer Support Strip */}
          <HelpFooterSupport
            contactInfo={contactInfo}
            onContactClick={() => setShowContactModal(true)}
          />
        </div>
      </main>

      {/* 3. Numbered Step-by-Step Modal */}
      <HelpStepModal
        show={showStepModal}
        onClose={() => {
          setShowStepModal(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
        isLoading={loadingTopicDetail}
      />

      {/* 4. Contact Support Modal */}
      <ContactSupportModal
        show={showContactModal}
        onClose={() => setShowContactModal(false)}
        contactInfo={contactInfo}
        contactForm={contactForm}
        onFormChange={setContactForm}
        onSubmit={handleContactSubmit}
        sendingMessage={sendingMessage}
        userName={userName}
      />

      {/* 5. Report Wizard Modal */}
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
