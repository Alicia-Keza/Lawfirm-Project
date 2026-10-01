// Create or update an admin account for the dashboard.
// Usage: npm run admin:create -- --email someone@example.com --name "Full Name"
// The password is read from the ADMIN_PASSWORD environment variable, or asked for.

const readline = require('readline/promises');
const { parseArgs } = require('util');
const { openDatabase } = require('../src/db');
const { hashPassword, MIN_LENGTH } = require('../src/passwords');

async function main() {
  const { values } = parseArgs({
    options: { email: { type: 'string' }, name: { type: 'string' } }
  });
  const email = (values.email || '').trim().toLowerCase();
  const name = (values.name || '').trim();
  if (!email || !name) {
    console.error('Usage: npm run admin:create -- --email someone@example.com --name "Full Name"');
    process.exit(1);
  }

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question(`Password (at least ${MIN_LENGTH} characters): `);
    rl.close();
  }

  const passwordHash = await hashPassword(password);
  const db = openDatabase();
  db.prepare(
    `INSERT INTO admin_users (email, name, password_hash) VALUES (?, ?, ?)
     ON CONFLICT (email) DO UPDATE SET name = excluded.name, password_hash = excluded.password_hash`
  ).run(email, name, passwordHash);
  db.prepare(
    'DELETE FROM sessions WHERE user_id = (SELECT id FROM admin_users WHERE email = ?)'
  ).run(email);

  console.log(`Admin account ready for ${email}.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
