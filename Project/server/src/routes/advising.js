import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Advising from '../models/Advising.js';

const router = express.Router();

function getUserId(req) {
  return req.user?.id || req.user?._id || req.user?.userId || null;
}

// list
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

// create
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      lastTerm = '',
      lastGpa = '',
      currentTerm = '',
      courses = [],
      lastTermCourses = [],
    } = req.body || {};

    const doc = await Advising.create({
      user: userId,
      lastTerm,
      lastGpa,
      currentTerm,
      courses,
      lastTermCourses,
      status: {
  type: String,
  enum: ['Pending', 'Approved', 'Rejected'],
  default: 'Pending',
},
    });

    res.json({ ok: true, record: doc });
  } catch (err) {
    console.error('POST /api/advising error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// load one
// GET /api/advising/history -> same as list
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const records = await Advising.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ ok: true, records });
  } catch (err) {
    console.error('GET /api/advising/history error:', err);
    res.status(500).json({ error: 'server error' });
  }
});
``
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    if (!id || id === 'undefined' || id.length < 12) {
      return res.status(400).json({ error: 'invalid id' });
    }

    const doc = await Advising.findOne({ _id: id, user: userId });
    if (!doc) return res.status(404).json({ error: 'not found' });

    res.json({ ok: true, record: doc }); // 👈 important
  } catch (err) {
    console.error('GET /api/advising/:id error:', err);
    res.status(500).json({ error: 'server error' });
  }
});


// ✅ update one
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    if (!id || id === 'undefined' || id.length < 12) {
      return res.status(400).json({ error: 'invalid id' });
    }

    const doc = await Advising.findOne({ _id: id, user: userId });
    if (!doc) return res.status(404).json({ error: 'not found' });

    // if approved/rejected, freeze
    if (doc.status && doc.status !== 'Pending') {
      return res.status(400).json({ error: 'record not editable' });
    }

    const {
      lastTerm,
      lastGpa,
      currentTerm,
      courses,
      lastTermCourses,
    } = req.body || {};

    if (lastTerm !== undefined) doc.lastTerm = lastTerm;
    if (lastGpa !== undefined) doc.lastGpa = lastGpa;
    if (currentTerm !== undefined) doc.currentTerm = currentTerm;
    if (courses !== undefined) doc.courses = courses;
    if (lastTermCourses !== undefined) doc.lastTermCourses = lastTermCourses;

    await doc.save();
    res.json({ ok: true, record: doc });
  } catch (err) {
    console.error('PUT /api/advising/:id error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
