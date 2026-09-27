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
  // Three controlled fields: name, email, message
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  // True while the POST is in-flight — disables Send to prevent double-submits
  const [sendingMessage, setSendingMessage] = useState(false);
  // Per-field validation messages shown inline beneath each input
  const [contactFieldErrors, setContactFieldErrors] = useState({ name: '', email: '', message: '' });
  // Inline network/server error shown at the bottom of the form on .catch()
  const [contactError, setContactError] = useState('');
  // Flipped to true on a successful 2xx response so the modal can show a
  // confirmation banner instead of the form without closing abruptly
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleOpenContactModal = () => {
    // Pre-fill name/email from the stored user object so the resident
    // doesn't have to retype what the app already knows about them.
    // We only overwrite blank fields so any edits the user made previously
    // in the same session are kept intact.
    setContactForm((current) => ({
      ...current,
      name: current.name || (user?.name || user?.fullName || ''),
      email: current.email || user?.email || '',
    }));
    // Clear any leftover errors and the success flag from a prior session
    setContactFieldErrors({ name: '', email: '', message: '' });
    setContactError('');
    setSubmitSuccess(false);
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

  // ---------------------------------------------------------------------------
  // handleContactSubmit — called when the user clicks "Send Message"
  // ---------------------------------------------------------------------------
  const handleContactSubmit = (e) => {
    // Always prevent the browser's native form submission so we handle
    // everything in JavaScript without a page reload.
    e.preventDefault();

    // Guard: if a request is already in-flight, ignore this click entirely.
    // This prevents duplicate tickets if the user clicks Send multiple times.
    if (sendingMessage) return;

    // --- Step 1: Trim all field values so leading/trailing whitespace doesn't
    //             pass validation but then fail on the backend. ---
    const name    = contactForm.name.trim();
    const email   = contactForm.email.trim();
    const message = contactForm.message.trim();

    // --- Step 2: Client-side validation ---
    // Build a fresh errors object so all fields are checked in one pass and
    // every field with a problem shows its own message simultaneously.
    const errors = { name: '', email: '', message: '' };
    let hasError = false;

    // Name is required — an empty string or whitespace-only string must fail.
    if (!name) {
      errors.name = 'Your name is required.';
      hasError = true;
    }

    // Email must be non-empty AND match a basic RFC-style pattern.
    // We do not rely solely on the browser's type="email" check because some
    // older browsers are too lenient (e.g. they accept "a@b").
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email address is required.';
      hasError = true;
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address (e.g. you@example.com).';
      hasError = true;
    }

    // Message is required and must be at least 5 characters (mirrors backend).
    if (!message) {
      errors.message = 'Please describe how we can help you.';
      hasError = true;
    } else if (message.length < 5) {
      errors.message = 'Message must be at least 5 characters long.';
      hasError = true;
    }

    // Push the per-field errors into state so the modal renders them inline.
    setContactFieldErrors(errors);

    // Also clear any stale network-level error from a previous attempt so the
    // UI doesn't show two different error messages at the same time.
    setContactError('');

    // If any field failed, stop here — do not send the request.
    if (hasError) return;

    // --- Step 3: Lock the UI while the request is in-flight ---
    // Setting sendingMessage to true disables the Send button (see JSX) and
    // changes its label to "Sending…" to give the user clear visual feedback.
    setSendingMessage(true);

    // --- Step 4: Build the request payload ---
    // subject is hard-coded here; the backend accepts it as an optional field
    // and defaults to 'General Support Inquiry' if omitted, but being explicit
    // makes the ticket easier to triage in the admin panel.
    const payload = {
      name,
      email,
      subject: 'Help Center Inquiry',
      message,
      // Include the logged-in user's ID if available so the backend can link
      // this ticket to the resident's account for follow-up.
      userId: user?._id || user?.id || null,
    };

    // --- Step 5: POST to the backend and handle the response ---
    // We use .then()/.catch() (not async/await) as specified in the brief.
    axios.post(`${API_URL}/api/support/contact`, payload)
      .then((res) => {
        // The request succeeded (2xx). Unlock the button first.
        setSendingMessage(false);

        // Flip the success flag so the modal swaps to a confirmation banner.
        // We keep the modal open so the resident sees the "Message sent" notice
        // rather than having the UI disappear without acknowledgement.
        setSubmitSuccess(true);

        // Reset the form fields so the next time the modal is opened there is
        // no stale content from this submission.
        setContactForm({ name: '', email: '', message: '' });
        setContactFieldErrors({ name: '', email: '', message: '' });

        // Always show a success toast — the inquiry is saved and the support
        // team can read it regardless of whether the backend email was delivered.
        // Showing a warning toast alongside the success banner is confusing
        // (two conflicting signals for one successful action).
        toast.success(
          res.data?.emailSent === false
            ? 'Your message has been received! Our team will get back to you.'
            : (res.data?.message || 'Thank you! Our support team has received your message and will respond shortly.')
        );
      })
      .catch((err) => {
        // The request failed (network error or 4xx/5xx from the server).
        // Unlock the Send button so the resident can retry.
        setSendingMessage(false);

        // Extract the server's human-readable error message if it provided one,
        // otherwise fall back to a generic message. This is shown inline inside
        // the modal (not via toast) so the resident can read it without the
        // form closing — and importantly, their typed text is still there.
        const serverMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Unable to send your message. Please check your connection and try again.';
        setContactError(serverMessage);
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
    // New states exposed for ContactSupportModal to render inline feedback
    contactFieldErrors,
    contactError,
    submitSuccess,
    setSubmitSuccess,
    handleOpenContactModal,
    handleContactSubmit,
  };
};
