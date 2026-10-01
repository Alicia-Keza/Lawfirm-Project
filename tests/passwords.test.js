const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('../src/passwords');

test('hashes and verifies a password', async () => {
  const hash = await hashPassword('correct horse battery');
  assert.match(hash, /^scrypt\$/);
  assert.ok(!hash.includes('correct horse battery'));
  assert.equal(await verifyPassword('correct horse battery', hash), true);
  assert.equal(await verifyPassword('wrong password!', hash), false);
});

test('the same password gives different hashes (random salt)', async () => {
  const a = await hashPassword('same password 123');
  const b = await hashPassword('same password 123');
  assert.notEqual(a, b);
});

test('rejects short passwords and malformed hashes', async () => {
  await assert.rejects(() => hashPassword('short'), /at least/);
  assert.equal(await verifyPassword('anything', 'not-a-hash'), false);
});
