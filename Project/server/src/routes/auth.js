import express from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import User from '../models/User.js';
import { signJwt } from '../utils/jwt.js';
import { sendMail } from '../utils/mailer.js';

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';


const SALT = 12;
const VERIFY_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const RESET_TTL_MS  = 1000 * 60 * 60 * 24; // 24h
const CODE_TTL_MS   = 1000 * 60 * 10;      // 10m

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, givenName = '', familyName = '' } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'email already registered' });

    const passwordHash = await bcrypt.hash(password, SALT);
    const verifyToken = randomBytes(32).toString('hex');

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      givenName, familyName,
      isVerified: false,
      verifyToken,
      verifyTokenExp: new Date(Date.now() + VERIFY_TTL_MS),
      roles: ['user']
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${verifyToken}&email=${encodeURIComponent(user.email)}`;
    try {
      await sendMail({
        to: user.email,
        subject: 'Verify your email',
        html: `<p>Welcome! Click to verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
      });
    } catch (e) {
      console.error('sendMail(register) error:', e?.message || e);
      // Don't fail registration in dev if email fails
    }

    return res.json({ ok: true, message: 'registered' });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, token } = req.body || {};
    const user = await User.findOne({ email: (email||'').toLowerCase(), verifyToken: token });
    if (!user || !user.verifyTokenExp || user.verifyTokenExp < new Date()) {
      return res.status(400).json({ error: 'invalid or expired token' });
    }
    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExp = null;
    await user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.error('verify-email error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// POST /api/auth/login (stage 1: password check + send 2FA code)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: (email||'').toLowerCase() });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ error: 'email not verified' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
user.twofa = {
  pendingCode: code,
  pendingCodeExp: new Date(Date.now() + 10 * 60 * 1000),
};
await user.save();


    try {
      await sendMail({
        to: user.email,
        subject: 'Your 2FA code',
        html: `<p>Your login code is <b>${code}</b>. It expires in 10 minutes.</p>`
      });
    } catch (e) {
      console.error('sendMail(login) error:', e?.message || e);
      if (process.env.NODE_ENV !== 'production') {
  console.log('2FA code for', user.email, code);
} else {
  // on render we still want to see it in logs while testing
  console.log('2FA (prod) for', user.email, code);
}

    }

    const tempToken = signJwt({ uid: user.id, step: '2fa' }, { expiresIn: '10m' });
    return res.json({ ok: true, tempToken, userId: user.id });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// POST /api/auth/verify-2fa (stage 2: exchange code for full JWT)
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, code } = req.body || {};
    const user = await User.findById(userId);
    if (!user || !user.twofa?.pendingCodeExp || user.twofa.pendingCodeExp < new Date()) {
      return res.status(400).json({ error: 'code expired' });
    }
    if (user.twofa.pendingCode !== code) {
      return res.status(400).json({ error: 'invalid code' });
    }

    user.twofa.pendingCode = null;
    user.twofa.pendingCodeExp = null;
    await user.save();

    const token = signJwt({ uid: user.id, roles: user.roles, email: user.email });
    const profile = { email: user.email, givenName: user.givenName, familyName: user.familyName, roles: user.roles };
    return res.json({ ok: true, token, user: profile });
  } catch (err) {
    console.error('verify-2fa error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// POST /api/auth/request-password-reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body || {};
    const user = await User.findOne({ email: (email||'').toLowerCase() });
    if (!user) return res.json({ ok: true }); // do not leak
    user.resetToken = randomBytes(32).toString('hex');
    user.resetTokenExp = new Date(Date.now() + RESET_TTL_MS);
    await user.save();

    const link = `${process.env.CLIENT_URL}/reset?token=${user.resetToken}&email=${encodeURIComponent(user.email)}`;
    try {
      await sendMail({ to: user.email, subject: 'Password reset', html: `<p><a href="${link}">${link}</a></p>` });
    } catch (e) {
      console.error('sendMail(reset) error:', e?.message || e);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('request-password-reset error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    const user = await User.findOne({ email: (email||'').toLowerCase(), resetToken: token });
    if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
      return res.status(400).json({ error: 'invalid or expired token' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, SALT);
    user.resetToken = null;
    user.resetTokenExp = null;
    await user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.error('reset-password error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

export default router;
