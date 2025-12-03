import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Advising from '../models/Advising.js';

const router = express.Router();

// ...your other admin routes...

// list
router.get('/advising', requireAuth, requireAdmin, async (_req, res) => {
  const records = await Advising.find({}).populate('user', 'email name').sort({ createdAt: -1 });
  res.json({ ok: true, records });
});

// get one (for AdminAdvisingView)
router.get('/advising/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const record = await Advising.findById(id).populate('user', 'email name');
  if (!record) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true, record });
});

// approve/reject with feedback
router.patch('/advising/:id/decision', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { decision, message } = req.body || {};
  if (!['Approved','Rejected'].includes(decision))
    return res.status(400).json({ error: 'bad decision' });

  const doc = await Advising.findById(id).populate('user', 'email');
  if (!doc) return res.status(404).json({ error: 'not found' });

  doc.status = decision;
  doc.adminFeedback = message || '';
  await doc.save();

  // (optional) email student about decision here

  res.json({ ok: true, record: doc });
});


export default router;
