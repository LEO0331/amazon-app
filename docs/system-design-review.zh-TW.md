# 系統設計審查（繁體中文）

日期：2026-05-08
範圍：`frontend/` + `backend/` + 部署流程

## 1. 摘要

此系統是偏務實的電商全端架構：

- 前端：React 17 + Redux + React Router v5 + Vite
- 後端：Express API，採 Cookie JWT 驗證 + CSRF 防護
- 資料層：libSQL/SQLite，關聯式表 + 部分 JSON 欄位
- 部署：GitHub Pages（前端）+ Vercel（後端）

整體設計優先順序是：開發效率、運維簡單、責任邊界清楚。也因此接受部分可預期取捨（例如 `orders`/`products` 內 JSON 欄位、Redux 樣板碼較多、客服採輪詢）。

## 2. 架構審查

### 2.1 執行時架構

- Client 層：
  - 路由殼層：`frontend/src/App.js`
  - 狀態流：`actions/*` + `reducers/*`
  - API 整合：`frontend/src/apiClient.js`（含 credentials + CSRF header）
- API 層：
  - 組裝：`backend/app.js`
  - 領域路由：users/products/orders/support/upload/seed
  - 橫切能力：Helmet、CORS allowlist、rate limit、CSRF
- Data 層：
  - client：`backend/db/client.js`
  - schema/index：`backend/db/schema.js`
  - mapper：`backend/db/mappers.js`
- 交付層：
  - CI/CD：`.github/workflows/deploy.yml`
  - 前端靜態部署 + 後端 serverless route shim（`vercel.json`）

### 2.2 優點

- 安全預設成熟：
  - HTTP-only auth cookie + CSRF + 嚴格 CORS + 認證限流
- 路由按領域切分，授權與商業規則可局部維護
- 可重現 seeding 流程，方便 demo 與回歸測試
- 資料索引與主要查詢路徑一致（category/seller/price/rating/time）
- Vite 手動 chunk 降低首屏單包風險

### 2.3 取捨與限制

- SQLite/libSQL 偏向低運維成本，不是高併發寫入最強解
- 關聯式 + JSON 欄位降低 join 複雜度，但弱化巢狀欄位查詢能力
- Redux 傳統寫法可控但樣板碼較多
- 客服輪詢簡單但即時性與網路效率較差
- Hash Routing 適合靜態託管，但 SEO 與 URL 語意不如 SSR/乾淨路徑

## 3. 資料結構選型：為什麼這樣選、替代方案是什麼

### 3.1 儲存/資料模型

| 現行選擇 | 為何採用 | 可替代方案 | 與替代方案取捨 |
|---|---|---|---|
| 關聯式表（users/products/orders/support_threads/support_messages） | 一致性高、SQL 統計容易、托管成本低 | 文件型資料庫（MongoDB） | 關聯式在一致性與報表較有優勢；文件庫在巢狀彈性與水平擴展較有優勢 |
| UUID（`TEXT`）主鍵 | 分散式建立 ID 不需依賴序列 | 自增整數 ID | UUID 避免碰撞、跨服務友善，但占用較大且不直觀 |
| `orders.order_items_json` | 訂單快照語意清楚、寫入簡單 | `order_items` 子表正規化 | JSON 便於快速開發與回傳；子表更利於查詢、索引與分析 |
| `products.reviews_json` | 商品詳情一次取回、實作快 | `reviews` 獨立表 | JSON 快速但後續 moderation/search/analytics 擴展受限 |
| `shipping_address_json` / `payment_result_json` | 支付/地址欄位彈性高，降低 migration 成本 | 嚴格正規化地址/支付表 | JSON 省遷移成本；正規化更適合驗證、查詢與報表 |

### 3.2 後端記憶體資料結構

| 現行選擇 | 為何採用 | 可替代方案 | 取捨 |
|---|---|---|---|
| `Set`（CORS origins） | O(1) membership + 去重 | Array includes | `Set` 在高頻檢查更直觀且較快 |
| `Set`（sellerIds 檢查） | 單一賣家約束判斷簡潔 | 物件 map / 迴圈比較 | `Set` 直接表達唯一性規則 |
| `Map`（批次 hydrate） | O(1) 查表、避免 N^2 | 每列 `find` | `Map` 對列表端點效能更穩定 |

### 3.3 前端狀態資料結構

| 現行選擇 | 為何採用 | 可替代方案 | 取捨 |
|---|---|---|---|
| Redux domain slices | 跨頁共享狀態可預測 | React Query / RTK Query | 現行方式顯式但冗長；query library 可降樣板碼並強化快取 |
| `cartItems`（localStorage JSON array） | 刷新後保留購物車，使用體驗佳 | 只存 server-side cart | 本地快、離線友善；server cart 可跨裝置同步 |
| API interceptor 管 CSRF | 統一修改請求策略 | 每個 action 手動帶 token | interceptor 降低遺漏風險、維護成本更低 |

## 4. 重要架構決策與取捨敘事

### 決策 A：Cookie JWT + CSRF，而非 localStorage Bearer Token

- 好處：
  - XSS 情境下 token 被直接讀出的風險較低（httpOnly）
  - 後端可集中管控 session 型行為
- 成本：
  - 需處理 CSRF 流程與 cookie sameSite/secure 設定
- 替代：
  - access token + refresh token（前端儲存）
- 為何現行可接受：
  - 以本專案規模，安全預設收益大於流程複雜度

### 決策 B：libSQL/SQLite，而非 managed Postgres

- 好處：
  - 運維成本低、開發啟動快
  - SQL 能力足夠覆蓋目前電商流程
- 成本：
  - 高併發寫入能力與進階分析能力受限
- 升級時機：
  - 寫入 contention 明顯、報表需求上升、交易需求更複雜

### 決策 C：客服輪詢，而非 WebSocket/SSE

- 好處：
  - 實作/部署簡單，故障模式容易處理
- 成本：
  - 即時性與網路效率較差
- 升級時機：
  - 即時客服 SLA 提升、輪詢流量成本上升

## 5. 深入問答準備（Deep Dive Q&A）

### 5.1 架構面

1. 為什麼訂單明細用 JSON 快照，不正規化成 order_items 表？
- 建議回答：先確保歷史訂單快照語意與開發速度；若後續分析/查詢需求上升，再拆子表與索引。

2. 為什麼購物車限制單一賣家？
- 建議回答：降低配送、請款、分潤與客服爭議流程複雜度；多賣家需做拆單與部分退款流程。

3. 為什麼採 router-per-domain？
- 建議回答：讓授權與商業規則在同一邊界內，降低巨型 controller 風險。

### 5.2 安全面

4. 為什麼要同時用 auth cookie 與 CSRF token？
- 建議回答：cookie 會自動夾帶，CSRF token 用來證明「使用者有意圖」執行修改行為。

5. 為什麼認證端點要獨立限流？
- 建議回答：登入註冊是暴力攻擊高風險點，獨立閾值可降低帳號填充攻擊。

6. CORS 如何落地？
- 建議回答：以 env allowlist 驗證 origin，未知來源直接拒絕。

### 5.3 資料面

7. 如何避免列表端點 N+1 問題？
- 建議回答：先批次查關聯資料，再用 `Map` hydrate。

8. 為何索引放在 category/seller/price/rating/created_at？
- 建議回答：對應首頁/搜尋/後台統計主要過濾排序路徑。

9. 為何訂單 seller_id 由後端從商品資料推導？
- 建議回答：避免信任 client payload，確保訂單與商品賣家關聯一致。

### 5.4 前端面

10. 為何用 Redux 而不是純 component state？
- 建議回答：cart/auth/order 跨頁共享，需可預測狀態遷移與持久化。

11. 為何 user/cart 要落 localStorage？
- 建議回答：刷新體驗穩定；敏感授權仍以後端 cookie 驗證為準。

12. 為何使用 hash routing？
- 建議回答：對 GitHub Pages 靜態託管友善，避免 server rewrite 依賴。

## 6. 演進路線建議

### 6.1 流量成長後

- 升級至 managed Postgres
- 將 `order_items` / `reviews` 正規化
- 建立 read-model 或 analytics endpoint

### 6.2 客服成為核心後

- 輪詢升級為 WebSocket 或 SSE
- 增加 unread counter / message status
- 建立 moderation 與稽核軌跡

### 6.3 前端規模提升後

- 導入 Redux Toolkit + RTK Query
- 建立 typed API contract 層
- 增加 route-level prefetch 與 cache policy

## 7. 面試/深挖前檢查清單

- 能說明 JSON 欄位在現階段為何合理
- 能定義何時需要正規化遷移
- 能解釋 cookie + CSRF 的完整驗證路徑
- 能說明單賣家限制的商業與系統原因
- 能把索引策略對應到真實查詢負載
- 能說明 Vite chunk 策略與未來調整條件

