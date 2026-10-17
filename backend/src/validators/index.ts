import { CraftCategory, MotifType, Product } from '../types/index.js';

const VALID_MOTIFS: MotifType[] = [
  'paisley',
  'vineBloom',
  'chinarLeaf',
  'boxRosette',
  'medallion',
  'latticeJali',
];

const VALID_CATEGORIES: CraftCategory[] = [
  'pashmina',
  'kaani',
  'walnut',
  'papier',
  'carpet',
  'crewel',
];

export function isValidCategory(cat: unknown): cat is CraftCategory {
  return typeof cat === 'string' && VALID_CATEGORIES.includes(cat as CraftCategory);
}

export function isValidMotif(motif: unknown): motif is MotifType {
  return typeof motif === 'string' && VALID_MOTIFS.includes(motif as MotifType);
}

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function sanitizeProductFields(body: Record<string, unknown>): Partial<Product> {
  const out: Partial<Product> = {};

  if (typeof body.name === 'string' && body.name.trim()) {
    out.name = body.name.trim().slice(0, 120);
  }

  if (typeof body.maker === 'string') {
    out.maker = body.maker.trim().slice(0, 120);
  }

  if (typeof body.badge === 'string') {
    out.badge = body.badge.trim().slice(0, 40);
  }

  if (typeof body.desc === 'string') {
    out.desc = body.desc.trim().slice(0, 2000);
  }

  if (typeof body.alt === 'string') {
    out.alt = body.alt.trim().slice(0, 300);
  }

  if (body.price !== undefined) {
    const p = Math.round(Number(body.price));
    if (Number.isFinite(p) && p >= 0 && p <= 100000000) {
      out.price = p;
    }
  }

  if (typeof body.img === 'string') {
    const img = body.img.trim();
    if (/^images\/[\w./-]+$/.test(img) && !img.includes('..')) {
      out.img = img;
      out.motif = null;
    }
  }

  if (body.img === null) {
    out.img = null;
  }

  if (isValidMotif(body.motif)) {
    out.motif = body.motif;
    out.img = null;
  }

  return out;
}
