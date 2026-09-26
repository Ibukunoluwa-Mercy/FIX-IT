const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../models/User');
const ResidentProfile = require('../models/ResidentProfile');
const { formatAccount, updateAccount, updatePassword, updateNotifications, deleteAccount } = require('../controllers/settingsController');
const { createRateLimiter } = require('../middleware/rateLimiter');

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

test('returns specific weak-password and incorrect-current-password codes', () => {
  const originalFindById = User.findById;
  User.findById = () => ({ select: () => Promise.resolve({ matchPassword: () => Promise.resolve(false) }) });
  const weakResponse = makeResponse();
  const wrongCurrentResponse = makeResponse();

  try {
    updatePassword({ user: { _id: 'user-id' }, body: { currentPassword: 'old-pass-123', newPassword: 'short', confirmPassword: 'short' } }, weakResponse);
    assert.equal(weakResponse.body.code, 'WEAK_PASSWORD');

    return updatePassword({ user: { _id: 'user-id' }, body: { currentPassword: 'wrong-pass-123', newPassword: 'new-pass-456', confirmPassword: 'new-pass-456' } }, wrongCurrentResponse)
      .then(() => assert.equal(wrongCurrentResponse.body.code, 'CURRENT_PASSWORD_INCORRECT'))
      .finally(() => { User.findById = originalFindById; });
  } catch (error) {
    User.findById = originalFindById;
    throw error;
  }
});

test('updates any subset of notification preferences and returns the complete preference object', () => {
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;
  let capturedUpdate;
  User.findByIdAndUpdate = (id, update) => {
    capturedUpdate = update.$set;
    return {
      lean: () => Promise.resolve({
        notificationPrefs: { issueUpdates: false, communityMessages: true, promotions: true },
      }),
    };
  };
  const response = makeResponse();

  return updateNotifications({ user: { _id: 'user-id' }, body: { promotions: true } }, response)
    .then(() => {
      assert.deepEqual(capturedUpdate, { 'notificationPrefs.promotions': true });
      assert.deepEqual(response.body.notificationPrefs, { issueUpdates: false, communityMessages: true, promotions: true });
    })
    .finally(() => { User.findByIdAndUpdate = originalFindByIdAndUpdate; });
});

test('re-verifies changed emails and clears the verified flag', () => {
  const originalFindOne = User.findOne;
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;
  const smtpValues = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_PASS'].map((key) => [key, process.env[key]]);
  smtpValues.forEach(([key]) => { delete process.env[key]; });
  let capturedUpdate;
  const user = { _id: new mongoose.Types.ObjectId(), name: 'Resident', email: 'old@example.com' };
  User.findOne = () => ({ select: () => ({ lean: () => Promise.resolve(null) }) });
  User.findByIdAndUpdate = (id, update) => {
    capturedUpdate = update.$set;
    return { lean: () => Promise.resolve({ ...user, ...capturedUpdate }) };
  };
  const response = makeResponse();

  return updateAccount({ user, body: { email: 'new@example.com' } }, response)
    .then(() => {
      assert.equal(capturedUpdate.email, 'new@example.com');
      assert.equal(capturedUpdate.emailVerified, false);
      assert.match(capturedUpdate.emailVerificationTokenHash, /^[a-f\d]{64}$/);
      assert.ok(capturedUpdate.emailVerificationExpires instanceof Date);
      assert.equal(response.body.isVerified, false);
    })
    .finally(() => {
      User.findOne = originalFindOne;
      User.findByIdAndUpdate = originalFindByIdAndUpdate;
      smtpValues.forEach(([key, value]) => {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      });
    });
});

test('rate-limits sensitive actions by authenticated user id', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1, keyGenerator: (req) => String(req.user._id) });
  const responseFor = () => ({
    statusCode: 200,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  });
  const first = responseFor();
  const blocked = responseFor();
  const otherUser = responseFor();
  let passed = 0;

  limiter({ user: { _id: 'resident-a' } }, first, () => { passed += 1; });
  limiter({ user: { _id: 'resident-a' } }, blocked, () => { passed += 1; });
  limiter({ user: { _id: 'resident-b' } }, otherUser, () => { passed += 1; });

  assert.equal(passed, 2);
  assert.equal(blocked.statusCode, 429);
  assert.equal(otherUser.statusCode, 200);
});

test('soft-deletes only after password confirmation and preserves the user record', () => {
  const originalFindById = User.findById;
  const originalDeleteOne = ResidentProfile.deleteOne;
  const smtpValues = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_PASS'].map((key) => [key, process.env[key]]);
  smtpValues.forEach(([key]) => { delete process.env[key]; });
  const user = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Resident Name',
    email: 'resident@example.com',
    phone: '+2348000000000',
    location: 'Ward 1',
    avatarUrl: '',
    matchPassword: () => Promise.resolve(true),
    save: () => Promise.resolve(user),
  };
  User.findById = () => ({ select: () => Promise.resolve(user) });
  ResidentProfile.deleteOne = () => Promise.resolve({ deletedCount: 1 });
  const response = makeResponse();

  return deleteAccount({ user: { _id: user._id }, body: { password: 'verified-password' } }, response)
    .then(() => {
      assert.equal(response.statusCode, 200);
      assert.ok(user.deletedAt instanceof Date);
      assert.equal(user.isActive, false);
      assert.equal(user.name, 'Deleted Resident');
      assert.equal(user.phone, undefined);
      assert.equal(user.emailVerified, false);
      assert.match(user.email, /^deleted-.*@deleted\.fixit\.invalid$/);
    })
    .finally(() => {
      User.findById = originalFindById;
      ResidentProfile.deleteOne = originalDeleteOne;
      smtpValues.forEach(([key, value]) => {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      });
    });
});
