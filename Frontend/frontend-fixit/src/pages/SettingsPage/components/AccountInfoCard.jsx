import { Button, Form, Spinner } from 'react-bootstrap';
import OfficialInfoSection from './OfficialInfoSection';

const AccountInfoCard = ({
  account,
  editingAccount,
  setEditingAccount,
  accountForm,
  setAccountForm,
  savingAccount,
  onSaveAccount,
  onBeginEdit,
  avatarSource,
  userName,
  userInitial,
  avatarInput,
  onAvatarSelect,
  avatarFile,
  uploadAvatar,
  uploadingAvatar,
  cancelAvatar,
  officialIdInput,
  onOfficialIdSelect,
  officialIdFile,
  uploadingOfficialId,
  uploadOfficialId,
  cancelOfficialId,
  apiUrl,
}) => {
  return (
    <section className="settings-card settings-account-card">
      <div className="settings-card-heading">
        <div>
          <h2>Account Information</h2>
          <p>Update your personal information and profile details.</p>
        </div>
        {!editingAccount ? (
          <Button variant="outline-primary" size="sm" className="settings-action" onClick={onBeginEdit}>
            <i className="fa-solid fa-pen" /> Edit
          </Button>
        ) : (
          <div className="settings-edit-actions">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setEditingAccount(false)}
              disabled={savingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSaveAccount}
              disabled={savingAccount || !accountForm.fullName.trim() || !accountForm.email.trim()}
            >
              {savingAccount ? (
                <>
                  <Spinner size="sm" animation="border" /> Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="settings-profile-summary">
        <div className="settings-avatar-wrap">
          {avatarSource ? (
            <img className="settings-avatar" src={avatarSource} alt={`${userName} profile`} />
          ) : (
            <span className="settings-avatar settings-avatar-initial">{userInitial}</span>
          )}
          <button
            type="button"
            className="settings-avatar-camera"
            aria-label="Choose profile picture"
            onClick={() => avatarInput.current?.click()}
          >
            <i className="fa-solid fa-camera" />
          </button>
          <input
            ref={avatarInput}
            className="visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onAvatarSelect}
          />
        </div>
        <div className="settings-profile-copy">
          <strong>{account.fullName || 'Name not provided'}</strong>
          <span>{account.email || 'Email not provided'}</span>
          {account.emailVerified && (
            <span className="settings-verified">
              <i className="fa-solid fa-circle-check" /> Verified
            </span>
          )}
          {!account.emailVerified && <span className="settings-unverified">Email not verified</span>}
          {avatarFile && (
            <div className="settings-avatar-actions">
              <Button size="sm" variant="primary" onClick={uploadAvatar} disabled={uploadingAvatar}>
                {uploadingAvatar ? (
                  <>
                    <Spinner size="sm" animation="border" /> Uploading...
                  </>
                ) : (
                  'Save picture'
                )}
              </Button>
              <Button size="sm" variant="outline-secondary" onClick={cancelAvatar} disabled={uploadingAvatar}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <Form onSubmit={onSaveAccount}>
        <div className="settings-account-fields">
          {[
            ['fullName', 'Full Name', 'fa-regular fa-user'],
            ['email', 'Email Address', 'fa-regular fa-envelope'],
            ['phone', 'Phone Number', 'fa-solid fa-phone'],
            ['location', 'Location', 'fa-solid fa-location-dot'],
          ].map(([key, label, icon]) => (
            <div className="settings-account-field" key={key}>
              <i className={icon} />
              <div>
                <span>{label}</span>
                {editingAccount ? (
                  <Form.Control
                    size="sm"
                    type={key === 'email' ? 'email' : 'text'}
                    value={accountForm[key]}
                    placeholder={
                      key === 'phone'
                        ? 'Add phone number'
                        : key === 'location'
                        ? 'Add location'
                        : ''
                    }
                    onChange={(event) =>
                      setAccountForm((current) => ({ ...current, [key]: event.target.value }))
                    }
                    required={key === 'fullName' || key === 'email'}
                  />
                ) : (
                  <strong>
                    {account[key] ||
                      (key === 'phone'
                        ? 'Add phone number'
                        : key === 'location'
                        ? 'Location not provided'
                        : 'Not provided')}
                  </strong>
                )}
              </div>
            </div>
          ))}
        </div>
        {account.isOfficial && (
          <OfficialInfoSection
            account={account}
            editingAccount={editingAccount}
            accountForm={accountForm}
            setAccountForm={setAccountForm}
            officialIdInput={officialIdInput}
            onOfficialIdSelect={onOfficialIdSelect}
            officialIdFile={officialIdFile}
            uploadingOfficialId={uploadingOfficialId}
            uploadOfficialId={uploadOfficialId}
            cancelOfficialId={cancelOfficialId}
            apiUrl={apiUrl}
          />
        )}
      </Form>
    </section>
  );
};

export default AccountInfoCard;
