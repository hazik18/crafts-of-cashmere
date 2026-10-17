import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { catalogRepository } from '../repositories/catalog.repository.js';
import { sanitizeProductFields, isValidCategory } from '../validators/index.js';
import { Product } from '../types/index.js';

const uid = () => `${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;

export class CatalogController {
  public static getCatalog(_req: Request, res: Response): void {
    const catalog = catalogRepository.getCatalog();
    res.json({ catalog });
  }

  public static async createProduct(req: Request, res: Response): Promise<void> {
    const body = req.body || {};
    const cat = body.cat;

    if (!isValidCategory(cat)) {
      res.status(400).json({ error: 'unknown category' });
      return;
    }

    const fields = sanitizeProductFields(body);
    if (!fields.name) {
      res.status(400).json({ error: 'name required' });
      return;
    }

    const item: Product = {
      id: `${cat}-${uid()}`,
      cat,
      name: fields.name,
      maker: fields.maker || 'Atelier of Ghulam Nabi',
      badge: fields.badge || 'Handmade',
      price: fields.price ?? 0,
      img: fields.img ?? null,
      alt: fields.alt || fields.name,
      motif: fields.img ? null : (fields.motif || 'paisley'),
      desc: fields.desc || '',
    };

    try {
      await catalogRepository.addProduct(item);
      res.json({ ok: true, item });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  public static async updateProduct(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const found = catalogRepository.findProduct(id);

    if (!found) {
      res.status(404).json({ error: 'not found' });
      return;
    }

    const fields = sanitizeProductFields(req.body || {});
    try {
      const updated = await catalogRepository.updateProduct(id, fields);
      res.json({ ok: true, item: updated });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  public static async deleteProduct(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const deleted = await catalogRepository.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({ error: 'not found' });
      return;
    }

    res.json({ ok: true });
  }
}
