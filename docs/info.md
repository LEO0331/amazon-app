# Amazon-App - AI Reference Document

This file is for AI assistants resuming work on this repository.
Read this together with `docs/flow.md` before implementing changes.
For workflow rules and guardrails, see `claude.md` at project root.

---

## Project Identity

- **Name**: Amazon-App
- **Type**: React/Redux ecommerce app with Express API
- **Purpose**: Product discovery, cart/checkout, order management, seller/admin operations, support inbox
- **Primary stack**:
  - Frontend: React 17, Redux, React Router v5, Vite
  - Backend: Express, `@libsql/client`, SQLite schema bootstrap
  - Infra: GitHub Pages (frontend), Vercel (backend)

---

## Problem Context

Current architecture goals:
- Handle larger catalog data reliably (SQLite + tuned queries and bounded pagination)
- Reduce latency (Vite build/dev flow, lazy-loaded routes, cache headers on selected endpoints)
- Improve security baseline (cookie auth, CSRF, strict CORS, Helmet, rate limiting)
- Keep demo-friendly setup (deterministic seed with Faker and admin seed endpoint)

---

## Runtime Layers

| Layer | Main Location | Responsibility |
|------|---------------|----------------|
| UI | `frontend/src/*` | routing, views, events, loading/error states |
| State/API | `frontend/src/actions/*`, `frontend/src/reducers/*` | async calls + state transitions |
| API | `backend/app.js`, `backend/routers/*` | auth, validation, business rules |
| Data | `backend/db/*`, `backend/services/seedService.js` | schema, mapping, SQL operations, seeding |

---

## Key Entry Points

- Frontend entry: `frontend/src/main.js`
- Frontend app shell/router: `frontend/src/App.js`
- Backend entry: `backend/server.js`
- Backend app/middleware wiring: `backend/app.js`

---

## API Surface (High-Value)

- `/api/auth/csrf-token`
- `/api/users/*`
- `/api/products/*`
- `/api/orders/*`
- `/api/support/*`
- `/api/seed` (admin + CSRF)
- `/api/config/paypal`
- `/health`, `/`

---

## Security Contract

- Auth: JWT in secure HTTP-only cookie.
- CSRF: token issued by `/api/auth/csrf-token`, required for mutations.
- CORS: origin allowlist from `FRONTEND_ORIGINS`.
- Headers: `helmet()` baseline hardening.
- Limits:
  - global limiter (`RATE_LIMIT_MAX`)
  - auth limiter (`AUTH_RATE_LIMIT_MAX`) on signin/register
- Authorization checks:
  - products update ownership for non-admin sellers
  - order detail/pay access checks
  - admin-only ops for user/order/admin views and seed controls

---

## Data / Seed Notes

- DB configured by `DATABASE_URL` (+ `DATABASE_AUTH_TOKEN` for Turso).
- Development bootstrap: `GET /api/users/seed` (disabled in production).
- Demo reseed: `POST /api/seed` as admin with CSRF, `count` in `1..1000` (default 500).
- Deterministic demo users:
  - `admin@gmail.com / 1234`
  - `seller@gmail.com / 1234`
  - `user@gmail.com / 1234`

---

## CI/CD

- Workflow: `.github/workflows/deploy.yml`
- Test/build on PR and push to `master`
- Frontend deploy: GitHub Pages (`frontend/dist`)
- Backend deploy: Vercel when `VERCEL_TOKEN` exists
- Build-time frontend runtime vars:
  - `VITE_API_BASE_URL`
  - `VITE_BASE_PATH` (for repo pages, e.g. `/amazon-app/`)

---

## Assistant Workflow

Before editing:
1. Read `claude.md`
2. Read `docs/flow.md` and this file
3. Confirm target layer (frontend/backend/docs/tests)

After editing:
1. Run targeted tests
2. Run coverage if relevant
3. Update docs when architecture/flow/contracts change
