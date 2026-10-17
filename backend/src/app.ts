import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import apiRoutes from './routes/api.routes.js';
import { generalRateLimiter } from './middleware/rateLimit.middleware.js';

const app = express();

/* Security Headers */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", 'http://localhost:5173', 'http://localhost:4173'],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* CORS for Frontend */
app.use(
  cors({
    origin: true, // Allow frontend dev server and same-origin
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
