# Amazon-App - Feature Flow / 功能流程說明

This document explains what happens in code when users click major UI actions.  
本文件用人類可讀方式說明：使用者點擊主要按鈕後，程式碼會執行哪些流程。

---

## 1) Runtime Layers / 主要執行層

```
+-------------------------------+
| Frontend (React + Redux)     |
| screens/*, actions/*         |
+---------------+---------------+
                |
                | axios/fetch + cookie + CSRF
+---------------v---------------+
| Backend (Express Routers)    |
| /api/users/products/orders   |
+---------------+---------------+
                |
                | SQL via @libsql/client
+---------------v---------------+
| SQLite (Turso/libSQL schema) |
| users/products/orders/support|
+-------------------------------+
```

- UI layer: route rendering, form events, loading/error states.  
  UI 層：頁面渲染、按鈕事件、loading/error 狀態。
- API layer: auth/validation/security checks + business logic.  
  API 層：驗證、授權、安全檢查與商業邏輯。
- DB layer: persistent data and indexed query paths.  
  DB 層：資料持久化與索引化查詢路徑。

---

## 2) Core Module Map / 核心模組對照

| File | Responsibility | 職責 |
|------|----------------|------|
| `frontend/src/App.js` | top-level router, header/sidebar, route guards | 根路由、Header/Sidebar、路由守衛 |
| `frontend/src/actions/*.js` | API calls and Redux lifecycle | API 呼叫與 Redux 狀態流 |
| `frontend/src/screens/*.js` | page-level UX flows | 各頁面使用者流程 |
| `backend/app.js` | middleware stack and router wiring | 中介層與路由掛載 |
| `backend/routers/userRouter.js` | auth/profile/admin user operations | 登入註冊、個人資料、管理者用戶操作 |
| `backend/routers/productRouter.js` | catalog/categories/reviews/product CRUD | 商品列表、分類、評論、商品 CRUD |
| `backend/routers/orderRouter.js` | create/pay/list/detail/summary | 訂單建立、付款、查詢與統計 |
| `backend/routers/supportRouter.js` | async support threads/messages | 客服對話串與訊息 |
| `backend/routers/seedRouter.js` | admin-protected reseed | 管理者資料重建 |

---

## 3) Button / Action Flows / 按鈕流程

### 3-1. App Boot + Sidebar + Search / 啟動、側欄與搜尋

```
App mount
  -> dispatch(listProductCategories())
  -> initializeCsrfToken() -> GET /api/auth/csrf-token

Sidebar toggle
  -> open-sidebar button toggles local state
  -> category click routes to /search/category/:category and closes sidebar
```

---

### 3-2. Sign In / Sign Out / 登入與登出

```
Sign in submit
  -> POST /api/users/signin (cookie session)
  -> server sets auth cookie + csrf cookie
  -> Redux stores userInfo

Sign out click
  -> POST /api/users/signout
  -> clear auth/csrf cookies
  -> reset user/cart/order related Redux state
```

---

### 3-3. Browse + Product Detail + Review / 商品瀏覽、詳情與評論

```
Home/Search load
  -> GET /api/products with filters

Product page
  -> GET /api/products/:id

Review submit
  -> POST /api/products/:id/reviews (auth + csrf)
  -> backend blocks duplicate reviews from same user
```

---

### 3-4. Cart -> Checkout -> Place Order -> Pay / 購物車到付款

```
Add to cart
  -> cartActions update Redux + localStorage

Place order
  -> POST /api/orders
  -> backend validates product ids
  -> backend derives seller_id from DB (not from client payload)
  -> order persisted in SQLite

Pay order
  -> PUT /api/orders/:id/pay
  -> only admin or order owner can mark paid
```

---

### 3-5. Admin / Seller Operations / 管理者與賣家流程

```
Admin dashboard
  -> GET /api/orders/summary (admin only)

Product management
  -> POST /api/products (admin/seller)
  -> PUT /api/products/:id
  -> seller can update only own products

Order management
  -> GET /api/orders?seller=...
  -> PUT /api/orders/:id/deliver (admin)
  -> DELETE /api/orders/:id (admin)
```

---

### 3-6. Support Inbox / 客服收件匣

```
Customer
  -> POST /api/support/threads
  -> POST /api/support/threads/:id/messages

Admin
  -> GET /api/support/threads
  -> GET /api/support/threads/:id/messages
```

No websocket dependency; polling-friendly async model.  
無 WebSocket 依賴，採用輪詢友善的非同步流程。

---

## 4) Security Flow Highlights / 安全重點

- Session auth uses HTTP-only cookie (not bearer token).  
  使用 HTTP-only cookie 驗證，不依賴前端 bearer token。
- Mutating requests require CSRF token header.  
  所有修改型 API 需要 CSRF token。
- CORS allowlist comes from `FRONTEND_ORIGINS`.  
  CORS 白名單由 `FRONTEND_ORIGINS` 控制。
- Route authorization includes admin/seller/owner checks.  
  路由授權包含 admin/seller/owner 權限檢查。
- Global + auth-specific rate limits are enabled.  
  啟用全域與認證專用 rate limit。
