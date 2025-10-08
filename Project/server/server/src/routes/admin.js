import express from 'express';
import prisma from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }});
  res.json({ users });
});

export default router;
