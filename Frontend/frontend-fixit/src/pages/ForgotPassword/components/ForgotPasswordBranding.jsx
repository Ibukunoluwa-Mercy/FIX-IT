import { Link } from 'react-router-dom';
import neighborhoodIllustration from '../../../assets/neighborhood_illustration.png';
import logo from '../../../assets/fixit-logo-white.png';

const ForgotPasswordBranding = ({ resetToken }) => {
  return (
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
  );
};

export default ForgotPasswordBranding;
