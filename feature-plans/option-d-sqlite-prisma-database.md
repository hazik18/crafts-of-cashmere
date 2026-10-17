# Feature Specification: Option D — Database Migration to SQLite with Prisma ORM

**Objective**: Transition the backend from temporary JSON file storage (`catalog.json`, `orders.json`, `subscribers.json`) to an embedded, transactional **SQLite** database managed with **Prisma ORM**. Guarantee ACID compliance, eliminate race conditions during concurrent checkouts, and establish a solid schema migration workflow while keeping the system lightweight and zero-dependency on external database servers.

---

## 1. Overview & Architectural Motivation

### Current Limitations of JSON Storage
- **Race Conditions**: Two checkouts landing in the same millisecond execute read-modify-write on arrays in memory; a server restart during a write cycle could theoretically lead to desynchronization.
- **No Referential Integrity**: If a product ID is deleted in `catalog.json`, historical order line items pointing to that product have no foreign key constraint.
- **Memory Footprint**: All products, orders, and subscriber records are loaded entirely into Node.js process memory.
- **Query Limitations**: Filtering, sorting, and pagination currently require iterating in-memory JavaScript arrays.

### Why SQLite + Prisma?
1. **Zero External Server**: SQLite runs directly in the Node process against a single local file (`backend/data/cashmere.db`), requiring no PostgreSQL/MySQL daemon, cloud connection, or database administration.
2. **ACID Transactions**: Checkouts run inside `prisma.$transaction(...)`, ensuring order generation, inventory decrement, and payment logging succeed together or roll back cleanly.
3. **Type Safety & Auto-Generated Client**: Prisma generates fully typed TypeScript query models matching our domain interfaces.
4. **Future-Proof**: Moving from SQLite to PostgreSQL in the future requires changing only a single line in `schema.prisma` (`provider = "postgresql"`).

---

## 2. Prisma Database Schema (`backend/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:../data/cashmere.db"
}

generator client {
  provider = "prisma-client-js"
}

model Category {
  id        String    @id // 'pashmina', 'kaani', 'walnut', 'papier', 'carpet', 'crewel'
  label     String
  products  Product[]
  createdAt DateTime  @default(now())
}

model Product {
  id             String          @id // e.g. 'pashmina-01'
  categoryId     String
  category       Category        @relation(fields: [categoryId], references: [id])
  name           String
  maker          String          @default("Atelier of Ghulam Nabi")
  badge          String          @default("Handmade")
  price          Int             // Stored in INR (e.g. 9200)
  img            String?         // e.g. "images/pashmina-red.jpg"
  alt            String?
  motif          String?         // 'paisley', 'chinarLeaf', etc.
  desc           String?
  stock          Int             @default(1)
  orderLines     OrderLineItem[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

model Order {
  id          String          @id // 'CC-XXXXXX'
  at          DateTime        @default(now())
  name        String
  email       String
  address     String
  total       Int             // Stored in INR
  status      String          @default("PENDING") // PENDING, PAID, DISPATCHED, DELIVERED
  paymentId   String?
  lines       OrderLineItem[]
}

model OrderLineItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  name      String   // Snapshot at purchase time
  qty       Int      @default(1)
  price     Int      // Snapshot at purchase time
}

model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  at        DateTime @default(now())
}
```

---

## 3. Implementation Steps

### 3.1 Install Prisma Dependencies
```bash
cd backend
npm.cmd install @prisma/client
npm.cmd install --save-dev prisma
```

### 3.2 Initialize and Run Migration
```bash
npx.cmd prisma init --datasource-provider sqlite
# Paste the schema into backend/prisma/schema.prisma
npx.cmd prisma migrate dev --name init_crafts_schema
npx.cmd prisma generate
```

### 3.3 Data Seeding Script (`backend/prisma/seed.ts`)
Create an automated migration script that imports existing records from `data/catalog.json`, `data/orders.json`, and `data/subscribers.json`:

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

async function main() {
  const catalogPath = path.resolve(__dirname, '../data/catalog.json');
  if (fs.existsSync(catalogPath)) {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

    for (const [catKey, catData] of Object.entries(catalog) as [string, any][]) {
      await prisma.category.upsert({
        where: { id: catKey },
        update: { label: catData.label },
        create: { id: catKey, label: catData.label },
      });

      for (const item of catData.items) {
        await prisma.product.upsert({
          where: { id: item.id },
          update: {
            name: item.name,
            maker: item.maker,
            badge: item.badge,
            price: item.price,
            img: item.img,
            alt: item.alt,
            motif: item.motif,
            desc: item.desc,
          },
          create: {
            id: item.id,
            categoryId: catKey,
            name: item.name,
            maker: item.maker,
            badge: item.badge,
            price: item.price,
            img: item.img,
            alt: item.alt,
            motif: item.motif,
            desc: item.desc,
          },
        });
      }
    }
  }
  console.log('Seeded database successfully from catalog.json');
}

main().finally(() => prisma.$disconnect());
```

---

## 4. Repository Modernization

Keep existing controller signatures identical, replacing the file-system operations inside `repositories/` with Prisma queries:

### Example: Updated `CatalogRepository` (`backend/src/repositories/catalog.repository.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
import { Catalog, Product, CraftCategory } from '../types/index.js';

const prisma = new PrismaClient();

export class CatalogRepository {
  public async getCatalog(): Promise<Catalog> {
    const categories = await prisma.category.findMany({
      include: { products: true },
    });

    const catalog = {} as Catalog;
    for (const cat of categories) {
      catalog[cat.id as CraftCategory] = {
        label: cat.label,
        items: cat.products as unknown as Product[],
      };
    }
    return catalog;
  }

  public async findProduct(id: string): Promise<Product | null> {
    const item = await prisma.product.findUnique({ where: { id } });
    return item as unknown as Product;
  }

  public async addProduct(item: Product): Promise<Product> {
    const created = await prisma.product.create({
      data: {
        id: item.id,
        categoryId: item.cat,
        name: item.name,
        maker: item.maker,
        badge: item.badge,
        price: item.price,
        img: item.img,
        alt: item.alt,
        motif: item.motif,
        desc: item.desc,
      },
    });
    return created as unknown as Product;
  }
}
```

### Example: Transactional Order Creation (`backend/src/controllers/order.controller.ts`)
```typescript
// Atomically creates the order and snapshot line items in a single ACID transaction:
const newOrder = await prisma.$transaction(async (tx) => {
  return tx.order.create({
    data: {
      id: orderId,
      name,
      email,
      address,
      total,
      lines: {
        create: lines.map((l) => ({
          productId: l.id,
          name: l.name,
          qty: l.qty,
          price: l.price,
        })),
      },
    },
    include: { lines: true },
  });
});
```

---

## 5. Acceptance Criteria & Testing Checklist

- [ ] `prisma migrate dev` creates `backend/data/cashmere.db` with proper tables and foreign keys.
- [ ] Seed script imports all 120 products across 6 categories without data loss.
- [ ] `GET /api/catalog` returns identical JSON structure expected by the React frontend.
- [ ] Concurrent simulated checkouts pass without table locks or duplicate primary keys.
- [ ] Product deletion or updates accurately reflect in database and cascade properly.
- [ ] Zero changes required on the React frontend (`frontend/src/services/api.ts` remains 100% compatible).
