const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createTestApp } = require('./helpers');
const { createMailer } = require('../src/mailer');
const { todayInKigali, addDays } = require('../src/booking');

const waitForEmails = () => new Promise((resolve) => setImmediate(resolve));

test('a new message notifies the firm and confirms to the visitor', async () => {
  const { app, sentEmails } = createTestApp();
  await request(app).post('/api/contact').send({
    first_name: 'Jean',
    last_name: 'Mutabazi',
    email: 'jean@example.com',
    service_inquiry: 'contract',
    message: 'Please review my contract.',
    consent: 'yes'
  });
  await waitForEmails();

  assert.equal(sentEmails.length, 2);
  const [toFirm, toVisitor] = sentEmails;
  assert.equal(toFirm.to, 'rutayisireeugene1968@gmail.com');
  assert.equal(toFirm.replyTo, 'jean@example.com');
  assert.match(toFirm.text, /Contract Drafting & Review/);
  assert.equal(toVisitor.to, 'jean@example.com');
});

test('an appointment without an email only notifies the firm', async () => {
  const { app, sentEmails } = createTestApp();
  let date = addDays(todayInKigali(), 2);
  while ([0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay())) date = addDays(date, 1);

  const res = await request(app).post('/api/appointments').send({
    full_name: 'Aline Uwase',
    phone: '+250788111222',
    service: 'notarial',
    date,
    time: '09:00',
    consent: 'yes'
  });
  assert.equal(res.status, 201);
  await waitForEmails();

  assert.equal(sentEmails.length, 1);
  assert.match(sentEmails[0].subject, new RegExp(`${date} at 09:00`));
});

test('a failing mail server does not throw', async () => {
  const transport = {
    sendMail: async () => {
      throw new Error('SMTP down');
    }
  };
  const mailer = createMailer({ transport, log: null });
  const results = await mailer.newMessage({
    first_name: 'A',
    last_name: 'B',
    email: 'a@b.rw',
    message: 'hello there'
  });
  assert.deepEqual(results, [null, null]);
});
