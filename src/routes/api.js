const express = require('express');
const { validateContact } = require('../validation');

const router = express.Router();

router.post('/contact', (req, res) => {
  const { data, errors, valid } = validateContact(req.body);
  if (!valid) return res.status(422).json({ ok: false, errors });

  const { db } = req.app.locals;
  const result = db
    .prepare(
      `INSERT INTO messages (first_name, last_name, email, phone, service, message)
       VALUES (@first_name, @last_name, @email, @phone, @service, @message)`
    )
    .run({ ...data, phone: data.phone || null, service: data.service || null });

  res.status(201).json({ ok: true, id: result.lastInsertRowid });
});

module.exports = router;
