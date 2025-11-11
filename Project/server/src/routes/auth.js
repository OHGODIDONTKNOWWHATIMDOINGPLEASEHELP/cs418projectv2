// Project/server/src/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signJwt, verifyJwt } from '../utils/jwt.js';
import { sendMail } from '../utils/mailer.js';
// at the top with your other imports
import { requireAuth } from '../middleware/auth.js';


const router = express.Router(); // 👈 create router FIRST

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomUUID?.() || Math.random().toString(36).slice(2);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      isVerified: false,
      roles: ['user'],
      verifyToken,
    });

    // log verify link so you can use it even if email fails
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify?token=${verifyToken}&email=${encodeURIComponent(user.email)}`;
    console.log('Verification link:', verifyUrl);

    // fire-and-forget email
    sendMail({
      to: user.email,
      subject: 'Verify your email',
      html: `<p>Click to verify: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    }).catch(err => console.error('register mail error:', err?.message || err));

    return res.json({ ok: true });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// POST /api/auth/login  (stage 1)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ error: 'email not verified' });

    // make 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twofa = {
      pendingCode: code,
      pendingCodeExp: new Date(Date.now() + 10 * 60 * 1000),
    };
    await user.save();

    console.log('2FA code for', user.email, code);

    // send email but don't await
    sendMail({
      to: user.email,
      subject: 'Your login code',
      html: `<p>Your login code is <b>${code}</b></p>`,
    }).catch(err => console.error('login mail error:', err?.message || err));

    const tempToken = signJwt({ uid: user.id, step: '2fa' }, { expiresIn: '10m' });

    return res.json({ ok: true, tempToken, userId: user.id });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// POST /api/auth/verify-2fa
router.post('/verify-2fa', async (req, res) => {
  try {
    const { code, tempToken, userId } = req.body || {};
    if (!code || !tempToken || !userId) {
      return res.status(400).json({ error: 'missing fields' });
    }

    const payload = verifyJwt(tempToken);
    if (!payload || payload.uid !== userId || payload.step !== '2fa') {
      return res.status(401).json({ error: 'invalid temp token' });
    }

    const user = await User.findById(userId);
    if (!user || !user.twofa) {
      return res.status(401).json({ error: '2fa not requested' });
    }

    const now = Date.now();
    const exp = new Date(user.twofa.pendingCodeExp).getTime();
    if (now > exp) {
      return res.status(400).json({ error: 'code expired' });
    }

    if (user.twofa.pendingCode !== code) {
      return res.status(400).json({ error: 'invalid code' });
    }

    // success – clear 2fa and issue real token
    user.twofa = undefined;
    await user.save();

    const token = signJwt({ uid: user.id, roles: user.roles || [] }, { expiresIn: '1d' });

    return res.json({ ok: true, token, user: { id: user.id, email: user.email, roles: user.roles } });
  } catch (err) {
    console.error('verify-2fa error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// GET /api/auth/me  – used by frontend on startup
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    ok: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      roles: req.user.roles || [],
    },
  });
});

export default router;

