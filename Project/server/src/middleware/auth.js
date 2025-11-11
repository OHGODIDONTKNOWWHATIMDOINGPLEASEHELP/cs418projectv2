// Project/server/src/middleware/auth.js
import { verifyJwt } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = auth.slice(7);
  try {
    const payload = verifyJwt(token);
    // normalize so routes can do req.user.id
    req.user = {
      id: payload.uid,
      roles: payload.roles || [],
      email: payload.email,
    };
    return next();
  } catch (err) {
    console.error('requireAuth error:', err.message);
    return res.status(401).json({ error: 'unauthorized' });
  }
}
