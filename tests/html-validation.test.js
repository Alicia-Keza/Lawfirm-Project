const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const request = require('supertest');
const { HtmlValidate, FileSystemConfigLoader } = require('html-validate');
const { createTestApp } = require('./helpers');
const { allServices } = require('../src/data/services');

const { app } = createTestApp();
const validator = new HtmlValidate(new FileSystemConfigLoader());
const configFile = path.join(__dirname, '..', '.htmlvalidate.json');

const urls = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/disclaimer',
  '/privacy',
  '/faq',
  '/admin/login',
  '/no-such-page',
  ...allServices.map((s) => `/services/${s.slug}`)
];

for (const url of urls) {
  test(`${url} is valid, accessible HTML`, async () => {
    const res = await request(app).get(url);
    const report = await validator.validateString(res.text, configFile);
    const problems = report.results
      .flatMap((r) => r.messages)
      .map((m) => `line ${m.line}: ${m.message} (${m.ruleId})`);
    assert.deepEqual(problems, []);
  });
}
