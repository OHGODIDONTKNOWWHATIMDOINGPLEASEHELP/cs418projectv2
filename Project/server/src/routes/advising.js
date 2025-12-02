import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Advising from '../models/Advising.js';

const router = express.Router();

// CREATE
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const {
      lastTerm = '',
      lastGpa = '',
      currentTerm = '',
      courses = [],
      lastTermCourses = [],
    } = req.body || {};

    // minimal validate
    if (!currentTerm) return res.status(400).json({ error: 'currentTerm required' });
    if (!Array.isArray(courses)) return res.status(400).json({ error: 'courses must be array' });

    const doc = await Advising.create({
      user: userId,
      lastTerm,
      lastGpa,
      currentTerm,
      courses,
      lastTermCourses,
      status: 'Pending',
    });

    res.json({ ok: true, record: doc });
  } catch (err) {
    console.error('POST /api/advising error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// LIST (history) – GET /api/advising
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const records = await Advising.find({ user: userId })
      .sort({ createdAt: -1 });
    res.json({ ok: true, records });
  } catch (err) {
    console.error('GET /api/advising error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET ONE – GET /api/advising/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!id || id.length < 12) return res.status(400).json({ error: 'invalid id' });

    const record = await Advising.findOne({ _id: id, user: userId });
    if (!record) return res.status(404).json({ error: 'not found' });

    res.json({ ok: true, record });
  } catch (err) {
    console.error('GET /api/advising/:id error:', err);
    res.status(500).json({ error: 'server error' });
  }
});


// UPDATE
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    if (!id || id.length < 12) return res.status(400).json({ error: 'invalid id' });

    const doc = await Advising.findOne({ _id: id, user: userId });
    if (!doc) return res.status(404).json({ error: 'not found' });

    if (doc.status && doc.status !== 'Pending') {
      return res.status(400).json({ error: 'record not editable' });
    }

    const {
      lastTerm, lastGpa, currentTerm, courses, lastTermCourses,
    } = req.body || {};

    if (lastTerm !== undefined) doc.lastTerm = lastTerm;
    if (lastGpa !== undefined) doc.lastGpa = lastGpa;
    if (currentTerm !== undefined && currentTerm !== '') doc.currentTerm = currentTerm;
    if (Array.isArray(courses)) doc.courses = courses;
    if (Array.isArray(lastTermCourses)) doc.lastTermCourses = lastTermCourses;

    await doc.save();
    res.json({ ok: true, record: doc });
  } catch (err) {
    console.error('PUT /api/advising/:id error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
