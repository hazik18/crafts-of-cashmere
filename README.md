# Crafts of Cashmere

E-commerce site for handmade Kashmiri crafts — pashmina and kaani shawls,
walnut wood carving, papier-mâché, hand-knotted carpets and crewel embroidery —
with a Node backend and an admin panel for managing the catalog.

## Run

Requires Node.js 18+. There are no npm dependencies to install.

```bash
ADMIN_KEY='choose-a-long-random-key' node server.js
```

- Site: http://localhost:4173
- Admin panel: http://localhost:4173/admin (sign in with your `ADMIN_KEY`;
  it falls back to `cashmere-admin` when unset — never deploy with the default)

On first run the server seeds `data/catalog.json` with 120 pieces (six crafts ×
20). Admin edits, orders and newsletter signups are saved under `data/`, and
uploaded photos under `images/uploads/`. Both folders are git-ignored: they are
runtime data, and orders contain customer details.

Serving the folder with a plain static server still shows the storefront, but
checkout, newsletter signup and the admin panel need `server.js`.

## Pages

| Page | Contents |
|---|---|
| `index.html` | Home: hero, collections, authenticity statement, newsletter |
| `shop.html` | Tabbed catalog; `shop.html?cat=carpet` opens a craft directly |
| `craft.html` | The making process, Dal Lake interlude, atelier story |
| `admin.html` | Catalog editing with photo upload, orders, subscribers |

## Structure

```
server.js          HTTP server, JSON API, uploads, security headers, optional TLS
js/products.js     fallback catalog generator and SVG motif artwork
js/main.js         storefront: nav, cart, checkout, shop tabs, animations
js/admin.js        admin panel
css/style.css      storefront design system
css/admin.css      admin panel styles
images/            photography (Unsplash, free license)
```

`js/three-scene.js` is an unused earlier 3D hero, kept for reference.

## HTTPS

Put `server.key` and `server.crt` in `certs/` (or set `HTTPS_KEY` /
`HTTPS_CERT`) and an HTTPS listener starts on port 4174. For production, put
the app behind a reverse proxy with a CA-issued certificate instead — see
[SECURITY.md](SECURITY.md).

## Further reading

- [SECURITY.md](SECURITY.md) — threat model, protections, production checklist
- [BUSINESS-PLAN.md](BUSINESS-PLAN.md) — hosting, payments and go-to-market plan
