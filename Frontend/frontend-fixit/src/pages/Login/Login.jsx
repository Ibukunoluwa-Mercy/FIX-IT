import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, MapPin, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import logo from '../../assets/fixit-logo-black.png';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import './Login.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:2701';

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      localStorage.setItem('fixitToken', data.token);
      localStorage.setItem('fixitUser', JSON.stringify(data.user || {}));

      const firstName = data.user?.name?.split(' ')[0] || 'there';
      toast.success(`Welcome back, ${firstName}!`);
      navigate('/explore');
    } catch (err) {
      const message = err.message || 'Unable to sign in right now.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <aside className="login-branding login-reveal login-reveal-hero" aria-label="Fixit portal branding">
          <div className="brand-row">
            <div className="brand-badge" aria-label="Fixit logo">
              <img src={logo} alt="Fixit" className="brand-logo" />
            </div>
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
                <MapPin size={18} />
              </div>
              <div className="feature-copy">
                <h2>Local Impact</h2>
                <p>See immediate changes in your neighborhood.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <Users size={18} />
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
                  <Mail size={16} className="field-icon" />
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
                  <Lock size={16} className="field-icon" />
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-links">
              <p>
                Don&apos;t have an account? <Link to="/register">Register here</Link>
              </p>
              <p>
                System Admin? <Link to="/login?role=admin">Log in here</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
