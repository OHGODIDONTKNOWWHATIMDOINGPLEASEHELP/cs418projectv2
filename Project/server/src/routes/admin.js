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

router.patch('/advising/:id/decision', requireAuth, requireAdmin, async (req,res)=>{
  const { id } = req.params;
  const { decision, message } = req.body || {};
  if (!['Approved','Rejected'].includes(decision))
    return res.status(400).json({ error: 'bad decision' });

  const doc = await Advising.findById(id);
  if (!doc) return res.status(404).json({ error: 'not found' });

  doc.status = decision;
  doc.adminFeedback = message || '';
  await doc.save();

  // optional: email notification (see #9)
  res.json({ ok: true, record: doc });
});

export default router;
