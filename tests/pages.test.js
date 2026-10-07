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
  ['/privacy', 'Privacy Policy'],
  ['/faq', 'Frequently Asked Questions']
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
  assert.match(res.text, /<li><a href="\/about" class="active" aria-current="page">/);
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

test('each service has its own page with a booking link', async () => {
  const { allServices } = require('../src/data/services');
  assert.equal(allServices.length, 12);
  for (const service of allServices) {
    const res = await request(app).get(`/services/${service.slug}`);
    assert.equal(res.status, 200, service.slug);
    assert.ok(res.text.includes(`/contact?service=${service.formService}#appointment`));
  }
  const services = await request(app).get('/services');
  assert.match(services.text, /href="\/services\/power-of-attorney"/);
  assert.equal((await request(app).get('/services/not-a-service')).status, 404);
});
