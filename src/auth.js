const crypto = require('crypto');
const config = require('./config');

const COOKIE_NAME = 'rb_session';
const SESSION_HOURS = 8;

function parseCookies(header = '') {
  const cookies = {};
  header.split(';').forEach((part) => {
    const index = part.indexOf('=');
    if (index < 0) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  });
  return cookies;
}

function randomToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function createSession(db, userId) {
  db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
  const session = { id: randomToken(), csrf: randomToken() };
  db.prepare(
    `INSERT INTO sessions (id, user_id, csrf_token, expires_at)
     VALUES (?, ?, ?, datetime('now', ?))`
  ).run(session.id, userId, session.csrf, `+${SESSION_HOURS} hours`);
  return session;
}

function setSessionCookie(res, sessionId) {
  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
    path: '/admin',
    maxAge: SESSION_HOURS * 60 * 60 * 1000
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/admin' });
}

// Attaches req.admin and req.csrfToken when the request has a valid session cookie
function loadSession(req, res, next) {
  const sessionId = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (sessionId) {
    const row = req.app.locals.db
      .prepare(
        `SELECT s.id AS session_id, s.csrf_token, u.id, u.email, u.name
         FROM sessions s JOIN admin_users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > datetime('now')`
      )
      .get(sessionId);
    if (row) {
      req.sessionId = row.session_id;
      req.csrfToken = row.csrf_token;
      req.admin = { id: row.id, email: row.email, name: row.name };
      res.locals.admin = req.admin;
      res.locals.csrfToken = row.csrf_token;
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.admin) return next();
  const target = encodeURIComponent(req.originalUrl);
  res.redirect(303, `/admin/login?next=${target}`);
}

function verifyCsrf(req, res, next) {
  const token = req.body && req.body._csrf;
  const expected = req.csrfToken || '';
  const valid =
    typeof token === 'string' &&
    token.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  if (valid) return next();
  res.status(403).send('Your session has expired. Please go back, refresh the page and try again.');
}

module.exports = {
  COOKIE_NAME,
  parseCookies,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  loadSession,
  requireAdmin,
  verifyCsrf
};
