import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { getEnv } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = [
  getEnv('CORS_ORIGIN', 'http://localhost:5173'),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://host.docker.internal:5173',
  'http://host.docker.internal:3000',
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/', courseRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
