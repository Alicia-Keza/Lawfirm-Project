const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createTestApp } = require('./helpers');

const { app } = createTestApp();

const pages = [
  ['/', 'Rutabanks Notary and Legal Services Ltd – Kigali, Rwanda'],
  ['/about', 'About Us'],
  ['/services', 'Our Services'],
  ['/contact', 'Contact Us'],
  ['/disclaimer', 'Legal Disclaimer'],
  ['/privacy', 'Privacy Policy']
];

for (const [url, title] of pages) {
  test(`GET ${url} renders the page`, async () => {
    const res = await request(app).get(url);
    assert.equal(res.status, 200);
    assert.match(res.text, new RegExp(`<title>${title}`));
    assert.match(res.text, /<main id="main">/);
  });
}

test('current page is marked in the navbar', async () => {
  const res = await request(app).get('/about');
  assert.match(res.text, /href="\/about" role="listitem" class="active" aria-current="page"/);
});

test('old .html links redirect to clean URLs', async () => {
  const res = await request(app).get('/services.html');
  assert.equal(res.status, 301);
  assert.equal(res.headers.location, '/services');
});

test('unknown pages return the 404 page', async () => {
  const res = await request(app).get('/does-not-exist');
  assert.equal(res.status, 404);
  assert.match(res.text, /Page Not Found/);
});

test('appointment date picker is limited to the Kigali booking window', async () => {
  const { bookingWindow } = require('../src/booking');
  const { min, max } = bookingWindow();
  const res = await request(app).get('/contact');
  assert.match(res.text, new RegExp(`id="appt-date"[^>]*min="${min}" max="${max}"`));
  assert.doesNotMatch(res.text, /toISOString/);
});
