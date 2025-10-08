import express from 'express';
import User from '../models/User.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 12/13 Admin-only endpoints + distinct view on frontend
router.get('/users', requireAuth, requireAdmin, async (_req, res) => {
  const users = await User.find().select('email givenName familyName roles isVerified createdAt').lean();
  res.json({ users });
});

export default router;
