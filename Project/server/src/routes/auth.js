// POST /api/auth/login (stage 1: password check + send 2FA code)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ error: 'email not verified' });

    // make a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // save it on the user
    user.twofa = {
      pendingCode: code,
      pendingCodeExp: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };
    await user.save();

    // ALWAYS log so you can log in even if email fails
    console.log('2FA code for', user.email, code);

    // fire-and-forget email — DO NOT await
    sendMail({
      to: user.email,
      subject: 'Your login code',
      html: `<p>Your login code is <b>${code}</b></p>`,
    }).catch(err => {
      console.error('login mail error:', err?.message || err);
    });

    // issue temp token for 2FA step
    const tempToken = signJwt({ uid: user.id, step: '2fa' }, { expiresIn: '10m' });
    return res.json({ ok: true, tempToken, userId: user.id });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

export default router;