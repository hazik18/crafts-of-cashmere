/* ============================================================
   Crafts of Cashmere — application server
   Zero-dependency Node.js: static hosting + JSON API + uploads.
   Run:  node server.js          (port 4173, override with PORT)
   Admin key: ADMIN_KEY env var  (default: cashmere-admin)
   ============================================================ */

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const CERTS_DIR = path.join(ROOT, 'certs');
const UPLOAD_DIR = path.join(ROOT, 'images', 'uploads');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SUBS_FILE = path.join(DATA_DIR, 'subscribers.json');
const PORT = Number(process.env.PORT) || 4173;
const ADMIN_KEY = process.env.ADMIN_KEY || 'cashmere-admin';
const MAX_BODY = 10 * 1024 * 1024; // 10 MB (covers base64 photo uploads)

/* ---------- security headers (OWASP: security misconfiguration) ---------- */
const SEC_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://cdn.jsdelivr.net",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

/* ---------- rate limiting (brute force / abuse) ---------- */
const buckets = new Map(); // key -> { count, reset }
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.reset) { b = { count: 0, reset: now + windowMs }; buckets.set(key, b); }
  b.count += 1;
  return b.count <= max;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k);
}, 60000).unref();

/* constant-time admin key comparison */
function keyMatches(candidate) {
  const a = Buffer.from(String(candidate || ''));
  const b = Buffer.from(ADMIN_KEY);
  if (a.length !== b.length) {
    // still burn comparable time before rejecting
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

/* image magic bytes — extension and data-URL label are attacker-controlled */
function looksLikeImage(buf, ext) {
  if (buf.length < 12) return false;
  if (ext === 'jpg') return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
  if (ext === 'png') return buf.readUInt32BE(0) === 0x89504E47;
  if (ext === 'webp') return buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

/* ---------- description seeds (used once when catalog.json is created) ---------- */
const DESC_TEMPLATES = {
  pashmina: [
    (n) => `${n} is hand-spun from the winter undercoat of the Changthangi goat and woven thread by thread on a wooden loom in Srinagar. Weeks on the loom; a lifetime in the wardrobe.`,
    (n) => `Feather-light and warmer than wool, ${n} is combed, spun and woven entirely by hand, then finished with a hand-rolled hem. GI-certified Kashmir pashmina.`,
    (n) => `Spun on the yinder wheel to a fineness no machine can match, ${n} carries the quiet lustre that only hand-spun cashmere holds.`,
    (n) => `${n} is dyed in small batches with natural pigments and woven on a handloom that has served three generations. No two pieces fall exactly alike.`,
  ],
  kaani: [
    (n) => `${n} is woven twig by twig with wooden kani bobbins, following a coded talim chart read aloud at the loom. Months of work live in every border.`,
    (n) => `A true Kanihama kaani: ${n} grows a few centimetres a day as the weaver counts warp threads against the talim. Collected as heirloom, worn as art.`,
    (n) => `${n} carries garden motifs that have travelled the Silk Road for five centuries — woven, never printed, on a handloom in the saffron villages.`,
    (n) => `Reversible and hand-finished, ${n} is the haute couture of the loom — each colour change tied by hand with a wooden twig.`,
  ],
  walnut: [
    (n) => `${n} is chiselled from seasoned Kashmiri walnut — a wood that grows for a hundred years before it is ever carved. Finished with natural wax, never lacquer.`,
    (n) => `Deep-relief chinar leaves and vines cover ${n}, carved freehand with chisels the artisan forged himself. The undercutting alone takes days.`,
    (n) => `${n} is carved from a single block of walnut, its grain chosen at the timber yard by the carver who will spend weeks inside it.`,
    (n) => `Every surface of ${n} is worked by hand in the pinjrakari tradition — no router, no template, only chisel, mallet and memory.`,
  ],
  papier: [
    (n) => `${n} begins as sakhta — paper pulp shaped and dried — then painted in naqashi style with a squirrel-hair brush and sealed in lacquer.`,
    (n) => `Painted freehand over weeks, ${n} carries thousands of brush strokes and a finish of real gold leaf where the light catches.`,
    (n) => `${n} is built up from pulp, polished with a burnishing stone, and painted with pigments ground by hand in the old city of Srinagar.`,
    (n) => `A miniature of patience: ${n} passes through five pairs of hands — moulder, smoother, painter, gilder, lacquerer — before it is done.`,
  ],
  carpet: [
    (n) => `${n} is knotted one thread at a time in the kal baffi tradition, following a talim chart sung out loud. Years of work, made to outlive us.`,
    (n) => `Hand-knotted in silk and wool, ${n} holds hundreds of knots in every square inch — each one tied, cut and combed by hand.`,
    (n) => `${n} descends from the Persian looms that came to the valley in the 15th century. The pattern is inherited; the hands are new.`,
    (n) => `Washed in spring water and sun-dried on river stones, ${n} leaves the loom only after every knot has been inspected twice.`,
  ],
  crewel: [
    (n) => `${n} is embroidered with a hooked aari needle, wool chasing cotton in the flowing chain stitch Kashmir is famous for.`,
    (n) => `Every bloom on ${n} is stitched freehand — the drawing lives in the embroiderer's hand, not on the cloth.`,
    (n) => `${n} is worked in hand-dyed wool on hand-loomed cotton, hooked stitch by stitch in a rhythm passed mother to daughter.`,
    (n) => `Dense, folk-bright and entirely hand-stitched, ${n} carries the meadows of the valley indoors.`,
  ],
};

/* ---------- tiny persistence layer ---------- */
function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function seedCatalog() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'products.js'), 'utf8');
  const ctx = vm.createContext({});
  vm.runInContext(`${src}\n;__result = { CATALOG };`, ctx);
  const catalog = JSON.parse(JSON.stringify(ctx.__result.CATALOG));
  Object.entries(catalog).forEach(([key, c]) => {
    const pool = DESC_TEMPLATES[key] || DESC_TEMPLATES.pashmina;
    c.items.forEach((it, i) => { it.desc = pool[i % pool.length](it.name); });
  });
  return catalog;
}

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}

// Writes to the same file are chained so they land in call order and never
// share a temp path. The value is serialized at call time, so each write
// persists the state as it was when that mutation happened.
const writeQueues = new Map();
function writeJSON(file, value) {
  const data = JSON.stringify(value, null, 2);
  const run = async () => {
    const tmp = `${file}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    await fsp.writeFile(tmp, data);
    await fsp.rename(tmp, file);
  };
  const next = (writeQueues.get(file) || Promise.resolve()).catch(() => {}).then(run);
  writeQueues.set(file, next);
  return next;
}

// time-ordered and collision-free even for requests in the same millisecond
const uid = () => `${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;

ensureDirs();
let catalog = readJSON(CATALOG_FILE, null);
if (!catalog) {
  catalog = seedCatalog();
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2));
  console.log('Seeded data/catalog.json with', Object.keys(catalog).length, 'categories');
}
// held in memory like the catalog: a read-modify-write from disk per request
// would let two simultaneous checkouts overwrite each other
const orders = readJSON(ORDERS_FILE, []);
const subscribers = readJSON(SUBS_FILE, []);

const findItem = (id) => {
  for (const [key, c] of Object.entries(catalog)) {
    const idx = c.items.findIndex((it) => it.id === id);
    if (idx !== -1) return { cat: key, idx, item: c.items[idx] };
  }
  return null;
};

/* ---------- helpers ---------- */
function send(res, status, body, headers = {}) {
  const data = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...SEC_HEADERS, ...headers });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch (e) { reject(new Error('invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const isAdmin = (req) => keyMatches(req.headers['x-admin-key']);
const clientIp = (req) => req.socket.remoteAddress || 'unknown';

function sanitizeItemFields(body) {
  const out = {};
  if (typeof body.name === 'string' && body.name.trim()) out.name = body.name.trim().slice(0, 120);
  if (typeof body.maker === 'string') out.maker = body.maker.trim().slice(0, 120);
  if (typeof body.badge === 'string') out.badge = body.badge.trim().slice(0, 40);
  if (typeof body.desc === 'string') out.desc = body.desc.trim().slice(0, 2000);
  if (typeof body.alt === 'string') out.alt = body.alt.trim().slice(0, 300);
  if (body.price !== undefined) {
    const p = Math.round(Number(body.price));
    if (Number.isFinite(p) && p >= 0 && p <= 100000000) out.price = p;
  }
  if (typeof body.img === 'string') {
    const img = body.img.trim();
    // only local image paths, no protocol/traversal tricks
    if (/^images\/[\w./-]+$/.test(img) && !img.includes('..')) { out.img = img; out.motif = null; }
  }
  if (body.img === null) out.img = null;
  if (typeof body.motif === 'string' && ['paisley', 'vineBloom', 'chinarLeaf', 'boxRosette', 'medallion', 'latticeJali'].includes(body.motif)) {
    out.motif = body.motif; out.img = null;
  }
  return out;
}

/* ---------- API routing ---------- */
async function handleApi(req, res, url) {
  const route = `${req.method} ${url.pathname}`;
  const ip = clientIp(req);

  // general API abuse ceiling
  if (!rateLimit(`api:${ip}`, 300, 60000)) return send(res, 429, { error: 'too many requests' });

  if (route === 'GET /api/catalog') return send(res, 200, { catalog });

  if (route === 'POST /api/login') {
    // brute-force guard: 10 attempts per 10 minutes per IP
    if (!rateLimit(`login:${ip}`, 10, 600000)) return send(res, 429, { error: 'too many attempts — try later' });
    const body = await readBody(req);
    const ok = keyMatches(body.key);
    return send(res, ok ? 200 : 401, { ok });
  }

  if (route === 'POST /api/subscribe') {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { error: 'invalid email' });
    if (!subscribers.some((s) => s.email === email)) {
      subscribers.push({ email, at: new Date().toISOString() });
      await writeJSON(SUBS_FILE, subscribers);
    }
    return send(res, 200, { ok: true });
  }

  if (route === 'POST /api/orders') {
    const body = await readBody(req);
    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 200);
    const address = String(body.address || '').trim().slice(0, 600);
    const items = Array.isArray(body.items) ? body.items : [];
    if (!name || !address || !items.length) return send(res, 400, { error: 'missing fields' });
    const lines = [];
    let total = 0;
    for (const it of items) {
      const found = findItem(String(it.id));
      const qty = Math.min(Math.max(1, Math.round(Number(it.qty) || 1)), 99);
      if (!found) continue;
      lines.push({ id: found.item.id, name: found.item.name, qty, price: found.item.price });
      total += found.item.price * qty;
    }
    if (!lines.length) return send(res, 400, { error: 'no valid items' });
    const order = {
      id: `CC-${uid().toUpperCase()}`,
      at: new Date().toISOString(),
      name, email, address, lines, total,
    };
    orders.push(order);
    await writeJSON(ORDERS_FILE, orders);
    return send(res, 200, { ok: true, orderId: order.id, total });
  }

  /* ----- admin-only below ----- */
  if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });

  if (route === 'GET /api/orders') return send(res, 200, { orders });
  if (route === 'GET /api/subscribers') return send(res, 200, { subscribers });

  if (route === 'POST /api/products') {
    const body = await readBody(req);
    const cat = String(body.cat || '');
    if (!catalog[cat]) return send(res, 400, { error: 'unknown category' });
    const fields = sanitizeItemFields(body);
    if (!fields.name) return send(res, 400, { error: 'name required' });
    const item = {
      id: `${cat}-${uid()}`,
      cat,
      name: fields.name,
      maker: fields.maker || 'Atelier of Ghulam Nabi',
      badge: fields.badge || 'Handmade',
      price: fields.price ?? 0,
      img: fields.img ?? null,
      alt: fields.alt || fields.name,
      motif: fields.img ? null : (fields.motif || 'paisley'),
      desc: fields.desc || '',
    };
    catalog[cat].items.push(item);
    await writeJSON(CATALOG_FILE, catalog);
    return send(res, 200, { ok: true, item });
  }

  const productMatch = url.pathname.match(/^\/api\/products\/([\w-]+)$/);
  if (productMatch && (req.method === 'PUT' || req.method === 'DELETE')) {
    const found = findItem(productMatch[1]);
    if (!found) return send(res, 404, { error: 'not found' });
    if (req.method === 'DELETE') {
      catalog[found.cat].items.splice(found.idx, 1);
      await writeJSON(CATALOG_FILE, catalog);
      return send(res, 200, { ok: true });
    }
    const body = await readBody(req);
    Object.assign(found.item, sanitizeItemFields(body));
    if (found.item.img) found.item.motif = null;
    await writeJSON(CATALOG_FILE, catalog);
    return send(res, 200, { ok: true, item: found.item });
  }

  if (route === 'POST /api/upload') {
    const body = await readBody(req);
    const raw = String(body.data || '');
    const m = raw.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
    if (!m) return send(res, 400, { error: 'expected data URL (jpeg/png/webp)' });
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 8 * 1024 * 1024) return send(res, 400, { error: 'image too large (8MB max)' });
    if (!looksLikeImage(buf, ext)) return send(res, 400, { error: 'file content is not a valid image' });
    const base = String(body.filename || 'photo').replace(/\.[^.]*$/, '').replace(/[^\w-]+/g, '-').slice(0, 40) || 'photo';
    const file = `${uid()}-${base}.${ext}`;
    await fsp.writeFile(path.join(UPLOAD_DIR, file), buf);
    return send(res, 200, { ok: true, path: `images/uploads/${file}` });
  }

  return send(res, 404, { error: 'unknown endpoint' });
}

/* ---------- static files ---------- */
function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/admin' || pathname === '/admin/') pathname = '/admin.html';
  if (pathname.includes('\0')) return send(res, 400, { error: 'bad request' });
  const filePath = path.normalize(path.join(ROOT, pathname));
  // no traversal, no private files, no dotfiles
  if (!filePath.startsWith(ROOT + path.sep) ||
      filePath.startsWith(DATA_DIR) ||
      filePath.startsWith(CERTS_DIR) ||
      path.basename(filePath) === 'server.js' ||
      filePath.split(path.sep).some((seg) => seg.startsWith('.'))) {
    return send(res, 403, { error: 'forbidden' });
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, { error: 'not found' });
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      ...SEC_HEADERS,
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const handler = async (req, res) => {
  // encrypted connections advertise HSTS so browsers pin HTTPS
  if (req.socket.encrypted) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'method not allowed' });
    return serveStatic(req, res, url);
  } catch (e) {
    return send(res, e.message === 'body too large' ? 413 : 400, { error: e.message });
  }
};

http.createServer(handler).listen(PORT, () => {
  console.log(`Crafts of Cashmere running at http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin (key: ${ADMIN_KEY === 'cashmere-admin' ? 'cashmere-admin — set ADMIN_KEY env to change' : 'from ADMIN_KEY env'})`);
});

/* ---------- optional TLS listener (encryption in transit) ----------
   Drop a key/cert at certs/server.key + certs/server.crt (or point
   HTTPS_KEY / HTTPS_CERT env vars at them) and an HTTPS listener
   starts alongside HTTP. In production, prefer a TLS reverse proxy
   (Caddy, nginx, Cloudflare) with a CA-issued certificate. */
const KEY_FILE = process.env.HTTPS_KEY || path.join(CERTS_DIR, 'server.key');
const CRT_FILE = process.env.HTTPS_CERT || path.join(CERTS_DIR, 'server.crt');
if (fs.existsSync(KEY_FILE) && fs.existsSync(CRT_FILE)) {
  const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 4174;
  https.createServer({ key: fs.readFileSync(KEY_FILE), cert: fs.readFileSync(CRT_FILE) }, handler)
    .listen(HTTPS_PORT, () => console.log(`TLS: https://localhost:${HTTPS_PORT} (self-signed certs trigger a browser warning — expected locally)`));
}
