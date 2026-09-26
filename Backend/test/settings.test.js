const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../models/User');
const ResidentProfile = require('../models/ResidentProfile');
const { formatAccount, updateAccount, updatePassword, updateNotifications, deleteAccount } = require('../controllers/settingsController');

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  headersSent: false,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; this.headersSent = true; return this; },
});

test('formats profile values directly from the signed-in user record', () => {
  const account = formatAccount({
    name: 'Real Resident Name',
    email: 'resident@example.com',
    phone: '',
    location: '',
    avatarUrl: '',
    emailVerified: false,
    lastKnownLocation: { address: 'Actual Saved Ward' },
    notificationPrefs: { issueUpdates: false, communityMessages: true, promotions: true },
  });

  assert.equal(account.fullName, 'Real Resident Name');
  assert.equal(account.email, 'resident@example.com');
  assert.equal(account.phone, '');
  assert.equal(account.location, 'Actual Saved Ward');
  assert.equal(account.avatarUrl, '');
  assert.equal(account.isVerified, false);
  assert.deepEqual(account.notificationPrefs, { issueUpdates: false, communityMessages: true, promotions: true });
});

test('PATCH account updates only the fields included in the request', () => {
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;
  let capturedUpdate;
  const user = { _id: 'user-id', name: 'Resident', email: 'resident@example.com', phone: '', location: '' };
  User.findByIdAndUpdate = (id, update) => {
    assert.equal(id, user._id);
    capturedUpdate = update.$set;
    return { lean: () => Promise.resolve({ ...user, ...capturedUpdate }) };
  };
  const response = makeResponse();

  return updateAccount({ user, body: { phone: '+2348000000000' } }, response)
    .then(() => {
      assert.deepEqual(capturedUpdate, { phone: '+2348000000000' });
      assert.equal(response.body.phone, '+2348000000000');
    })
    .finally(() => { User.findByIdAndUpdate = originalFindByIdAndUpdate; });
});

test('rejects confirmation mismatch before querying the account', () => {
  const originalFindById = User.findById;
  User.findById = () => { throw new Error('Password validation should not query the database'); };
  const response = makeResponse();

  try {
    updatePassword({ user: { _id: 'user-id' }, body: { currentPassword: 'old-pass-123', newPassword: 'new-pass-123', confirmPassword: 'different-pass-123' } }, response);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.code, 'PASSWORD_MISMATCH');
    assert.match(response.body.message, /do not match/i);
  } finally {
    User.findById = originalFindById;
  }
});

test('rejects unknown notification preference keys', () => {
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;
  User.findByIdAndUpdate = () => { throw new Error('Invalid preference should not query the database'); };
  const response = makeResponse();

  try {
    updateNotifications({ user: { _id: 'user-id' }, body: { key: 'email', enabled: true } }, response);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.code, 'INVALID_NOTIFICATION_PREFS');
    assert.match(response.body.message, /notification preferences/i);
  } finally {
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});
