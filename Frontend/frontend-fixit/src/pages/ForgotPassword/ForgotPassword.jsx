import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import logo from '../../assets/fixit-logo-black.png';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('name@community.org');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      navigate('/reset-password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-shell">
        <aside className="forgot-branding" aria-label="Fixit portal branding">
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

        <section className="forgot-card-wrap">
          <div className="forgot-card">
            <div className="card-lock-badge" aria-hidden="true">
              <Mail size={26} />
            </div>

            <div className="forgot-card-header">
              <h2>Forgot Password?</h2>
              <p>No problem! Enter your email address and we&apos;ll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="forgot-form" noValidate>
              <div className="field-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-shell ${error ? 'has-error' : ''}`}>
                  <Mail size={16} className="field-icon" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError('');
                    }}
                    placeholder="name@community.org"
                    autoComplete="email"
                  />
                </div>
              </div>

              {error && <div className="field-error">{error}</div>}

              <button type="submit" className="reset-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
                <ArrowRight size={18} />
              </button>

              <div className="divider-row">
                <span className="divider-line" />
                <span className="divider-text">OR</span>
                <span className="divider-line" />
              </div>

              <Link to="/login" className="back-login-button">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </form>

            <div className="support-footer">
              Still having trouble? <a href="mailto:support@fixit.org">Contact Support</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
