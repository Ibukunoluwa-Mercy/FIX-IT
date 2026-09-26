const WizardStepper = ({ step, steps, onStepClick }) => {
  return (
    <aside className="wizard-stepper">
      {steps.map((label, index) => (
        <button
          key={label}
          className={step === index + 1 ? 'current' : step > index + 1 ? 'complete' : ''}
          onClick={() => step > index + 1 && onStepClick(index + 1)}
        >
          <span>{step > index + 1 ? <i className="fa-solid fa-check" style={{ fontSize: 13 }}></i> : index + 1}</span>
          {label}
        </button>
      ))}
    </aside>
  );
};

export default WizardStepper;
