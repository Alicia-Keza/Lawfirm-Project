const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { verifyPassword, hashPassword } = require('../passwords');
const { todayInKigali } = require('../booking');
const { SERVICE_NAMES } = require('../mailer');
const {
  createSession,
  setSessionCookie,
  clearSessionCookie,
  loadSession,
  requireAdmin,
  verifyCsrf
} = require('../auth');

const router = express.Router();

// Compared against when the email is unknown, so both cases take the same time
const dummyHash = hashPassword('placeholder-password');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).render('admin/login', {
      error: 'Too many sign-in attempts. Please wait 15 minutes and try again.',
      email: '',
      next: ''
    })
});

function safeNext(value) {
  return typeof value === 'string' && value.startsWith('/admin') && !value.startsWith('//')
    ? value
    : '/admin';
}

router.use((req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.set('Cache-Control', 'no-store');
  next();
});
router.use(loadSession);

router.get('/login', (req, res) => {
  if (req.admin) return res.redirect(303, '/admin');
  res.render('admin/login', { error: null, email: '', next: safeNext(req.query.next) });
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');
    const { db } = req.app.locals;

    const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
    const ok = await verifyPassword(password, user ? user.password_hash : await dummyHash);
    if (!user || !ok) {
      return res.status(401).render('admin/login', {
        error: 'Incorrect email or password.',
        email,
        next: safeNext(req.body.next)
      });
    }

    const session = createSession(db, user.id);
    setSessionCookie(res, session.id);
    res.redirect(303, safeNext(req.body.next));
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAdmin, verifyCsrf, (req, res) => {
  req.app.locals.db.prepare('DELETE FROM sessions WHERE id = ?').run(req.sessionId);
  clearSessionCookie(res);
  res.redirect(303, '/admin/login');
});

router.get('/', requireAdmin, (req, res) => {
  const { db } = req.app.locals;
  const counts = {
    newMessages: db.prepare("SELECT COUNT(*) FROM messages WHERE status = 'new'").pluck().get(),
    pendingAppointments: db
      .prepare("SELECT COUNT(*) FROM appointments WHERE status = 'pending'")
      .pluck()
      .get()
  };
  res.render('admin/dashboard', { counts });
});

/* ===== APPOINTMENTS ===== */
const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

router.get('/appointments', requireAdmin, (req, res) => {
  const { db } = req.app.locals;
  const when = req.query.when === 'past' ? 'past' : 'upcoming';
  const status = APPOINTMENT_STATUSES.includes(req.query.status) ? req.query.status : 'all';
  const today = todayInKigali();

  const where = [when === 'past' ? 'date < @today' : 'date >= @today'];
  if (status !== 'all') where.push('status = @status');
  const order = when === 'past' ? 'date DESC, time DESC' : 'date ASC, time ASC';

  const appointments = db
    .prepare(`SELECT * FROM appointments WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT 200`)
    .all({ today, status });

  res.render('admin/appointments', {
    appointments,
    filters: { when, status },
    statuses: APPOINTMENT_STATUSES,
    serviceNames: SERVICE_NAMES,
    notice: NOTICES[req.query.notice] || null,
    returnTo: req.originalUrl
  });
});

const NOTICES = {
  updated: { type: 'success', text: 'Appointment updated.' },
  'slot-taken': {
    type: 'error',
    text: 'That time has been booked by someone else, so this appointment cannot be reopened.'
  },
  invalid: { type: 'error', text: 'That change is not allowed.' }
};

function backTo(returnTo, notice) {
  const base =
    typeof returnTo === 'string' && returnTo.startsWith('/admin/appointments')
      ? returnTo.replace(/([?&])notice=[^&]*&?/, '$1').replace(/[?&]$/, '')
      : '/admin/appointments';
  return `${base}${base.includes('?') ? '&' : '?'}notice=${notice}`;
}

router.post('/appointments/:id/status', requireAdmin, verifyCsrf, (req, res) => {
  const { db, mailer } = req.app.locals;
  const { status, returnTo } = req.body;
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!appt || !APPOINTMENT_STATUSES.includes(status)) {
    return res.redirect(303, backTo(returnTo, 'invalid'));
  }

  try {
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, appt.id);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(303, backTo(returnTo, 'slot-taken'));
    }
    throw err;
  }

  if (status !== appt.status) mailer.appointmentStatusChanged({ ...appt, status });
  res.redirect(303, backTo(returnTo, 'updated'));
});

module.exports = router;
