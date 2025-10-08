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
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);

// CORS first
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin or tools (no Origin header), and the whitelisted dev origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Explicitly handle preflight
app.options('*', cors({ origin: ALLOWED_ORIGINS, credentials: true }));

// Then rate limit (skip OPTIONS so preflight never gets blocked)
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    skip: (req) => req.method === 'OPTIONS',
    standardHeaders: true,
    legacyHeaders: false,
  })
);
const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// Health
app.get('/', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Startup
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cs418projectv2';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
}

app.get('/api/ping', (_req, res) => res.json({ pong: true }));


start();
