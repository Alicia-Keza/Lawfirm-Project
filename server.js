const config = require('./src/config');
const { openDatabase } = require('./src/db');
const { createMailer } = require('./src/mailer');
const { createApp } = require('./src/app');

const db = openDatabase();
const mailer = createMailer();

createApp({ db, mailer }).listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port} (${config.env})`);
});
