import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import logo from '../../assets/fixit-logo-white.png';
import './ForgotPassword.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  const [form, setForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!resetToken) {
      if (!form.email.trim()) {
        e.email = 'Email address is required.';
      } else if (!emailPattern.test(form.email.trim())) {
        e.email = 'Please enter a valid email address.';
      }
    }

    if (!form.newPassword) {
      e.newPassword = 'Password is required.';
    } else if (form.newPassword.length < 8) {
      e.newPassword = 'Password must be at least 8 characters.';
    }

    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (form.confirmPassword !== form.newPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    return e;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev, [name]: '', form: '' };
      if (name === 'email' && !resetToken && value.trim().length > 0 && !emailPattern.test(value.trim())) {
        next.email = 'Please enter a valid email address.';
      }
      if (name === 'newPassword' && value.length > 0 && value.length < 8) {
        next.newPassword = 'Password must be at least 8 characters.';
      }
      if (name === 'confirmPassword' && value && value !== form.newPassword) {
        next.confirmPassword = 'Passwords do not match.';
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
      
      let response;
      if (resetToken) {
        response = await axios.put(
          `${apiUrl}/api/auth/reset-password/${encodeURIComponent(resetToken)}`,
          { password: form.newPassword }
        );
      } else {
        response = await axios.put(
          `${apiUrl}/api/auth/reset-password`,
          {
            email: form.email.trim().toLowerCase(),
            password: form.newPassword,
          }
        );
      }

      if (response.data?.token) {
        localStorage.setItem('fixitToken', response.data.token);
      }
      setSuccess(true);
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || 'Unable to reset your password. Please check your information and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-shell">
        
        {/* ── Left branding panel ── */}
        <aside className="forgot-branding auth-reveal auth-reveal-hero" aria-label="Fixit portal branding">
          <div className="brand-row">
            <Link to="/" className="brand-link" aria-label="Fixit Homepage">
              <img src={logo} alt="Fixit" className="brand-logo" />
            </Link>
          </div>

          <div className="forgot-copy-block">
            <h1 className="forgot-headline">
              No worries,
              <span className="headline-highlight">we&apos;ve got you.</span>
            </h1>
            <p className="forgot-subtext">
              {resetToken
                ? 'Create a strong, secure new password to regain access to your account.'
                : 'Enter your email address and choose a new password to quickly regain access.'}
            </p>
          </div>

          <div className="forgot-feature-grid">
            <div className="forgot-feature-card">
              <div className="forgot-feature-icon orange">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="forgot-feature-copy">
                <h2>Secure &amp; Private</h2>
                <p>Your information is safe with us.</p>
              </div>
            </div>

            <div className="forgot-feature-card">
              <div className="forgot-feature-icon orange">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div className="forgot-feature-copy">
                <h2>Quick &amp; Easy</h2>
                <p>Reset your password in just a few minutes.</p>
              </div>
            </div>
          </div>

          <div className="forgot-illustration-wrap">
            <img src={neighborhoodIllustration} alt="Neighborhood illustration" className="forgot-illustration" />
          </div>
        </aside>

        {/* ── Right card panel ── */}
        <section className="forgot-card-wrap auth-reveal auth-reveal-card">
          <div className="forgot-card">

            {!success ? (
              <>
                {/* Lock icon badge */}
                <div className="card-lock-badge" aria-hidden="true">
                  <i className="fa-solid fa-lock" style={{ fontSize: 26 }}></i>
                </div>

                <div className="forgot-card-header">
                  <h2>Reset Password</h2>
                  <p>
                    {resetToken
                      ? 'Enter your new password below to regain access to your account.'
                      : 'Enter your registered email and new password below.'}
                  </p>
                </div>

                <form className="forgot-form" onSubmit={handleSubmit} noValidate>

                  {/* Email Address (shown when direct reset without token link) */}
                  {!resetToken && (
                    <div className="field-group">
                      <label htmlFor="email">Email Address</label>
                      <div className={`input-shell ${errors.email ? 'has-error' : ''}`}>
                        <i className="fa-solid fa-envelope field-icon"></i>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="name@community.org"
                          autoComplete="email"
                        />
                      </div>
                      {errors.email && (
                        <span className="field-error">
                          <i className="fa-solid fa-circle-exclamation error-icon"></i>
                          {errors.email}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* New Password */}
                  <div className="field-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className={`input-shell ${errors.newPassword ? 'has-error' : ''}`}>
                      <i className="fa-solid fa-lock field-icon"></i>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNew ? 'text' : 'password'}
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password (min. 8 characters)"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowNew((c) => !c)}
                        aria-label={showNew ? 'Hide password' : 'Show password'}
                      >
                        {showNew ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <span className="field-error">
                        <i className="fa-solid fa-circle-exclamation error-icon"></i>
                        {errors.newPassword}
                      </span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="field-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className={`input-shell ${errors.confirmPassword ? 'has-error' : ''}`}>
                      <i className="fa-solid fa-lock field-icon"></i>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowConfirm((c) => !c)}
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="field-error">
                        <i className="fa-solid fa-circle-exclamation error-icon"></i>
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>

                  {errors.form && <div className="field-error form-error">{errors.form}</div>}

                  <button type="submit" className="reset-button" disabled={loading}>
                    {loading ? (
                      <><span className="spinner" aria-hidden="true" /> Resetting...</>
                    ) : (
                      <>Reset Password <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i></>
                    )}
                  </button>
                </form>

                <div className="forgot-footer">
                  Remember your password?{' '}
                  <Link to="/login">Back to Login</Link>
                </div>
              </>
            ) : (
              /* ── Success / Password Updated screen ── */
              <div className="success-state">
                <div className="success-sparkles" aria-hidden="true">
                  <span className="sparkle s1">✦</span>
                  <span className="sparkle s2">◆</span>
                  <span className="sparkle s3">✦</span>
                  <span className="sparkle s4">◆</span>
                  <span className="sparkle s5">✦</span>
                  <span className="sparkle s6">◆</span>
                </div>

                <div className="success-icon-wrap" aria-label="Password updated successfully">
                  <div className="success-icon-ring">
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 52 }}></i>
                  </div>
                </div>

                <h2>Password Updated!</h2>
                <p>
                  Your password has been successfully reset.<br />
                  You can now sign in with your new password.
                </p>

                <button
                  type="button"
                  className="proceed-button"
                  onClick={() => navigate('/login')}
                >
                  Proceed to Login
                  <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
                </button>

                <div className="forgot-footer">
                  Remember your password?{' '}
                  <Link to="/login">Back to Login</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
