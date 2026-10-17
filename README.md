# Crafts of Cashmere

E-commerce platform and digital atelier for authentic handmade Kashmiri crafts — pashmina and kaani shawls, walnut wood carving, papier-mâché, hand-knotted carpets and crewel embroidery.

Migrated to a decoupled modern architecture:
- **Frontend**: React 19 + TypeScript, Vite, React Router, GSAP, Lenis
- **Backend**: Node.js + TypeScript, Express, Helmet, CORS, atomic file persistence

---

## Getting Started

### 1. Backend Server
```bash
cd backend
npm.cmd install        # first time
npm.cmd run dev        # runs on http://localhost:4173
```
- API Base URL: `http://localhost:4173/api`
- Default Admin Key: `cashmere-admin` (override with `ADMIN_KEY` environment variable)

### 2. Frontend Application
```bash
cd frontend
npm.cmd install        # first time
npm.cmd run dev        # runs on http://localhost:5173
```
- Storefront Home: `http://localhost:5173/`
- Shop Catalog: `http://localhost:5173/shop`
- Craft Story: `http://localhost:5173/craft`
- Atelier Admin Panel: `http://localhost:5173/admin`

---

## Project Structure

```
crafts-of-cashmere/
├── backend/
│   ├── data/                 # JSON persistence (catalog, orders, subscribers)
│   ├── uploads/              # Local image uploads directory
│   ├── src/
│   │   ├── types/            # TypeScript domain interfaces
│   │   ├── repositories/     # Persistence layer with atomic write queues
│   │   ├── services/         # Storage service interface (local / cloud-ready)
│   │   ├── middleware/       # Constant-time auth & rate limiters
│   │   ├── validators/       # Request sanitizers & field bounds
│   │   ├── controllers/      # Catalog, Order, Subscriber, Auth, Upload
│   │   ├── routes/           # REST API routes
│   │   ├── app.ts            # Express setup with Helmet & CORS
│   │   └── server.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   └── images/           # High-resolution craft photography
│   ├── src/
│   │   ├── app/              # Router & application setup
│   │   ├── components/       # Navbar, Footer, Preloader, Grain, ScrollProgress
│   │   ├── features/
│   │   │   ├── cart/         # CartContext (localStorage) & CartDrawer
│   │   │   ├── checkout/     # CheckoutModal with backend order submission
│   │   │   └── products/     # 6 parametric SVG motifs, ProductCard, ProductDetailModal
│   │   ├── hooks/            # useLenis (kinetic smooth scrolling & ScrollTrigger)
│   │   ├── services/         # Typed API client
│   │   ├── styles/           # Preserved CSS design system
│   │   └── pages/
│   │       ├── HomePage.tsx  # Hero reveals, marquee, 6-craft collection grid
│   │       ├── ShopPage.tsx  # Filter tabs, URL query sync, 120-piece product grid
│   │       ├── CraftPage.tsx # Process narrative, Dal Lake parallax, quote
│   │       └── AdminPage.tsx # Password login, catalog CRUD, orders & letters
│   ├── package.json
│   ├── vite.config.ts        # Dev server proxying /api to backend
│   └── tsconfig.json
│
├── crafts_of_cashmere_analysis.md # Comprehensive architectural analysis
├── Plan.md                        # Migration specification
├── BUSINESS-PLAN.md               # Unit economics, logistics & go-to-market plan
└── SECURITY.md                    # Threat model & security mitigations
```

---

## Production Build

```bash
# Build backend
cd backend
npm.cmd run build

# Build frontend
cd ../frontend
npm.cmd run build
```
