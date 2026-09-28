process.env.NODE_ENV = 'test';

const { openDatabase } = require('../src/db');
const { createApp } = require('../src/app');

function createTestApp() {
  const db = openDatabase(':memory:');
  const app = createApp({ db });
  return { app, db };
}

module.exports = { createTestApp };
