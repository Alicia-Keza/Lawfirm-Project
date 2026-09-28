const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile) && process.env.NODE_ENV !== 'test') {
  process.loadEnvFile(envFile);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'rutabanks.db')
};

module.exports = config;
