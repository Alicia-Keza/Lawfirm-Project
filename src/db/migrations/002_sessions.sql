-- Signed-in admin sessions (the id is a random token stored in an HttpOnly cookie)
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  csrf_token  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX sessions_user ON sessions (user_id);
