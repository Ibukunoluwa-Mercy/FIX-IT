import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, MapPin, Lock, Eye, EyeOff,
  ShieldCheck, Users, Building2, ArrowRight, Loader2
} from 'lucide-react';
import logo from '../../assets/fixit-logo-black.png';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('resident');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    neighborhood: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.neighborhood.trim()) newErrors.neighborhood = 'Neighborhood or zip code is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!agreed) newErrors.agreed = 'You must agree to the terms';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="register-page">
      {/* Logo — top right */}
      <div className="register-logo-bar">
        <Link to="/">
          <img src={logo} alt="FIX-IT Logo" className="register-logo" />
        </Link>
      </div>

      <div className="register-split">
        {/* ─── LEFT HERO ─── */}
        <div className="register-hero animate-slide-in">
          <div className="register-hero-content">
            <h1 className="register-hero-headline">
              Your community,{' '}
              <span className="hero-accent">built better together.</span>
            </h1>
            <p className="register-hero-subtitle">
              Connect with neighbors, report local issues, and collaborate with
              officials to create a safer, cleaner environment for everyone.
            </p>

            {/* Feature Badges */}
            <div className="register-badges">
              <div className="register-badge">
                <div className="badge-icon-wrap">
                  <Building2 size={22} />
                </div>
                <div>
                  <div className="badge-title">Local Impact</div>
                  <div className="badge-desc">
                    See immediate changes in your neighborhood.
                  </div>
                </div>
              </div>
              <div className="register-badge">
                <div className="badge-icon-wrap">
                  <Users size={22} />
                </div>
                <div>
                  <div className="badge-title">Community Driven</div>
                  <div className="badge-desc">
                    Join thousands making a difference daily.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Neighborhood Illustration */}
          <div className="register-illustration-wrap">
            <img
              src={neighborhoodIllustration}
              alt="Connected neighborhood illustration"
              className="register-illustration"
            />
          </div>
        </div>

        {/* ─── RIGHT FORM ─── */}
        <div className="register-form-side animate-slide-in delay-100">
          <div className="register-card">
            {/* Progress Indicator */}
            <div className="register-progress-bar">
              <div className="progress-track">
                <div className="progress-filled" />
                <div className="progress-empty" />
              </div>
            </div>

            <h2 className="register-card-title">Create your account</h2>
            <p className="register-card-sub">I am joining as a:</p>

            {/* Role Tabs */}
            <div className="register-role-tabs">
              <button
                type="button"
                className={`role-tab ${role === 'resident' ? 'active' : ''}`}
                onClick={() => setRole('resident')}
              >
                <User size={20} className="role-tab-icon" />
                <span>Resident</span>
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'official' ? 'active' : ''}`}
                onClick={() => setRole('official')}
              >
                <ShieldCheck size={20} className="role-tab-icon" />
                <span>Local Official</span>
              </button>
            </div>

            {/* Admin callout banner */}
            <div className="register-admin-banner">
              <div className="admin-banner-left">
                <span className="admin-banner-label">Are you a local official?</span>
                <Link to="/admin/register" className="admin-banner-link">
                  Create an Admin Account <ArrowRight size={14} className="ms-1" />
                </Link>
              </div>
              <ShieldCheck size={26} className="admin-banner-icon" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="register-form">
              {/* Full Name */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="fullName">Full Name</label>
                <div className={`reg-input-wrap ${errors.fullName ? 'has-error' : ''}`}>
                  <User size={16} className="reg-input-icon" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="reg-input"
                    placeholder="Jane Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
                {errors.fullName && <span className="reg-error">{errors.fullName}</span>}
              </div>

              {/* Email */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="email">Email Address</label>
                <div className={`reg-input-wrap ${errors.email ? 'has-error' : ''}`}>
                  <Mail size={16} className="reg-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="reg-input"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="reg-error">{errors.email}</span>}
              </div>

              {/* Neighborhood / Zip */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="neighborhood">
                  {role === 'official' ? 'Department / District' : 'Neighborhood / Zip Code'}
                </label>
                <div className={`reg-input-wrap ${errors.neighborhood ? 'has-error' : ''}`}>
                  <MapPin size={16} className="reg-input-icon" />
                  <input
                    id="neighborhood"
                    name="neighborhood"
                    type="text"
                    className="reg-input"
                    placeholder={role === 'official' ? 'e.g. Public Works, District 5' : 'e.g. 90210 or Downtown'}
                    value={form.neighborhood}
                    onChange={handleChange}
                  />
                </div>
                {errors.neighborhood && <span className="reg-error">{errors.neighborhood}</span>}
              </div>

              {/* Password */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="password">Password</label>
                <div className={`reg-input-wrap ${errors.password ? 'has-error' : ''}`}>
                  <Lock size={16} className="reg-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="reg-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="reg-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="reg-error">{errors.password}</span>}
              </div>

              {/* Terms */}
              <div className="reg-terms">
                <label className="reg-terms-label">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (errors.agreed) setErrors({ ...errors, agreed: '' });
                    }}
                    className="reg-checkbox"
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className="reg-link">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="reg-link">Privacy Policy</Link>.
                  </span>
                </label>
                {errors.agreed && <span className="reg-error">{errors.agreed}</span>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="reg-submit-btn"
                disabled={loading}
                id="register-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="reg-spinner" />
                    <span>Creating Account…</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer link */}
            <p className="reg-footer-link">
              Already have an account?{' '}
              <Link to="/login" className="reg-link fw-semibold">Log in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
