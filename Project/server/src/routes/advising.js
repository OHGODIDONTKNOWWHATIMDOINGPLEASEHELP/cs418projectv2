import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Advising from '../models/Advising.js';

const router = express.Router();

// helper to get user id from whatever the middleware put there
function getUserId(req) {
  return req.user?.id || req.user?._id || req.user?.userId || null;
}

// GET /api/advising  – list this user's records
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      console.error('GET /api/advising: no user id on req.user', req.user);
      return res.status(401).json({ error: 'unauthorized' });
    }

    const records = await Advising.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ ok: true, records });
  } catch (err) {
    console.error('GET /api/advising error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/advising – create new record
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      console.error('POST /api/advising: no user id on req.user', req.user);
      return res.status(401).json({ error: 'unauthorized' });
    }

    const {
      lastTerm = '',
      lastGpa = '',
      currentTerm = '',
      courses = [],
    } = req.body || {};

    const doc = await Advising.create({
      user: userId,
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
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const doc = await Advising.findOne({ _id: req.params.id, user: userId });
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
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const doc = await Advising.findOne({ _id: req.params.id, user: userId });
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
