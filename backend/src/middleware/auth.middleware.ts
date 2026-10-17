import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export const ADMIN_KEY = process.env.ADMIN_KEY || 'cashmere-admin';

export function keyMatches(candidate: unknown): boolean {
  const a = Buffer.from(String(candidate || ''));
  const b = Buffer.from(ADMIN_KEY);
  if (a.length !== b.length) {
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const candidate = req.headers['x-admin-key'];
  if (!keyMatches(candidate)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
}
