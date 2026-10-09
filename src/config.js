const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile) && process.env.NODE_ENV !== 'test') {
  process.loadEnvFile(envFile);
}

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port,
  // Public address of the site, used for canonical links, Open Graph and the sitemap
  siteUrl: (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
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

function validateConfig() {
  const warnings = [];

  if (config.env === 'production') {
    let siteUrl;
    try {
      siteUrl = new URL(config.siteUrl);
    } catch {
      warnings.push('Production requires SITE_URL to be a valid URL.');
    }
    if (siteUrl && (siteUrl.protocol !== 'https:' || siteUrl.hostname === 'localhost')) {
      warnings.push('Production SITE_URL should use HTTPS and a non-localhost hostname.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.mail.firmEmail)) {
      warnings.push('Production requires a valid FIRM_EMAIL address.');
    }
    if (!config.mail.host) {
      warnings.push('SMTP_HOST is not configured; email notifications will not be delivered.');
    }
  }

  if (warnings.length > 0) {
    console.warn('[config] warnings:');
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }
}

validateConfig();

module.exports = config;
