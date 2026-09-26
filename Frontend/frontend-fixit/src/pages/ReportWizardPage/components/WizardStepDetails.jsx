const categories = [
  'Potholes & Road Damage',
  'Streetlight Outages',
  'Garbage & Litter',
  'Water Leaks',
  'Others',
];

const severities = [
  ['Low', 'Minor issue'],
  ['Medium', 'Moderate issue'],
  ['High', 'Urgent issue'],
];

const WizardStepDetails = ({ form, onUpdate, onSeverityChange }) => {
  return (
    <>
      <label>
        What type of issue is this?
        <select name="category" value={form.category} onChange={onUpdate}>
          <option value="">Select issue category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label>
        Describe the issue
        <textarea
          name="description"
          maxLength="500"
          value={form.description}
          onChange={onUpdate}
          placeholder="Provide a clear description of the problem..."
        />
        <small className="counter">{form.description.length}/500</small>
      </label>

      <fieldset>
        <legend>How severe is the issue?</legend>
        <div className="severity-grid">
          {severities.map(([name, note]) => (
            <button
              type="button"
              className={`severity ${form.severity === name ? 'selected' : ''}`}
              key={name}
              onClick={() => onSeverityChange(name)}
            >
              <b className={name.toLowerCase()} />
              {name}
              <small>{note}</small>
            </button>
          ))}
        </div>
      </fieldset>
    </>
  );
};

export default WizardStepDetails;
