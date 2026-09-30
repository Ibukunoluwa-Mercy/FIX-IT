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

  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportWizard, setShowReportWizard] = useState(false);

  
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('fixitUser') || '{}');
    } catch {
      return {};
    }
  }, []);
  const userName = user.name || user.fullName || 'Resident';
  const firstName = userName.split(' ')[0];

  
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
    contactFieldErrors,
    contactError,
    submitSuccess,
    setSubmitSuccess,
    handleOpenContactModal,
    handleContactSubmit,
  } = useHelpCenterData(user);

  
  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.label === 'Notifications') {
      setShowNotifications((prev) => !prev);
    } else {
      toast.info(`${item.label} section`);
    }
  };

  
  const handleSignOut = () => {
    localStorage.removeItem('fixitToken');
    localStorage.removeItem('token');
    localStorage.removeItem('fixitUser');
    navigate('/login');
  };

  return (
    <div className={`help-center-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      
      <HelpCenterSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        navGroups={navGroups}
        onNavClick={handleNavClick}
        userName={userName}
        showProfileMenu={showProfileMenu}
        onToggleProfileMenu={() => setShowProfileMenu((prev) => !prev)}
        onSignOut={handleSignOut}
        onSettingsClick={() => {
          setShowProfileMenu(false);
          setIsMobileSidebarOpen(false);
          navigate('/settings');
        }}
      />

      
      <main className="help-main">
        <HelpCenterHeader
          onToggleSidebar={() => {
            if (window.innerWidth <= 768) {
              setIsMobileSidebarOpen((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
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

      
      <HelpStepModal
        show={showStepModal}
        onClose={() => {
          setShowStepModal(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
        isLoading={loadingTopicDetail}
      />

      
      <ContactSupportModal
        show={showContactModal}
        onClose={() => setShowContactModal(false)}
        contactInfo={contactInfo}
        contactForm={contactForm}
        onFormChange={setContactForm}
        onSubmit={handleContactSubmit}
        sendingMessage={sendingMessage}
        fieldErrors={contactFieldErrors}
        submitError={contactError}
        submitSuccess={submitSuccess}
        onDismissSuccess={() => {
          
          
          setSubmitSuccess(false);
          setShowContactModal(false);
        }}
        userName={userName}
      />

      
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
