# Security posture — Crafts of Cashmere

Last audited: July 2026. This is a demo-grade local application hardened against
the attack classes that actually apply to it. Read the **production checklist**
before exposing it to the internet.

## What is protected, and against what

| Attack class (OWASP 2025) | Mitigation in this codebase |
|---|---|
| Broken access control | All write endpoints require the `X-Admin-Key` header, compared in constant time (`crypto.timingSafeEqual`). Static server refuses `/data`, `/certs`, `server.js`, dotfiles, null bytes and path traversal. |
| Security misconfiguration | Every response carries `Content-Security-Policy` (scripts only from self + jsdelivr, no inline scripts, no framing), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. |
| Injection / stored XSS | All admin-entered text is HTML-escaped at every `innerHTML` sink on both the storefront (`js/main.js`) and admin panel (`js/admin.js`). Server-side field sanitization caps lengths, whitelists image paths (`images/…` only) and motif names. Prices/totals are recomputed server-side. |
| Cryptographic failures | Optional TLS listener (see below); HSTS sent on encrypted connections. No passwords are stored; no cookies are used. |
| Software supply chain | The server has **zero npm dependencies**. The three CDN scripts (GSAP, ScrollTrigger, Lenis) are pinned with Subresource Integrity hashes — a tampered CDN file will refuse to load. |
| Brute force / abuse | `/api/login` limited to 10 attempts / 10 min / IP; all API routes capped at 300 req/min/IP; JSON bodies capped at 10 MB. |
| Malicious uploads | Uploads must be JPEG/PNG/WebP data-URLs ≤ 8 MB **and** pass magic-byte inspection; filenames are sanitized and regenerated. |
| CSRF | No cookies/session ambient authority; admin calls need a custom header, which cross-origin pages cannot send (no CORS is enabled). |

## Encryption (TLS)

- **Local**: `certs/server.key` + `certs/server.crt` (self-signed) enable
  https://localhost:4174 automatically. Browsers warn on self-signed certs —
  that is expected and still encrypts the connection.
- **Production**: do NOT ship the self-signed cert. Put the app behind a TLS
  reverse proxy with a CA-issued certificate (Caddy gives you Let's Encrypt
  automatically), or set `HTTPS_KEY`/`HTTPS_CERT` to real cert files.

## Production checklist (do these before going public)

1. `export ADMIN_KEY='<long random string>'` — never run with the default key.
2. Serve exclusively over HTTPS (reverse proxy or real certs); redirect HTTP.
3. Back up `data/*.json` (catalog, orders, subscribers) — they are the database.
4. Keep `certs/` and `data/` out of any git repository (`.gitignore`).
5. Consider moving admin to a separate origin or IP-allowlisting it.
6. Orders/subscribers contain personal data — apply your local privacy rules.

## Known, accepted limitations (demo scope)

- Single shared admin key (no user accounts, roles, or audit log).
- JSON-file persistence — fine for one instance, not for concurrent writers.
- In-memory rate limits reset on restart and are per-process.
