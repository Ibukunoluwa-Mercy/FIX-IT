const WizardActions = ({
  step,
  steps,
  submitting,
  form,
  onBack,
  onNext,
  onSubmit,
}) => {
  return (
    <footer className="wizard-actions">
      {step > 1 && (
        <button className="wizard-secondary" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}></i> Back
        </button>
      )}

      {step < 4 ? (
        <button
          className="wizard-primary"
          disabled={step === 2 && (form.location.latitude === null || form.location.longitude === null)}
          onClick={onNext}
        >
          Next: {steps[step]} <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
        </button>
      ) : (
        <button className="wizard-primary" disabled={submitting} onClick={onSubmit}>
          {submitting ? 'Submitting...' : 'Submit Report'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
        </button>
      )}
    </footer>
  );
};

export default WizardActions;
