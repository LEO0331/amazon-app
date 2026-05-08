# System Design Review (English)

Date: 2026-05-08
Scope: `frontend/` + `backend/` + deployment pipeline

## 1. Executive Summary

This system is a pragmatic full-stack ecommerce platform with:

- Frontend: React 17 + Redux + React Router v5 + Vite
- Backend: Express API with cookie-based JWT auth + CSRF protection
- Data: libSQL/SQLite with relational tables and selective JSON columns
- Deployment: GitHub Pages (frontend) + Vercel (backend)

The design optimizes for implementation speed, low operational complexity, and clear ownership boundaries. It intentionally accepts some scalability and modeling tradeoffs (notably JSON columns for order items/reviews, Redux boilerplate, and polling-based support chat).

## 2. Architecture Review

### 2.1 Runtime Architecture

- Client layer:
  - Route shell in `frontend/src/App.js`
  - Redux state + async actions (`actions/*` + `reducers/*`)
  - API integration in `frontend/src/apiClient.js` (credentials + CSRF header injection)
- API layer:
  - Express app composition in `backend/app.js`
  - Domain routers: users, products, orders, support, upload, seed
  - Cross-cutting middleware: Helmet, CORS allowlist, cookie parsing, rate limiting, CSRF
- Persistence layer:
  - libSQL client in `backend/db/client.js`
  - Schema and indexes in `backend/db/schema.js`
  - Row-to-DTO mapping in `backend/db/mappers.js`
- Delivery layer:
  - CI/CD in `.github/workflows/deploy.yml`
  - Frontend static hosting (Pages) + backend serverless route shim (`api/index.js` / `vercel.json`)

### 2.2 Strengths

- Security baseline is stronger than typical demo ecommerce apps:
  - HTTP-only auth cookie + CSRF token + strict CORS + rate limits
- Clear domain boundaries with router-per-domain design
- Deterministic seeding workflow enables predictable QA and demos
- Index coverage is aligned with dominant query paths (category/seller/price/rating/time)
- Manual Vite chunking reduces first-load bundle risk compared to single bundle output

### 2.3 Tradeoffs and Constraints

- SQLite/libSQL favors operational simplicity over high write concurrency
- JSON-in-relational columns reduce join complexity but weaken queryability for nested fields
- Redux classic pattern is explicit but verbose compared with RTK/RTK Query
- Support inbox polling model is simple but less real-time and less efficient than websocket/SSE
- Hash-based routing compatibility is good for static hosting, but URL semantics and SEO are weaker than SSR/clean URLs

## 3. Data Structure Choices: Why and Alternatives

### 3.1 Storage/Data Modeling

| Choice in current system | Why chosen | Alternative | Tradeoff vs alternative |
|---|---|---|---|
| Relational tables (`users`, `products`, `orders`, `support_threads`, `support_messages`) | Strong integrity, easy SQL aggregation, simple hosting with libSQL | Document DB (MongoDB) | Relational schema gives stronger consistency and easier analytics; document DB gives flexible nested writes and horizontal patterns |
| UUID string primary keys (`TEXT`) | Safe distributed ID generation without DB sequence coordination | Auto-increment integer IDs | UUID avoids ID collisions across distributed writes, but consumes more storage and is less human-readable |
| `order_items_json` as JSON text in `orders` | Captures snapshot of purchased items at order-time; avoids heavy join graph | `order_items` normalized child table | JSON snapshot simplifies writes and historical accuracy; child table improves queryability and indexing |
| `reviews_json` on `products` | Easy read/write for product detail response | Separate `reviews` table | JSON is fast to ship as a single payload; separate table scales better for moderation/search/analytics |
| `shipping_address_json` and `payment_result_json` | Schema flexibility for provider payload variation | Strict normalized address/payment tables | JSON reduces migration overhead; normalized design improves validation/query/reporting |

### 3.2 In-Memory Structures (Backend)

| Choice in current system | Why chosen | Alternative | Tradeoff vs alternative |
|---|---|---|---|
| `Set` for `allowedOrigins` in CORS | O(1) membership checks and deduplication | Array includes lookup | `Set` is clearer and faster under repeated checks |
| `Set` for `sellerIds` validation in order creation | Fast uniqueness check for mixed-seller rejection | Object-map or repeated loop compare | `Set` is minimal and readable for uniqueness constraints |
| `Map` for `productById` and `usersById` hydration | O(1) joins in app layer and cleaner mapping | Nested loops / array find per row | `Map` avoids accidental O(n^2) behavior on large lists |

### 3.3 Frontend State Structures

| Choice in current system | Why chosen | Alternative | Tradeoff vs alternative |
|---|---|---|---|
| Redux split reducers by domain and operation | Explicit state transitions, predictable async lifecycle | React Query / RTK Query | Current approach is explicit but boilerplate-heavy; query libraries reduce boilerplate and improve caching |
| `cartItems` persisted in `localStorage` as JSON array | Survives refresh and offline browsing | Server-side cart/session cart only | Local persistence is fast and user-friendly; server cart improves cross-device continuity |
| API client interceptor caches CSRF token + cookie fallback | Centralized mutating-request policy | Pass CSRF token manually per action | Interceptor reduces human error and improves consistency |

## 4. Architecture Decisions and Tradeoff Narratives

### Decision A: Cookie JWT + CSRF vs Bearer Token in localStorage

- Current design benefits:
  - Better XSS resistance for auth token extraction (`httpOnly`)
  - Standardized server-managed session behavior
- Cost:
  - Requires CSRF lifecycle and same-site/cross-site cookie tuning
- Alternative:
  - Bearer JWT in memory/localStorage with refresh token strategy
- Why current is reasonable:
  - For this app scale, cookie + CSRF yields safer defaults with manageable complexity

### Decision B: libSQL/SQLite vs managed Postgres

- Current design benefits:
  - Lower operational burden, low cost, fast local/dev setup
  - Good enough for moderate traffic and clear SQL semantics
- Cost:
  - Limited write concurrency and fewer advanced analytical features
- Alternative:
  - Postgres (managed cloud)
- Migration trigger:
  - Sustained write contention, more complex reporting, stronger transaction needs

### Decision C: Polling support inbox vs WebSocket/SSE

- Current design benefits:
  - Simpler implementation and deployment model
  - Easier failure behavior and retry semantics
- Cost:
  - Latency and redundant network calls
- Alternative:
  - WebSocket (bidirectional real-time), SSE (server push)
- Migration trigger:
  - Need near-real-time support response and cost pressure from polling traffic

## 5. Deep-Dive Question Bank (with short answer guidance)

### 5.1 Architecture

1. Why keep `order_items` as JSON snapshot instead of normalized order lines?
- Suggested answer: preserves historical product snapshot integrity and simplifies response assembly; if analytics or per-line querying grows, move to child table with indexed foreign keys.

2. Why support single-seller cart only?
- Suggested answer: simplifies shipping/payment split and seller settlement logic; multi-seller cart requires order splitting and partial payment/dispute workflows.

3. Why route-per-domain routers in Express?
- Suggested answer: keeps authorization/business policies localized and testable; prevents controller monolith.

### 5.2 Security

4. Why both auth cookie and CSRF token?
- Suggested answer: cookie is automatic on browser requests; CSRF token proves intent for state-changing operations.

5. Why rate limit auth endpoints separately?
- Suggested answer: signin/register are brute-force hotspots; tighter threshold lowers account stuffing risk.

6. How is CORS enforced?
- Suggested answer: dynamic allowlist from env + credentials enabled, with explicit reject path for unknown origins.

### 5.3 Data

7. How are N+1 issues reduced in list endpoints?
- Suggested answer: batch-fetch related users/products and hydrate with `Map` lookups.

8. Why index on category/seller/price/rating/created_at?
- Suggested answer: these match dominant filter/sort paths in product listing and admin summary views.

9. What is consistency behavior for order seller derivation?
- Suggested answer: seller ID is derived from DB product rows at order creation, not trusted from client payload.

### 5.4 Frontend

10. Why Redux over local component state?
- Suggested answer: cross-screen cart/auth/order state requires predictable centralized transitions and persistence.

11. Why store `userInfo` and cart data in localStorage?
- Suggested answer: improves UX across refresh; server remains source of truth for protected operations.

12. Why hash routing?
- Suggested answer: static hosting compatibility on GitHub Pages without custom server rewrites.

## 6. Potential Evolution Paths

### 6.1 If traffic grows

- Migrate to managed Postgres
- Normalize `order_items` and `reviews`
- Add read-model endpoints for analytics

### 6.2 If support/chat becomes core

- Upgrade from polling to websocket/SSE
- Add message status and unread counters
- Introduce moderation/audit pipeline

### 6.3 If frontend complexity grows

- Move to Redux Toolkit + RTK Query
- Add shared typed API contract layer
- Add route-level data prefetch and cache policies

## 7. Interview / Deep-Dive Readiness Checklist

Use this as prep before architecture discussion:

- Explain why JSON columns were acceptable at current scale
- Explain concrete trigger conditions for normalization migration
- Explain CSRF + cookie model and failure paths
- Explain single-seller order constraint and what changes for multi-seller support
- Explain index strategy tied to product search and order summary workloads
- Explain why Vite chunking strategy was chosen and when to revise it

