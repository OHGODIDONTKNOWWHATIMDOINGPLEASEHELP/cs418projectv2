import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import advisingRoutes from './routes/advising.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/advising', advisingRoutes);

export default app;
