import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import uploadRouter from './routers/uploadRouter.js';
import supportRouter from './routers/supportRouter.js';
import seedRouter from './routers/seedRouter.js';
import { csrfProtection, issueCsrfToken } from './utils.js';
import { initDatabase } from './db/schema.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

const app = express();

await initDatabase();

const originList = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const allowedOrigins = new Set([...defaultOrigins, ...originList]);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/auth/csrf-token', (req, res) => {
  const token = issueCsrfToken(res);
  res.send({ csrfToken: token });
});

app.use(csrfProtection);

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/support', supportRouter);
app.use('/api/seed', seedRouter);

app.get('/api/config/paypal', (_req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.get('/api/config/google', (_req, res) => {
  res.send(process.env.GOOGLE_API_KEY || '');
});

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (_req, res) => {
  res.status(200).send({ status: 'ok', service: 'amazon-app-api' });
});

app.get('/health', (_req, res) => {
  res.status(200).send({ status: 'ok' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(__dirname, '/frontend/dist/index.html'))
  );
}

app.use((err, _req, res, _next) => {
  const message = err?.message || 'Server Error';
  if (message.includes('CORS')) {
    res.status(403).send({ message });
    return;
  }
  res.status(500).send({ message });
});

export default app;
