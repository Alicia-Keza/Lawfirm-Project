const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createTestApp } = require('./helpers');
const { todayInKigali, addDays } = require('../src/booking');

// Next Monday-Friday at least 2 days from now, so the test never depends on the current day
function nextWeekday() {
  let date = addDays(todayInKigali(), 2);
  while ([0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay())) date = addDays(date, 1);
  return date;
}
function nextSunday() {
  let date = addDays(todayInKigali(), 2);
  while (new Date(`${date}T12:00:00Z`).getUTCDay() !== 0) date = addDays(date, 1);
  return date;
}

const date = nextWeekday();
const valid = {
  full_name: 'Aline Uwase',
  phone: '+250 788 111 222',
  email: 'aline@example.com',
  service: 'power-of-attorney',
  date,
  time: '10:00',
  notes: 'Special power of attorney for a land sale.',
  consent: 'yes'
};

test('lists free slots for an open day', async () => {
  const { app } = createTestApp();
  const res = await request(app).get(`/api/slots?date=${date}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.open, true);
  assert.ok(res.body.slots.length > 0);
  assert.ok(res.body.slots.every((s) => s.available));
});

test('reports Sundays as closed', async () => {
  const { app } = createTestApp();
  const res = await request(app).get(`/api/slots?date=${nextSunday()}`);
  assert.equal(res.body.open, false);
  assert.match(res.body.reason, /Sundays/);
});

test('books an appointment and marks the slot as taken', async () => {
  const { app, db } = createTestApp();
  const res = await request(app).post('/api/appointments').send(valid);
  assert.equal(res.status, 201);

  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(res.body.id);
  assert.equal(row.status, 'pending');
  assert.equal(row.time, '10:00');

  const slots = await request(app).get(`/api/slots?date=${date}`);
  const ten = slots.body.slots.find((s) => s.time === '10:00');
  assert.equal(ten.available, false);
});

test('refuses to double-book a slot', async () => {
  const { app } = createTestApp();
  await request(app).post('/api/appointments').send(valid);
  const res = await request(app)
    .post('/api/appointments')
    .send({ ...valid, full_name: 'Someone Else' });
  assert.equal(res.status, 409);
  assert.ok(res.body.errors.time);
});

test('rejects past dates, times outside office hours and missing fields', async () => {
  const { app } = createTestApp();
  const past = await request(app)
    .post('/api/appointments')
    .send({ ...valid, date: todayInKigali() });
  assert.equal(past.status, 422);
  assert.match(past.body.errors.date, /tomorrow/);

  const lunch = await request(app)
    .post('/api/appointments')
    .send({ ...valid, time: '13:00' });
  assert.equal(lunch.status, 422);
  assert.ok(lunch.body.errors.time);

  const empty = await request(app).post('/api/appointments').send({});
  assert.equal(empty.status, 422);
  for (const field of ['full_name', 'phone', 'service', 'date', 'consent']) {
    assert.ok(empty.body.errors[field], `expected an error for ${field}`);
  }
});
