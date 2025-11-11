// Project/server/src/index.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import coursesRoutes from './routes/courses.js';
import advisingRoutes from './routes/advising.js';

const app = express(); // 👈 create the app FIRST

// --- middleware ---
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://cs418project.netlify.app', // your Netlify
];

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// --- basic route ---
app.get('/', (_req, res) => res.json({ ok: true }));

// --- your routes ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', coursesRoutes); // new courses route
app.use('/api/advising', advisingRoutes);
// app.use('/api/advising', advisingRoutes);  // if you have this too

// --- start server ---
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cs418projectv2';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`API listening on :${port}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();
