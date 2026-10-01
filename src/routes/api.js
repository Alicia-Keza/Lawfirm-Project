const express = require('express');
const { validateContact, validateAppointment, isSpam } = require('../validation');
const { availableSlots } = require('../booking');

const router = express.Router();

router.post('/contact', (req, res) => {
  // Pretend success so bots don't learn they were caught
  if (isSpam(req.body)) return res.status(201).json({ ok: true });

  const { data, errors, valid } = validateContact(req.body);
  if (!valid) return res.status(422).json({ ok: false, errors });

  const { db } = req.app.locals;
  const result = db
    .prepare(
      `INSERT INTO messages (first_name, last_name, email, phone, service, message)
       VALUES (@first_name, @last_name, @email, @phone, @service, @message)`
    )
    .run({ ...data, phone: data.phone || null, service: data.service || null });

  // Emails are sent in the background; failures are logged, not shown to the visitor
  req.app.locals.mailer.newMessage(data);
  res.status(201).json({ ok: true, id: result.lastInsertRowid });
});

router.get('/slots', (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : '';
  res.json(availableSlots(req.app.locals.db, date));
});

router.post('/appointments', (req, res) => {
  if (isSpam(req.body)) return res.status(201).json({ ok: true });

  const { data, errors, valid } = validateAppointment(req.body);
  if (!valid) return res.status(422).json({ ok: false, errors });

  const { db } = req.app.locals;
  try {
    const result = db
      .prepare(
        `INSERT INTO appointments (full_name, phone, email, service, date, time, notes)
         VALUES (@full_name, @phone, @email, @service, @date, @time, @notes)`
      )
      .run({ ...data, email: data.email || null, notes: data.notes || null });
    req.app.locals.mailer.newAppointment(data);
    res.status(201).json({ ok: true, id: result.lastInsertRowid });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        ok: false,
        errors: { time: 'Sorry, this time has just been booked. Please choose another time.' }
      });
    }
    throw err;
  }
});

module.exports = router;
