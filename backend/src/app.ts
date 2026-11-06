import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import apiRoutes from './routes/api.routes.js';
import { generalRateLimiter } from './middleware/rateLimit.middleware.js';

const app = express();

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : defaultOrigins;

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return true;
  }
  // Allow any DigitalOcean App Platform domain (*.ondigitalocean.app)
  if (/^https:\/\/[a-z0-9-]+\.ondigitalocean\.app$/.test(origin)) {
    return true;
  }
  // Allow any port on localhost / 127.0.0.1 for local development
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
}

/* Security Headers */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", ...allowedOrigins, 'http://localhost:*', 'http://127.0.0.1:*', 'https://res.cloudinary.com'],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* CORS with explicit whitelist */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, mobile apps)
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      // Deny CORS gracefully without throwing an unhandled 500 error
      return callback(null, false);
    },
    credentials: true,
  })
);

/* Request Body Parser */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* Static uploads directory */
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
app.use('/images/uploads', express.static(UPLOADS_DIR));

/* API Router with abuse ceiling */
app.use('/api', generalRateLimiter, apiRoutes);

/* 404 Handler for unmatched API routes */
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'unknown endpoint' });
});

/* Global Error Handler */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'internal server error' });
});

export default app;
