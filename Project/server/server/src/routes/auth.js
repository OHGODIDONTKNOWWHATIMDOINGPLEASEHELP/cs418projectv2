import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../db.js';
import { sendMail } from '../mailer.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email = '', password = '', fullName = '' } = req.body;
  const e = email.toLowerCase().trim();
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(e)) return res.status(400).json({ error: 'Invalid email' });
  if (password.length < 8) return res.status(400).json({ error: 'Password too short' });

  const existing = await prisma.user.findUnique({ where: { email: e } });
  if (existing) return res.status(400).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email: e, passwordHash, fullName } });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24*60*60*1000);
  await prisma.emailVerification.create({ data: { userId: user.id, token, expiresAt }});
  const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  await sendMail(e, 'Verify your email', `<p>Hi${fullName ? ' ' + fullName : ''}, verify: <a href="${url}">${url}</a> (24h).</p>`);
  res.json({ ok: true });
});

// Verify email
router.post('/verify', async (req, res) => {
  const { token = '' } = req.body;
  const ev = await prisma.emailVerification.findUnique({ where: { token }});
  if (!ev) return res.status(400).json({ error: 'Invalid token' });
  if (ev.expiresAt < new Date()) return res.status(400).json({ error: 'Token expired' });
  await prisma.user.update({ where: { id: ev.userId }, data: { emailVerifiedAt: new Date() }});
  await prisma.emailVerification.delete({ where: { id: ev.id }});
  res.json({ ok: true });
});

// Login (stage 1)
router.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body;
  const e = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: e }});
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  if (!await bcrypt.compare(password, user.passwordHash)) return res.status(400).json({ error: 'Invalid credentials' });
  if (!user.emailVerifiedAt) return res.status(403).json({ error: 'Verify email first' });

  const code = String(Math.floor(Math.random()*1_000_000)).padStart(6, '0');
  const expiresAt = new Date(Date.now() + 10*60*1000);
  await prisma.twoFactorCode.create({ data: { userId: user.id, code, expiresAt }});
  await sendMail(user.email, 'Your 2FA code', `<p>Your code: <b>${code}</b> (10 min).</p>`);

  req.session.pending2fa = { userId: user.id, email: user.email };
  res.json({ ok: true });
});

// 2FA (stage 2)
router.post('/twofa', async (req, res) => {
  const pending = req.session.pending2fa;
  if (!pending) return res.status(400).json({ error: 'No login in progress' });
  const { code = '' } = req.body;

  const last = await prisma.twoFactorCode.findFirst({
    where: { userId: pending.userId },
    orderBy: { id: 'desc' }
  });
  if (!last) return res.status(400).json({ error: 'No code found' });
  if (last.expiresAt < new Date()) return res.status(400).json({ error: 'Code expired' });
  if (last.attempts >= 5) return res.status(429).json({ error: 'Too many attempts' });

  if (last.code !== code.trim()) {
    await prisma.twoFactorCode.update({ where: { id: last.id }, data: { attempts: { increment: 1 } } });
    return res.status(400).json({ error: 'Incorrect code' });
  }

  await prisma.twoFactorCode.delete({ where: { id: last.id }});
  delete req.session.pending2fa;

  const user = await prisma.user.findUnique({ where: { id: pending.userId }});
  req.session.userId = user.id;
  req.session.role   = user.role;
  res.json({ ok: true, role: user.role });
});

// Forgot & Reset
router.post('/forgot', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }});
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60*60*1000);
    await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt }});
    const url = `${process.env.FRONTEND_URL}/reset?token=${token}`;
    await sendMail(email, 'Reset your password', `<p>Reset link: <a href="${url}">${url}</a> (1h).</p>`);
  }
  res.json({ ok: true });
});

router.post('/reset', async (req, res) => {
  const { token = '', password = '' } = req.body;
  if (password.length < 8) return res.status(400).json({ error: 'Password too short' });
  const pr = await prisma.passwordReset.findUnique({ where: { token }});
  if (!pr || pr.used || pr.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid/expired token' });

  const hash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: pr.userId }, data: { passwordHash: hash } }),
    prisma.passwordReset.update({ where: { id: pr.id }, data: { used: true } })
  ]);
  res.json({ ok: true });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Whoami
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  res.json({ user: { id: req.session.userId, role: req.session.role } });
});

export default router;
