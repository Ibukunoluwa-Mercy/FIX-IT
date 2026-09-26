import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReportWizard from '../ReportWizardPage/ReportWizard';
import { contactInfo } from './helpCenterData';
import { useHelpCenterData } from './hooks/useHelpCenterData';

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

const navGroups = [
  [
    { label: 'Dashboard', iconClass: 'fa-solid fa-grip', path: '/dashboard' },
    { label: 'Nearby Issues', iconClass: 'fa-solid fa-location-dot', path: '/map' },
    { label: 'My Reports', iconClass: 'fa-solid fa-file-lines', path: '/reports' },
    { label: 'Notifications', iconClass: 'fa-solid fa-bell', badge: 0 },
  ],
  [
    { label: 'Help Center', iconClass: 'fa-solid fa-circle-question', path: '/help-center', active: true },
    { label: 'Settings', iconClass: 'fa-solid fa-gear', path: '/settings' },
  ],
];

const HelpCenter = () => {
  const navigate = useNavigate();

  // Layout & UI states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportWizard, setShowReportWizard] = useState(false);

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

  // Hook for topic/faq data, search, filtering, and modals
  const {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    setDebouncedQuery,
    filteredQuickHelp,
    filteredCategories,
    filteredGuides,
    displayedFaqs,
    showAllFaqs,
    setShowAllFaqs,
    selectedTopic,
    setSelectedTopic,
    showStepModal,
    setShowStepModal,
    loadingTopicDetail,
    handleOpenTopic,
    showContactModal,
    setShowContactModal,
    contactForm,
    setContactForm,
    sendingMessage,
    handleOpenContactModal,
    handleContactSubmit,
  } = useHelpCenterData(user);

  // Navigation click
  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.label === 'Notifications') {
      setShowNotifications((prev) => !prev);
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
          navigate('/settings');
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
          <HelpBanner />

          <HelpSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            onSearchSubmit={() => setDebouncedQuery(searchQuery.trim().toLowerCase())}
            hasSearchFilter={Boolean(debouncedQuery)}
          />

          <HelpSecondaryBanner
            onContactClick={handleOpenContactModal}
          />

          <HelpQuickOptions
            items={filteredQuickHelp}
            onSelectTopic={handleOpenTopic}
          />

          <HelpCategories
            categories={filteredCategories}
            onSelectTopic={handleOpenTopic}
          />

          <HelpQuickGuides
            guides={filteredGuides}
            onSelectTopic={handleOpenTopic}
          />

          <HelpFaqsAccordion
            faqs={displayedFaqs}
            showAllFaqs={showAllFaqs}
            onToggleShowAll={() => setShowAllFaqs((prev) => !prev)}
          />

          <HelpFooterSupport
            contactInfo={contactInfo}
            onContactClick={handleOpenContactModal}
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
