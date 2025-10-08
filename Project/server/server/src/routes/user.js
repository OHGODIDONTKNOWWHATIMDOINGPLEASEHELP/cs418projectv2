import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me/profile', requireAuth, async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.session.userId }});
  res.json({ email: u.email, fullName: u.fullName ?? '', role: u.role, verified: !!u.emailVerifiedAt });
});

router.post('/me/profile', requireAuth, async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  await prisma.user.update({ where: { id: req.session.userId }, data: { fullName }});
  res.json({ ok: true });
});

router.post('/me/change-password', requireAuth, async (req, res) => {
  const { current = '', next = '' } = req.body;
  if (next.length < 8) return res.status(400).json({ error: 'Password too short' });
  const u = await prisma.user.findUnique({ where: { id: req.session.userId }});
  const ok = await bcrypt.compare(current, u.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Current password incorrect' });
  const hash = await bcrypt.hash(next, 12);
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: hash }});
  res.json({ ok: true });
});

export default router;
