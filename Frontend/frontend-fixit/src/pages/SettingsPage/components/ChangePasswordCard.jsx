import { Button, Form, Spinner } from 'react-bootstrap';

const ChangePasswordCard = ({
  passwordForm,
  setPasswordForm,
  passwordVisibility,
  setPasswordVisibility,
  passwordError,
  setPasswordError,
  changingPassword,
  onSubmitPassword,
}) => {
  return (
    <section className="settings-card settings-password-card">
      <div className="settings-card-heading">
        <div className="settings-heading-icon password-icon">
          <i className="fa-solid fa-lock" />
        </div>
        <div>
          <h2>Change Password</h2>
          <p>Keep your account safe by using a strong password.</p>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          className="settings-action"
          type="submit"
          form="change-password-form"
          disabled={
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword ||
            changingPassword
          }
        >
          {changingPassword ? (
            <>
              <Spinner size="sm" animation="border" /> Updating...
            </>
          ) : (
            <>
              <i className="fa-solid fa-key" /> Change Password
            </>
          )}
        </Button>
      </div>
      <Form id="change-password-form" onSubmit={onSubmitPassword}>
        <div className="settings-password-fields">
          {[
            ['currentPassword', 'Current Password', 'Enter current password'],
            ['newPassword', 'New Password', 'Enter new password'],
            ['confirmPassword', 'Confirm New Password', 'Confirm new password'],
          ].map(([key, label, placeholder]) => (
            <Form.Group key={key}>
              <Form.Label>{label}</Form.Label>
              <div className="settings-password-input">
                <Form.Control
                  type={passwordVisibility[key] ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={placeholder}
                  value={passwordForm[key]}
                  onChange={(event) => {
                    setPasswordForm((current) => ({ ...current, [key]: event.target.value }));
                    setPasswordError('');
                  }}
                />
                <button
                  type="button"
                  aria-label={`Show or hide ${label.toLowerCase()}`}
                  onClick={() =>
                    setPasswordVisibility((current) => ({
                      ...current,
                      [key]: !current[key],
                    }))
                  }
                >
                  <i
                    className={`fa-regular ${
                      passwordVisibility[key] ? 'fa-eye-slash' : 'fa-eye'
                    }`}
                  />
                </button>
              </div>
            </Form.Group>
          ))}
        </div>
        {passwordError && (
          <div className="settings-inline-error" role="alert">
            {passwordError}
          </div>
        )}
      </Form>
    </section>
  );
};

export default ChangePasswordCard;
