import express from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import User from '../models/User.js';
import { signJwt } from '../utils/jwt.js';
import { sendMail } from '../utils/mailer.js';

const router = express.Router();
const SALT = 12;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

router.post('/register', async (req, res) => {
  try {
    const { email, password, givenName = '', familyName = '' } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'email already registered' });

    const passwordHash = await bcrypt.hash(password, SALT);
    const verifyToken = randomBytes(32).toString('hex');

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      givenName, familyName,
      isVerified: false,
      verifyToken,
      verifyTokenExp: new Date(Date.now() + TOKEN_TTL_MS)
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${verifyToken}&email=${encodeURIComponent(user.email)}`;
    try {
      await sendMail({ to: user.email, subject: 'Verify your email', html: `<a href="${verifyUrl}">${verifyUrl}</a>` });
    } catch (err) {
      console.error('sendMail error:', err?.message || err);
    }

    return res.json({ ok: true, message: 'registered' });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

export default router;
