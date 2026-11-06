import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { catalogRepository } from '../repositories/catalog.repository.js';
import { ordersRepository } from '../repositories/orders.repository.js';
import { isValidEmail } from '../validators/index.js';
import { Order, OrderLineItem } from '../types/index.js';

const uid = () => `${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;

export class OrderController {
  public static async createOrder(req: Request, res: Response): Promise<void> {
    const body = req.body || {};
    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 200);
    const address = String(body.address || '').trim().slice(0, 600);
    const items = Array.isArray(body.items) ? body.items : [];

    if (!name || !address || !email || !items.length) {
      res.status(400).json({ error: 'missing required fields' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'invalid email address' });
      return;
    }

    const lines: OrderLineItem[] = [];
    let total = 0;

    for (const it of items) {
      const found = catalogRepository.findProduct(String(it.id));
      const qty = Math.min(Math.max(1, Math.round(Number(it.qty) || 1)), 99);
      if (!found) continue;

      lines.push({
        id: found.item.id,
        name: found.item.name,
        qty,
        price: found.item.price,
      });
      total += found.item.price * qty;
    }

    if (!lines.length) {
      res.status(400).json({ error: 'no valid items' });
      return;
    }

    const order: Order = {
      id: `CC-${uid().toUpperCase()}`,
      at: new Date().toISOString(),
      name,
      email,
      address,
      lines,
      total,
    };

    try {
      await ordersRepository.addOrder(order);
      res.json({ ok: true, orderId: order.id, total });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  public static getOrders(_req: Request, res: Response): void {
    const orders = ordersRepository.getOrders();
    res.json({ orders });
  }
}
