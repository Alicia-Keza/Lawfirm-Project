const crypto = require('crypto');

// scrypt cost parameters; stored with each hash so they can be raised later
const N = 16384;
const r = 8;
const p = 1;
const KEY_LENGTH = 64;
const MIN_LENGTH = 10;

function scrypt(password, salt, params) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, params, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
}

async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_LENGTH) {
    throw new Error(`Password must be at least ${MIN_LENGTH} characters.`);
  }
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  const [scheme, n, rr, pp, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const key = await scrypt(password, Buffer.from(salt, 'base64'), {
    N: Number(n),
    r: Number(rr),
    p: Number(pp)
  });
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}

module.exports = { hashPassword, verifyPassword, MIN_LENGTH };
