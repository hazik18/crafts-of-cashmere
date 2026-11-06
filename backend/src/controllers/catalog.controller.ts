import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { catalogRepository } from '../repositories/catalog.repository.js';
import { sanitizeProductFields, isValidCategory } from '../validators/index.js';
import { storageService } from '../services/storage.service.js';
import { Product } from '../types/index.js';

const uid = () => `${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;

export class CatalogController {
  public static getCatalog(_req: Request, res: Response): void {
    const catalog = catalogRepository.getCatalog();
    res.json({ catalog });
  }

  public static getProducts(req: Request, res: Response): void {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const cat = (req.query.cat as string) || 'all';
    const q = (req.query.q as string) || '';
    const sort = (req.query.sort as string) || 'curated';
    const min = req.query.min !== undefined && req.query.min !== '' ? Number(req.query.min) : undefined;
    const max = req.query.max !== undefined && req.query.max !== '' ? Number(req.query.max) : undefined;
    const badges = req.query.badges
      ? (Array.isArray(req.query.badges) ? (req.query.badges as string[]) : (req.query.badges as string).split(',')).filter(Boolean)
      : undefined;

    const result = catalogRepository.getPaginatedProducts({
      page,
      limit,
      cat,
      q,
      sort,
      min,
      max,
      badges,
    });

    res.json(result);
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
      images: fields.images ?? [],
      stock: fields.stock,
      leadTimeWeeks: fields.leadTimeWeeks,
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
    const deletedItem = await catalogRepository.deleteProduct(id);

    if (!deletedItem) {
      res.status(404).json({ error: 'not found' });
      return;
    }

    // Storage cleanup: delete associated uploaded or cloud images to prevent disk exhaustion
    const imagesToPurge: string[] = [];
    if (deletedItem.img) {
      imagesToPurge.push(deletedItem.img);
    }
    if (Array.isArray(deletedItem.images)) {
      imagesToPurge.push(...deletedItem.images);
    }

    if (imagesToPurge.length > 0) {
      await storageService.deleteImages(imagesToPurge).catch((err) => {
        console.error('Failed to clean up product images:', err);
      });
    }

    res.json({ ok: true });
  }
}
