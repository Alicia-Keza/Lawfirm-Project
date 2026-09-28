-- Contact form messages
CREATE TABLE messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  service     TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Appointment requests
CREATE TABLE appointments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  service     TEXT NOT NULL,
  date        TEXT NOT NULL,  -- YYYY-MM-DD (Kigali time)
  time        TEXT NOT NULL,  -- HH:MM
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A slot can only be held by one active appointment
CREATE UNIQUE INDEX appointments_active_slot
  ON appointments (date, time)
  WHERE status IN ('pending', 'confirmed');

-- Staff who can sign in to the admin dashboard
CREATE TABLE admin_users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  email          TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  password_hash  TEXT NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
