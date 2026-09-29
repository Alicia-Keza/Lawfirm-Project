const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile) && process.env.NODE_ENV !== 'test') {
  process.loadEnvFile(envFile);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'rutabanks.db'),
  // Set to 1 when running behind a reverse proxy (Render, Railway, Nginx) so client IPs are correct
  trustProxy: Number(process.env.TRUST_PROXY) || 0,
  // Form submissions allowed per visitor every 15 minutes
  formRateLimit: Number(process.env.FORM_RATE_LIMIT) || 10
};

module.exports = config;
