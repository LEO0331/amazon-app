# ECommerce Website (SQLite + Vite)

This project is an Amazon-style ecommerce app with:
- Backend: Express + Turso/libSQL (SQLite protocol)
- Frontend: React + Redux + Vite
- Security: HTTP-only auth cookies, CSRF token checks, strict CORS
- Support: Async support inbox (no websocket dependency)

## Prerequisites

- Node.js 20+
- A Turso/libSQL database (or local sqlite URL: `file:./dev.db`)

## Environment

Copy `.env.example` to `.env` and set values.

Required:
- `JWT_SECRET`
- `DATABASE_URL`

## Install

```bash
npm install
cd frontend && npm install
```

## Run Locally

Backend:
```bash
npm run backend:start
```

Frontend (Vite):
```bash
cd frontend
npm run dev
```

## Seed Demo Data

1. Sign in as admin (`admin@gmail.com` / `1234`) after initial user seed endpoint is run.
2. Call `POST /api/seed` with admin auth to generate demo data (500 products by default).

## Tests

```bash
npm test
```

## Build Frontend

```bash
cd frontend
npm run build
```

## Deployment

- Backend: Vercel (`vercel.json` routes `/api/*` to `api/index.js`)
- Frontend: GitHub Pages (set `VITE_BASE_PATH` and `VITE_API_BASE_URL` in frontend env)
