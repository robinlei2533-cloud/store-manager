# UWELL CRM Initial Launch Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the confirmed fan, store, and admin specs into a local first-launch preview where the core journeys, rules, navigation, and operational modules are clear enough for stakeholder review.

**Architecture:** Keep the existing React/Vite/Ant Design structure and localDb demo mode. Add one small shared rules utility with tests, then update the three main portals without introducing new dependencies.

**Tech Stack:** React 19, Vite, Ant Design, Zustand, TanStack Query, Vitest, localStorage/localDb demo data.

## Global Constraints

- Default language is English.
- Arabic is the only second language and must support RTL-ready copy/layout hooks.
- Do not install new dependencies.
- Do not edit `.env`.
- Use existing JSX structure for current files; add small tested utilities instead of large rewrites.
- Fixed logic: stores verify only; the system awards points.
- Fixed logic: reward redemption deducts available points but never lifetime growth points.
- Fixed logic: backend login has no public registration; only Admin creates Manager/Rep accounts.
- Fixed logic: region-based access controls are required for warehouse and field data.

---

### Task 1: Shared Launch Rules

**Files:**
- Create: `frontend/src/utils/uwellLaunchRules.js`
- Create: `frontend/src/utils/uwellLaunchRules.test.mjs`

**Interfaces:**
- Produces: `isValidBusinessEmail(email)`, `getFanLevel(lifetimePoints)`, `getNextFanLevel(lifetimePoints)`, `classifyScanResult(input)`, `scoreStoreRating(input)`, `canRoleCreateStaff(role)`, `canViewWarehouse(role, assignedRegion, warehouseRegion)`, `getRewardDecision(fan, reward)`.

- [ ] Write failing Vitest tests for email validation, fan level thresholds, unique-code scan limits, store scoring, role staff creation, warehouse region visibility, and reward redemption decisions.
- [ ] Implement the smallest utility functions needed for the tests.
- [ ] Run `npm test -- src/utils/uwellLaunchRules.test.mjs`.

### Task 2: Fan Portal Initial Launch UI

**Files:**
- Modify: `frontend/src/pages/fans/FanCenterPage.jsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/pages/fans/FanCenterPage.static.test.mjs`

**Interfaces:**
- Consumes: `getFanLevel`, `getNextFanLevel`, `classifyScanResult`, `getRewardDecision`.
- Produces: fixed fan nav labels `Home / Activities / Community / Rewards / Stores / Me`, a simplified Home, two-tab Activities, reward image slots, Me entries for Invite and Existing Fan Verification.

- [ ] Add/update static tests for required nav labels and banned fallback copy.
- [ ] Update the fan center nav and Home structure.
- [ ] Add concise activity, reward, store, community, and Me sections using existing local data.
- [ ] Add CSS for fixed nav, short-card layout, yellow-green game growth visual, reward image placeholders, and RTL-safe spacing.
- [ ] Run fan static tests.

### Task 3: Store Portal Initial Launch UI

**Files:**
- Modify: `frontend/src/pages/store-owner/StoreOwnerPage.jsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/pages/store-owner/StoreOwnerPage.static.test.mjs`

**Interfaces:**
- Consumes: `scoreStoreRating`.
- Produces: store nav `Home / Verify / Activities / Me`, exposure metrics, photo reminders, store verification copy, official/store campaign tabs, and no manual point issuing.

- [ ] Add/update static tests for store nav, verify-only wording, store photo wording, and campaign cost reminder.
- [ ] Update the store landing layout with Home/Verify/Activities/Me.
- [ ] Add storefront photo and display photo reminders in Home and Me.
- [ ] Add scan/manual verification UI copy that confirms system-awarded points.
- [ ] Run store static tests.

### Task 4: Admin / Field Ops Initial Launch UI

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/layout/AppLayout.jsx`
- Modify: `frontend/src/pages/dashboard/DashboardPage.jsx`
- Create: `frontend/src/pages/admin-ops/ReviewsPage.jsx`
- Create: `frontend/src/pages/admin-ops/RiskCenterPage.jsx`
- Create: `frontend/src/pages/admin-ops/RewardsOpsPage.jsx`
- Create: `frontend/src/pages/admin-ops/ScanCodesPage.jsx`
- Modify: existing static tests or add targeted static tests.

**Interfaces:**
- Consumes: `canRoleCreateStaff`, `canViewWarehouse`, `scoreStoreRating`.
- Produces: backend nav modules `Dashboard / Stores / Fans / Campaigns / Rewards / Scan Codes / Materials / Field Visits / Reviews / Risk Center / Settings`, segmented dashboard, account creation only under Admin Settings.

- [ ] Add routes and sidebar entries for Reviews, Risk Center, Rewards, and Scan Codes.
- [ ] Ensure Manager and Rep cannot see staff account creation entry.
- [ ] Add lightweight pages with review queues, risk categories, reward governance, and scan-code rules.
- [ ] Add dashboard launch sections for fan, store, field visit, verification, and warehouse alerts.
- [ ] Run admin static tests.

### Task 5: Verification And Preview

**Files:**
- No production file edits unless verification exposes a bug.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start or reuse local preview server.
- [ ] Provide links for fan entry, fan center, store login, store owner, admin login, and admin dashboard/modules.
