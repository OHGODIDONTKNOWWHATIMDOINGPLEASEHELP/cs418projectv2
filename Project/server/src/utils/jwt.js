// Project/server/src/utils/jwt.js
import jwt from 'jsonwebtoken';

const DEV_FALLBACK = 'dev-only-secret-change-me';
const SECRET =
  process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0
    ? process.env.JWT_SECRET
    : (process.env.NODE_ENV === 'production' ? '' : DEV_FALLBACK);

const EXPIRES = process.env.JWT_EXPIRES || '7d';

export function signJwt(payload, opts = {}) {
  if (!SECRET) {
    throw new Error('JWT_SECRET not set. Add it to Project/server/.env');
  }
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES, ...opts });
}

export function verifyJwt(token) {
  if (!SECRET) {
    throw new Error('JWT_SECRET not set. Add it to Project/server/.env');
  }
  return jwt.verify(token, SECRET);
}
