# Amazon-App - AI Reference / AI 參考文件

For assistants resuming work on this repository.  
提供給接手本專案的 AI 助手。

Read this with `docs/flow.md` before making code changes.  
實作前請搭配 `docs/flow.md` 閱讀。

---

## Project Identity / 專案定位

- **Name / 名稱**: Amazon-App
- **Type / 類型**: React/Redux ecommerce app with Express API
- **Purpose / 目的**: product discovery, cart/checkout, order management, seller/admin ops, support inbox  
  商品瀏覽、購物結帳、訂單管理、賣家與管理者作業、客服收件匣
- **Primary stack / 主要技術棧**:
  - Frontend: React 17, Redux, React Router v5, Vite
  - Backend: Express, `@libsql/client`, SQLite/libSQL
  - Infra: GitHub Pages (frontend), Vercel (backend)

---

## Current Goals / 當前架構目標

- Handle larger product data with stable pagination/filtering.  
  提升大量商品資料下的分頁與篩選穩定性。
- Reduce latency through Vite tooling and efficient API paths.  
  透過 Vite 與 API 路徑優化降低延遲。
- Keep secure defaults: cookie auth + CSRF + strict CORS + rate limits.  
  維持安全預設：cookie 驗證、CSRF、嚴格 CORS、rate limits。
- Support demo mode via deterministic seeding.  
  透過可重現資料種子支援展示環境。

---

## Runtime Layers / 執行層級

| Layer | Main Location | Responsibility |
|------|---------------|----------------|
| UI | `frontend/src/*` | routing, views, events, loading/error |
| State/API | `frontend/src/actions/*`, `frontend/src/reducers/*` | async dispatch and state transitions |
| API | `backend/app.js`, `backend/routers/*` | auth, validation, business rules |
| Data | `backend/db/*`, `backend/services/seedService.js` | schema, SQL access, seed pipeline |

---

## Key Entrypoints / 主要進入點

- Frontend entry: `frontend/src/main.js`
- Frontend app shell: `frontend/src/App.js`
- Backend entry: `backend/server.js`
- Backend middleware/router assembly: `backend/app.js`

---

## API Surface / 主要 API 範圍

- `/api/auth/csrf-token`
- `/api/users/*`
- `/api/products/*`
- `/api/orders/*`
- `/api/support/*`
- `/api/seed` (admin + csrf)
- `/api/config/paypal`
- `/health`, `/`

---

## Security Contract / 安全契約

- Auth: JWT in secure HTTP-only cookie.  
  使用安全 HTTP-only cookie 儲存 JWT。
- CSRF: required for mutating requests.  
  修改型請求必須帶 CSRF token。
- CORS: enforced by allowlist (`FRONTEND_ORIGINS`).  
  以白名單方式限制跨網域來源。
- Security headers: Helmet baseline.  
  以 Helmet 提供基礎安全標頭。
- Rate limiting:
  - Global limiter: `RATE_LIMIT_MAX`
  - Auth limiter: `AUTH_RATE_LIMIT_MAX` on signin/register
- Authorization:
  - product update ownership checks for sellers
  - order access checks (owner/admin/seller as defined)
  - admin-only controls for user/order summary/seed paths

---

## Data and Seeding / 資料與種子

- DB config:
  - `DATABASE_URL` (required)
  - `DATABASE_AUTH_TOKEN` (for Turso, if required)
- Development bootstrap:
  - `GET /api/users/seed` (disabled in production)
- Demo reseed:
  - `POST /api/seed` as admin with CSRF
  - `count` range: `1..1000` (default 500)
- Demo accounts:
  - `admin@gmail.com / 1234`
  - `seller@gmail.com / 1234`
  - `user@gmail.com / 1234`

---

## CI/CD / 持續整合與部署

- Workflow: `.github/workflows/deploy.yml`
- Runs test/build on PR and push to `master`.
- Frontend deploys to GitHub Pages (`frontend/dist`).
- Backend deploys to Vercel when `VERCEL_TOKEN` exists.
- Frontend build-time env:
  - `VITE_API_BASE_URL`
  - `VITE_BASE_PATH` (e.g. `/amazon-app/`)

---

## Assistant Workflow / 助手工作流程

Before editing / 修改前:
1. Read `claude.md`.
2. Read `docs/flow.md` and this file.
3. Confirm target layer and affected contracts.

After editing / 修改後:
1. Run targeted tests.
2. Run coverage for touched modules.
3. Update docs when architecture/flow/contracts changed.
