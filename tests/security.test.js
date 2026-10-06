const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createTestApp } = require('./helpers');

const { app } = createTestApp();

test('pages are served with security headers', async () => {
  const res = await request(app).get('/');
  const csp = res.headers['content-security-policy'];
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /style-src 'self' https:\/\/fonts.googleapis.com/);
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-powered-by'], undefined);
});

test('pages contain no inline scripts that the policy would block', async () => {
  for (const url of ['/', '/contact', '/faq', '/services/power-of-attorney']) {
    const html = (await request(app).get(url)).text;
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].filter(
      (m) => !m[1].includes('application/ld+json')
    );
    assert.equal(inline.length, 0, `inline script on ${url}`);
    assert.doesNotMatch(html, /\sstyle="/, `inline style on ${url}`);
  }
});
