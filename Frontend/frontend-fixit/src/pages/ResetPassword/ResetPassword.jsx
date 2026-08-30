import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import axios from 'axios';
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

  const validate = () => {
    const nextErrors = {};

    if (!form.newPassword) {
      nextErrors.newPassword = 'Password is required.';
    } else if (form.newPassword.length < 8) {
      nextErrors.newPassword = 'Password must be at least 8 characters.';
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const resetToken = searchParams.get('token');
      if (!resetToken) {
        setErrors({ form: 'This password reset link is invalid or incomplete.' });
        return;
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
      const response = await axios.put(`${apiUrl}/api/auth/reset-password/${encodeURIComponent(resetToken)}`, {
        password: form.newPassword,
      });
      localStorage.setItem('fixitToken', response.data.token);
      setSuccess(true);
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Unable to reset your password. Please request a new link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <div className="reset-icon-wrap" aria-hidden="true">
          <ShieldCheck size={28} />
        </div>

        {!success ? (
          <>
            <div className="reset-header">
              <h1>Reset Password</h1>
              <p>Enter your new password below to regain access to your account.</p>
            </div>

            <form className="reset-form" onSubmit={handleSubmit} noValidate>
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
                    onClick={() => setShowNew((current) => !current)}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
              </div>

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
                    onClick={() => setShowConfirm((current) => !current)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>

              {errors.form && <div className="field-error">{errors.form}</div>}

              <button type="submit" className="reset-button" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
                <ArrowRight size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="success-state">
            <div className="success-icon-wrap" aria-hidden="true">
              <Check size={48} />
            </div>
            <h2>Password Updated!</h2>
            <p>Your password has been successfully reset. You can now sign in with your new password.</p>
            <button type="button" className="proceed-button" onClick={() => navigate('/login')}>
              Proceed to Login
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {!success && (
          <div className="reset-footer">
            Remember your password? <Link to="/login">Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
