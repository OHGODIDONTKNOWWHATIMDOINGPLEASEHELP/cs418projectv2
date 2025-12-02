import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 11 Profile get/update (email immutable)
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.uid).lean();
  if (!user) return res.status(404).json({ error: 'not found' });
  const { email, givenName, familyName, roles } = user;
  res.json({ email, givenName, familyName, roles });
});

router.post('/me', requireAuth, async (req, res) => {
  const { givenName = '', familyName = '' } = req.body || {};
  const user = await User.findByIdAndUpdate(req.user.uid, { givenName, familyName }, { new: true });
  const { email, roles } = user;
  res.json({ email, givenName: user.givenName, familyName: user.familyName, roles });
});

// 9 Change password (authenticated)
router.post('/change-password', requireAuth, async (req, res) => {
  const PWD_RX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
if (!PWD_RX.test(password)) {
  return res.status(400).json({ error: 'weak password' });
}
  const { currentPassword, newPassword } = req.body || {};
  const user = await User.findById(req.user.uid);
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'current password incorrect' });
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ ok: true });
});

export default router;
