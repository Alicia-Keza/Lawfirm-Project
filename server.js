const config = require('./src/config');
const { openDatabase } = require('./src/db');
const { createMailer } = require('./src/mailer');
const { createApp } = require('./src/app');

const db = openDatabase();
const mailer = createMailer();

const server = createApp({ db, mailer }).listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port} (${config.env})`);
});

// Finish open requests and close the database cleanly when the host stops the app
function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
