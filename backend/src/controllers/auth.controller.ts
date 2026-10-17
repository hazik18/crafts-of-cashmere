import { Request, Response } from 'express';
import { keyMatches } from '../middleware/auth.middleware.js';

export class AuthController {
  public static login(req: Request, res: Response): void {
    const key = req.body?.key;
    const ok = keyMatches(key);

    if (ok) {
      res.status(200).json({ ok: true });
    } else {
      res.status(401).json({ ok: false });
    }
  }
}
