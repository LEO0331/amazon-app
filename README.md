# Amazon App (SQLite + Vite)

[![CI and Deploy](https://github.com/LEO0331/amazon-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/LEO0331/amazon-app/actions/workflows/deploy.yml)
[![Frontend](https://img.shields.io/badge/frontend-Vite-646CFF?logo=vite&logoColor=fff)](./frontend)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20SQLite-000000?logo=sqlite&logoColor=fff)](./backend)

Amazon-style ecommerce application with a modernized architecture:
- Backend on Express + Turso/libSQL (SQLite protocol)
- Frontend on React + Redux + Vite
- Cookie-based auth with CSRF protection
- Async support inbox API (replacing websocket chat)
- Vercel-ready backend + GitHub Pages frontend flow

## What Changed

- Replaced Mongo/Mongoose runtime with SQLite-compatible data layer (`@libsql/client`)
- Added SQL schema initialization and indexed query paths for products/orders/support
- Added deterministic Faker seeding (500 products by default)
- Migrated frontend from CRA to Vite
- Added centralized API client with `withCredentials` + automatic CSRF header
- Reworked support feature to async thread/message polling APIs
- Added CI/CD workflow for test/build + GitHub Pages deploy + optional Vercel deploy

## Tech Stack

- Backend: Node.js, Express, libSQL client, bcryptjs, jsonwebtoken
- Frontend: React 17, Redux, React Router v5, Axios, Vite
- Data: Turso/libSQL (or local sqlite file URL)
- Deploy: GitHub Pages (frontend), Vercel (backend)

## Environment Variables

Copy `.env.example` to `.env`.

Required:
- `JWT_SECRET`
- `DATABASE_URL`

Recommended:
- `DATABASE_AUTH_TOKEN`
- `FRONTEND_ORIGINS`

Frontend build/runtime:
- `VITE_API_BASE_URL` (set in GitHub Actions secrets for production)
- `VITE_BASE_PATH` (usually `/`)

## Local Development

Install dependencies:

```bash
npm install
npm install --prefix frontend
```

Run backend:

```bash
npm run backend:start
```

Run frontend:

```bash
npm run frontend:dev
```

## Seed Demo Data

Seed users + 500 products + baseline orders:

- Legacy dev endpoint: `GET /api/users/seed`
- Admin-protected endpoint: `POST /api/seed` (cookie auth required)

Default accounts after seed:
- `admin@gmail.com` / `1234`
- `seller@gmail.com` / `1234`
- `user@gmail.com` / `1234`

## Tests and Build

Run tests:

```bash
npm test
```

Build frontend:

```bash
npm run build
```

## CI/CD (GitHub Actions)

Workflow file: `.github/workflows/deploy.yml`

On push/PR to `master`:
1. Install dependencies
2. Run backend tests
3. Build frontend

On push to `master`:
1. Deploy `frontend/dist` to GitHub Pages
2. Deploy backend to Vercel (if `VERCEL_TOKEN` is configured)

### Required GitHub Secrets

- `VITE_API_BASE_URL` (frontend API URL, e.g. your Vercel backend URL)
- `VERCEL_TOKEN` (optional, needed only for backend deploy job)

## API Coverage in Tests

Integration tests currently validate:
- `/api/users`: seed, signin, protected list
- `/api/products`: listing, detail, categories
- `/api/orders`: create, mine, pay, summary
- `/api/support`: thread creation, messaging, admin thread listing
- Security behavior: auth required + CSRF enforcement checks

## Deployment Topology

- Frontend: GitHub Pages static deployment from `frontend/dist`
- Backend: Vercel serverless route via `vercel.json` (`/api/*` -> `api/index.js`)
