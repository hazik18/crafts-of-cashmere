import { Catalog, Order, Product, Subscriber } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }

  return data as T;
}

export const api = {
  async getCatalog(): Promise<{ catalog: Catalog }> {
    return request<{ catalog: Catalog }>('/api/catalog');
  },

  async login(key: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ key }),
    });
  },

  async subscribe(email: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async createOrder(payload: {
    name: string;
    email: string;
    address: string;
    items: { id: string; qty: number }[];
  }): Promise<{ ok: boolean; orderId: string; total: number }> {
    return request<{ ok: boolean; orderId: string; total: number }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getOrders(adminKey: string): Promise<{ orders: Order[] }> {
    return request<{ orders: Order[] }>('/api/orders', {
      headers: { 'X-Admin-Key': adminKey },
    });
  },

  async getSubscribers(adminKey: string): Promise<{ subscribers: Subscriber[] }> {
    return request<{ subscribers: Subscriber[] }>('/api/subscribers', {
      headers: { 'X-Admin-Key': adminKey },
    });
  },

  async createProduct(
    product: Partial<Product>,
    adminKey: string
  ): Promise<{ ok: boolean; item: Product }> {
    return request<{ ok: boolean; item: Product }>('/api/products', {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
      body: JSON.stringify(product),
    });
  },

  async updateProduct(
    id: string,
    updates: Partial<Product>,
    adminKey: string
  ): Promise<{ ok: boolean; item: Product }> {
    return request<{ ok: boolean; item: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'X-Admin-Key': adminKey },
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(id: string, adminKey: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Key': adminKey },
    });
  },

  async uploadImage(
    dataUrl: string,
    filename: string,
    adminKey: string
  ): Promise<{ ok: boolean; path: string }> {
    return request<{ ok: boolean; path: string }>('/api/upload', {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
      body: JSON.stringify({ data: dataUrl, filename }),
    });
  },

  async uploadBatch(
    images: Array<{ data: string; filename: string }>,
    adminKey: string
  ): Promise<{ ok: boolean; paths: string[] }> {
    return request<{ ok: boolean; paths: string[] }>('/api/upload/batch', {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
      body: JSON.stringify({ images }),
    });
  },
};
