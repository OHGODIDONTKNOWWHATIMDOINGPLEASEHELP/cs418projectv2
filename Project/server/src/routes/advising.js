import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Advising from '../models/Advising.js';

const router = express.Router();

// helper, in case you used it before
function getUserId(req) {
  return req.user?.id || req.user?._id || req.user?.userId || null;
}

// GET /api/advising  ← notice: just '/'
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const records = await Advising.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ ok: true, records });
  } catch (err) {
    console.error('GET /api/advising error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/advising
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
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
    const { id } = req.params;
    if (!id || id === 'undefined' || id.length < 12) {
      return res.status(400).json({ error: 'invalid id' });
    }

    const doc = await Advising.findOne({ _id: id, user: userId });
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true, record: doc });
  } catch (err) {
    console.error('GET /api/advising/:id error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
