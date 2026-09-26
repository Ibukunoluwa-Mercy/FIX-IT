import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordSuccess = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default ForgotPasswordSuccess;
