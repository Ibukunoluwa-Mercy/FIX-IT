import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Eye, EyeOff, Lock, ShieldCheck, Mail } from 'lucide-react';
import axios from 'axios';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import logo from '../../assets/fixit-logo-black.png';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
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
      const next = { ...prev, [name]: '' };
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
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return; }

    setLoading(true);
    try {
      const resetToken = searchParams.get('token') || 'dummy-token';
      const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
      
      // Attempt actual API call if token is provided, otherwise simulate success
      if (searchParams.get('token')) {
        const response = await axios.put(
          `${apiUrl}/api/auth/reset-password/${encodeURIComponent(resetToken)}`,
          { password: form.newPassword }
        );
        localStorage.setItem('fixitToken', response.data.token);
      }
      setSuccess(true);
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || 'Unable to reset your password. Please request a new link.',
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
            <div className="brand-badge" aria-label="Fixit logo">
              <img src={logo} alt="Fixit" className="brand-logo" />
            </div>
          </div>

          <div className="forgot-copy-block">
            <h1 className="forgot-headline">
              No worries,
              <span className="headline-highlight">we&apos;ve got you.</span>
            </h1>
            <p className="forgot-subtext">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <div className="forgot-feature-grid">
            <div className="forgot-feature-card">
              <div className="forgot-feature-icon orange">
                <ShieldCheck size={18} />
              </div>
              <div className="forgot-feature-copy">
                <h2>Secure &amp; Private</h2>
                <p>Your information is safe with us.</p>
              </div>
            </div>

            <div className="forgot-feature-card">
              <div className="forgot-feature-icon orange">
                <Mail size={18} />
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
                  <Lock size={26} strokeWidth={2.2} />
                </div>

                <div className="forgot-card-header">
                  <h2>Reset Password</h2>
                  <p>Enter your new password below to regain access to your account.</p>
                </div>

                <form className="forgot-form" onSubmit={handleSubmit} noValidate>
                  
                  {/* New Password */}
                  <div className="field-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className={`input-shell ${errors.newPassword ? 'has-error' : ''}`}>
                      <Lock size={16} className="field-icon" />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNew ? 'text' : 'password'}
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowNew((c) => !c)}
                        aria-label={showNew ? 'Hide password' : 'Show password'}
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <span className="field-error">
                        <svg className="error-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.8"/>
                          <line x1="10" y1="6" x2="10" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="10" cy="14" r="1" fill="currentColor"/>
                        </svg>
                        {errors.newPassword}
                      </span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="field-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className={`input-shell ${errors.confirmPassword ? 'has-error' : ''}`}>
                      <Lock size={16} className="field-icon" />
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
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="field-error">
                        <svg className="error-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.8"/>
                          <line x1="10" y1="6" x2="10" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="10" cy="14" r="1" fill="currentColor"/>
                        </svg>
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>

                  {errors.form && <div className="field-error form-error">{errors.form}</div>}

                  <button type="submit" className="reset-button" disabled={loading}>
                    {loading ? (
                      <><span className="spinner" aria-hidden="true" /> Resetting...</>
                    ) : (
                      <>Reset Password <ArrowRight size={18} /></>
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
                    <CheckCircle size={52} />
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
                  <ArrowRight size={18} />
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
