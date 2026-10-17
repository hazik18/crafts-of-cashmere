import { Request, Response } from 'express';
import { subscribersRepository } from '../repositories/subscribers.repository.js';
import { isValidEmail } from '../validators/index.js';

export class SubscriberController {
  public static async subscribe(req: Request, res: Response): Promise<void> {
    const email = req.body?.email;

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'invalid email' });
      return;
    }

    try {
      await subscribersRepository.addSubscriber(email);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  public static getSubscribers(_req: Request, res: Response): void {
    const subscribers = subscribersRepository.getSubscribers();
    res.json({ subscribers });
  }
}
