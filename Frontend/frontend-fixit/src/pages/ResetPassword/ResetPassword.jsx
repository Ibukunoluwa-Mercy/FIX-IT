import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import axios from 'axios';
import logo from '../../assets/fixit-logo-black.png';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  /* ── real-time validation ── */
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
    /* re-validate the changed field instantly */
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
      const resetToken = searchParams.get('token');
      if (!resetToken) {
        setErrors({ form: 'This password reset link is invalid or incomplete.' });
        return;
      }
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        'http://localhost:5100';
      const response = await axios.put(
        `${apiUrl}/api/auth/reset-password/${encodeURIComponent(resetToken)}`,
        { password: form.newPassword }
      );
      localStorage.setItem('fixitToken', response.data.token);
      setSuccess(true);
    } catch (err) {
      setErrors({
        form:
          err.response?.data?.message ||
          'Unable to reset your password. Please request a new link.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      {/* decorative blobs */}
      <div className="rp-blob rp-blob--coral"  aria-hidden="true" />
      <div className="rp-blob rp-blob--mint"   aria-hidden="true" />

      {/* ── Card ── */}
      <div className="rp-card">

        {/* Fixit logo badge */}
        <div className="rp-logo-badge" aria-label="Fixit">
          <img src={logo} alt="Fixit logo" />
        </div>

        {/* ════════════════════════════════
            FORM STATE
            ════════════════════════════════ */}
        {!success ? (
          <>
            {/* lock icon circle */}
            <div className="rp-lock-badge" aria-hidden="true">
              <Lock size={26} strokeWidth={2.2} />
            </div>

            <div className="rp-header">
              <h1>Reset Password</h1>
              <p>Enter your new password below to regain access to your account.</p>
            </div>

            <form className="rp-form" onSubmit={handleSubmit} noValidate>

              {/* New Password */}
              <div className="rp-field">
                <label htmlFor="rp-new">New Password</label>
                <div className={`rp-input-wrap ${errors.newPassword ? 'is-error' : ''}`}>
                  <Lock size={16} className="rp-prefix-icon" />
                  <input
                    id="rp-new"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="rp-eye"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="rp-error-msg">
                    <svg className="rp-error-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.8"/>
                      <line x1="10" y1="6" x2="10" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="10" cy="14" r="1" fill="currentColor"/>
                    </svg>
                    {errors.newPassword}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="rp-field">
                <label htmlFor="rp-confirm">Confirm New Password</label>
                <div className={`rp-input-wrap ${errors.confirmPassword ? 'is-error' : ''}`}>
                  <Lock size={16} className="rp-prefix-icon" />
                  <input
                    id="rp-confirm"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="rp-eye"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="rp-error-msg">
                    <svg className="rp-error-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.8"/>
                      <line x1="10" y1="6" x2="10" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="10" cy="14" r="1" fill="currentColor"/>
                    </svg>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {errors.form && (
                <div className="rp-error-msg rp-error-msg--form">{errors.form}</div>
              )}

              {/* Submit */}
              <button type="submit" className="rp-submit-btn" disabled={loading}>
                {loading ? (
                  <><span className="rp-spinner" aria-hidden="true" /> Resetting…</>
                ) : (
                  <>Reset Password <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <div className="rp-divider" aria-hidden="true" />

            <div className="rp-footer">
              Remember your password?{' '}
              <Link to="/login">Back to Login</Link>
            </div>
          </>
        ) : (
          /* ════════════════════════════════
              SUCCESS STATE  –  Password Updated
              ════════════════════════════════ */
          <div className="rp-success">
            {/* floating sparkle diamonds */}
            <span className="sp sp1" aria-hidden="true">◆</span>
            <span className="sp sp2" aria-hidden="true">✦</span>
            <span className="sp sp3" aria-hidden="true">◆</span>
            <span className="sp sp4" aria-hidden="true">✦</span>
            <span className="sp sp5" aria-hidden="true">◆</span>
            <span className="sp sp6" aria-hidden="true">✦</span>

            <div className="rp-check-ring" aria-label="Password updated successfully">
              <CheckCircle size={52} strokeWidth={2} />
            </div>

            <h1 className="rp-success-title">Password Updated!</h1>
            <p className="rp-success-sub">
              Your password has been successfully reset.<br />
              You can now sign in with your new password.
            </p>

            <button
              type="button"
              className="rp-submit-btn"
              onClick={() => navigate('/login')}
            >
              Proceed to Login <ArrowRight size={18} />
            </button>

            <div className="rp-divider" aria-hidden="true" />

            <div className="rp-footer">
              Remember your password?{' '}
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
