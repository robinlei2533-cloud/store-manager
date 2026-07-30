# UWELL CRM · Full-System Audit Report

**Date**: 2026-07-26
**Scope**: All three portals — Fan App, Store Owner App, Admin Backend
**Coverage**: Contrast, typography, animation/motion, backend bugs, code quality, theme consistency
**Method**: Source code scan (CSS + JSX + services) + Playwright browser QA (390x844 + 1151x698) + lint pattern search
**Note**: Read-only audit. No code changes were made during this scan.

---

## Scorecard Summary

| Category | P0 Critical | P1 High | P2 Medium | P3 Low |
|---|---:|---:|---:|---:|
| Contrast / Readability | 2 | 8 | 4 | 0 |
| Typography | 0 | 4 | 2 | 0 |
| Animation / Motion | 0 | 1 | 2 | 2 |
| Backend Bugs | 4 | 2 | 3 | 1 |
| Theme Consistency | 1 | 1 | 2 | 0 |
| i18n / RTL | 0 | 1 | 2 | 0 |
| Code Quality | 0 | 1 | 2 | 2 |
| **Total** | **7** | **18** | **17** | **5** |

---

## Browser QA Results

| Page | Mobile Contrast | Desktop Contrast | Console | Overflow |
|---|---:|---:|---|---|
| Admin Login | 0 | 0 | 0 | none |
| Admin Dashboard | 17 | 1 | 0 | none |
| Admin Stores | 0 | 1 | 0 | none |
| Admin Fans | 0 | 1 | 0 | none |
| Admin Campaigns | 0 | 1 | 0 | none |
| Admin Materials | 1 | 2 | 0 | none |
| Admin Settings | 0 | 1 | 0 | none |
| Admin Reviews | 0 | 1 | 0 | none |
| Fan Center | 20 | (timeout) | 0 | none |
| Store Owner | 0 | 0 | 0 | none |

**Artifact**: `frontend/output/playwright/full-system-audit/`
**JSON**: `frontend/output/playwright/full-system-audit/audit-results.json`

**Notes on QA**:
- Desktop fan-center screenshot timed out (30s) at "waiting for fonts to load" — confirms heavy font load or animation work
- No horizontal overflow detected on any page (good)
- No console warnings captured on first render (may not catch deprecation warnings on subsequent renders)

---

# P0 — Critical (Fix First)

## P0-1. Admin Theme Mismatch: Light Shell + Mixed Card Styles

**Where**: `frontend/src/index.css` lines 2338–2420
**Visible on**: All `/app/*` admin pages (Dashboard, Stores, Fans, Campaigns, Materials, Visits, Settings, Reviews)
**Problem**:
- `admin-liquid-shell` background is **light** (`linear-gradient(... rgba(245, 249, 237, 0.96) ... rgba(239, 245, 232, 0.88))` → `#f4f7ee`)
- But `.admin-liquid-shell .ant-card, .admin-readable-card, .ant-table-wrapper, .ant-tabs-content-holder` are forced to **dark** (`background: rgba(9, 14, 24, 0.82)`)
- Siderbar is **dark** (`linear-gradient(rgba(54, 68, 46, 0.92), rgba(37, 49, 35, 0.96))`)
- But ant Descriptions card forces **white** (`background: #ffffff !important`) — overrides everything
- Result: 3 different surface styles on one page (light shell + dark cards + white description table), jarring visual hierarchy
**Screenshot evidence**: See QA screenshots; Settings page shows outer "double card" issue
**Risk**: Low (CSS-only change); reversible by adjusting selectors
**Recommendation**: Make admin shell + all cards light-coherent (recommended), or make everything dark-coherent. The current mid-state is the worst option.

## P0-2. `IS_LOCAL_MODE` Static Export Bug

**Where**: `frontend/src/services/api/dashboard.js` line 168
**Problem**: `export const IS_LOCAL_MODE = isLocal();` captures the boolean at module load. When `withFallback` later sets `_useLocal = true` (because Supabase threw), `IS_LOCAL_MODE` is still `false`.
**Affected consumers**:
- `AppLayout.jsx` line 34: `import { IS_LOCAL_MODE } from '../../services/api'`
- `AppLayout.jsx` line 280: `{IS_LOCAL_MODE && ...}` — renders "Local Demo" badge based on static value
- Multiple API files imported in `api.js` and used in routes
**Impact**: After Supabase fallback kicks in, some code paths stay on the Supabase branch while the data layer has switched to local. Mixed behavior across components after a transient Supabase failure.
**Fix**: Replace `IS_LOCAL_MODE` static value with function call `isLocal()`, or remove the export entirely (consumers should call `isLocal()`).

## P0-3. `scanQrCode` Credits Wrong Fan in Local Mode

**Where**: `frontend/src/services/api/qrcodes.js` lines 60–76
**Problem**: `localDb.find('fans', f => f.store_id === qr.store_id)[0]` — picks the **first fan** of the store, not the scanning fan.
**Impact**: When a QR is scanned in demo/local mode, points and scan record go to the wrong fan. Only one fan per store is ever credited even if multiple fans scan the same QR.
**Affected demos**: All local demo scans — visible on Fan Center "Scan" tab, Store Owner "Verify" tab.
**Fix**: `scanQrCode(qrCodeId, fanId)` — accept scanning fan as parameter; check it exists and belongs to the store.

## P0-4. Auth Fan-Login Fallback Picks Wrong Fan

**Where**: `frontend/src/stores/authStore.js` lines 228–237
**Problem**: When `fan_logged_in === 'true'` and no `store_manager_current_user` is set, the code falls back to `fans[0]` — the first fan in the database, not the fan who actually logged in via `fan-entry.html`.
**Impact**: Fan sees another fan's profile, points, and history. A privacy/integrity bug.
**Fix**: Persist the fan ID chosen by `fan-entry.html` (`localStorage.setItem('store_manager_current_user', pickedFanId)` or a separate `fan_logged_in_id` key) and read it back here.

---

# P1 — High Priority

## Contrast / Readability

### P1-1. Admin Sidebar: Subtitle & Icons Fail WCAG AA

**Where**: `frontend/src/index.css`
- Line 3389: `.admin-ref-brand-sub { color: rgba(255,255,255,0.36); font-size: 10px; }` — contrast ~2.1:1 on dark sider (needs 4.5:1)
- Line 3406: `.ant-menu-item .ant-menu-item-icon { color: rgba(255,255,255,0.54); }` — contrast ~3.6:1

**Fix**: Bump subtitle to `rgba(255,255,255,0.72)` (≥4.5:1) and icons to `rgba(255,255,255,0.75)`.

### P1-2. Admin Forms: Placeholder & Empty State

**Where**: `frontend/src/index.css`
- Line 642: `.ant-input::placeholder { color: rgba(255,255,255,0.2); }` — invisible
- Line 646: `.ant-empty-description { color: rgba(255,255,255,0.25); }` — nearly invisible
- Line 668: `.ant-modal-close { color: rgba(255,255,255,0.3); }`

**Fix**: Raise to 0.45–0.55 minimum for placeholders on dark cards.

### P1-3. Admin Table Text Marginal

**Where**: `frontend/src/index.css` line 2368
- `.admin-liquid-shell .ant-table-tbody > tr > td { color: rgba(255,255,255,0.74); }` — borderline ~4.5:1 on `rgba(10,15,25,0.64)` row background
- Line 2360: card text 0.9 — OK; but list/typography text 0.74 is the gray secondary class

**Fix**: Raise 0.74 to 0.85, or pin table cell background to solid dark to make 0.74 reliably meet 4.5:1.

### P1-4. Fan Portal: 30+ Low-Contrast Text Rules

**Where**: `frontend/src/index.css`
- Lines 1423, 1433, 1437, 1449, 2060, 2114, 2138, 2145: `rgba(255,255,255,0.12)` to `rgba(255,255,255,0.35)` for labels, units, footer, modal specs

**Impact**: Material units, store activity guidance text, modal category and spec labels are illegible for users with even mild vision impairment.

**Fix**: Map all 0.12–0.35 white-on-dark text rules to ≥0.5 (or 0.65 for body) using `--uwell-text-secondary/tertiary` tokens consistently.

### P1-5. Store Portal: Stat Labels & Dim Text

**Where**: `frontend/src/index.css` lines 1423, 1437
- `.so-stat-label { color: rgba(255,255,255,0.3); font-size: 11px; }`
- `.so-text-dim { color: rgba(255,255,255,0.3) !important; }`

**Fix**: Bump to 0.6 minimum.

### P1-6. Inline JSX Hardcoded Greys

**Where**: Multiple JSX files (Dashboard, FanDetail, EmptyState, ErrorState, MaterialList, ScanCenter, EvalList)
- `#888`, `#999`, `#666`, `#555`, `#ccc` — appear ~15+ times
- `#FFD700` (gold) at 12px size — passes for large text only

**Fix**: Replace with design tokens `--text-secondary` etc. via class names; or accept these for now and add to roadmap.

### P1-7. Hardcoded Chinese in English/Arabic-context Code

**Where**:
- `frontend/src/pages/dashboard/DashboardPage.jsx` lines 911–914: `本周拜访, 本周新增粉丝, 门店总数, 进行中活动, 库存预警` — hardcoded Chinese in dashboard stat chips for admin
- `frontend/src/pages/dashboard/DashboardPage.jsx` lines 1173, 1185, 1199: `'#888'` labels — but strings hardcoded as Chinese in `dash-stat-label` class content
- `frontend/src/services/api/dashboard.js` line 65: garbled encoding `鏁版嵁鐪嬬洏` (mojibake, originally `数据看板`)
- `frontend/src/pages/fans/FanRulesPage.jsx` line 56: `积分` in admin table column header
- `frontend/src/pages/fans/ScanCenterPage.jsx` lines 14, 17, 19, 68, 70: `启用码数`, `发放积分`, `次扫码`

**Impact**: Admin accounts using English/Arabic see Chinese labels mixed with translations. i18n system supports zh/en/ar but these strings bypass `t()`.

**Fix**: Replace with `t('key')` calls. Add missing keys to `translations.js`.

## Typography

### P1-8. Font Sizes Below 12px (30+ instances)

**Where**: `frontend/src/index.css` lines with `font-size: 8px`, `9px`, `10px`
- `.fe-prod-series { font-size: 8px; }` — product series name, tiny
- `.fe-modal-spec-label { font-size: 9px; }` — modal spec value labels, unreadable
- `.so-material-unit { font-size: 10px; }` — material units on store
- `.fe-footer p { font-size: 11px; letter-spacing: 1px; }` — small font + increased letter spacing makes it look even smaller

**Impact**: Fails WCAG accessibility, hard to read especially at 390px mobile.

**Fix**: Minimum 12px for body text. For decorative tiny labels (e.g. 8px product series), keep visual hierarchy but add tooltip on hover/tap.

### P1-9. Decimal Font Size: `9.8px` in Dashboard

**Where**: `.dash-stat-label { font-size: 9.8px; color: rgb(95,107,122); }` on admin mobile — confirmed by Playwright QA showing 17 instances.

**Fix**: Round to `10px` or `11px`, raise color to `rgb(36, 28, 16, 0.78)` for AA contrast.

### P1-10. Barlow Listed But CSS Resolves to Inter

**Where**: `frontend/src/index.css` line 51: `--uwell-font-body: 'Inter', -apple-system, ...`
**Status**: HTML correctly loads Barlow via `<link>` for the body class, but the rest of the app uses Inter as primary. Not a bug per se — but `font-heading: 'Barlow', 'Inter', ...` falls back silently when Barlow isn't selected by a `.font-heading` class.

**Fix**: Pin `--uwell-font-heading` to clearly resolve Barlow when intended, or rename to `--uwell-font-display` to avoid confusion.

### P1-11. CSS `@import` Blocks Render

**Where**: `frontend/src/index.css` line 1: `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');`

**Problem**: The same font is already loaded via `<link rel="stylesheet">` in `index.html`, `fan-app.html`, `store-app.html`. Redundant external request; CSS `@import` is render-blocking.

**Fix**: Remove the `@import` line since HTML loads it with `display=swap`.

## Animation / Motion

### P1-12. Excessive `backdrop-filter` Stacking (38 instances)

**Where**: `frontend/src/index.css` — 38 separate `backdrop-filter` declarations
- Multiple `blur(16px)`, `blur(18px)`, `blur(20px)` on overlapping surfaces
- Admin header `blur(16px)` + admin cards `blur(12px)` + modal `blur(20px)` stacking
- Sidebar `blur(18px)` + menu `blur(...)` cascades

**Impact**: Heavy GPU cost on mobile, frame drops during scroll (e.g. desktop fan-center timeout at 30s during `page.screenshot` "waiting for fonts to load" — likely not font but paint layout).

**Fix**: Audit each — replace `blur(20px)` with `blur(10px)` or solid `rgba(0,0,0,0.7)` background. Avoid stacking more than 2 blur layers in a viewport.

## Backend Bugs

### P1-13. `withFallback` Permanent Mode Switch

**Where**: `frontend/src/services/api/helpers.js` lines 56–57
**Problem**: `_useLocal = true;` sets it permanently for the entire session. Any subsequent API call goes to localDb even if Supabase comes back online.
**Impact**: After one transient Supabase failure, dashboard/scan/fan data is permanently inconsistent.
**Fix**: Add a per-call attempt, or reset `_useLocal` to false on next session, or expose a manual retry.

### P1-14. Hardcoded `USE_TRIAL_LOCAL_*` Flags

**Where**:
- `frontend/src/services/api/dashboard.js` line 10: `const USE_TRIAL_LOCAL_ANALYTICS = true;`
- `frontend/src/services/api/qrcodes.js` line 11: `const USE_TRIAL_LOCAL_SCAN_RECORDS = true;`

**Problem**: Forces local-data paths even in Supabase mode. Dashboard analytics and scan records always come from localDb, never Supabase.
**Impact**: Data inconsistency between what the user sees and what is in the cloud.
**Fix**: Gate by environment variable, or remove the flag.

## Code Quality

### P1-15. Deprecated AntD v6 Props (22 instances)

**Where**:
- `Space direction="vertical"` → `orientation="vertical"` (19 instances):
  - `SStoreDetailPage.jsx` lines 592, 629, 667, 748, 785, 868 (6)
  - `CommunityPage.jsx` lines 149, 166, 198, 225 (4)
  - `SStoreManagementPage.jsx` lines 263, 355, 366, 386 (4)
  - `StoreListPage.jsx` line 515 (1)
  - `FanRulesPage.jsx` lines 85, 90, 95 (3)
  - `AuditLogPage.jsx` — uses `direction=vertical` (1, already fixed in Task-130L per progress note but at AppLayout audit we still found in scan)
- `Alert message=` → `title=` (3 instances):
  - `DashboardPage.jsx` line 903
  - `LoginPage.jsx` line 73
  - `AuditLogPage.jsx` line 141

**Impact**: Console deprecation warnings (not captured by our QA on first render but will appear after AntD initializes). Future AntD update will break.

**Fix**: Global find/replace; safe, low risk. Add a CI lint rule to catch new instances.

---

# P2 — Medium Priority

## Contrast

### P2-1. Fan Store Modal Labels Below 0.35

**Where**: `frontend/src/index.css` line 2145 (`.fe-modal-spec-label` 0.25) and 2138 (`.fe-modal-category` 0.25)
**Fix**: Bump to 0.5.

### P2-2. Fan Entry/Footer: 0.12 Opacity

**Where**: `frontend/src/index.css` line 2114 (`.fe-footer p { color: rgba(255,255,255,0.12); }`)
**Fix**: Bump to 0.4 minimum, or use solid low-contrast token.

### P2-3. Leaflet Attribution Below 11px

**Where**: Map attribution text in `DashboardPage.jsx` — 10.5px font on `rgb(31,26,18)` bg
**Note**: Third-party Leaflet, but rendered text triggers our 12px threshold.
**Fix**: Acceptable for now; add CSS `.leaflet-attribution-flag { font-size: 11px; }`.

### P2-4. AntD Form Helper Text

**Where**: `.ant-form-item-extra` color in `index.css` line 1746 — `rgba(36,28,16,0.64)` after Task-130L is OK on light card; verify contrast on dark cards in other portals.

## Typography

### P2-5. Font-Heading Token Disconnect

**Where**: `--uwell-font-heading: 'Barlow', 'Inter', ...` vs `--uwell-font-body: 'Inter', ...` — inconsistent naming.
**Fix**: Either rename to `--uwell-font-display` for clarity, or apply globally.

### P2-6. `font-display: swap` Dependency

**Where**: External Google Fonts request — falls back to system on slow network, but no offline fallback font defined.
**Fix**: Define system font stack explicitly via `--uw-font-fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.

## Animation / Motion

### P2-7. `prefers-reduced-motion` Incomplete

**Where**: Only 5 `@media (prefers-reduced-motion: reduce)` blocks exist. `@keyframes pulse` (line 876), `@keyframes shimmer` (line 877), and several `transition: all 0.3s` rules are not covered.
**Fix**: Add global rule at top of CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

### P2-8. Font-Weight 900 Used Liberally

**Where**: Bold/Black weights in admin shell (`b { color: rgba(255,255,255,0.82); font-size: 13px; }`) and elsewhere; combined with `letter-spacing: 0.08em` causes wide-form letterforms on small text.
**Fix**: Audit `font-weight: 800/900` usages; ensure they have ≥16px font size to render properly.

## Backend Bugs

### P2-9. `localDb.transaction()` Full Snapshot

**Where**: `frontend/src/services/db/localDb.js` lines 192–204
**Problem**: Loads all 46 tables as JSON snapshots before each transaction, regardless of which tables are touched. With ~1000 records/table this becomes several MB of JSON parse/stringify per transaction.
**Fix**: Build a per-table snapshot lazily inside `transaction(cb)` — only snapshot tables touched via the `txnDb` proxy.

### P2-10. Fan Profile Created Without RLS Check

**Where**: `frontend/src/stores/authStore.js` lines 211–222 — `localDb.insert('fans', {...})` on init creates a fan row with `user_id: savedProfileId` regardless of RLS being enforced on Supabase side.
**Impact**: In Supabase mode, this local-insert call won't actually persist (RLS denies). But the local state still claims `isAuthenticated: true`. User reaches admin routes without a real fan record.
**Fix**: Only insert when `isLocal()` returns true; in Supabase mode, wait for fetched profile.

### P2-11. Empty Fan Profile Fallback

**Where**: Same file, line 223: `const fallbackFan = { id: savedProfileId, role: 'fan', name: 'UWELL Fan', phone: '', avatar: '' };` — generic fallback fan without distinguishing marks. Multiple anonymous fans would all show as "UWELL Fan".
**Fix**: Use fan-entry email or stored name to create identifiable fallback.

## Code Quality

### P2-12. Console Statements in Production

**Where**: 5 `console.log/error/warn` calls in production JSX (FanEntryPage, ErrorBoundary, ScanTab, authStore).
**Fix**: Use a thin logger wrapper that disables in production.

### P2-13. Monolithic CSS (22,680 lines)

**Where**: `frontend/src/index.css`
**Note**: Historical growth with each fix batch. Hard to navigate.
**Fix**: Defer; not urgent. Optional split by domain.

## Theme Consistency

### P2-14. Brand Colors Inconsistent

**Where**:
- `#FFD700` (gold) used in DashboardPage.jsx, FanEntryPage, etc.
- `#ccff00` (neon green) used in DashboardPage stat chips
- `#722ed1` (purple), `#1677ff` (blue) used as alternative stat colors
- `#FFD700` vs `--uw-brand-gold` vs `--uwell-gold` — three CSS vars for "gold"

**Impact**: Multiple shades of "brand gold" across the app. Inconsistent visual identity.

**Fix**: Resolve to single token `--uw-brand-accent` and ensure all hardcoded colors come from it.

### P2-15. Light/Dark Mix Without Clear Boundary

**Where**:
- Admin: light shell + dark sider + dark cards + white descriptions
- Fan: light theme (yellow-green) but dark modals
- Store: dark theme but light subpages

**Impact**: Inconsistent perception of "what each portal is for".

**Fix**: Pin theme per portal explicitly. Pick one direction.

## i18n / RTL

### P2-16. Hardcoded Arabic Strings in StoreOwnerPage

**Where**: `frontend/src/pages/store-owner/StoreOwnerPage.jsx` — 279 hardcoded English strings + a local `AR` map (not in `translations.js`).
**Impact**: Store portal advertises AR/RTL support, but hardcoded strings won't translate.

**Fix**: Move to `translations.js` (already has 1014 keys per progress).

### P2-17. `Body [dir=rtl]` Set, CSS Partial

**Where**: `frontend/src/stores/languageStore.js` sets `body.dataset.direction = 'rtl'` for AR; `index.css` has 20 RTL-specific rules covering only admin-review-action-ladder, fan-shell, store-feedback-row etc.
**Impact**: Switching to AR works for some areas; margins/paddings on untranslated areas break.

**Fix**: Add global RTL flip rules via `html[dir=rtl] * { text-align: inherit; }` and component-specific margin/padding flips.

---

# P3 — Low Priority

### P3-1. Redundant Scrollbar CSS
`index.css` lines 86–99 vs `index.html` inline 44–46 — both define dark-theme scrollbar. Only one wins; the other is dead.
**Fix**: Pick one location.

### P3-2. Map Library Attribution
Leaflet attribution at 10.5px font is below 12px threshold; consider accepting per vendor standard.
**Fix**: Optional.

### P3-3. FOUC on Admin (Body Black Background)
`index.html` line 40: `body { background: #000000; }` initial state. Admin shell is light. Flash of black before render.
**Fix**: Set body background to match the most common initial portal (admin cream or fan light).

### P3-4. `validateStatus` Patterns
Some forms use AntD default validation without explicit rules.
**Fix**: Audit forms in UserManagementPage, CampaignCreatePage etc.

### P3-5. Empty Filter Value Handling
Various filter inputs don't trim or handle null. Minor data quality.

---

# Optimization Plan (Sequenced Batches)

Per project rules (no rebuild, no DB/API/permission changes, UI subtraction not addition, impact analysis before changes), I propose the following batches. **Each batch is small, reversible, and contains its own QA gate.**

## Batch 1: P0 Backend Bugs (highest data integrity risk)
1. **P0-2** Fix `IS_LOCAL_MODE` static export — replace with `isLocal()` getter
2. **P0-3** Fix `scanQrCode` to accept fanId parameter
3. **P0-4** Fix fan-login fallback to use persisted fan ID
4. **P1-13** Add per-call Supabase retry to `withFallback` (toggle, not permanent)
5. **P1-14** Gate `USE_TRIAL_LOCAL_*` flags by env var
6. **P2-9** Optimize `localDb.transaction()` to lazy snapshot

**Impact**: Data correctness across fan flow
**Files**: `services/api/dashboard.js`, `services/api/helpers.js`, `services/api/qrcodes.js`, `services/api/fans.js`, `stores/authStore.js`, `services/db/localDb.js`
**Risk**: Low; careful with backward compat in `scanQrCode` callers
**Verification**: After each fix, run focused API tests + admin/fan/store manual flow; check that scanned QR credits correct fan

## Batch 2: AntD Deprecation Cleanup (low risk, high cleanup)
1. **P1-15** Replace `Space direction="vertical"` → `orientation="vertical"` in 6 files
2. Replace `Alert message=` → `title=` in 3 files
3. Add ESLint rule to prevent regression

**Impact**: Clean console, future-proof AntD
**Files**: 6 page files (listed above)
**Risk**: Very low (mechanical)
**Verification**: Browser QA across affected pages; check console for warning disappearance

## Batch 3: Theme Surface Coherence (admin light direction)
1. **P0-1** Make admin shell + all cards light + dark sider together; OR push everything dark. Recommendation: light shell + light cards (consistent with Task-130L direction) + dark sider
2. Add explicit light surface tokens: `--uw-admin-bg`, `--uw-admin-card`, `--uw-admin-card-head`
3. Update `.admin-liquid-shell` selector set

**Impact**: Visual hierarchy and brand consistency
**Files**: `index.css`, possibly `AppLayout.jsx`
**Risk**: Medium (large selector cascade)
**Verification**: 390x844 + 1151x698 QA across dashboard, stores, settings, reviews

## Batch 4: Contrast Pass (UI subtraction only)
1. **P1-1** Bump sidebar subtitle 0.36 → 0.72
2. **P1-2** Bump admin placeholder 0.2 → 0.5
3. **P1-3** Bump table cell text 0.74 → 0.85 (light cards) or pin table bg solid
4. **P1-4** Bump all `rgba(255,255,255, 0.12-0.35)` in fan portal to 0.55+
5. **P1-5** Bump store portal `.so-stat-label`, `.so-text-dim`
6. **P1-6** Replace inline `#888/#999` JSX with token class names

**Impact**: WCAG AA compliance
**Files**: `index.css` rules + ~15 JSX files for inline greys
**Risk**: Low; pure CSS/JSX color value changes
**Verification**: Playwright contrast re-audit; check mobile and desktop

## Batch 5: Typography Floor (12px minimum)
1. **P1-8** Raise all `font-size: 8px/9px/10px` to `11px` minimum (decorative text can stay smaller, requires audit per case)
2. **P1-9** Round `.dash-stat-label` 9.8px → 11px
3. **P1-11** Remove CSS `@import` for Instrument Serif (already loaded in HTML)

**Impact**: Readability, accessibility
**Files**: `index.css` ~30 rules, `DashboardPage.jsx`
**Risk**: Visual reflow; check no layouts break
**Verification**: Mobile QA at 390x844

## Batch 6: i18n / RTL Real Coverage
1. **P1-7** Move hardcoded Chinese dashboard labels to translations
2. **P2-16** Move 279 hardcoded StoreOwnerPage strings to translations
3. **P2-17** Add global RTL margin/padding flips

**Impact**: Full zh/en/ar coverage, RTL production-ready
**Files**: `pages/dashboard/DashboardPage.jsx`, `pages/store-owner/StoreOwnerPage.jsx`, `utils/translations.js`
**Risk**: Low; manual translation review needed
**Verification**: Language switch test, RTL layout check at 390x844

## Batch 7: Animation / Motion Performance
1. **P1-12** Audit 38 `backdrop-filter` instances; reduce blur radius (12 → 8, 20 → 12) and replace deep blurs with solid backgrounds
2. **P2-7** Add global `prefers-reduced-motion` rule
3. Verify `desktop-fan-center` no longer hits `page.screenshot` 30s timeout

**Impact**: Mobile GPU relief, accessibility for motion-sensitive users
**Files**: `index.css`
**Risk**: Low; visual quality may reduce slightly (acceptable per design docs "operations console")
**Verification**: Mobile scroll FPS, screenshot time check

## Batch 8: P3 Housekeeping (when time permits)
- P3-1 redundant scrollbar
- P3-3 FOUC body background
- P2-12 logger wrapper for production
- P3-4 validateStatus patterns

---

## Implementation Order Recommendation

**This week (highest ROI)**:
- Batch 1 (P0 backend bugs) — data integrity
- Batch 2 (AntD cleanup) — easy wins

**Next**:
- Batch 3 (theme coherence) — visible UI win
- Batch 4 (contrast pass) — accessibility

**Then**:
- Batch 5 (typography)
- Batch 7 (animation)
- Batch 6 (i18n/RTL)
- Batch 8 (P3)

---

## Out of Scope (Acknowledged Not-Covered)

- `seedData.js` content review (26 tables of seed data) — not scanned for data quality
- Supabase RLS policies — not in this repo
- Service worker / PWA manifest — `sw.js` not reviewed
- Build performance (chunk warnings mentioned in progress) — not re-verified
- Full E2E flow test (click-through every page) — only viewport-level scan

---

**Next step**: Confirm Batch 1 scope and impact analysis, then start. Each batch will report back to `PROGRESS.md` per the project's required workflow.
