const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatDateTime } = require('../src/format');

test('shows database (UTC) times in Kigali time', () => {
  // 22:30 UTC on 1 Oct is 00:30 on 2 Oct in Kigali
  assert.equal(formatDateTime('2026-10-01 22:30:00'), '2 Oct 2026, 00:30');
  assert.equal(formatDateTime(''), '');
});
