import { Button, Form, Spinner } from 'react-bootstrap';

const ArtisanInfoSection = ({
  account,
  editingAccount,
  setEditingAccount,
  accountForm,
  setAccountForm,
  savingAccount,
  onSaveAccount,
  onBeginEdit,
  officialIdInput,
  onOfficialIdSelect,
  officialIdFile,
  uploadingOfficialId,
  uploadOfficialId,
  cancelOfficialId,
  apiUrl,
}) => {
  const rawDocUrl = account.certificateUrl || account.idDocumentUrl || '';
  const certificateUrl = rawDocUrl
    ? (rawDocUrl.startsWith('http') ? rawDocUrl : `${apiUrl}${rawDocUrl}`)
    : '';
  const documentName = account.certificateName || account.officialIdName || (rawDocUrl ? rawDocUrl.split('/').pop() : '');

  return (
    <div className="settings-official-section">
      <div className="settings-section-divider">
        <div className="settings-section-title">
          <i className="fa-solid fa-briefcase" />
          <span>Official Information</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {account.verificationStatus && (
            <span className={`official-status-badge status-${account.verificationStatus.toLowerCase()}`}>
              <i className={account.verificationStatus === 'Approved' ? 'fa-solid fa-circle-check' : 'fa-solid fa-clock'} />
              {account.verificationStatus}
            </span>
          )}
          {!editingAccount ? (
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              className="settings-action"
              onClick={onBeginEdit}
            >
              <i className="fa-solid fa-pen" /> Edit
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                onClick={() => setEditingAccount && setEditingAccount(false)}
                disabled={savingAccount}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onSaveAccount}
                disabled={savingAccount}
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
      </div>

      <div className="settings-account-fields">
        <div className="settings-account-field">
          <i className="fa-solid fa-building" />
          <div>
            <span>Office / Department</span>
            <strong>{account.office || account.department || 'Not provided'}</strong>
          </div>
        </div>

        <div className="settings-account-field">
          <i className="fa-solid fa-location-dot" />
          <div>
            <span>Local Government Area</span>
            <strong>{account.lga || account.location || 'Not provided'}</strong>
          </div>
        </div>

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
            <span>Official ID Document</span>
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
                  {officialIdFile ? officialIdFile.name : (documentName || 'Upload updated document')}
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
                  <i className="fa-solid fa-file-lines" />
                  <span>{documentName || 'View Document'}</span>
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
