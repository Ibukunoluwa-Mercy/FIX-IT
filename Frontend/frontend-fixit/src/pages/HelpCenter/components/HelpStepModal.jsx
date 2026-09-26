import React from 'react';
import { Modal } from 'react-bootstrap';

const HelpStepModal = ({
  show,
  onClose,
  topic,
  isLoading,
}) => {
  if (!topic) return null;

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="help-step-modal"
    >
      <div className="help-step-modal-header">
        <div className="help-step-modal-title">
          <div
            className="help-step-modal-icon"
            style={{
              backgroundColor: topic.iconBg || '#eff6ff',
              color: topic.iconColor || '#2563eb',
            }}
            aria-hidden="true"
          >
            <i className={topic.icon || 'fa-solid fa-circle-info'}></i>
          </div>
          <h5>{topic.title}</h5>
        </div>
        <button
          type="button"
          className="help-step-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="help-step-modal-body">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
            <span className="text-muted small">Loading walkthrough...</span>
          </div>
        ) : topic.steps && topic.steps.length > 0 ? (
          <ol className="help-steps-ol">
            {topic.steps.map((st, index) => (
              <li key={st.id || st.order || st.number || index} className="help-step-item">
                <span className="help-step-number">{st.order || st.number || index + 1}</span>
                <div className="help-step-details">
                  <strong>{st.title}</strong>
                  <p>{st.description}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="help-modal-article">
            {topic.content && topic.content.length > 0 ? (
              topic.content.map((paragraph, i) => <p key={i}>{paragraph}</p>)
            ) : topic.body ? (
              <p>{topic.body}</p>
            ) : (
              <p className="text-muted">No additional details available for this topic.</p>
            )}
          </div>
        )}
      </div>

      <div className="help-step-modal-footer">
        <button
          type="button"
          className="help-btn-got-it"
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </Modal>
  );
};

export default HelpStepModal;
