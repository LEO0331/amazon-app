# Amazon App (Vite + SQLite on Turso)

[![CI and Deploy](https://github.com/LEO0331/amazon-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/LEO0331/amazon-app/actions/workflows/deploy.yml)
[![Frontend](https://img.shields.io/badge/frontend-Vite-646CFF?logo=vite&logoColor=fff)](./frontend)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20libSQL-0f172a?logo=sqlite&logoColor=fff)](./backend)

A polished Amazon-style ecommerce experience with a Vite frontend, cookie-based security, and a Turso/libSQL backend optimized for serverless deployment.

## Short GitHub Description

Modern Amazon-style ecommerce app with Vite frontend, Express + Turso/libSQL backend, cookie auth + CSRF security, and CI/CD to GitHub Pages + Vercel.

## Architecture

- Frontend: React 17, Redux, React Router v5, Vite
- Backend: Express, `@libsql/client`, SQL schema initialization, indexed query paths
- Security: HTTP-only auth cookies, CSRF token checks, strict CORS allowlist, Helmet, rate limiting
- Support: Async support inbox (threads + polling), no websocket dependency
- Deployment: GitHub Pages (frontend), Vercel (backend API)

## Removed / Cleaned Up

- Removed map/location flow and Google API key dependency
- Removed unused Mailgun email helpers
- Removed unused Stripe demo components
- Hardened auth to cookie-session only (no bearer token fallback)
- Restricted destructive dev seed route in production

## Environment Variables

Copy `.env.example` to `.env`.

Required:
- `JWT_SECRET`
- `DATABASE_URL`

Recommended:
- `DATABASE_AUTH_TOKEN`
- `FRONTEND_ORIGINS` (example: `https://leo0331.github.io,http://localhost:5173`)

Optional:
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_MAX`
- `PAYPAL_CLIENT_ID` (use `sb` for PayPal sandbox demo)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET` / `AWS_REGION` (only if enabling S3 upload)

GitHub Actions secrets:
- `VITE_API_BASE_URL` = your Vercel backend URL
- `VERCEL_TOKEN` = optional, needed for backend deploy job

## Payment Demo Setup

Current checkout demo uses **PayPal JS SDK** via `/api/config/paypal`.

For demo mode:
- Set `PAYPAL_CLIENT_ID=sb`
- Keep payment method as `PayPal` in checkout

For production-like testing:
- Create a PayPal developer app and replace `PAYPAL_CLIENT_ID`

## Local Development

```bash
npm install
npm install --prefix frontend
npm run backend:start
npm run frontend:dev
```

## Seed Demo Data

Bootstrap users + products:
- `GET /api/users/seed` (development only, disabled in production)

Full admin-protected seed (default 500 products):
- `POST /api/seed` with auth cookie + CSRF token (`count` must be `1..1000`)

Default seeded users:
- `admin@gmail.com` / `1234`
- `seller@gmail.com` / `1234`
- `user@gmail.com` / `1234`

## Tests and Coverage

Run all tests (backend + frontend):

```bash
npm test
```

What is covered now:
- Backend integration tests:
  - `/api/users`, `/api/products`, `/api/orders`, `/api/support`
  - auth-required route checks, CSRF enforcement, CORS allowlist behavior
  - pagination/filter validation, seed count bounds, cache header checks
- Frontend unit tests:
  - asset URL resolution for GitHub Pages base path
  - cart reducer behavior (add/update/remove/clear/address/payment)
  - user reducer flows (signin/register/profile update)
  - order reducer flows (create/details/summary)

Build frontend:

```bash
npm run build
```

## CI/CD

Workflow: `.github/workflows/deploy.yml`

On PR / push to `master`:
1. Install dependencies
2. Run tests
3. Build frontend

On push to `master`:
1. Deploy frontend to GitHub Pages
2. Deploy backend to Vercel (if `VERCEL_TOKEN` exists)
