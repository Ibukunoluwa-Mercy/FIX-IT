import { Button, Form } from 'react-bootstrap';

export const LocationTab = ({ location, onEditAccount }) => (
  <section className="settings-card">
    <div className="settings-card-heading">
      <div>
        <h2>Location</h2>
        <p>Your saved account location is used when nearby issues cannot access your live location.</p>
      </div>
    </div>
    <div className="settings-location-value">
      <i className="fa-solid fa-location-dot" />
      <div>
        <strong>{location || 'Location not provided'}</strong>
        <span>{location ? 'Account location' : 'Add a location in Account Information.'}</span>
      </div>
    </div>
    {location && (
      <Button variant="outline-primary" size="sm" onClick={onEditAccount}>
        Edit account details
      </Button>
    )}
  </section>
);

export const AppearanceTab = ({ appearance, onSaveAppearance }) => (
  <section className="settings-card">
    <div className="settings-card-heading">
      <div>
        <h2>Appearance</h2>
        <p>Choose how FixIt looks on this device.</p>
      </div>
    </div>
    <Form.Select
      aria-label="Theme"
      value={appearance}
      onChange={(event) => onSaveAppearance(event.target.value)}
    >
      <option value="system">Use device setting</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </Form.Select>
  </section>
);

export const HelpTab = ({ onOpenHelpCenter }) => (
  <section className="settings-card">
    <div className="settings-card-heading">
      <div>
        <h2>Help &amp; Support</h2>
        <p>Find answers and contact the FixIt support team.</p>
      </div>
    </div>
    <Button variant="outline-primary" onClick={onOpenHelpCenter}>
      Open Help Center
    </Button>
  </section>
);
