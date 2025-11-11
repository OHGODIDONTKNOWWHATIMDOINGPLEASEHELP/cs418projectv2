// Project/server/src/routes/courses.js
import express from 'express';
import Course from '../models/Course.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// list all active courses
router.get('/', requireAuth, async (_req, res) => {
  const courses = await Course.find({ active: true }).sort({ code: 1 });
  res.json({ ok: true, courses });
});

export default router;
