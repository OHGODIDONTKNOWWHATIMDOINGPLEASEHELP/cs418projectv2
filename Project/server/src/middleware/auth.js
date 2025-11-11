// Project/server/src/middleware/auth.js
import { verifyJwt } from '../utils/jwt.js';

// protect any logged-in route
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = auth.slice(7);

  try {
    const payload = verifyJwt(token);
    // normalize what we put on req.user so other routes can use it
    req.user = {
      id: payload.uid,
      email: payload.email,
      roles: payload.roles || [],
    };
    return next();
  } catch (err) {
    console.error('requireAuth error:', err.message);
    return res.status(401).json({ error: 'unauthorized' });
  }
}

// extra guard for admin-only routes
export function requireAdmin(req, res, next) {
  // requireAuth should have run already, but be defensive
  const roles = req.user?.roles || [];
  if (!roles.includes('admin')) {
    return res.status(403).json({ error: 'forbidden' });
  }
  return next();
}
