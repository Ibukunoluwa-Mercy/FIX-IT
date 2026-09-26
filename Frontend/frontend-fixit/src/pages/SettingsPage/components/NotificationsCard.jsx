import { Button, Form } from 'react-bootstrap';

const notificationOptions = [
  ['issueUpdates', 'Issue Updates', 'Get notified when there are updates on your reported issues.'],
  ['communityMessages', 'Community Messages', 'Receive messages from other users in your community.'],
  ['promotionsNews', 'Promotions & News', 'Get the latest news, tips and special offers.'],
];

const NotificationsCard = ({
  account,
  savingNotification,
  onToggleNotification,
  onManageClick,
}) => {
  return (
    <section className="settings-card settings-notifications-card">
      <div className="settings-card-heading">
        <div className="settings-heading-icon notifications-icon">
          <i className="fa-regular fa-bell" />
        </div>
        <div>
          <h2>Notifications</h2>
          <p>Choose what you want to be notified about.</p>
        </div>
        {onManageClick && (
          <Button
            variant="outline-primary"
            size="sm"
            className="settings-action"
            onClick={onManageClick}
          >
            Manage Notifications <i className="fa-solid fa-chevron-right" />
          </Button>
        )}
      </div>
      <div className="settings-notification-list">
        {notificationOptions.map(([key, label, description]) => (
          <div className="settings-notification-row" key={key}>
            <div>
              <strong>{label}</strong>
              <p>{description}</p>
            </div>
            <Form.Check
              type="switch"
              id={`setting-${key}`}
              aria-label={label}
              checked={Boolean(account.notifications?.[key])}
              disabled={Boolean(savingNotification)}
              onChange={(event) => onToggleNotification(key, event.target.checked)}
              className="settings-switch"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default NotificationsCard;
