# Cloudflare Configuration — redditch.pixelabs.net

Redditch is a fully static Next.js export hosted on GitHub Pages. Cloudflare sits in front as a CDN, TLS terminator, and cache layer. This document covers every setting that must be manually configured in the Cloudflare dashboard, plus the two secrets required by the deploy pipeline.

---

## 1. DNS

Navigate to **DNS > Records** and add:

| Type  | Name       | Target                          | Proxy status |
|-------|------------|---------------------------------|--------------|
| CNAME | `redditch` | `<github-org>.github.io`        | Proxied (orange cloud) |

Replace `<github-org>` with your actual GitHub username or organisation slug.

The CNAME must be **proxied** (orange cloud). Without proxying, Cloudflare provides no caching or TLS benefits.

GitHub Pages also requires the custom domain to be set in the repository settings under **Settings > Pages > Custom domain**.

---

## 2. SSL / TLS

Navigate to **SSL/TLS > Overview** and set encryption mode to **Full (strict)**.

- **Full** — encrypts traffic between Cloudflare and GitHub Pages (GitHub Pages serves over HTTPS).
- **Strict** — validates the origin certificate. GitHub Pages uses a Let's Encrypt cert that passes validation.
- Never use "Flexible" — it sends traffic to the origin in plain HTTP and creates a false sense of security.

### HSTS

Navigate to **SSL/TLS > Edge Certificates** and enable **HTTP Strict Transport Security (HSTS)**:

| Setting                      | Value    |
|------------------------------|----------|
| Max Age                      | 6 months (15768000 seconds) |
| Include subdomains           | No (unless you own all subdomains) |
| Preload                      | Yes (after testing — cannot be undone quickly) |
| No-Sniff header              | Yes |

Enable HSTS only after the site is confirmed stable on HTTPS. HSTS preload is permanent at the browser level for the max-age duration.

---

## 3. Cache Rules

Navigate to **Caching > Cache Rules** and create the following rules in order (rules are evaluated top-to-bottom; first match wins).

### Rule 1 — Immutable static assets (_next/static)

| Field        | Value                              |
|--------------|------------------------------------|
| Expression   | `http.request.uri.path contains "/_next/static/"` |
| Cache status | Cache everything                   |
| Edge TTL     | 1 year (override origin header)    |
| Browser TTL  | 1 year                             |

Next.js content-hashes all files under `_next/static/`. Cached for one year is safe — a changed file gets a new hash and therefore a new URL.

### Rule 2 — Generated icons and splash screens

| Field        | Value                              |
|--------------|------------------------------------|
| Expression   | `http.request.uri.path contains "/icons/" or http.request.uri.path contains "/splash/"` |
| Cache status | Cache everything                   |
| Edge TTL     | 1 year                             |
| Browser TTL  | 1 year                             |

Icon files only change when `generate-icons.ts` is re-run, which is rare. The deploy pipeline calls `purge_everything` on each deploy, so stale icons will never persist beyond a single release cycle.

### Rule 3 — HTML pages

| Field        | Value                              |
|--------------|------------------------------------|
| Expression   | `http.request.uri.path matches "^/$" or http.request.uri.path matches ".*/$" or http.request.uri.path matches ".*.html$"` |
| Cache status | Cache everything                   |
| Edge TTL     | 2 hours (override origin header)   |
| Browser TTL  | 0 (no browser caching for HTML)    |

Short TTL on HTML means users see updated content within two hours of a deploy even if the cache purge step in the pipeline is misconfigured. Browser TTL is zero so a hard refresh always fetches fresh HTML.

### Default cache behaviour

Cloudflare does not cache HTML by default. If no cache rule matches, GitHub Pages' `Cache-Control` headers apply (typically `max-age=600`).

---

## 4. Rocket Loader — MUST BE OFF

Navigate to **Speed > Optimization > Content Optimization** and confirm **Rocket Loader is OFF**.

Rocket Loader rewrites `<script>` tags in the HTML response to load them asynchronously. This breaks React/Next.js hydration because:

- It defers the Next.js bootstrap script past the point where React expects the DOM to match the server-rendered HTML.
- It can reorder script execution, causing `__NEXT_DATA__` to be unavailable when the hydration runtime initialises.
- With `output: 'export'`, Next.js ships pre-rendered static HTML and expects its scripts to execute in a specific order.

Symptoms of Rocket Loader being on: blank pages after navigation, React errors in the console (`Hydration failed`, `Expected server HTML to contain`), or JavaScript that simply never runs.

---

## 5. Speed Optimisations

Navigate to **Speed > Optimization** and apply these settings:

| Setting              | Value | Notes |
|----------------------|-------|-------|
| Brotli               | ON    | Better compression than gzip; supported by all modern browsers |
| HTTP/3 (with QUIC)   | ON    | Reduces latency on mobile; zero setup required |
| Auto Minify          | OFF   | Next.js already minifies HTML/CSS/JS during build; double-minification can corrupt output |
| Early Hints          | ON    | Allows Cloudflare to push `103 Early Hints` for `<link rel="preload">` headers; improves LCP |
| Mirage               | OFF   | Image optimisation for low-bandwidth; conflicts with Next.js static image handling |
| Polish               | OFF   | Cloudflare image recompression; not needed — Next.js handles image optimisation at build time |

---

## 6. GitHub Actions Secrets

Two repository secrets must be created under **Settings > Secrets and variables > Actions**:

| Secret name    | Description |
|----------------|-------------|
| `CF_ZONE_ID`   | The Zone ID for `pixelabs.net` (found in the Cloudflare dashboard right sidebar) |
| `CF_API_TOKEN` | A scoped API token with **Zone.Cache Purge** permission only |

The deploy pipeline checks `if: env.CF_ZONE_ID != '' && env.CF_API_TOKEN != ''` before calling the purge endpoint, so missing secrets cause the step to be skipped rather than failing the deployment.

### How to get the Zone ID

1. Log in to the Cloudflare dashboard.
2. Select the `pixelabs.net` zone.
3. Scroll to the bottom of the right-hand sidebar on the **Overview** tab.
4. Copy the **Zone ID** string.

### How to create a scoped API token

The token used by CI needs exactly one permission. A narrowly scoped token limits blast radius if the secret is ever exposed.

1. Go to **My Profile > API Tokens > Create Token**.
2. Select **Create Custom Token**.
3. Set the following:
   - Token name: `redditch-deploy-cache-purge`
   - Permissions: `Zone` / `Cache Purge` / `Edit`
   - Zone resources: `Include` / `Specific zone` / `pixelabs.net`
   - TTL: no expiry (or set a rotation reminder in your calendar)
4. Click **Continue to summary**, then **Create Token**.
5. Copy the token immediately — it is only shown once.
6. Add it as the `CF_API_TOKEN` repository secret.

### Rotating the token

When the token expires or is compromised:
1. Revoke the old token in **My Profile > API Tokens**.
2. Create a new token following the steps above.
3. Update the `CF_API_TOKEN` repository secret.
4. No code change or redeployment is required — the next push to `main` will use the new token automatically.

---

## 7. Page Rules (legacy — prefer Cache Rules)

If you are on a plan that does not support the newer Cache Rules UI, equivalent Page Rules are:

```
URL: redditch.pixelabs.net/_next/static/*
Cache Level: Cache Everything
Edge Cache TTL: a year

URL: redditch.pixelabs.net/icons/*
Cache Level: Cache Everything
Edge Cache TTL: a year

URL: redditch.pixelabs.net/*
Cache Level: Cache Everything
Edge Cache TTL: 2 hours
```

Page Rules are evaluated in order; create them top-to-bottom as listed above.

---

## 8. Health Check

After configuration:

1. Open `https://redditch.pixelabs.net` in a browser.
2. In DevTools > Network, confirm:
   - Response header `cf-cache-status: HIT` on a second load (or `MISS` then `HIT`).
   - Response header `server: cloudflare`.
   - TLS certificate issuer is Let's Encrypt (via GitHub Pages).
3. Run `curl -I https://redditch.pixelabs.net` and check for `strict-transport-security` header.
4. Confirm the Cloudflare cache purge step succeeds in the GitHub Actions deploy log (look for `"success": true` in the JSON response).
