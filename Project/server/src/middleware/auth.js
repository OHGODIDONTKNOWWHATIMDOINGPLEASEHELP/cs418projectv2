import { verifyJwt } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    req.user = verifyJwt(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.roles?.includes('admin')) return res.status(403).json({ error: 'admin only' });
  next();
}
