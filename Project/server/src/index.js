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

// 1) CREATE THE APP FIRST — nothing uses `app` before this line
const app = express();

// 2) Middleware (safe to use `app` now)
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.options('*', cors({ origin: ALLOWED_ORIGINS, credentials: true }));

app.use(rateLimit({
  windowMs: 60_000,
  max: 120,
  skip: (req) => req.method === 'OPTIONS',
  standardHeaders: true,
  legacyHeaders: false,
}));

// 3) Health and routes
app.get('/api/ping', (_req, res) => res.json({ pong: true }));
app.get('/', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// 4) Start
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cs418projectv2';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();
