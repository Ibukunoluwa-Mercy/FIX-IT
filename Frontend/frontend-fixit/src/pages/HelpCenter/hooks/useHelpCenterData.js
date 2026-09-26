import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  quickHelpOptions as fallbackQuickHelp,
  categoriesList as fallbackCategories,
  quickGuides as fallbackGuides,
  faqsList as fallbackFaqs,
} from '../helpCenterData';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const useHelpCenterData = (user) => {
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

  const handleOpenContactModal = () => {
    setContactForm((current) => ({
      ...current,
      name: current.name || (user?.name || user?.fullName || ''),
      email: current.email || user?.email || '',
    }));
    setShowContactModal(true);
  };

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
    if (sendingMessage) return;
    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const message = contactForm.message.trim();
    if (!name || !email || !message) {
      toast.error('Please provide your name, email address, and message.');
      return;
    }
    setSendingMessage(true);

    const payload = {
      name,
      email,
      subject: 'Help Center Inquiry',
      message,
      userId: user?._id || user?.id || null,
    };

    axios.post(`${API_URL}/api/support/contact`, payload)
      .then((res) => {
        setSendingMessage(false);
        setShowContactModal(false);
        setContactForm({ name: '', email: '', message: '' });
        if (res.data?.emailSent === false) {
          toast.warning(res.data.message || 'Your message was saved, but email delivery to support failed.');
        } else {
          toast.success(res.data?.message || 'Thank you! Our support team has received your message and will respond shortly.');
        }
      })
      .catch((err) => {
        setSendingMessage(false);
        toast.error(err.response?.data?.error || 'Unable to submit your support message. Please try again.');
      });
  };

  return {
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
  };
};
