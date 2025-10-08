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

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get('/', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`API listening on :${port}`));
};
start();
