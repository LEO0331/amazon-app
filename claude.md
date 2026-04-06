# Amazon-App - AI Project Guide / AI 專案指南

React + Redux + Vite frontend with Express + libSQL backend.  
目標：在保持安全預設與可維護性的前提下，穩定交付電商展示流程。

---

## Read Before Any Task / 開始任務前必讀

1. `docs/info.md` - architecture, contracts, deploy/security baseline  
   架構、契約、部署與安全基線
2. `docs/flow.md` - button-level flow and route behavior  
   按鈕層級流程與路由行為
3. `README.md` - environment, run/test/seed commands  
   環境變數與執行/測試/seed 指令

---

## Working Workflow / 工作流程

1. Understand request scope and impacted modules.  
   先釐清需求範圍與受影響模組。
2. Prefer focused, minimal changes.  
   優先小範圍、可驗證的修改。
3. Preserve existing business behavior unless explicitly changed.  
   除非明確要求，避免改動既有商業邏輯。
4. Verify with tests before claiming completion.  
   完成前必須以測試驗證。

---

## Documentation Update Rules / 文件更新規則

| Change Type | Update File |
|------------|-------------|
| Architecture / API contract / deployment changes | `docs/info.md` |
| Button flow / route behavior changes | `docs/flow.md` |
| Setup / env / scripts / runbook changes | `README.md` |

---

## Technical Guardrails / 技術守則

### 1) Business Safety / 商業邏輯安全

- Do not silently alter pricing/order/security rules.  
  不可無聲改動價格、訂單或安全邏輯。
- Keep API/DB changes backward-compatible when possible.  
  API/資料庫修改盡量維持向後相容。
- Preserve cookie-session + CSRF contract.  
  維持 cookie session 與 CSRF 契約。

### 2) Code Quality / 程式品質

- Keep diffs small and localized.  
  變更應聚焦且區域化。
- Follow existing naming and folder conventions.  
  依循現有命名與目錄慣例。
- Avoid unnecessary rewrites.  
  避免不必要的大改。

### 3) Validation / 驗證

- Backend:
  - `npm run test:backend:coverage` for API/security/data changes
- Frontend:
  - `npm --prefix frontend run test`
  - `npm --prefix frontend run test:coverage` when touching reducers/actions/screens

### 4) Performance / 效能

- Prefer lazy-loading for route-heavy pages.  
  路由型頁面優先使用 lazy loading。
- Keep query parameters bounded/validated.  
  查詢參數要有上限與驗證。
- Avoid expensive sync work in hot API paths.  
  避免在高頻 API 路徑執行昂貴同步工作。

### 5) Security / 安全性

- Keep strict CORS allowlist behavior.  
  維持嚴格 CORS 白名單。
- Keep CSRF protection on all mutating routes.  
  所有修改型路由維持 CSRF 檢查。
- Keep role/ownership checks on admin/seller/order operations.  
  管理者、賣家、訂單流程必須保留角色與資源歸屬檢查。
- Never log secrets (`JWT_SECRET`, DB tokens).  
  不得記錄任何敏感憑證。

---

## CI/CD Rules / CI/CD 規範

- `.github/workflows/deploy.yml` must pass test/build before deploy.  
  部署前必須先通過測試與建置。
- Frontend target: GitHub Pages.  
  前端部署到 GitHub Pages。
- Backend target: Vercel.  
  後端部署到 Vercel。
- If backend domain changes, update `VITE_API_BASE_URL` secret first.  
  後端網域變更時，先更新 `VITE_API_BASE_URL` secret。

---

## Notes for AI Assistants / AI 助手備註

- State intended file changes before large edits.  
  大幅修改前先說明影響檔案範圍。
- If blocked by env/network/deploy setup, report exact missing keys/endpoints.  
  若受環境或部署設定阻擋，請精確回報缺少的參數或端點。
- When changing contracts, update docs in the same pass.  
  契約有變更時，請同步更新文件。
