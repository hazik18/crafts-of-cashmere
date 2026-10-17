import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Catalog, Product, CraftCategory } from '../types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');

const writeQueues = new Map<string, Promise<void>>();

function writeJSONAtomic<T>(file: string, value: T): Promise<void> {
  const data = JSON.stringify(value, null, 2);
  const run = async () => {
    const tmp = `${file}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    await fsp.writeFile(tmp, data, 'utf8');
    await fsp.rename(tmp, file);
  };
  const next = (writeQueues.get(file) || Promise.resolve()).catch(() => {}).then(run);
  writeQueues.set(file, next);
  return next;
}

export class CatalogRepository {
  private catalog: Catalog;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(CATALOG_FILE)) {
      try {
        this.catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')) as Catalog;
      } catch (err) {
        console.error('Failed to parse catalog.json, using fallback empty catalog:', err);
        this.catalog = {} as Catalog;
      }
    } else {
      this.catalog = {} as Catalog;
    }
  }

  public getCatalog(): Catalog {
    return this.catalog;
  }

  public findProduct(id: string): { cat: CraftCategory; idx: number; item: Product } | null {
    for (const [key, category] of Object.entries(this.catalog) as [CraftCategory, Catalog[CraftCategory]][]) {
      const idx = category.items.findIndex((item) => item.id === id);
      if (idx !== -1) {
        return { cat: key, idx, item: category.items[idx] };
      }
    }
    return null;
  }

  public async addProduct(item: Product): Promise<Product> {
    if (!this.catalog[item.cat]) {
      throw new Error(`Category ${item.cat} does not exist`);
    }
    this.catalog[item.cat].items.push(item);
    await writeJSONAtomic(CATALOG_FILE, this.catalog);
    return item;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const found = this.findProduct(id);
    if (!found) return null;

    Object.assign(found.item, updates);
    if (found.item.img) {
      found.item.motif = null;
    }
    await writeJSONAtomic(CATALOG_FILE, this.catalog);
    return found.item;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const found = this.findProduct(id);
    if (!found) return false;

    this.catalog[found.cat].items.splice(found.idx, 1);
    await writeJSONAtomic(CATALOG_FILE, this.catalog);
    return true;
  }
}

export const catalogRepository = new CatalogRepository();
