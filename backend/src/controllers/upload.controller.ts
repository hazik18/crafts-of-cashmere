import { Request, Response } from 'express';
import { storageService } from '../services/storage.service.js';

export class UploadController {
  public static async upload(req: Request, res: Response): Promise<void> {
    const { data, filename } = req.body || {};

    if (!data) {
      res.status(400).json({ error: 'expected data URL (jpeg/png/webp)' });
      return;
    }

    try {
      const result = await storageService.saveImage(String(data), filename);
      res.json({ ok: true, path: result.path });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
}
