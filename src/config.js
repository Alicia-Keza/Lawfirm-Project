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
  formRateLimit: Number(process.env.FORM_RATE_LIMIT) || 10,
  mail: {
    // Without SMTP_HOST, emails are printed to the console instead of sent
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Rutabanks Website <no-reply@rutabanks.rw>',
    // Where new message and appointment notifications are sent
    firmEmail: process.env.FIRM_EMAIL || 'rutayisireeugene1968@gmail.com'
  }
};

module.exports = config;
