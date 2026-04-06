# Amazon-App - AI Project Guide

React + Redux + Vite frontend with Express + libSQL backend.
Goal: deliver stable ecommerce demo flows with low latency, secure defaults, and clear docs.

---

## Read Before Any Task

1. `docs/info.md` - architecture, contracts, deploy/security baseline
2. `docs/flow.md` - button-level user flow and route behavior
3. `README.md` - environment, run/test/seed commands

---

## Working Workflow

1. Understand user request and impacted modules.
2. Prefer minimal, focused changes over broad refactors.
3. Preserve existing business behavior unless explicitly asked to change it.
4. Verify with tests before reporting completion.

---

## Documentation Update Rules

| Change Type | Update File |
|------------|-------------|
| Architecture / API contract / deployment changes | `docs/info.md` |
| Button flow / route behavior changes | `docs/flow.md` |
| Setup / env / scripts / runbook changes | `README.md` |

---

## Technical Guardrails

### 1) Business Safety

- Do not silently change pricing/order/security logic.
- Keep DB and API changes backward-compatible whenever practical.
- For auth/session behavior, preserve cookie + CSRF contract.

### 2) Code Quality

- Keep diffs small and local to impacted areas.
- Follow existing folder and naming conventions.
- Avoid unnecessary framework rewrites.

### 3) Validation

- Backend:
  - `npm run test:backend:coverage` for API/security/data changes
- Frontend:
  - `npm --prefix frontend run test`
  - `npm --prefix frontend run test:coverage` when touching reducers/actions/screens

### 4) Performance

- Prefer lazy-loading for route-heavy UI.
- Keep query parameters bounded and validated.
- Avoid expensive synchronous operations in hot request paths.

### 5) Security

- Keep strict CORS allowlist model.
- Keep CSRF protection active on mutating endpoints.
- Maintain role/ownership checks on admin/seller/order operations.
- Never log secrets (`JWT_SECRET`, DB auth tokens).

---

## CI/CD Rules

- `.github/workflows/deploy.yml` must pass test/build before deployment.
- Frontend deploy target: GitHub Pages.
- Backend deploy target: Vercel.
- If backend domain changes, update `VITE_API_BASE_URL` secret before frontend release.

---

## Notes for AI Assistants

- State the files you will modify before large edits.
- If blocked by env/network/deploy settings, report exact missing variable or endpoint.
- When changing contracts, update docs in the same pass.
