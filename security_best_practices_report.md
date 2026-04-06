# Security Best Practices Report

## Executive Summary
The project has a solid baseline (HTTP-only auth cookies, CSRF token checks, strict CORS allowlist, Helmet, rate limiting, parameterized SQL), but there are **critical authorization gaps** in order access/payment and a few high-impact operational risks. The most urgent items are IDOR-style access control flaws in `/api/orders/:id` and `/api/orders/:id/pay`.

## Critical Findings

### SEC-001: IDOR on Order Detail Endpoint
- Severity: Critical
- Location: `backend/routers/orderRouter.js:145`
- Evidence:
  - Route requires only `isAuth`, then fetches by `id` and returns the order without ownership/admin/seller scope checks.
- Impact: Any authenticated user can fetch arbitrary order details by ID (PII, address, payment metadata exposure).
- Fix:
  - Enforce access control before returning the order:
    - allow if `req.user.isAdmin`
    - allow seller only if `row.seller_id === req.user._id`
    - allow buyer only if `row.user_id === req.user._id`
    - otherwise return `403`.
- Mitigation:
  - Add integration tests that verify cross-user order reads fail with `403`.

### SEC-002: IDOR on Order Payment Endpoint
- Severity: Critical
- Location: `backend/routers/orderRouter.js:158`
- Evidence:
  - `PUT /:id/pay` requires only `isAuth` and updates payment state for any existing order ID.
- Impact: Any authenticated user can mark someone else’s order as paid and alter payment-result metadata.
- Fix:
  - Apply the same ownership/role checks as SEC-001, or restrict payment to buyer only.
  - Reject pay operations when `is_paid = 1` to prevent repeated writes.
- Mitigation:
  - Add tests: user A cannot pay user B’s order.

## High Findings

### SEC-003: Seller Can Update Any Product
- Severity: High
- Location: `backend/routers/productRouter.js:206`
- Evidence:
  - `PUT /api/products/:id` uses `isAdminOrSeller` but does not verify seller ownership (`row.seller_id`).
- Impact: Any seller can modify another seller’s products.
- Fix:
  - Permit update if admin, or seller where `row.seller_id === req.user._id`; else `403`.
- Mitigation:
  - Add API tests for cross-seller update denial.

### SEC-004: Unprotected Product Seed Endpoint Allows Full Reset
- Severity: High
- Location: `backend/routers/productRouter.js:136`
- Evidence:
  - `GET /api/products/seed` resets DB and seeds users/products with **no auth** and no environment guard.
- Impact: Any unauthenticated caller can wipe and reseed database state.
- Fix:
  - Remove this route, or protect with `isAuth + isAdmin + explicit feature flag`.
- Mitigation:
  - Keep only the admin-protected `POST /api/seed`.

### SEC-005: Destructive User Seed Endpoint Exposed in Non-Production
- Severity: High
- Location: `backend/routers/userRouter.js:56`
- Evidence:
  - `GET /api/users/seed` has no auth and resets/reseeds DB unless `NODE_ENV === 'production'`.
- Impact: In any non-production environment exposed publicly (preview/staging/misconfigured prod), unauthenticated callers can destroy/replace data.
- Fix:
  - Remove this route entirely, or guard with `isAuth + isAdmin + explicit feature flag` (e.g., `ENABLE_DEV_SEED=true`).
- Mitigation:
  - Keep only `POST /api/seed` (already admin-protected) for controlled demo seeding.

### SEC-006: Order Seller Attribution Trusts Client Payload
- Severity: High
- Location: `backend/routers/orderRouter.js:117`
- Evidence:
  - `seller_id` is taken from `req.body.orderItems[0]?.seller?._id` without server-side verification.
- Impact: A client can forge seller attribution, corrupting seller analytics/order ownership and admin workflows.
- Fix:
  - Derive seller IDs from authoritative product records server-side (resolve each `orderItems[].product` from DB).
  - Reject mixed-seller carts unless intentionally supported and modeled.

## Medium Findings

### SEC-007: Error Responses May Leak Internal Details
- Severity: Medium
- Location: `backend/app.js:107`
- Evidence:
  - Global error handler returns `err.message` directly for all non-CORS errors.
- Impact: Internal implementation details (DB errors, stack-derived messages) can leak to clients and aid attackers.
- Fix:
  - Return generic messages in production (e.g., `Internal Server Error`) and log detailed errors server-side only.
- Mitigation:
  - Keep current CORS-specific 403 path, but sanitize all other messages.

### SEC-008: Upload Validation Trusts MIME + Predictable Local Filename
- Severity: Medium
- Location: `backend/routers/uploadRouter.js:12`, `backend/routers/uploadRouter.js:26`
- Evidence:
  - Validation only checks `file.mimetype.startsWith('image/')`.
  - Local disk filename is `${Date.now()}.jpg` (predictable, extension-forced).
- Impact: MIME spoofing can bypass file-type checks; predictable naming may cause collisions and easier probing.
- Fix:
  - Validate by magic bytes/content sniffing (server-side), enforce allowed extensions/types, and use random UUID filenames for local uploads too.
  - Consider storing outside static root and serving via controlled download endpoint when needed.
- Mitigation:
  - Keep size limit (`5MB`) and auth gate in place.

## Low Findings

### SEC-009: DATABASE_URL Not Enforced at Startup
- Severity: Low
- Location: `backend/db/client.js:3`, `backend/app.js:19`
- Evidence:
  - App hard-fails when `JWT_SECRET` missing, but `DATABASE_URL` silently falls back to `file:./dev.db`.
- Impact: Production misconfiguration can unintentionally run against local/ephemeral DB with data-loss/confusion risk.
- Fix:
  - Fail startup in production when `DATABASE_URL` is missing (and optionally when `DATABASE_AUTH_TOKEN` missing for libsql URL).

### SEC-010: CI Lacks Dependency Vulnerability Gate
- Severity: Low
- Location: `.github/workflows/deploy.yml`
- Evidence:
  - Workflow runs tests/build but no `npm audit`/SCA gate.
- Impact: Known vulnerable dependencies may pass CI unnoticed.
- Fix:
  - Add a dependency-scanning step (at least advisory reporting; enforce thresholds for critical/high in production branches).

## Positive Controls Observed
- Cookie auth uses `HttpOnly` and `Secure` in production: `backend/utils.js:40`.
- CSRF token issue + verification pipeline exists: `backend/app.js:71`, `backend/utils.js:84`.
- CORS origin allowlist is implemented: `backend/app.js:49`.
- Global and auth-specific rate limits are configured: `backend/app.js:35`, `backend/app.js:60`.
- Product listing uses bounded pagination and validated sort/filter options: `backend/routers/productRouter.js:47`.
