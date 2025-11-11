import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Advising from '../models/Advising.js';

const router = express.Router();

// ...your other admin routes...

// list all advising submissions (for admin)
router.get('/advising', requireAuth, requireAdmin, async (req, res) => {
  const records = await Advising.find({}).populate('user', 'email').sort({ createdAt: -1 });
  res.json({ ok: true, records });
});

// approve
router.patch('/advising/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const doc = await Advising.findById(id);
  if (!doc) return res.status(404).json({ error: 'not found' });

  doc.status = 'Approved';
  await doc.save();
  res.json({ ok: true, record: doc });
});

// reject
router.patch('/advising/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const doc = await Advising.findById(id);
  if (!doc) return res.status(404).json({ error: 'not found' });

  doc.status = 'Rejected';
  await doc.save();
  res.json({ ok: true, record: doc });
});

export default router;
