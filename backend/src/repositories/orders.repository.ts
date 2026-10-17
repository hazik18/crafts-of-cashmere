import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Order } from '../types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

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

export class OrdersRepository {
  private orders: Order[] = [];

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ORDERS_FILE)) {
      try {
        this.orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')) as Order[];
      } catch (err) {
        console.error('Failed to parse orders.json:', err);
        this.orders = [];
      }
    }
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public async addOrder(order: Order): Promise<Order> {
    this.orders.push(order);
    await writeJSONAtomic(ORDERS_FILE, this.orders);
    return order;
  }
}

export const ordersRepository = new OrdersRepository();
