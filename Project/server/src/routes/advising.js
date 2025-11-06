import express from 'express';
import AdvisingRecord from '../models/AdvisingRecord.js';
import { requireAuth } from '../middleware/auth.js'; // you already have something like this

const router = express.Router();

/**
 * GET /api/advising
 * list history for logged-in student
 */
router.get('/', requireAuth, async (req, res) => {
  const studentId = req.user.uid;
  const items = await AdvisingRecord
    .find({ studentId })
    .sort({ submittedAt: -1 });
  // format for UI
  const result = items.map(r => ({
    id: r._id,
    date: r.submittedAt,
    term: r.currentTerm,
    status: r.status,
  }));
  res.json({ ok: true, records: result });
});

/**
 * GET /api/advising/:id
 * load a single record (must belong to student)
 */
router.get('/:id', requireAuth, async (req, res) => {
  const studentId = req.user.uid;
  const rec = await AdvisingRecord.findOne({ _id: req.params.id, studentId });
  if (!rec) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true, record: rec });
});

/**
 * POST /api/advising
 * create new advising record
 * body: { lastTerm, lastGpa, currentTerm, courses: [{level, courseName}] }
 * rule: cannot include courses that were in lastTerm
 */
router.post('/', requireAuth, async (req, res) => {
  const studentId = req.user.uid;
  const studentEmail = req.user.email;
  const { lastTerm, lastGpa, currentTerm, courses = [] } = req.body || {};

  if (!lastTerm || !currentTerm || typeof lastGpa === 'undefined') {
    return res.status(400).json({ error: 'missing fields' });
  }

  // RULE: prevent adding courses taken in last term
  // simplest approach: client sends lastTermCourses array, or we infer from courses?
  // for now: if body.lastTermCourses exists, block intersection
  const lastTermCourses = req.body.lastTermCourses || [];
  const plannedCourseNames = courses.map(c => c.courseName);
  const dup = plannedCourseNames.find(name => lastTermCourses.includes(name));
  if (dup) {
    return res.status(400).json({ error: `Course ${dup} was taken in last term and cannot be added.` });
  }

  const rec = await AdvisingRecord.create({
    studentId,
    studentEmail,
    lastTerm,
    lastGpa,
    currentTerm,
    courses,
    status: 'Pending',
  });

  res.json({ ok: true, record: rec });
});

/**
 * PUT /api/advising/:id
 * update only if status is Pending
 */
router.put('/:id', requireAuth, async (req, res) => {
  const studentId = req.user.uid;
  const { lastTerm, lastGpa, currentTerm, courses = [], lastTermCourses = [] } = req.body || {};
  const rec = await AdvisingRecord.findOne({ _id: req.params.id, studentId });
  if (!rec) return res.status(404).json({ error: 'not found' });

  if (rec.status !== 'Pending') {
    return res.status(400).json({ error: 'record is not editable' });
  }

  // rule again
  const plannedCourseNames = courses.map(c => c.courseName);
  const dup = plannedCourseNames.find(name => lastTermCourses.includes(name));
  if (dup) {
    return res.status(400).json({ error: `Course ${dup} was taken in last term and cannot be added.` });
  }

  rec.lastTerm = lastTerm;
  rec.lastGpa = lastGpa;
  rec.currentTerm = currentTerm;
  rec.courses = courses;
  await rec.save();

  res.json({ ok: true, record: rec });
});

export default router;
