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

export interface OrderItemInput {
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

export interface CreateProductDTO {
  cat: CraftCategory;
  name: string;
  maker?: string;
  badge?: string;
  price?: number;
  img?: string | null;
  alt?: string;
  motif?: MotifType | null;
  desc?: string;
  images?: string[];
  stock?: number;
  leadTimeWeeks?: number;
}

export interface UpdateProductDTO {
  name?: string;
  maker?: string;
  badge?: string;
  price?: number;
  img?: string | null;
  alt?: string;
  motif?: MotifType | null;
  desc?: string;
  images?: string[];
  stock?: number;
  leadTimeWeeks?: number;
}

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
  min?: number;
  max?: number;
  badges?: string[];
}
