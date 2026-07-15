# UWELL CRM Dirty Working Tree Audit

Date: 2026-07-15

## Purpose

This document classifies the current uncommitted working tree so future work does not accidentally continue from rejected experiments, temporary artifacts, or mixed UI changes.

No code, database, or page behavior is changed by this audit.

## Which Version Is This?

### Safe committed baseline

```text
Branch: codex/uwell-trial-ops-sync
Commit: eb87aaea5c9c8c481c5940e7caa41388d8e16ec4
Short: eb87aae
Commit date: 2026-07-09 16:29:55 +0800
Commit subject: 优化粉丝活动展示内容
```

### Version meaning

This is the latest committed trial-operations mainline.

Main characteristics:

- Three portals exist: Fan App, Store App, Admin/Manager/Field Ops.
- Fan activity display was simplified after the Knowledge Hub / activity-task pass.
- Store-created activities and fan-visible activity logic had already been worked on in prior commits.
- Reward redemption, S-level pickup verification, local/Supabase fallback, and trial accounts had already been developed in previous sealed commits.
- It is the best committed baseline for continuing work.

### Local working tree

The current local working tree is **not a clean version**.

It contains:

- 73 modified tracked files.
- 11,844 insertions and 3,747 deletions in tracked files.
- Many untracked docs, tests, preview files, admin-ops files, assets, and patches.
- Large UI/style changes after the committed baseline.

Decision:

- Treat `eb87aae` as the safe baseline.
- Treat the current local working tree as an unreviewed mixed work state.
- Do not commit, revert, or continue from all uncommitted changes as one batch.

## High-level Status

| Category | Status | Decision |
|---|---|---|
| Current branch | Valid | Keep using `codex/uwell-trial-ops-sync` |
| Latest committed baseline | Valid | `eb87aae` is the safe baseline |
| Modified tracked files | High risk | Must review by group before keeping |
| Untracked docs | Useful | Keep after review |
| Untracked preview fan page | Experimental/rejected direction | Do not use as product baseline |
| Untracked admin-ops files | Potentially useful | Review separately before keeping |
| Design preview | Visual reference only | Do not use as app baseline |
| Root/manual patches | Reference only | Do not apply automatically |
| Temporary scripts/assets | Needs classification | Do not delete without confirmation |

## Modified Tracked Files

The following tracked files are modified from `eb87aae`.

### Highest-risk changes by size

| File | Approx change | Risk |
|---|---:|---|
| `frontend/src/index.css` | +6452 / -2157 | Very high. Global UI changes can affect all portals. |
| `frontend/src/pages/store-owner/StoreOwnerPage.jsx` | +949 / -68 | High. Store app behavior and UI likely changed heavily. |
| `frontend/src/pages/dashboard/DashboardPage.jsx` | +476 / -76 | High. Backend dashboard behavior/UI changed. |
| `frontend/src/pages/visits/VisitCreatePage.jsx` | +410 / -101 | High. Field visit workflow affected. |
| `frontend/src/pages/stores/StoreListPage.jsx` | +312 / -156 | High. Store management and exposure/review may be affected. |
| `frontend/src/pages/evaluation/EvalCreatePage.jsx` | +200 / -213 | High. Store rating workflow affected. |
| `frontend/src/pages/fans/tabs/ScanTab.jsx` | +219 / -88 | High. Fan scan logic affected. |
| `frontend/src/pages/stores/StoreDetailPage.jsx` | +200 / -77 | Medium/high. Store detail and exposure logic affected. |
| `frontend/src/pages/visits/VisitListPage.jsx` | +261 / -5 | Medium/high. Visit records affected. |
| `frontend/src/pages/fans/tabs/CommunityTab.jsx` | +167 / -19 | Medium/high. Fan community behavior affected. |

### Modified functional areas

| Area | Files | Initial decision |
|---|---|---|
| Entry HTML | `fan-app.html`, `store-app.html`, `index.html`, `public/uwell-fan-login.html` | Review before keeping |
| Routing | `src/App.jsx`, `src/fan/App.jsx`, `src/store/App.jsx` | High-risk; routes affect portal separation |
| Shared UI | Empty/Error/Language/PageTransition/Counter/DeviceContext | Review; may be useful but should not drive product direction |
| Global style | `src/index.css`, `styles/animations.css` | Very high-risk; likely source of mixed UI |
| Admin layout | `AppLayout.jsx`, tests | Review against RBAC and IA |
| Fan pages | Fan entry, login, fan tabs, fan rules, complaint reply | Review feature-by-feature |
| Store pages | Store entry and owner page | Review carefully; store app was a later priority |
| Backend pages | Dashboard, campaigns, evaluation, materials, settings, stores, visits | Review by module |
| API/data | fans API, helpers, visits API, localDb, seedData | Database/API impact; must not keep blindly |
| Auth/language | authStore, languageStore, translations | Review because language/RBAC rules matter |
| Utilities | constants, reward-redemption, closed-loop, role access | Review against business rules |

## Untracked Files And Folders

### New governance docs

Files:

- `docs/00_PROJECT_VISION.md`
- `docs/01_PRODUCT_BIBLE.md`
- `docs/02_PRD.md`
- `docs/03_USER_FLOW.md`
- `docs/04_INFORMATION_ARCH.md`
- `docs/05_DATABASE.md`
- `docs/06_API.md`
- `docs/07_RBAC.md`
- `docs/08_DESIGN_SYSTEM.md`
- `docs/09_BUSINESS_RULES.md`
- `docs/10_AI_RULES.md`
- `docs/11_TASK_TEMPLATE.md`
- `docs/12_TEST_CASE.md`
- `docs/13_CODE_REVIEW.md`
- `docs/14_VERSION_BASELINE.md`
- `docs/CHANGELOG.md`
- `docs/ROADMAP.md`

Decision:

- Keep.
- These are the new project road-map and AI collaboration baseline.
- They do not affect runtime.

### Existing planning specs and plans

Files under:

- `docs/superpowers/specs`
- `docs/superpowers/plans`

Decision:

- Keep as planning/reference material.
- Do not treat specs as implemented truth unless current code confirms it.
- Use docs 00-15 as the entry point, and use these specs as detailed references.

### Fan preview experiment

Folder:

```text
frontend/src/pages/preview
```

Files:

- `FanPreviewPage.jsx`
- `fan-preview.css`
- `fan-preview-data.js`
- `FanPreviewPage.static.test.mjs`

Decision:

- Experimental only.
- Do not use as the real fan app baseline.
- Do not migrate this wholesale into production.
- It can be referenced for visual direction only after checking against real old fan functions.

Reason:

- The user explicitly rejected this direction because it removed/confused old real functions and became a disconnected preview.

### Admin ops untracked module

Folder:

```text
frontend/src/pages/admin-ops
```

Files include:

- `OperationalRulesPage.jsx`
- `ReviewsPage.jsx`
- `RewardsOpsPage.jsx`
- `RiskCenterPage.jsx`
- `ScanCodesPage.jsx`
- `admin-ops-workflows.js`
- related tests

Decision:

- Potentially useful.
- Must be reviewed separately against `02_PRD.md`, `07_RBAC.md`, and `09_BUSINESS_RULES.md`.
- Do not assume these are correct production modules until their routes, permissions, data sources, and UI are audited.

### New test files

Examples:

- `EmptyState.static.test.mjs`
- `ErrorState.static.test.mjs`
- `LanguageSwitcher.static.test.mjs`
- `FanRulesPage.operational-boundary.test.mjs`
- `MapTab.exposure.static.test.mjs`
- `StoreOwnerPage.operations.test.mjs`
- `StoreOwnerPage.reward-pickup.test.mjs`
- `MaterialStocksPage.region-access.static.test.mjs`
- `localDb.schema.static.test.mjs`
- `uwellClosedLoop.static.test.mjs`

Decision:

- Potentially useful.
- Keep for now.
- Before commit, run targeted tests and remove tests that lock rejected preview behavior.

### New utility rule files

Files:

- `frontend/src/utils/fanPointsRules.js`
- `frontend/src/utils/fanPointsRules.test.mjs`
- `frontend/src/utils/uwellLaunchRules.js`
- `frontend/src/utils/uwellLaunchRules.test.mjs`

Decision:

- Potentially useful, but must be reviewed against `09_BUSINESS_RULES.md`.
- Do not allow duplicate business-rule implementations.
- If kept, rules must become the single shared source or be refactored into the existing rule source.

### Design preview and assets

Folders:

- `design-preview`
- `frontend/public/uwell-assets`

Decision:

- Visual/reference assets only.
- Do not let these folders define business logic.
- Assets can be used later only after UI placement is confirmed.

### Temporary/tool artifacts

Files/folders:

- `.workbuddy`
- `frontend/gen_audit.py`
- `DESIGN-AUDIT-REPORT.md`
- `manual-upload/store-manager-v20260705_03ee776.patch`
- `manual-upload/store-manager-v20260705_a04915d.patch`

Decision:

- Reference or temporary.
- Do not include in product commits unless explicitly needed.
- Do not delete without user confirmation.

## Recommended Classification

### Keep Immediately

- `docs/00_PROJECT_VISION.md`
- `docs/01_PRODUCT_BIBLE.md`
- `docs/02_PRD.md`
- `docs/03_USER_FLOW.md`
- `docs/04_INFORMATION_ARCH.md`
- `docs/05_DATABASE.md`
- `docs/06_API.md`
- `docs/07_RBAC.md`
- `docs/08_DESIGN_SYSTEM.md`
- `docs/09_BUSINESS_RULES.md`
- `docs/10_AI_RULES.md`
- `docs/11_TASK_TEMPLATE.md`
- `docs/12_TEST_CASE.md`
- `docs/13_CODE_REVIEW.md`
- `docs/14_VERSION_BASELINE.md`
- `docs/15_DIRTY_WORKING_TREE_AUDIT.md`
- `docs/CHANGELOG.md`
- `docs/ROADMAP.md`

### Keep As Reference Only

- `design-preview`
- `docs/superpowers/specs`
- `docs/superpowers/plans`
- bundle files
- manual upload patches
- `.bak` files
- `output`

### Needs Focused Review Before Keeping

- All modified tracked frontend files.
- `frontend/src/pages/admin-ops`
- new test files under `frontend/src`
- `frontend/src/utils/fanPointsRules.js`
- `frontend/src/utils/uwellLaunchRules.js`
- `frontend/public/uwell-assets`

### Do Not Use As Baseline

- `frontend/src/pages/preview`
- `design-preview`
- root backup folders
- bundle archives
- manual upload folders

## Risk Assessment

### Product risk

High. The working tree mixes accepted product work, rejected fan preview work, broad UI changes, and backend/admin additions.

### UI risk

Very high. `frontend/src/index.css` has the largest diff and may affect all pages globally.

### Database risk

Medium/high. `localDb.js`, `seedData.js`, `seedData.test.mjs`, and rule utilities changed. These must be checked before keeping.

### Permission risk

Medium/high. `AppLayout.jsx`, `uwellRoleAccess.js`, `authStore.js`, admin-ops files, and settings/user management changed.

### Maintenance risk

High. Many changed files cross all three portals, making it unsafe to accept all changes as one unit.

## Recommended Next Action

Do **not** continue feature development yet.

Next task should be:

```text
Task-003: Choose Cleanup Strategy
```

Recommended strategy:

1. Preserve docs 00-15.
2. Treat `eb87aae` as code baseline.
3. Review uncommitted code by module, not as one batch.
4. First classify fan-related modified files into:
   - keep old function improvements
   - reject preview/new-shell experiment
   - defer store/admin changes
5. Only after classification, start a focused fan app upgrade plan.

## Suggested Cleanup Order

1. Documentation files: keep.
2. Preview fan experiment: quarantine/reference only.
3. Global CSS: review first before any UI work.
4. Fan real modules: compare against old function requirements.
5. Store/admin modified files: freeze until fan baseline is stable.
6. Database/API/rules: review only when a task needs them.

