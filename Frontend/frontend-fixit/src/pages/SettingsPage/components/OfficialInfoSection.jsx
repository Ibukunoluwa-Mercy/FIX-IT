import { Button, Form, Spinner } from 'react-bootstrap';
import { officialOptions } from '../settingsConstants';

const OfficialInfoSection = ({
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
  const documentUrl = account.idDocumentUrl
    ? (account.idDocumentUrl.startsWith('http') ? account.idDocumentUrl : `${apiUrl}${account.idDocumentUrl}`)
    : '';

  return (
    <div className="settings-official-section">
      <div className="settings-section-divider">
        <div className="settings-section-title">
          <i className="fa-solid fa-shield-halved" />
          <span>Official Information</span>
        </div>
        {account.verificationStatus && (
          <span className={`official-status-badge status-${account.verificationStatus.toLowerCase()}`}>
            <i className={account.verificationStatus === 'Verified' ? 'fa-solid fa-circle-check' : 'fa-solid fa-clock'} />
            {account.verificationStatus}
          </span>
        )}
      </div>

      <div className="settings-account-fields">
        <div className="settings-account-field">
          <i className="fa-solid fa-building" />
          <div>
            <span>Office / Department</span>
            {editingAccount ? (
              <Form.Select
                size="sm"
                value={accountForm.office || ''}
                onChange={(event) => setAccountForm((current) => ({ ...current, office: event.target.value }))}
              >
                <option value="">Select your office</option>
                {officialOptions.office.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
            ) : (
              <strong>{account.office || 'Not provided'}</strong>
            )}
          </div>
        </div>

        <div className="settings-account-field">
          <i className="fa-solid fa-shield-halved" />
          <div>
            <span>Role / Position</span>
            {editingAccount ? (
              <Form.Select
                size="sm"
                value={accountForm.position || ''}
                onChange={(event) => setAccountForm((current) => ({ ...current, position: event.target.value }))}
              >
                <option value="">Select your position</option>
                {officialOptions.position.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
            ) : (
              <strong>{account.position || 'Not provided'}</strong>
            )}
          </div>
        </div>

        <div className="settings-account-field">
          <i className="fa-solid fa-location-dot" />
          <div>
            <span>Local Government Area</span>
            {editingAccount ? (
              <Form.Select
                size="sm"
                value={accountForm.lga || ''}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, lga: event.target.value, location: event.target.value }))
                }
              >
                <option value="">Select your LGA</option>
                {officialOptions.lga.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
            ) : (
              <strong>{account.lga || account.location || 'Not provided'}</strong>
            )}
          </div>
        </div>

        <div className="settings-account-field">
          <i className="fa-solid fa-id-badge" />
          <div>
            <span>Employee / Staff ID</span>
            {editingAccount ? (
              <Form.Control
                size="sm"
                type="text"
                value={accountForm.staffId || ''}
                placeholder="e.g. LG/2024/001234"
                onChange={(event) => setAccountForm((current) => ({ ...current, staffId: event.target.value }))}
              />
            ) : (
              <strong>{account.staffId || 'Not provided'}</strong>
            )}
          </div>
        </div>

        <div className="settings-account-field settings-account-field-full">
          <i className="fa-solid fa-file-lines" />
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
                  {officialIdFile ? officialIdFile.name : (account.officialIdName || 'Upload new document')}
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
            ) : documentUrl ? (
              <div className="official-id-preview">
                <a href={documentUrl} target="_blank" rel="noreferrer" className="official-id-link">
                  <i className="fa-solid fa-file-lines" />
                  <span>{account.officialIdName || 'View Document'}</span>
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

export default OfficialInfoSection;
