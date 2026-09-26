const WizardIntro = ({ onStart, onClose }) => {
  return (
    <div className="wizard-backdrop">
      <div className="wizard-intro" role="dialog" aria-modal="true">
        <button className="wizard-close" onClick={onClose} aria-label="Close">
          <i className="fa-solid fa-xmark"></i>
        </button>
        <span className="wizard-intro-icon">
          <i className="fa-solid fa-image" style={{ fontSize: 24 }}></i>
        </span>
        <h2>Report a New Problem</h2>
        <p>Help keep our community safe and clean by letting us know what&apos;s happening.</p>
        {[
          ['Quick & Easy', 'Report issues in just a few steps.'],
          ['Track Progress', 'We&apos;ll keep you updated on the status.'],
          ['Stronger Community', 'Your report helps make a difference.'],
        ].map(([title, text], index) => (
          <div className="intro-benefit" key={title}>
            <span>{index + 1}</span>
            <div>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
          </div>
        ))}
        <button className="wizard-primary" onClick={onStart}>
          Report Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
        </button>
        <button className="wizard-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WizardIntro;
