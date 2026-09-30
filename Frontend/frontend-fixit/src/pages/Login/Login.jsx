import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../../assets/fixit-logo-white.png';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import './Login.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminMode = new URLSearchParams(location.search).get('role') === 'admin';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const [countdown, setCountdown] = useState(null);
  
  // Optional: Update countdown live if it's set
  useEffect(() => {
      if (countdown !== null && countdown > 0) {
          const timer = setInterval(() => setCountdown(c => c - 1), 1000);
          return () => clearInterval(timer);
      }
  }, [countdown]);

  // Pre-fill email if passed from Registration success screen
  useEffect(() => {
      if (location.state?.email && !form.email) {
          setForm(prev => ({ ...prev, email: location.state.email }));
      }
  }, [location.state]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setCountdown(null);

    // 1. Submit with fetch using .then()/.catch() promise chaining (no async/await)
    // 2. Include credentials to store httpOnly cookies securely
    fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }),
    })
      .then((response) => {
        // We need to parse JSON to see error codes/messages
        return response.json().then((data) => ({ status: response.status, data }));
      })
      .then(({ status, data }) => {
        setLoading(false);

        // 3. Handle responses by status code as requested
        if (status === 200) {
          localStorage.setItem('fixitToken', data.token); // Optional: if using bearer fallback
          localStorage.setItem('fixitUser', JSON.stringify(data.user || {}));
          localStorage.setItem('fixitDashboardGreeting', 'welcome-back');

          const firstName = data.user?.name?.split(' ')[0] || 'there';
          toast.success(`Welcome back, ${firstName}!`);
          
          // Redirect by role
          const role = data.user?.role?.toLowerCase() || 'resident';
          if (role === 'admin' || role === 'official') {
              navigate('/dashboard/official');
          } else if (role === 'artisan') {
              navigate('/dashboard/artisan');
          } else {
              navigate('/dashboard/resident');
          }
        } else if (status === 403 && data.code === 'ACCOUNT_VERIFYING') {
          // Do NOT show a red error. Show a friendly notice with a live countdown
          setCountdown(data.secondsRemaining || 300);
        } else if (status === 401) {
          setError('Invalid email or password.');
          toast.error('Invalid email or password.');
        } else if (status === 403 && data.code === 'ACCOUNT_SUSPENDED') {
          setError('This account is not active. Contact support.');
          toast.error('This account is not active. Contact support.');
        } else if (status === 429) {
          setError('Too many attempts. Try again later.');
          toast.error('Too many attempts. Try again later.');
        } else {
          const message = data.message || 'Unable to sign in right now.';
          setError(message);
          toast.error(message);
        }
      })
      .catch((err) => {
        setLoading(false);
        const message = 'Unable to reach the server. Please try again.';
        setError(message);
        toast.error(message);
      });
  };

  return (
    <div className="login-page">
      <div className="login-logo-bar">
        <Link to="/" aria-label="Fixit Homepage">
          <img src={logo} alt="Fixit" className="login-logo" />
        </Link>
      </div>

      <div className="login-shell">
        <aside className="login-branding login-reveal login-reveal-hero" aria-label="Fixit portal branding">
          <div className="brand-row">
            <Link to="/" className="brand-link" aria-label="Fixit Homepage">
              <img src={logo} alt="Fixit" className="brand-logo" />
            </Link>
          </div>

          <div className="login-copy-block">
            <h1 className="login-headline">
              Welcome back
              <span className="headline-highlight">Let&apos;s keep making our community better.</span>
            </h1>

            <p className="login-subtext">
              Sign in to report and track issues happening in your neighborhood.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon orange">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div className="feature-copy">
                <h2>Local Impact</h2>
                <p>See immediate changes in your neighborhood.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="feature-copy">
                <h2>Community Driven</h2>
                <p>Join thousands making a difference daily.</p>
              </div>
            </div>
          </div>

          <div className="illustration-card">
            <img src={neighborhoodIllustration} alt="Neighborhood illustration" className="illustration-image" />
          </div>
        </aside>

        <section className="login-card-wrap login-reveal login-reveal-card">
          <div className="login-card">
            <h2 className="card-title">{isAdminMode ? 'Admin Login' : 'Welcome Back'}</h2>
            <p className="card-subtitle">
              {isAdminMode ? 'Sign in to manage local reports and actions.' : 'Sign in to report and track issues.'}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-shell">
                  <i className="fa-solid fa-envelope field-icon"></i>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@community.org"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="field-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="password-link">
                    Forgot Password?
                  </Link>
                </div>

                <div className="input-shell">
                  <i className="fa-solid fa-lock field-icon"></i>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                  </button>
                </div>
              </div>

              {countdown !== null ? (
                <div className="form-notice" style={{ color: '#f59e0b', backgroundColor: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>
                  <i className="fa-solid fa-clock" style={{ marginRight: '8px' }}></i>
                  {countdown > 0 
                    ? `We're still verifying your information. You can log in in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}.`
                    : "You're all set, log in now."}
                </div>
              ) : error ? (
                <div className="form-error">{error}</div>
              ) : null}

              <button type="submit" className="login-submit" disabled={loading || (countdown !== null && countdown > 0)}>
                {loading ? 'Logging in...' : 'Login'}
                <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }}></i>
              </button>
            </form>

            <div className="auth-links">
              <p>
                Don&apos;t have an account? <Link to="/register">Register here</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
