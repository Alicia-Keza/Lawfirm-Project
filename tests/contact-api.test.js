const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createTestApp } = require('./helpers');

const valid = {
  first_name: 'Jean',
  last_name: 'Mutabazi',
  email: 'jean@example.com',
  phone: '+250 788 000 000',
  service_inquiry: 'contract',
  message: 'I need help reviewing a sale agreement.'
};

test('saves a valid contact message', async () => {
  const { app, db } = createTestApp();
  const res = await request(app).post('/api/contact').send(valid);
  assert.equal(res.status, 201);
  assert.equal(res.body.ok, true);

  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(res.body.id);
  assert.equal(row.email, 'jean@example.com');
  assert.equal(row.service, 'contract');
  assert.equal(row.status, 'new');
});

test('rejects an empty form with an error for each required field', async () => {
  const { app, db } = createTestApp();
  const res = await request(app).post('/api/contact').send({});
  assert.equal(res.status, 422);
  for (const field of ['first_name', 'last_name', 'email', 'message']) {
    assert.ok(res.body.errors[field], `expected an error for ${field}`);
  }
  assert.equal(db.prepare('SELECT COUNT(*) FROM messages').pluck().get(), 0);
});

test('rejects an invalid email, phone and service', async () => {
  const { app } = createTestApp();
  const res = await request(app)
    .post('/api/contact')
    .send({ ...valid, email: 'not-an-email', phone: '12ab', service_inquiry: 'hacking' });
  assert.equal(res.status, 422);
  assert.ok(res.body.errors.email);
  assert.ok(res.body.errors.phone);
  assert.ok(res.body.errors.service_inquiry);
});

test('phone and service are optional', async () => {
  const { app } = createTestApp();
  const res = await request(app)
    .post('/api/contact')
    .send({ ...valid, phone: '', service_inquiry: '' });
  assert.equal(res.status, 201);
});

test('unknown API routes return JSON 404', async () => {
  const { app } = createTestApp();
  const res = await request(app).get('/api/nothing');
  assert.equal(res.status, 404);
  assert.equal(res.body.ok, false);
});
