# Crafts of Cashmere — Business & Technical Plan
*Drafted July 2026. You have: 42 artisan families + a working website with admin panel. This plan covers everything else.*

---

## Part 1 — Hosting (getting it on the internet)

The app is a single Node process with JSON-file storage and disk uploads, so it needs a host with a **persistent disk** — not serverless (Vercel/Netlify won't work without re-architecting storage).

**Recommended: a small VPS + Caddy (≈ ₹400–600/month)**

| Item | Choice | Cost |
|---|---|---|
| Domain | `craftsofcashmere.in` / `.com` via GoDaddy/Namecheap/Cloudflare | ₹800–1,200/yr |
| Server | Hetzner CX22, DigitalOcean Basic, or AWS Lightsail (2GB RAM is plenty) | ₹350–550/mo |
| HTTPS | Caddy reverse proxy → free auto-renewing Let's Encrypt certificate | ₹0 |
| CDN/shield | Cloudflare free tier in front (caching, DDoS protection) | ₹0 |

Deployment steps (one afternoon):
1. Point the domain's DNS at the VPS (via Cloudflare).
2. Install Node 22 + Caddy. Caddyfile is two lines: `craftsofcashmere.in { reverse_proxy localhost:4173 }` — TLS is automatic.
3. Run the app as a systemd service with `ADMIN_KEY=<long random string>` set.
4. Nightly cron backup of `data/` + `images/uploads/` to object storage (Cloudflare R2 free tier) — **these folders are your entire database**.

Simpler alternative if you never want to touch a server: **Railway or Render** with a persistent disk (~$5–7/mo) — git push to deploy. Slightly more per month, much less sysadmin.

---

## Part 2 — Can it handle multiple users?

**Honest engineering answer: yes, comfortably, at boutique scale — with one known limit.**

- **Browsing**: Node serves static files and an in-memory catalog. Hundreds of simultaneous visitors (a viral Instagram day) are no problem on a ₹400 VPS. Rate limiting (added in the security pass) protects against abuse.
- **Ordering**: writes go to JSON files. The write itself is atomic (temp-file + rename), but two orders landing in the *same instant* perform read-modify-write without a lock — a theoretical lost-order race. At boutique volume (even 50 orders/day) the practical risk is near zero, but it is not flash-sale-grade.
- **Admin**: one shared key, designed for one operator (you). Fine until you hire.

**Scaling path (only when the business demands it):**
1. **Now → ~50 orders/day**: current architecture as-is. ✅
2. **Growth trigger**: serialize writes through a queue (20-line change) or move `data/*.json` to **SQLite** (still one file, zero server, safe concurrent writes) — a weekend of work.
3. **Scale trigger** (thousands of orders/mo, multiple staff): Postgres + user accounts + roles. This is a good problem to have; don't build it before then.

---

## Part 3 — Payments (India)

**Recommended: Razorpay** — the standard for Indian D2C, supports UPI, cards, netbanking, wallets, EMI, and international cards.

Verified pricing (2026): **2% + GST** on domestic UPI/cards/netbanking, **~3% + GST** on international cards and premium instruments, **no setup or annual fees**, settlement T+2 domestic / T+7 international. Fees drop at volume (tiered after ₹25L cumulative UPI).

**To get a Razorpay account (KYC) you need:**
- PAN + a bank account (business current account preferred)
- GST registration (see Part 4)
- A live website **with these pages: Terms, Privacy Policy, Refund/Return Policy, Shipping Policy, Contact** — these are mandatory for approval and the site doesn't have them yet. *(Ask me — I'll add them.)*

**Integration into this codebase** (roughly a day of work when you're ready):
1. Server: `/api/pay/create-order` → creates a Razorpay order for the server-computed cart total.
2. Frontend: Razorpay Checkout modal opens from the existing checkout form.
3. Server: verify the payment signature webhook-side, then mark the order paid in `data/orders.json`. Never trust the client's total (the server already recomputes it — good).

**Bridge option for your first sales (this week, zero code):** WhatsApp Business + UPI QR code / payment link. Take orders via the site's checkout (which already records them), confirm payment manually. Dozens of successful craft sellers run months on exactly this.

**International buyers** (huge for Kashmiri crafts): activate Razorpay International (3%) and/or PayPal; both settle to Indian accounts. Requires IEC code (Part 4).

---

## Part 4 — Legal & compliance (India, in order)

1. **Entity**: start as a sole proprietorship (free, instant). Convert to Pvt Ltd only when revenue or a co-founder demands it.
2. **Udyam (MSME) registration** — free, online, 15 minutes. Unlocks credit and government craft-sector schemes.
3. **GST registration** — required to sell online across states and for Razorpay. Handicraft GST rates vary by item (shawls vs wood vs papier-mâché differ; roughly 5–12% by HSN code) — one sitting with a local CA (~₹2–5k) sets this up correctly.
4. **Current account** in the business name.
5. **IEC (Import-Export Code)** — ₹500, online, needed the day you ship abroad.
6. **GI compliance**: only GI-registered weavers/units may label products "Kashmir Pashmina (GI)". Source through registered artisans and keep their certification copies — this is also your strongest marketing asset.

---

## Part 5 — The business model

### Positioning (your unfair advantage)
Direct-from-artisan, GI-certified, maker-signed. The global pashmina market is drowning in fakes; **provenance is the product**. Every piece already carries its maker's name on the site — lean into radical authenticity: photos of the actual weaver, the actual loom, a signed authenticity card in the box.

### Sourcing & inventory
- Start **consignment or small-batch buyouts** (10–20 entry pieces + 5 hero pieces). Don't sink cash into deep stock.
- Carpets and premium kaani: **made-to-order / video-call selling** — zero inventory risk on ₹1L+ items.
- Add real photos per piece via the admin panel (daylight + one detail/texture shot + one maker shot). Phone camera is fine; consistency beats gear.

### Pricing & unit economics (target ≥ 50% gross margin on volume items)
Example — crewel cushion set: artisan ₹1,400 → sell ₹3,200. Less payment fee (~₹75), shipping (~₹90), packaging (~₹60), returns/damage buffer (5%) → **~₹1,415 contribution (44%)**. Hero pashmina: artisan ₹9,000 → sell ₹19,500 → ~₹9,300 contribution.
- **Entry tier** ₹1.5–6k (papier-mâché, crewel, small walnut): discovery + gifting volume.
- **Hero tier** ₹15–70k (pashmina, kaani): margin engine.
- **Commission tier** ₹75k+ (carpets, dorukha): high-touch, deposit upfront.

### Logistics
- Domestic: **Shiprocket/Delhivery aggregator** — ~₹45–90 per 500g, COD available (charge COD fee to customer), insurance on high-value.
- International: Shiprocket X / DHL — price shipping into the product for "free insured shipping" (the site already promises it).
- Packaging: archival tissue + sturdy box + maker card + GI/authenticity card. Budget ₹60–150/order; it *is* the luxury experience.

### Marketing (₹0-first, in order of ROI)
1. **Instagram/Reels of the making** — looms, chisels, brushes. Process content from real ateliers is the single highest-ROI asset you own. 3 reels/week.
2. **WhatsApp Business** — catalog + broadcast list; where Indian craft actually sells.
3. **Newsletter** — the site already captures emails; send the monthly "Letters from the valley" it promises.
4. **Marketplaces as a channel, not home**: Etsy (international), Amazon Karigar, Novica — reach while your own site's SEO grows.
5. **SEO content**: "How to spot real pashmina (the ring test)", "What is a talim?" — authenticity questions people actually Google.
6. **Seasonality**: Sept–Feb (weddings, Diwali, winter, Christmas exports) is 70% of the year — plan stock and content around it.
7. Later: influencer gifting (hero pieces), Dastkar/Dilli Haat exhibitions, B2B outreach to interior designers & boutique hotels (carpets, crewel drapes — big tickets, repeat buyers).

### 12-month phased roadmap

| Phase | Timeline | Goals | Tech work |
|---|---|---|---|
| **0 — Foundation** | Weeks 1–3 | Entity, GST, bank, Razorpay KYC, domain, hosting, policy pages, 25 real product photos | Deploy to VPS, add policy pages, Razorpay integration |
| **1 — First sales** | Months 1–3 | 10–30 orders/mo via IG + WhatsApp + site; collect testimonials | Order-confirmation emails; Plausible analytics |
| **2 — Traction** | Months 3–9 | 50–100 orders/mo; Etsy/Amazon channels; ₹1.5–3L/mo revenue | SQLite migration, inventory counts, discount codes, image optimization |
| **3 — Scale** | Months 9–12+ | Exports, B2B carpet/crewel pipeline, first hire (packing/photos) | Multi-admin accounts, shipping-API integration, customer accounts |

### Startup budget (lean)

| Item | ₹ |
|---|---|
| Domain + 1yr hosting | ~5,000 |
| GST/CA + registrations | ~5,000 |
| Packaging materials (first 50 orders) | ~6,000 |
| First consignment/photo batch logistics | ~8,000 |
| Contingency | ~6,000 |
| **Total to launch** | **~₹30,000** |

Monthly fixed cost ≈ ₹1,500–2,500 (hosting, tools). At ~44% contribution on a ₹3,000 average order, **break-even is roughly 2 orders/month** — everything above that funds growth.

### Risks to watch
- **Fakes/commodity pressure** → GI + provenance is the moat; never compromise it.
- **Artisan capacity/seasonality** → maintain 2–3 makers per craft; communicate honest lead times ("woven on demand — 3 weeks").
- **Kashmir logistics disruptions** → keep buffer stock of bestsellers outside the valley.
- **Cash tied in inventory** → consignment first; buy outright only what photographs well and moves.
