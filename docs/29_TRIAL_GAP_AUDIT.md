# UWELL CRM — Trial Gap Audit

Last updated: 2026-07-23

## 1. Scope And Method

This audit reviews the three real portals (Fan, Store, Admin), the data layer, i18n, and engineering health against the goal of a **complete, demo-ready trial operation system**.

Method: read-only inspection of real source code under `frontend/src/`, real routes (`/fan-app.html#/fan-center`, `/store-app.html#/store-owner`, `/#/app/dashboard`), project docs (`08_DESIGN_SYSTEM.md`, `09_BUSINESS_RULES.md`, `10_AI_RULES.md`, `19`–`27`), and `PROGRESS.md` (latest Task-113).

Audit baseline:
- npm test: 102 files / 472 tests — passed
- npm run build: passed
- Latest task: Task-113 (store-owner Home density trim)

This audit changes **no code, no database, no API, no permissions, no .env, no dependencies**. It only produces this document and a Task suggestion list.

---

## 2. Scorecard Overview

| Dimension | Fan Portal | Store Portal | Admin Portal |
|-----------|:----------:|:------------:|:------------:|
| Feature completeness | ✅ Full | ✅ Full | ✅ Full |
| UI polish (density / brand) | ⚠️ 4 of 10 tabs polished | ⚠️ 1 of 5 tabs polished | ⚠️ Language + table fixes only, no brand polish |
| i18n coverage | ✅ EN + AR via t() | ⚠️ EN + partial AR map, no zh | ✅ zh-first, hardcoded labels by design |
| RTL support | ⚠️ Partial (52 CSS rules, dir set, ConfigProvider missing) | ⚠️ Partial | N/A (zh-first) |
| Production readiness | ❌ Local fallback hides failures | ❌ Same as fan | ❌ admin-ops localDb only |
| Closed-loop demo | ✅ Works end-to-end locally | ✅ Works locally | ✅ Works locally |

Legend: ✅ ready · ⚠️ partial · ❌ gap

**Bottom line**: as a local demo, the system is end-to-end functional across all three portals. As a trial-operation deliverable, the remaining work is UI polish on un-polished tabs, RTL for the Saudi market, and a small set of visible flaws. Production backend hardening is a separate, later line.

---

## 3. Trial-Line Gap List

### P0 — Fix Before Customer Demo

| ID | Portal | Issue | Evidence | Fix scope |
|----|--------|-------|----------|-----------|
| P0-1 | Store | **Dead self-navigation buttons in Me tab** — 4 buttons all call `setActiveTab("me")` while already on Me; clicking does nothing visible | `StoreOwnerPage.jsx` ~line 2310, 2314-2330 | JS only: point to photo section scroll, or remove redundant buttons |
| P0-2 | Store | **Verify tab repeats the same rule 3 times** — "stores do not give points, only verify" appears at rule strip (~2115), scan card desc (~2137), and pickup card (~2181); first screen stacks 6 cards | `StoreOwnerPage.jsx` lines 2110-2284 | JSX structure + CSS scoped classes |
| P0-3 | Store | **Activities tab has two near-duplicate explainer blocks** before any content — guidance strip (3 cells) + execution board (3 cells) both say "official campaigns first / store-created need approval / appears in fan activities" | `StoreOwnerPage.jsx` lines 1450-1600 | Merge into one strip, remove duplication |
| P0-4 | Admin | **RewardsOpsPage shows placeholder text "图片位 占位"** in image column | `RewardsOpsPage.jsx` line 279 | Replace placeholder with real image or remove column |
| P0-5 | Fan | **`/preview/fan` route still registered** — ROADMAP known risk: misleads development, may be opened by accident in demo | `App.jsx` line 139 | Remove or redirect route (keep file for reference) |
| P0-6 | Fan | **Community "Photo posting is coming soon" label** visible to users — demo audiences may ask about it | `translations.js` line 1199 | Decide: hide label or keep as roadmap signal |

### P1 — Should Fix During Trial Period

| ID | Portal | Issue | Evidence | Fix scope |
|----|--------|-------|----------|-----------|
| P1-1 | Fan | **Community tab not polished** to Home/Activities brand standard (348 lines, no brand rhythm) | `fans/tabs/CommunityTab.jsx` | JSX + scoped CSS |
| P1-2 | Fan | **Rewards tab not polished** + known 390px chip overflow (Task-077-P2) | `fans/tabs/MallTab.jsx` | JSX + CSS |
| P1-3 | Fan | **Stores/Map tab not polished** — functional but visual not brand-aligned | `fans/tabs/MapTab.jsx` | JSX + CSS |
| P1-4 | Fan | **Me tab not polished** — 7 equal-weight blocks, no visual hierarchy | `FanCenterPage.jsx` Me section | JSX + CSS |
| P1-5 | Store | **S Report tab top has dual explainer strips** (hero + execution lane) that can merge | `StoreOwnerPage.jsx` 1921-2108 | JSX structure |
| P1-6 | Store | **Activities tab inline hardcoded hex colors** on campaign cards | `StoreOwnerPage.jsx` ~1536-1541 | Move to scoped CSS classes |
| P1-7 | Cross | **RTL foundation exists but coverage incomplete** — languageStore sets `dir="rtl"` on html+body (languageStore.js:28,31); index.css has 52 RTL-specific rules; but antd ConfigProvider `direction` prop not set, and not all components have RTL overrides | `languageStore.js:27-33`, `index.css` (52 `dir="rtl"` rules), `App.jsx` (missing ConfigProvider direction) | Add ConfigProvider direction; audit and fill RTL CSS gaps |
| P1-8 | Store | **Store portal i18n fragmented** — 279 hardcoded English strings + local `STORE_OWNER_AR_COPY` map, not in central `translations.js`, no Chinese | `StoreOwnerPage.jsx` line 531 (`st()`), ~line 60 (copy map) | Migrate strings to translations.js (decision needed: does store portal need zh?) |
| P1-9 | Admin | **FanListPage is thin** — 45 lines, table + filter only, no export / no batch actions | `fans/FanListPage.jsx` | Add export button, batch actions (if confirmed) |
| P1-10 | Cross | **Asset hotlink risk** — fan portal hotlinks `files.myuwell.com` CDN + 1 CloudFront video + leaflet markers from `unpkg.com`; if CDN changes, images break with no local fallback | `FanCenterPage.jsx`, `CampaignTab.jsx`, `DashboardPage.jsx` | Decision: download critical assets locally or accept hotlink |

### P2 — Can Schedule Later

| ID | Portal | Issue | Evidence |
|----|--------|-------|----------|
| P2-1 | Cross | **index.css is a 19,322-line monolith** — hard to maintain, risky to edit | `frontend/src/index.css` |
| P2-2 | Cross | **42 `_*.js`/`_*.cjs` scratch scripts at project root** + multiple `.bundle` backups + `backup_20260627_163514` directory | Project root listing |
| P2-3 | Cross | **JSX everywhere but docs say TypeScript** — known tech debt | `AGENTS.md` mentions TS, all files are `.jsx` |
| P2-4 | Store | **Activities tab photo-purpose-grid** 3 buttons all navigate to current tab (related to P0-1, may be same fix) | `StoreOwnerPage.jsx` ~2314-2330 |
| P2-5 | Admin | **Dashboard leaflet markers hotlink `unpkg.com`** — third-party CDN dependency | `DashboardPage.jsx` lines 51-53 |

---

## 4. Production-Line Gap List

> These are **not** trial-operation blockers. They are documented here so the team knows what remains before the system can run on a real Supabase backend with real users. Source: Explore agent data-layer audit + `docs/23`, `docs/24`, `docs/27`.

| ID | Issue | Evidence | Impact |
|----|-------|----------|--------|
| PR-1 | **Silent fallbacks hide failures** — DEV/localhost auto-falls back to local demo auth; missing env makes supabase client a no-op Proxy that swallows all calls | `services/api/helpers.js:11-16`, `services/supabase.js:18-26`, `stores/authStore.js:13-18,123-126` | Production errors invisible |
| PR-2 | **Plaintext demo passwords** in localStorage `auth` table | `seedData.js`, `authStore.js:68-72` | Security risk if exposed |
| PR-3 | **`visit-photos` storage bucket has no migration** — manual step only | No storage SQL in `supabase/migrations/`; `database/RUN_ON_SUPABASE.md:40-44` | Remote photo upload fails |
| PR-4 | **RPC execution on fresh prod project undocumented** — scan_qr_code, trend RPCs, confirm_reward_pickup, write_audit_log, internal/fan-safe store RPCs | `supabase/migrations/` 12 files; Task-060 executed 5 against preview only | Fresh deploy may miss RPCs |
| PR-5 | **RLS acceptance was preview-only** — remote-mode page-level acceptance not complete | `docs/27:229`, `docs/ROADMAP.md:104` | RLS may have gaps in prod |
| PR-6 | **Signup flows unverified under RLS** — fan/store `auth.signUp` + profile/fan inserts depend on RLS insert policies | `FanEntryPage.jsx:199-202`, `StoreEntryPage.jsx:120` | New user registration may fail |
| PR-7 | **Feature loss in remote mode** — visits drops 10 local-only fields; dashboard analytics hard-pinned to local | `services/api/visits.js:17-27`, `services/api/dashboard.js:10,67-70` | Remote mode has less data than demo |
| PR-8 | **admin-ops workflows are localDb-only** — Reviews, Risk Center, Rewards Ops all read/write localDb, not Supabase | `admin-ops/admin-ops-workflows.js` (uses `localDb.insert`/`localDb.all`) | Admin operations don't persist in prod |
| PR-9 | **Audit log writes are fire-and-forget** — `void supabase.rpc(...)` not awaited | `services/api/audit-logs.js:66-86` | Audit entries may silently fail |
| PR-10 | **Realtime needs publication config** — channels assume `postgres_changes` publication is set up | `hooks/useRealtimeSubscription.js:23-31` | Realtime updates won't work without config |

---

## 5. Task Suggestion List

> These are **suggestions only**. Each requires a separate impact analysis and user confirmation before implementation, per `docs/10_AI_RULES.md`. Numbering continues from Task-113.

### Task-114: Store Owner Verify Tab Density Trim

- **Scope**: Merge 3 repeated rule copies into 1; reduce 6 cards to 4 (rule strip / method area / result states / pickup form)
- **Files**: `frontend/src/pages/store-owner/StoreOwnerPage.jsx`, `frontend/src/index.css`
- **No change to**: verification logic, scan popup, risk validation, S-store policy
- **Rollback**: revert 2 files
- **Priority**: P0-2

### Task-115: Store Owner Activities Tab Duplicate Explainer Removal

- **Scope**: Merge guidance strip + execution board into one strip; move inline hex colors to scoped CSS
- **Files**: `frontend/src/pages/store-owner/StoreOwnerPage.jsx`, `frontend/src/index.css`
- **No change to**: campaign list logic, approval flow, fan visibility
- **Rollback**: revert 2 files
- **Priority**: P0-3, P1-6

### Task-116: Store Owner Me Tab Dead Button Fix

- **Scope**: Fix 4 buttons that self-navigate to current tab — point to photo section scroll or remove
- **Files**: `frontend/src/pages/store-owner/StoreOwnerPage.jsx`
- **No change to**: photo upload logic, profile data
- **Rollback**: revert 1 file
- **Priority**: P0-1
- **Decision needed**: scroll-to-section vs remove buttons

### Task-117: Admin RewardsOps Placeholder Removal

- **Scope**: Replace "图片位 占位" with real image or remove image column
- **Files**: `frontend/src/pages/admin-ops/RewardsOpsPage.jsx`
- **No change to**: rewards data, redemption logic
- **Rollback**: revert 1 file
- **Priority**: P0-4

### Task-118: Preview Route Cleanup

- **Scope**: Remove or redirect `/preview/fan` route registration
- **Files**: `frontend/src/App.jsx`
- **No change to**: real fan routes, fan center logic
- **Rollback**: revert 1 file
- **Priority**: P0-5
- **Decision needed**: remove route entirely vs redirect to `/fan-entry`

### Task-119: Fan Portal Community Tab Brand Polish

- **Scope**: Apply Home/Activities brand rhythm to Community feed — reduce rule text, modernize composer, improve card hierarchy
- **Files**: `frontend/src/pages/fans/tabs/CommunityTab.jsx`, `frontend/src/index.css`, `frontend/src/utils/translations.js`
- **No change to**: post/like/comment logic, community data
- **Rollback**: revert 3 files
- **Priority**: P1-1

### Task-120: Fan Portal Rewards Tab Brand Polish + Overflow Fix

- **Scope**: Fix 390px chip overflow (Task-077-P2); apply brand rhythm to mall grid
- **Files**: `frontend/src/pages/fans/tabs/MallTab.jsx`, `frontend/src/index.css`
- **No change to**: redemption logic, points deduction
- **Rollback**: revert 2 files
- **Priority**: P1-2

### Task-121: Fan Portal Stores/Map Tab Brand Polish

- **Scope**: Brand-align store cards, map markers, UWELL Brand Store presentation
- **Files**: `frontend/src/pages/fans/tabs/MapTab.jsx`, `frontend/src/index.css`
- **No change to**: map logic, store data, Google Maps link
- **Rollback**: revert 2 files
- **Priority**: P1-3

### Task-122: Fan Portal Me Tab Brand Polish

- **Scope**: Group 7 equal-weight blocks into visual hierarchy; simplify history
- **Files**: `frontend/src/pages/fans/FanCenterPage.jsx` (Me section), `frontend/src/index.css`
- **No change to**: profile data, points display, level logic
- **Rollback**: revert 2 files
- **Priority**: P1-4

### Task-123: RTL Coverage Completion (needs confirmation)

- **Scope**: Add antd ConfigProvider `direction="rtl"` for Arabic (languageStore already sets `dir` on html+body); audit existing 52 RTL CSS rules for coverage gaps; fill missing overrides for components that still render LTR under Arabic
- **Files**: `frontend/src/App.jsx` (ConfigProvider direction prop), `frontend/src/index.css` (fill RTL gaps)
- **No change to**: business logic, data, languageStore dir switching (already works)
- **Rollback**: revert 2 files
- **Priority**: P1-7
- **Decision needed**: is RTL completion in scope for this trial phase, or deferred?

### Task-124: Store Portal i18n Consolidation (needs confirmation)

- **Scope**: Migrate 279 hardcoded English strings from `STORE_OWNER_AR_COPY` map into central `translations.js`
- **Files**: `frontend/src/pages/store-owner/StoreOwnerPage.jsx`, `frontend/src/utils/translations.js`
- **No change to**: store logic, data
- **Rollback**: revert 2 files
- **Priority**: P1-8
- **Decision needed**: does store portal need Chinese, or EN+AR only?

### Task-125: Store Owner S Report Tab Light Trim

- **Scope**: Merge top dual explainer strips (hero + execution lane) into one; keep all form panels and history cards intact
- **Files**: `frontend/src/pages/store-owner/StoreOwnerPage.jsx`, `frontend/src/index.css`
- **No change to**: sell-through/inventory/material submission logic, history locking
- **Rollback**: revert 2 files
- **Priority**: P1-5

---

## 6. Explicit Non-Goals

This audit does **not** propose:

- Changing any business rule (points +5, scan 3/day cap, point dual-track, level thresholds, reward tiers, S-store rules)
- Changing database schema, backend API, Supabase/RLS, permissions, or `.env`
- Adding dependencies (`npm install` / `pip install`)
- Removing any existing feature (check-in, scan, points, rewards, activities, community, stores, S-store loop, admin data)
- Redesigning any portal from scratch — all work is incremental polish on real pages
- Implementing Fan Growth rules (daily 50 cap, membership journey, reward tiers) — these remain documented directions until separately confirmed

---

## 7. Recommended Execution Order

For trial-operation readiness, the fastest path to demo confidence:

```
Task-116 (Me dead buttons)     → quickest fix, visible flaw
Task-117 (RewardsOps 占位)     → quickest fix, visible flaw
Task-114 (Verify density)      → highest-density page
Task-115 (Activities dedup)    → second-density page
Task-118 (preview route)       → cleanup
Task-119-122 (fan tab polish)  → brand consistency, one per task
Task-125 (S Report trim)       → light pass
Task-123/124 (RTL / i18n)      → needs decision first
```

Each task is independent, rollback-friendly, and scoped to 1-3 files. None touches business logic, database, or permissions.
