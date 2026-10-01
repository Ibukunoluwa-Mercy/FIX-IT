import { Button, Form, Spinner } from 'react-bootstrap';

const ArtisanInfoSection = ({
  account,
  editingAccount,
  accountForm,
  setAccountForm,
  officialIdInput,
  onOfficialIdSelect,
  officialIdFile,
  uploadingOfficialId,
  uploadOfficialId,
  cancelOfficialId,
  apiUrl,
}) => {
  const certificateUrl = account.certificateUrl
    ? (account.certificateUrl.startsWith('http') ? account.certificateUrl : `${apiUrl}${account.certificateUrl}`)
    : '';

  return (
    <div className="settings-official-section">
      <div className="settings-section-divider">
        <div className="settings-section-title">
          <i className="fa-solid fa-briefcase" />
          <span>Artisan Business & Verification Details</span>
        </div>
        {account.verificationStatus && (
          <span className={`official-status-badge status-${account.verificationStatus.toLowerCase()}`}>
            <i className={account.verificationStatus === 'Approved' ? 'fa-solid fa-circle-check' : 'fa-solid fa-clock'} />
            {account.verificationStatus}
          </span>
        )}
      </div>

      <div className="settings-account-fields">
        <div className="settings-account-field">
          <i className="fa-solid fa-store" />
          <div>
            <span>Business / Trade Name</span>
            {editingAccount ? (
              <Form.Control
                size="sm"
                type="text"
                value={accountForm.businessName || ''}
                placeholder="e.g. Acme Plumbing & Repair"
                onChange={(event) => setAccountForm((current) => ({ ...current, businessName: event.target.value }))}
              />
            ) : (
              <strong>{account.businessName || 'Not provided'}</strong>
            )}
          </div>
        </div>

        <div className="settings-account-field">
          <i className="fa-solid fa-user-gear" />
          <div>
            <span>Account Role</span>
            <strong>Artisan</strong>
          </div>
        </div>

        <div className="settings-account-field settings-account-field-full">
          <i className="fa-solid fa-file-contract" />
          <div>
            <span>Uploaded Certificate / Document</span>
            {editingAccount ? (
              <div className="official-id-upload-wrap">
                <input
                  ref={officialIdInput}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="visually-hidden"
                  onChange={onOfficialIdSelect}
                />
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  className="official-file-picker-btn"
                  onClick={() => officialIdInput?.current?.click()}
                >
                  <i className="fa-solid fa-cloud-arrow-up" />
                  {officialIdFile ? officialIdFile.name : (account.certificateName || 'Upload updated certificate')}
                </Button>
                {officialIdFile && (
                  <div className="official-file-actions">
                    <Button size="sm" variant="primary" onClick={uploadOfficialId} disabled={uploadingOfficialId}>
                      {uploadingOfficialId ? <Spinner size="sm" animation="border" /> : 'Save document'}
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={cancelOfficialId} disabled={uploadingOfficialId}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : certificateUrl ? (
              <div className="official-id-preview">
                <a href={certificateUrl} target="_blank" rel="noreferrer" className="official-id-link">
                  <i className="fa-solid fa-file-pdf" />
                  <span>{account.certificateName || 'View Certificate'}</span>
                  <i className="fa-solid fa-arrow-up-right-from-square official-link-icon" />
                </a>
              </div>
            ) : (
              <strong>Not uploaded</strong>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanInfoSection;
