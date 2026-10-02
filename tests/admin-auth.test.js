const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createTestApp } = require('./helpers');
const { hashPassword } = require('../src/passwords');

const EMAIL = 'admin@rutabanks.rw';
const PASSWORD = 'a-long-test-password';

async function setup() {
  const ctx = createTestApp();
  ctx.db
    .prepare('INSERT INTO admin_users (email, name, password_hash) VALUES (?, ?, ?)')
    .run(EMAIL, 'Test Admin', await hashPassword(PASSWORD));
  return ctx;
}

async function signIn(app, extra = {}) {
  const agent = request.agent(app);
  const res = await agent
    .post('/admin/login')
    .type('form')
    .send({ email: EMAIL, password: PASSWORD, ...extra });
  return { agent, res };
}

const csrfFrom = (html) => html.match(/name="_csrf" value="([^"]+)"/)[1];

test('the dashboard requires signing in', async () => {
  const { app } = await setup();
  const res = await request(app).get('/admin');
  assert.equal(res.status, 303);
  assert.equal(res.headers.location, '/admin/login?next=%2Fadmin');
});

test('wrong passwords and unknown emails are rejected the same way', async () => {
  const { app } = await setup();
  const wrong = await request(app)
    .post('/admin/login')
    .type('form')
    .send({ email: EMAIL, password: 'nope-nope-nope' });
  const unknown = await request(app)
    .post('/admin/login')
    .type('form')
    .send({ email: 'who@example.com', password: PASSWORD });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.match(wrong.text, /Incorrect email or password/);
  assert.match(unknown.text, /Incorrect email or password/);
});

test('signing in sets a secure session cookie and opens the dashboard', async () => {
  const { app } = await setup();
  const { agent, res } = await signIn(app);
  assert.equal(res.status, 303);
  assert.equal(res.headers.location, '/admin');
  const cookie = res.headers['set-cookie'][0];
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\/admin/);

  const dashboard = await agent.get('/admin');
  assert.equal(dashboard.status, 200);
  assert.match(dashboard.text, /Welcome, Test Admin/);
  assert.equal(dashboard.headers['x-robots-tag'], 'noindex, nofollow');
});

test('only redirects back to admin pages after signing in', async () => {
  const { app } = await setup();
  const { res } = await signIn(app, { next: 'https://evil.example' });
  assert.equal(res.headers.location, '/admin');
});

test('signing out needs the CSRF token and ends the session', async () => {
  const { app } = await setup();
  const { agent } = await signIn(app);
  const page = await agent.get('/admin');

  const forged = await agent.post('/admin/logout').type('form').send({});
  assert.equal(forged.status, 403);

  const out = await agent
    .post('/admin/logout')
    .type('form')
    .send({ _csrf: csrfFrom(page.text) });
  assert.equal(out.status, 303);
  const after = await agent.get('/admin');
  assert.equal(after.status, 303);
});

test('lists upcoming appointments and filters by status', async () => {
  const { app, db } = await setup();
  const { todayInKigali, addDays } = require('../src/booking');
  const insert = db.prepare(
    `INSERT INTO appointments (full_name, phone, service, date, time, status)
     VALUES (?, '+250788000000', 'notarial', ?, '09:00', ?)`
  );
  insert.run('Future Client', addDays(todayInKigali(), 3), 'pending');
  insert.run('Old Client', addDays(todayInKigali(), -3), 'completed');

  const { agent } = await signIn(app);
  const upcoming = await agent.get('/admin/appointments');
  assert.equal(upcoming.status, 200);
  assert.match(upcoming.text, /Future Client/);
  assert.doesNotMatch(upcoming.text, /Old Client/);
  assert.match(upcoming.text, /Notarial Services/);

  const past = await agent.get('/admin/appointments?when=past&status=completed');
  assert.match(past.text, /Old Client/);

  const none = await agent.get('/admin/appointments?status=confirmed');
  assert.match(none.text, /No appointments match/);
});

test('confirming an appointment updates it and emails the client', async () => {
  const { app, db, sentEmails } = await setup();
  const { todayInKigali, addDays } = require('../src/booking');
  const date = addDays(todayInKigali(), 3);
  const { lastInsertRowid: id } = db
    .prepare(
      `INSERT INTO appointments (full_name, phone, email, service, date, time)
       VALUES ('Aline', '+250788000000', 'aline@example.com', 'notarial', ?, '10:00')`
    )
    .run(date);

  const { agent } = await signIn(app);
  const page = await agent.get('/admin/appointments');
  const csrf = csrfFrom(page.text);

  const forged = await agent.post(`/admin/appointments/${id}/status`).type('form').send({
    status: 'confirmed'
  });
  assert.equal(forged.status, 403);

  const res = await agent
    .post(`/admin/appointments/${id}/status`)
    .type('form')
    .send({ _csrf: csrf, status: 'confirmed', returnTo: '/admin/appointments?status=pending' });
  assert.equal(res.status, 303);
  assert.equal(res.headers.location, '/admin/appointments?status=pending&notice=updated');
  assert.equal(
    db.prepare('SELECT status FROM appointments WHERE id = ?').pluck().get(id),
    'confirmed'
  );

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(sentEmails.length, 1);
  assert.match(sentEmails[0].subject, /Appointment confirmed/);
});

test('cannot reopen a cancelled appointment whose slot was taken', async () => {
  const { app, db } = await setup();
  const { todayInKigali, addDays } = require('../src/booking');
  const date = addDays(todayInKigali(), 3);
  const insert = db.prepare(
    `INSERT INTO appointments (full_name, phone, service, date, time, status)
     VALUES (?, '+250788000000', 'notarial', ?, '10:00', ?)`
  );
  const { lastInsertRowid: cancelledId } = insert.run('First', date, 'cancelled');
  insert.run('Second', date, 'pending');

  const { agent } = await signIn(app);
  const csrf = csrfFrom((await agent.get('/admin/appointments')).text);
  const res = await agent
    .post(`/admin/appointments/${cancelledId}/status`)
    .type('form')
    .send({ _csrf: csrf, status: 'pending' });
  assert.match(res.headers.location, /notice=slot-taken/);
  assert.equal(
    db.prepare('SELECT status FROM appointments WHERE id = ?').pluck().get(cancelledId),
    'cancelled'
  );

  const invalid = await agent
    .post(`/admin/appointments/${cancelledId}/status`)
    .type('form')
    .send({ _csrf: csrf, status: 'deleted' });
  assert.match(invalid.headers.location, /notice=invalid/);
});

test('messages inbox: read, archive and escaping of visitor text', async () => {
  const { app, db } = await setup();
  const { lastInsertRowid: id } = db
    .prepare(
      `INSERT INTO messages (first_name, last_name, email, message)
       VALUES ('Jean', 'M', 'jean@example.com', '<script>alert(1)</script> please call me')`
    )
    .run();

  const { agent } = await signIn(app);
  const inbox = await agent.get('/admin/messages');
  assert.equal(inbox.status, 200);
  assert.match(inbox.text, /&lt;script&gt;alert\(1\)&lt;\/script&gt; please call me/);
  assert.doesNotMatch(inbox.text, /<script>alert/);

  const csrf = csrfFrom(inbox.text);
  await agent
    .post(`/admin/messages/${id}/status`)
    .type('form')
    .send({ _csrf: csrf, status: 'read' });
  assert.equal(db.prepare('SELECT status FROM messages WHERE id = ?').pluck().get(id), 'read');

  await agent
    .post(`/admin/messages/${id}/status`)
    .type('form')
    .send({ _csrf: csrf, status: 'archived' });
  assert.doesNotMatch((await agent.get('/admin/messages')).text, /please call me/);
  assert.match((await agent.get('/admin/messages?view=archived')).text, /please call me/);
});
