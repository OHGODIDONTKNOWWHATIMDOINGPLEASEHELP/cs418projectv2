export function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Auth required' });
  next();
}
export function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
