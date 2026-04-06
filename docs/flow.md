# Amazon-App - Feature Flow

This document explains what happens in code when users click major UI actions.

---

## 1. Runtime Layers

```
┌──────────────────────────────┐
│ Frontend (React + Redux)     │
│ screens/*, actions/*         │
└──────────────┬───────────────┘
               │ axios/fetch with cookies + CSRF
┌──────────────▼───────────────┐
│ Backend (Express Routers)    │
│ /api/users/products/orders   │
└──────────────┬───────────────┘
               │ SQL via @libsql/client
┌──────────────▼───────────────┐
│ SQLite (Turso/libSQL schema) │
│ users/products/orders/support│
└──────────────────────────────┘
```

- UI layer: route rendering, form events, optimistic UI/loading/error states.
- API layer: auth/validation/security checks + business flow.
- DB layer: persistent data with indexed query paths.

---

## 2. Core Module Map

| File | Responsibility |
|------|----------------|
| `frontend/src/App.js` | top-level router, header/sidebar, route guards |
| `frontend/src/actions/*.js` | API calls and Redux dispatch lifecycle |
| `frontend/src/screens/*.js` | page-level user flows |
| `backend/app.js` | middleware stack (CORS, CSRF, cookies, rate limits, routers) |
| `backend/routers/userRouter.js` | sign in/register/profile/admin user ops |
| `backend/routers/productRouter.js` | catalog, categories, reviews, product CRUD |
| `backend/routers/orderRouter.js` | create/pay/list/detail/summary/order admin ops |
| `backend/routers/supportRouter.js` | support inbox thread/message flow |
| `backend/routers/seedRouter.js` | admin-protected demo reseed |

---

## 3. Button / Action Flows

### 3-1. App Boot + Sidebar + Search

```
App mount
  ├─ dispatch(listProductCategories())
  └─ initializeCsrfToken() -> GET /api/auth/csrf-token

Sidebar toggle
  ├─ open-sidebar button toggles local state
  └─ category click routes to /search/category/:category and closes sidebar
```

---

### 3-2. Sign In / Sign Out

```
Sign in submit (SigninScreen)
  ├─ POST /api/users/signin (cookie session)
  ├─ set auth cookie + csrf cookie
  └─ store userInfo in Redux

Sign out click (header dropdown)
  ├─ POST /api/users/signout
  ├─ clear auth/csrf cookies
  └─ reset user/cart/order state in Redux
```

---

### 3-3. Browse + Product Detail + Review

```
Home/Search load
  └─ GET /api/products with filters (name/category/price/rating/order/page)

Product page
  └─ GET /api/products/:id

Review submit
  ├─ POST /api/products/:id/reviews (auth + csrf)
  └─ backend prevents duplicate review per user
```

---

### 3-4. Cart -> Checkout -> Place Order -> Pay

```
Add to cart
  └─ cartActions update localStorage-backed Redux cart

Place order
  ├─ POST /api/orders (auth + csrf)
  ├─ server validates product ids and derives seller_id from DB
  └─ order created in SQLite

Pay order
  ├─ PUT /api/orders/:id/pay
  └─ only admin or order owner can mark paid
```

---

### 3-5. Admin / Seller Operations

```
Admin dashboard
  └─ GET /api/orders/summary (admin only)

Product management
  ├─ POST /api/products (admin/seller)
  ├─ PUT /api/products/:id
  └─ seller can only update own product, admin can update any

Order management
  ├─ GET /api/orders?seller=...
  ├─ PUT /api/orders/:id/deliver (admin)
  └─ DELETE /api/orders/:id (admin)
```

---

### 3-6. Support Inbox

```
Customer
  ├─ POST /api/support/threads
  └─ POST /api/support/threads/:id/messages

Admin
  ├─ GET /api/support/threads
  └─ GET /api/support/threads/:id/messages
```

No websocket dependency; polling-friendly async support flow.

---

## 4. Security Flow Highlights

- Session model: HTTP-only auth cookie, not bearer token.
- Mutating API requests require CSRF token header.
- CORS allowlist enforced from `FRONTEND_ORIGINS`.
- Route-level authorization:
  - orders: owner/admin/seller access checks
  - admin routes: `isAdmin`
  - seller routes: `isAdminOrSeller` + ownership checks
- Global + auth-specific rate limits enabled.
