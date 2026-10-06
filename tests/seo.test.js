const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createTestApp } = require('./helpers');

const { app } = createTestApp();

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) =>
    JSON.parse(m[1])
  );
}

test('pages have a canonical link and Open Graph tags', async () => {
  const res = await request(app).get('/services');
  assert.match(res.text, /<link rel="canonical" href="http:\/\/localhost:3000\/services" \/>/);
  assert.match(res.text, /<meta property="og:title" content="Our Services/);
  assert.match(res.text, /<meta property="og:description" content="[^"]+"/);
});

test('home page describes the business for search engines', async () => {
  const [business] = jsonLdBlocks((await request(app).get('/')).text);
  assert.equal(business['@type'], 'LegalService');
  assert.equal(business.telephone, '+250788308526');
  assert.equal(business.openingHoursSpecification.length, 2);
});

test('FAQ page publishes its questions as FAQPage data', async () => {
  const blocks = jsonLdBlocks((await request(app).get('/faq')).text);
  const faqPage = blocks.find((b) => b['@type'] === 'FAQPage');
  assert.ok(faqPage);
  assert.equal(faqPage.mainEntity.length, 9);
});

test('robots.txt keeps crawlers out of admin and API and points to the sitemap', async () => {
  const res = await request(app).get('/robots.txt');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /text\/plain/);
  assert.match(res.text, /Disallow: \/admin/);
  assert.match(res.text, /Disallow: \/api/);
  assert.match(res.text, /Sitemap: http:\/\/localhost:3000\/sitemap.xml/);
});

test('sitemap lists the main pages and every service page', async () => {
  const res = await request(app).get('/sitemap.xml');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /xml/);
  const locs = [...res.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, 7 + 12);
  assert.ok(locs.includes('http://localhost:3000/services/power-of-attorney'));
  assert.ok(!locs.some((l) => l.includes('/admin')));
});
