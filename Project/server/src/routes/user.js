// server/src/routes/user.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('email givenName familyName roles createdAt').lean();
  if (!user) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true, user });
});

router.post('/me', requireAuth, async (req, res) => {
  const { givenName = '', familyName = '' } = req.body || {};
  const updated = await User.findByIdAndUpdate(
    req.user.id,
    { givenName, familyName },
    { new: true, select: 'email givenName familyName roles createdAt' }
  ).lean();
  res.json({ ok: true, user: updated });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword = '', newPassword = '' } = req.body || {};
  const PWD_RX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  if (!PWD_RX.test(newPassword)) {
    return res.status(400).json({ error: 'weak password' });
  }
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'not found' });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'current password incorrect' });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ ok: true });
});

export default router;
