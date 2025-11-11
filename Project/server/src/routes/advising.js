// Project/server/src/routes/advising.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Advising from '../models/Advising.js';

const router = express.Router();

// GET /api/advising  -> list current user's records
router.get('/', requireAuth, async (req, res) => {
  try {
    const records = await Advising.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ ok: true, records });
  } catch (err) {
    console.error('GET /api/advising error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/advising  -> create new record
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      lastTerm = '',
      lastGpa = '',
      currentTerm = '',
      courses = [],
    } = req.body || {};

    const doc = await Advising.create({
      user: req.user.id,
      lastTerm,
      lastGpa,
      currentTerm,
      courses,
      status: 'Pending',
    });

    res.json({ ok: true, record: doc });
  } catch (err) {
    console.error('POST /api/advising error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/advising/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Advising.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true, record: doc });
  } catch (err) {
    console.error('GET /api/advising/:id error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// PUT /api/advising/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Advising.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ error: 'not found' });
    if (doc.status !== 'Pending') {
      return res.status(400).json({ error: 'record not editable' });
    }

    const { lastTerm, lastGpa, currentTerm, courses } = req.body || {};
    if (lastTerm !== undefined) doc.lastTerm = lastTerm;
    if (lastGpa !== undefined) doc.lastGpa = lastGpa;
    if (currentTerm !== undefined) doc.currentTerm = currentTerm;
    if (courses !== undefined) doc.courses = courses;

    await doc.save();
    res.json({ ok: true, record: doc });
  } catch (err) {
    console.error('PUT /api/advising/:id error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
