import { Button, Form, Modal, Spinner } from 'react-bootstrap';

const DeleteAccountModal = ({
  show,
  onHide,
  deletingAccount,
  deletePassword,
  setDeletePassword,
  onDeleteAccount,
}) => {
  return (
    <Modal show={show} onHide={() => !deletingAccount && onHide()} centered>
      <Form onSubmit={onDeleteAccount}>
        <Modal.Header closeButton={!deletingAccount}>
          <Modal.Title>Delete your account?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This permanently removes your account and personal profile. Community reports will
            remain without your profile details.
          </p>
          <Form.Group>
            <Form.Label>Enter your current password to confirm</Form.Label>
            <Form.Control
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={deletingAccount}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" disabled={!deletePassword || deletingAccount}>
            {deletingAccount ? (
              <>
                <Spinner size="sm" animation="border" /> Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DeleteAccountModal;
