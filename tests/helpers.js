process.env.NODE_ENV = 'test';

const { openDatabase } = require('../src/db');
const { createApp } = require('../src/app');
const { createMailer } = require('../src/mailer');

// Collects emails instead of sending them
function createFakeTransport() {
  const sent = [];
  return {
    sent,
    async sendMail(message) {
      sent.push(message);
      return { messageId: `test-${sent.length}` };
    }
  };
}

function createTestApp() {
  const db = openDatabase(':memory:');
  const transport = createFakeTransport();
  const mailer = createMailer({ transport, log: null });
  const app = createApp({ db, mailer });
  return { app, db, sentEmails: transport.sent };
}

module.exports = { createTestApp, createFakeTransport };
