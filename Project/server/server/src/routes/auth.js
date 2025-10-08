import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { signJwt } from '../utils/jwt.js';
import { sendMail } from '../utils/mailer.js';

const router = express.Router();
const SALT = 12;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const CODE_TTL_MS = 1000 * 60 * 10; // 10 minutes

// 1/2/3/4/5 Register + email verification
router.post('/register', async (req, res) => {
  const { email, password, givenName = '', familyName = '' } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ error: 'email already registered' });

  const passwordHash = await bcrypt.hash(password, SALT);
  const verifyToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    givenName, familyName,
    verifyToken,
    verifyTokenExp: new Date(Date.now() + TOKEN_TTL_MS)
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${verifyToken}&email=${encodeURIComponent(user.email)}`;
  await sendMail({
    to: user.email,
    subject: 'Verify your email',
    html: `<p>Welcome! Click to verify:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
  });

  res.json({ ok: true, message: 'registered, verification email sent' });
});

// Email verify link
router.post('/verify-email', async (req, res) => {
  const { email, token } = req.body || {};
  const user = await User.findOne({ email: (email||'').toLowerCase(), verifyToken: token });
  if (!user || !user.verifyTokenExp || user.verifyTokenExp < new Date())
    return res.status(400).json({ error: 'invalid or expired token' });

  user.isVerified = true;
  user.verifyToken = null; user.verifyTokenExp = null;
  await user.save();
  res.json({ ok: true });
});

// 6/7 Login (stage 1) – gate on isVerified and issue an intermediate JWT to do 2FA
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: (email||'').toLowerCase() });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  if (!user.isVerified) return res.status(403).json({ error: 'email not verified' });

  // start 2FA by sending a code to email
  const code = (Math.floor(100000 + Math.random()*900000)).toString(); // 6-digit
  user.twofa.pendingCode = code;
  user.twofa.pendingCodeExp = new Date(Date.now() + CODE_TTL_MS);
  await user.save();

  await sendMail({
    to: user.email,
    subject: 'Your 2FA code',
    html: `<p>Your login code is <b>${code}</b>. It expires in 10 minutes.</p>`
  });

  // temp token limited to 10 minutes, used only to hit /verify-2fa
  const tempToken = signJwt({ uid: user.id, step: '2fa' }, { expiresIn: '10m' });
  res.json({ ok: true, tempToken });
});

// 10 Verify 2FA (issue full JWT)
router.post('/verify-2fa', async (req, res) => {
  const { userId, code } = req.body || {};
  const user = await User.findById(userId);
  if (!user || !user.twofa?.pendingCodeExp || user.twofa.pendingCodeExp < new Date())
    return res.status(400).json({ error: 'code expired' });
  if (user.twofa.pendingCode !== code) return res.status(400).json({ error: 'invalid code' });

  user.twofa.pendingCode = null; user.twofa.pendingCodeExp = null;
  await user.save();
  const token = signJwt({ uid: user.id, roles: user.roles, email: user.email });
  res.json({ ok: true, token, user: { email: user.email, givenName: user.givenName, familyName: user.familyName, roles: user.roles } });
});

// 8 Forgot password (send reset token)
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body || {};
  const user = await User.findOne({ email: (email||'').toLowerCase() });
  if (!user) return res.json({ ok: true }); // don't leak

  user.resetToken = crypto.randomBytes(32).toString('hex');
  user.resetTokenExp = new Date(Date.now() + TOKEN_TTL_MS);
  await user.save();

  const link = `${process.env.CLIENT_URL}/reset?token=${user.resetToken}&email=${encodeURIComponent(user.email)}`;
  await sendMail({
    to: user.email,
    subject: 'Password reset',
    html: `<p>Click to reset:</p><p><a href="${link}">${link}</a></p>`
  });
  res.json({ ok: true });
});

// 8 Reset password (via token)
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body || {};
  const user = await User.findOne({ email: (email||'').toLowerCase(), resetToken: token });
  if (!user || !user.resetTokenExp || user.resetTokenExp < new Date())
    return res.status(400).json({ error: 'invalid or expired token' });

  user.passwordHash = await bcrypt.hash(newPassword, SALT);
  user.resetToken = null; user.resetTokenExp = null;
  await user.save();
  res.json({ ok: true });
});

export default router;
