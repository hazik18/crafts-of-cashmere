import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Catalog, Product, CraftCategory, ProductQueryParams, PaginatedProductsResponse } from '../types/index.js';

const resolveDataDir = (): string => {
  const inBackend = path.resolve(process.cwd(), 'backend', 'data');
  if (fs.existsSync(path.join(inBackend, 'catalog.json'))) {
    return inBackend;
  }
  const inCwd = path.resolve(process.cwd(), 'data');
  if (fs.existsSync(path.join(inCwd, 'catalog.json'))) {
    return inCwd;
  }
  return inCwd;
};

const DATA_DIR = resolveDataDir();
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

  public getAllProducts(): Product[] {
    return Object.values(this.catalog).flatMap((category) => category?.items || []);
  }

  public getPaginatedProducts(params: ProductQueryParams): PaginatedProductsResponse {
    const allProducts = this.getAllProducts();
    const totalCount = allProducts.length;

    const activeCat = params.cat || 'all';
    const q = (params.q || '').toLowerCase().trim();
    const badges = params.badges || [];
    const min = params.min;
    const max = params.max;
    const sort = params.sort || 'curated';

    // 1. Filter
    const filtered = allProducts.filter((item) => {
      // Category check
      if (activeCat !== 'all' && item.cat !== activeCat) {
        return false;
      }

      // Keyword query match
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchMaker = (item.maker || '').toLowerCase().includes(q);
        const matchBadge = (item.badge || '').toLowerCase().includes(q);
        const matchDesc = (item.desc || '').toLowerCase().includes(q);
        const matchCat = (item.cat || '').toLowerCase().includes(q);
        if (!matchName && !matchMaker && !matchBadge && !matchDesc && !matchCat) {
          return false;
        }
      }

      // Badges match
      if (badges.length > 0) {
        if (!badges.includes(item.badge)) {
          return false;
        }
      }

      // Price range
      if (min !== undefined && min !== null && !isNaN(min) && item.price < min) {
        return false;
      }
      if (max !== undefined && max !== null && !isNaN(max) && item.price > max) {
        return false;
      }

      return true;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'name_asc') return a.name.localeCompare(b.name);
      if (sort === 'maker_asc') return a.maker.localeCompare(b.maker);
      return 0; // Curated order preserved
    });

    // 3. Compute available badges for the current category selection
    const badgeCounts: Record<string, number> = {};
    allProducts.forEach((p) => {
      if (activeCat !== 'all' && p.cat !== activeCat) return;
      if (p.badge) {
        badgeCounts[p.badge] = (badgeCounts[p.badge] || 0) + 1;
      }
    });
    const availableBadges = Object.entries(badgeCounts)
      .map(([badge, count]) => ({ badge, count }))
      .sort((a, b) => b.count - a.count);

    // 4. Paginate
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 12));
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const paginatedItems = filtered.slice(offset, offset + limit);

    return {
      products: paginatedItems,
      pagination: {
        page: safePage,
        limit,
        totalItems,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
      availableBadges,
      totalCount,
      filteredCount: totalItems,
    };
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

  public async deleteProduct(id: string): Promise<Product | null> {
    const found = this.findProduct(id);
    if (!found) return null;

    const [removedItem] = this.catalog[found.cat].items.splice(found.idx, 1);
    await writeJSONAtomic(CATALOG_FILE, this.catalog);
    return removedItem || null;
  }
}

export const catalogRepository = new CatalogRepository();
