const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { getMyReport, getMyReportComments } = require('../controllers/reportDataController');

const makeResponse = () => ({
	statusCode: 200,
	body: null,
	status(code) { this.statusCode = code; return this; },
	json(body) { this.body = body; return this; },
});

test('returns a report detail payload only for its owner', async () => {
	const userId = new mongoose.Types.ObjectId();
	const reportId = new mongoose.Types.ObjectId();
	const report = {
		_id: reportId, user: userId, title: 'Water Leaks', category: 'Water', status: 'New',
		createdAt: new Date('2026-09-27T08:00:00.000Z'), photos: ['/uploads/reports/leak.jpg'],
		location: { addressText: 'Oyo, Nigeria', latitude: 7.85, longitude: 3.93 },
	};
	const originalFindOne = Report.findOne;
	const originalFindById = User.findById;
	let reportFilter;

	Report.findOne = (filter) => {
		reportFilter = filter;
		return { lean: () => Promise.resolve(report) };
	};
	User.findById = () => ({ select: () => ({ lean: () => Promise.resolve({ _id: userId, name: 'Resident', avatarUrl: '/avatar.png' }) }) });

	try {
		const response = makeResponse();
		await getMyReport({ params: { id: String(reportId) }, user: { _id: userId } }, response);
		assert.equal(response.statusCode, 200);
		assert.equal(response.body.id, String(reportId));
		assert.equal(response.body.title, 'Water Leaks');
		assert.deepEqual(response.body.location, { address: 'Oyo, Nigeria', lat: 7.85, lng: 3.93 });
		assert.deepEqual(response.body.images, ['/uploads/reports/leak.jpg']);
		assert.deepEqual(response.body.reportedBy, { id: String(userId), name: 'Resident', avatar: '/avatar.png' });
		assert.equal(response.body.status, 'reported');
		assert.equal(response.body.reportedAt, report.createdAt);
		assert.equal(response.body.inProgressAt, null);
		assert.equal(response.body.closedAt, null);
		assert.deepEqual(reportFilter.$or, [{ user: userId }, { createdBy: userId }]);
	} finally {
		Report.findOne = originalFindOne;
		User.findById = originalFindById;
	}
});

test('returns comments and embedded updates in oldest-first normalized order', async () => {
	const userId = new mongoose.Types.ObjectId();
	const reportId = new mongoose.Types.ObjectId();
	const report = {
		_id: reportId,
		user: userId,
		updates: [{ text: 'Report submitted', author: 'Resident', timestamp: new Date('2026-09-01T08:00:00.000Z') }],
	};
	const comment = {
		_id: new mongoose.Types.ObjectId(),
		text: 'I can confirm this issue.',
		createdAt: new Date('2026-09-02T08:00:00.000Z'),
		createdBy: { _id: new mongoose.Types.ObjectId(), name: 'Neighbor', avatarUrl: '/neighbor.png' },
	};
	const originalFindOne = Report.findOne;
	const originalFindById = User.findById;
	const originalCommentFind = Comment.find;
	let sortOrder;

	Report.findOne = () => ({ lean: () => Promise.resolve(report) });
	User.findById = () => ({ select: () => ({ lean: () => Promise.resolve({ name: 'Resident', avatarUrl: '/resident.png' }) }) });
	Comment.find = () => ({
		populate: () => ({ sort: (sort) => {
			sortOrder = sort;
			return { lean: () => Promise.resolve([comment]) };
		} }),
	});

	try {
		const response = makeResponse();
		await getMyReportComments({ params: { id: String(reportId) }, user: { _id: userId } }, response);
		assert.equal(response.statusCode, 200);
		assert.deepEqual(sortOrder, { createdAt: 1 });
		assert.deepEqual(response.body.comments.map(({ type }) => type), ['update', 'comment']);
		assert.deepEqual(response.body.comments[1], {
			id: String(comment._id), type: 'comment',
			commenter: { id: String(comment.createdBy._id), name: 'Neighbor', avatar: '/neighbor.png' },
			message: 'I can confirm this issue.', timestamp: comment.createdAt,
		});
	} finally {
		Report.findOne = originalFindOne;
		User.findById = originalFindById;
		Comment.find = originalCommentFind;
	}
});

test('rejects malformed report IDs without querying the database', async () => {
	const response = makeResponse();
	await getMyReport({ params: { id: 'not-an-object-id' }, user: { _id: new mongoose.Types.ObjectId() } }, response);
	assert.equal(response.statusCode, 404);
	assert.deepEqual(response.body, { error: 'Report not found' });
});

test('uses canonical lifecycle values and normalizes legacy report statuses before validation', async () => {
	const userId = new mongoose.Types.ObjectId();
	const legacyReport = new Report({ user: userId, status: 'In Progress' });
	await legacyReport.validate();
	assert.deepEqual(Report.schema.path('status').enumValues, ['reported', 'in_progress', 'resolved', 'closed']);
	assert.equal(legacyReport.status, 'in_progress');
	assert.ok(legacyReport.reportedAt instanceof Date);
	assert.equal(legacyReport.inProgressAt, null);
	assert.equal(legacyReport.resolvedAt, null);
	assert.equal(legacyReport.closedAt, null);
});