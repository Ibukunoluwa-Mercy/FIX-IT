const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const app = require('../server');
const { seedHelpCenter } = require('../seed/seedHelpCenter');

let server;
let baseUrl;

test.before(async () => {
	await connectDB();
	await seedHelpCenter();

	// Start server on an ephemeral port
	await new Promise((resolve) => {
		server = app.listen(0, () => {
			const port = server.address().port;
			baseUrl = `http://127.0.0.1:${port}`;
			resolve();
		});
	});
});

test.after(async () => {
	if (server) {
		await new Promise((resolve) => server.close(resolve));
	}
	if (mongoose.connection.readyState !== 0) {
		await mongoose.connection.close();
	}
});

test('GET /api/help/topics returns structured topics across all sections', async () => {
	const res = await fetch(`${baseUrl}/api/help/topics`);
	assert.equal(res.status, 200);
	const data = await res.json();
	assert.equal(Array.isArray(data), true);
	assert.equal(data.length >= 16, true);

	// Check sections presence
	const sections = new Set(data.map((t) => t.section));
	assert.equal(sections.has('quick_help'), true);
	assert.equal(sections.has('category'), true);
	assert.equal(sections.has('guide'), true);

	// Check step structure for report-an-issue
	const reportTopic = data.find((t) => t.slug === 'report-an-issue');
	assert.ok(reportTopic);
	assert.equal(reportTopic.hasSteps, true);
	assert.equal(Array.isArray(reportTopic.steps), true);
	assert.equal(reportTopic.steps.length, 5);
	assert.equal(reportTopic.steps[0].order, 1);
});

test('GET /api/help/topics/:slug returns topic walkthrough detail or 404', async () => {
	// Valid topic with steps
	const validRes = await fetch(`${baseUrl}/api/help/topics/report-an-issue`);
	assert.equal(validRes.status, 200);
	const validData = await validRes.json();
	assert.equal(validData.slug, 'report-an-issue');
	assert.equal(validData.hasSteps, true);
	assert.equal(validData.steps.length, 5);
	assert.ok(validData.steps[0].title);
	assert.ok(validData.steps[0].description);

	// Valid topic without steps (explanatory copy)
	const guideRes = await fetch(`${baseUrl}/api/help/topics/community-guidelines`);
	assert.equal(guideRes.status, 200);
	const guideData = await guideRes.json();
	assert.equal(guideData.hasSteps, false);
	assert.ok(guideData.body || guideData.content.length > 0);

	// Non-existent topic
	const missingRes = await fetch(`${baseUrl}/api/help/topics/non-existent-topic`);
	assert.equal(missingRes.status, 404);
	const missingData = await missingRes.json();
	assert.ok(missingData.error);
});

test('GET /api/help/faqs returns 5 items by default and all when requested', async () => {
	// Default limit of 5
	const defaultRes = await fetch(`${baseUrl}/api/help/faqs`);
	assert.equal(defaultRes.status, 200);
	const defaultData = await defaultRes.json();
	assert.equal(Array.isArray(defaultData), true);
	assert.equal(defaultData.length, 5);

	// All FAQs via query param
	const allRes = await fetch(`${baseUrl}/api/help/faqs?all=true`);
	assert.equal(allRes.status, 200);
	const allData = await allRes.json();
	assert.equal(allData.length >= 8, true);

	// All FAQs via /all endpoint
	const allEndpointRes = await fetch(`${baseUrl}/api/help/faqs/all`);
	assert.equal(allEndpointRes.status, 200);
	const allEndpointData = await allEndpointRes.json();
	assert.equal(allEndpointData.length >= 8, true);
});

test('GET /api/help/search returns grouped articles and faqs', async () => {
	const searchRes = await fetch(`${baseUrl}/api/help/search?q=report`);
	assert.equal(searchRes.status, 200);
	const searchData = await searchRes.json();
	assert.equal(searchData.query, 'report');
	assert.ok(searchData.total > 0);
	assert.ok(Array.isArray(searchData.results.articles));
	assert.ok(Array.isArray(searchData.results.faqs));
	assert.ok(searchData.results.articles.length > 0);
	assert.ok(searchData.results.faqs.length > 0);

	// Empty query returns empty groups
	const emptyRes = await fetch(`${baseUrl}/api/help/search?q=`);
	assert.equal(emptyRes.status, 200);
	const emptyData = await emptyRes.json();
	assert.equal(emptyData.total, 0);
	assert.equal(emptyData.results.articles.length, 0);
});

test('POST /api/support/contact validates input and records support inquiry', async () => {
	// Rejection on missing fields
	const invalidRes = await fetch(`${baseUrl}/api/support/contact`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			name: '',
			email: 'invalid-email',
			message: 'hi',
		}),
	});
	assert.equal(invalidRes.status, 400);

	// Successful submission
	const validRes = await fetch(`${baseUrl}/api/support/contact`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			name: 'Ada Lovelace',
			email: 'ada@example.com',
			subject: 'Map marker question',
			message: 'Could you clarify how community zones are refreshed?',
		}),
	});
	assert.equal(validRes.status, 201);
	const validData = await validRes.json();
	assert.equal(validData.success, true);
	assert.ok(validData.ticket.id);
	assert.equal(validData.ticket.status, 'open');
});
