const config = require('./src/config');
const { openDatabase } = require('./src/db');
const { createApp } = require('./src/app');

const db = openDatabase();

createApp({ db }).listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port} (${config.env})`);
});
