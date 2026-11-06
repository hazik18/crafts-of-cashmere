export type CraftCategory = 'pashmina' | 'kaani' | 'walnut' | 'papier' | 'carpet' | 'crewel';

export type MotifType = 'paisley' | 'chinarLeaf' | 'latticeJali' | 'medallion' | 'vineBloom' | 'boxRosette';

export interface Product {
  id: string;
  cat: CraftCategory;
  name: string;
  maker: string;
  badge: string;
  price: number;
  img: string | null;
  alt: string;
  motif: MotifType | null;
  desc?: string;
  images?: string[];      // ordered gallery of additional photo paths
  stock?: number;         // 1 = single piece heirloom, 0 = woven to order
  leadTimeWeeks?: number; // used when stock === 0
  dimensions?: string;
  weight?: string;
  materials?: string;
  technique?: string;
  origin?: string;
  loomTime?: string;
  careGuide?: string;
}

export interface CategoryCatalog {
  label: string;
  items: Product[];
}

export type Catalog = Record<CraftCategory, CategoryCatalog>;

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AvailableBadge {
  badge: string;
  count: number;
}

export interface PaginatedProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
  availableBadges: AvailableBadge[];
  totalCount: number;
  filteredCount: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  cat?: string;
  q?: string;
  sort?: string;
  min?: number | null;
  max?: number | null;
  badges?: string[];
}

export interface CartItem {
  id: string;
  qty: number;
}

export interface OrderLineItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  at: string;
  name: string;
  email: string;
  address: string;
  lines: OrderLineItem[];
  total: number;
}

export interface Subscriber {
  email: string;
  at: string;
}

export interface Collection {
  id: CraftCategory;
  name: string;
  motif: MotifType;
  palette: CraftCategory;
  img: string;
  alt: string;
  desc: string;
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'pashmina',
    name: 'Pashmina Shawls',
    motif: 'paisley',
    palette: 'pashmina',
    img: 'images/pashmina-red.jpg',
    alt: 'Woman wrapped in a deep red pashmina shawl',
    desc: 'Hand-spun cashmere from Changthangi goats, softer than anything a machine can make.',
  },
  {
    id: 'kaani',
    name: 'Kaani Shawls',
    motif: 'vineBloom',
    palette: 'kaani',
    img: 'images/kaani-floral.jpg',
    alt: 'Woman wearing a red and white floral woven shawl',
    desc: 'Woven twig by twig from a coded talim — the haute couture of the loom.',
  },
  {
    id: 'walnut',
    name: 'Walnut Wood Carving',
    motif: 'chinarLeaf',
    palette: 'walnut',
    img: 'images/wood-chisel.jpg',
    alt: 'Artisan carving wood with a chisel',
    desc: 'Deep-relief chinar leaves and vines, chiselled from hundred-year-old walnut.',
  },
  {
    id: 'papier',
    name: 'Papier-Mâché',
    motif: 'boxRosette',
    palette: 'papier',
    img: 'images/papier-vases.jpg',
    alt: 'Colorful hand-painted vases with floral patterns',
    desc: 'Sakhta and naqashi — pulp shaped, lacquered and painted with squirrel-hair brushes.',
  },
  {
    id: 'carpet',
    name: 'Hand-Knotted Carpets',
    motif: 'medallion',
    palette: 'carpet',
    img: 'images/carpet-red.jpg',
    alt: 'Red hand-knotted carpet with intricate design',
    desc: 'Silk and wool kal baffi, up to 900 knots per square inch, made to outlive us.',
  },
  {
    id: 'crewel',
    name: 'Crewel & Chain Stitch',
    motif: 'latticeJali',
    palette: 'crewel',
    img: 'images/papier-ornament.jpg',
    alt: 'Hands embroidering colorful thread on dark fabric in a hoop',
    desc: 'Wool-embroidered drapery and namda rugs, hooked in flowing aari stitch.',
  },
];
