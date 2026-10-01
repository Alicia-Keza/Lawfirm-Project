const path = require('path');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const config = require('./config');
const pageRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');

function createApp({ db, mailer }) {
  const app = express();
  app.locals.db = db;
  app.locals.mailer = mailer;
  app.set('trust proxy', config.trustProxy);

  const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.formRateLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: (req) => req.method !== 'POST',
    handler: (req, res) =>
      res.status(429).json({
        ok: false,
        error:
          'Too many requests. Please wait a few minutes and try again, or call us on +250 788 308 526.'
      })
  });

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use(express.json({ limit: '20kb' }));
  app.use(express.urlencoded({ extended: false, limit: '20kb' }));

  app.use(pageRoutes);
  app.use('/api', formLimiter, apiRoutes);

  app.use('/api', (req, res) => {
    res.status(404).json({ ok: false, error: 'Not found' });
  });
  app.use((req, res) => {
    res.status(404).render('pages/404');
  });

  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    if (req.path.startsWith('/api')) {
      return res
        .status(status)
        .json({ ok: false, error: status >= 500 ? 'Server error' : err.message });
    }
    res
      .status(status)
      .send(status >= 500 ? 'Something went wrong. Please try again later.' : err.message);
  });

  return app;
}

module.exports = { createApp };
