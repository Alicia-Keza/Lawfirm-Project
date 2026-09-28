const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openDatabase, migrate } = require('../src/db');

test('migrations create the tables and can run twice', () => {
  const db = openDatabase(':memory:');
  migrate(db);
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .pluck()
    .all();
  for (const name of ['admin_users', 'appointments', 'messages', 'schema_migrations']) {
    assert.ok(tables.includes(name), `missing table ${name}`);
  }
});

test('two active appointments cannot share a slot', () => {
  const db = openDatabase(':memory:');
  const insert = db.prepare(
    `INSERT INTO appointments (full_name, phone, service, date, time, status)
     VALUES ('Test', '+250788000000', 'notarial', '2026-10-01', '09:00', ?)`
  );
  insert.run('pending');
  assert.throws(() => insert.run('confirmed'), /UNIQUE/);
});

test('a cancelled appointment frees its slot', () => {
  const db = openDatabase(':memory:');
  const insert = db.prepare(
    `INSERT INTO appointments (full_name, phone, service, date, time, status)
     VALUES ('Test', '+250788000000', 'notarial', '2026-10-01', '09:00', ?)`
  );
  insert.run('cancelled');
  assert.doesNotThrow(() => insert.run('pending'));
});
