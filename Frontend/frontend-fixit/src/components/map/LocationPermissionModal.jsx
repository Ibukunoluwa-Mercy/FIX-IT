const LocationPermissionModal = ({ onCancel, onContinue }) => {
  return (
    <div className="location-permission-backdrop" role="presentation">
      <div
        className="location-permission-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-permission-title"
      >
        <i className="fa-solid fa-location-crosshairs permission-icon"></i>
        <h3 id="location-permission-title">Turn on your location</h3>
        <p>
          Please make sure Location/GPS is turned on on your device, then allow access when your
          browser asks. This lets us pinpoint exactly where the problem is.
        </p>
        <div>
          <button type="button" className="wizard-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="wizard-primary" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
