import express from 'express';
import Course from '../models/Course.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/courses  -> list all active courses (public to logged-in students)
router.get('/', requireAuth, async (_req, res) => {
  const courses = await Course.find({ active: true }).sort({ code: 1 });
  res.json({ ok: true, courses });
});

// GET /api/courses/:code  -> get one
router.get('/:code', requireAuth, async (req, res) => {
  const course = await Course.findOne({ code: req.params.code.toUpperCase() });
  if (!course) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true, course });
});

// POST /api/courses  -> admin creates a course
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { code, title, level, credits, termOffered, prerequisites } = req.body || {};
  if (!code || !title) {
    return res.status(400).json({ error: 'code and title are required' });
  }
  const course = await Course.create({
    code: code.toUpperCase(),
    title,
    level,
    credits,
    termOffered,
    prerequisites,
  });
  res.json({ ok: true, course });
});

// PUT /api/courses/:code  -> admin updates a course
router.put('/:code', requireAuth, requireAdmin, async (req, res) => {
  const code = req.params.code.toUpperCase();
  const course = await Course.findOne({ code });
  if (!course) return res.status(404).json({ error: 'not found' });

  const { title, level, credits, termOffered, prerequisites, active } = req.body || {};
  if (title !== undefined) course.title = title;
  if (level !== undefined) course.level = level;
  if (credits !== undefined) course.credits = credits;
  if (termOffered !== undefined) course.termOffered = termOffered;
  if (prerequisites !== undefined) course.prerequisites = prerequisites;
  if (active !== undefined) course.active = active;

  await course.save();
  res.json({ ok: true, course });
});

// DELETE /api/courses/:code  -> admin soft-deactivates
router.delete('/:code', requireAuth, requireAdmin, async (req, res) => {
  const code = req.params.code.toUpperCase();
  const course = await Course.findOne({ code });
  if (!course) return res.status(404).json({ error: 'not found' });
  course.active = false;
  await course.save();
  res.json({ ok: true });
});

export default router;
