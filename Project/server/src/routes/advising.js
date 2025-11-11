import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Advising from '../models/Advising.js'; // or whatever you called it

const router = express.Router();

// GET /api/advising
router.get('/', requireAuth, async (req, res) => {
  const records = await Advising.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ ok: true, records });
});

// POST /api/advising
router.post('/', requireAuth, async (req, res) => {
  const doc = await Advising.create({
    user: req.user.id,
    ...req.body,
    status: 'Pending',
  });
  res.json({ ok: true, record: doc });
});

// GET /api/advising/:id
router.get('/:id', requireAuth, async (req, res) => {
  const doc = await Advising.findOne({ _id: req.params.id, user: req.user.id });
  if (!doc) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true, record: doc });
});

// PUT /api/advising/:id
router.put('/:id', requireAuth, async (req, res) => {
  const doc = await Advising.findOne({ _id: req.params.id, user: req.user.id });
  if (!doc) return res.status(404).json({ error: 'not found' });
  if (doc.status !== 'Pending') {
    return res.status(400).json({ error: 'record not editable' });
  }
  Object.assign(doc, req.body);
  await doc.save();
  res.json({ ok: true, record: doc });
});

export default router;
