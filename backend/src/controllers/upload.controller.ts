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

  public static async uploadBatch(req: Request, res: Response): Promise<void> {
    const { images } = req.body || {};

    if (!Array.isArray(images) || images.length === 0) {
      res.status(400).json({ error: 'expected non-empty images array' });
      return;
    }

    // Each element: { data: string (base64 dataURL), filename?: string }
    const invalid = images.some(
      (img: unknown) => typeof img !== 'object' || img === null || typeof (img as Record<string, unknown>).data !== 'string'
    );
    if (invalid) {
      res.status(400).json({ error: 'each image must have a data field' });
      return;
    }

    try {
      const result = await storageService.saveImages(
        images as Array<{ data: string; filename?: string }>
      );
      res.json({ ok: true, paths: result.paths });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
}
