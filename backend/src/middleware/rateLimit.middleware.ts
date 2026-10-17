import { Request, Response, NextFunction } from 'express';

interface Bucket {
  count: number;
  reset: number;
}

const buckets = new Map<string, Bucket>();

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.reset) {
    b = { count: 0, reset: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  return b.count <= max;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now > b.reset) buckets.delete(k);
  }
}, 60000).unref();

export function generalRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`api:${ip}`, 300, 60000)) {
    res.status(429).json({ error: 'too many requests' });
    return;
  }
  next();
}

export function loginRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`login:${ip}`, 10, 600000)) {
    res.status(429).json({ error: 'too many attempts — try later' });
    return;
  }
  next();
}
