# Store Auth and S-Level Reward Redemption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build email/password Store owner entry, S-level-only Fan reward pickup, and a focused modal readability hardening pass.

**Architecture:** Keep the first implementation local-preview compatible while aligning with strict Supabase RLS. Put reward pickup validation in a small utility module so UI, tests, and future RPC/Edge Function work use the same state names and failure reasons. Add Store Center pickup UI after Fan redemption records carry status and expiry fields.

**Tech Stack:** React, TypeScript-style JSX project conventions, Ant Design 6, Vitest, localStorage localDb, Supabase API helpers.

## Global Constraints

- Use TypeScript conventions where new logic is introduced; current source files are JSX/MJS and should follow existing file style.
- Tests use Vitest and run with `npm test`.
- Do not install dependencies.
- Do not edit `.env`.
- Function names use camelCase and file names use kebab-case for new files.
- Keep the PR scoped and avoid unrelated refactors.

---

### Task 1: Store Entry Email and Password Cleanup

**Files:**
- Modify: `frontend/src/pages/store-owner/StoreEntryPage.jsx`
- Modify: `frontend/src/pages/store-owner/StoreEntryPage.static.test.mjs`

**Interfaces:**
- Consumes: `useAuthStore().signIn(email, password)`
- Produces: Store login UI with Email / Password and Store registration UI without required contact person.

- [ ] **Step 1: Write failing static tests**

Add assertions that `StoreEntryPage.jsx` contains `Owner email *`, `Password *`, `placeholder="Email"`, `placeholder="Password"`, and does not require `contact` in registration validation.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/store-owner/StoreEntryPage.static.test.mjs`

- [ ] **Step 3: Implement UI and validation**

Rename state/handlers from mixed Store ID/phone login to email/password while preserving local fallback behind non-email demo behavior if needed. Registration should require store name, owner email, password, phone, country, city.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/pages/store-owner/StoreEntryPage.static.test.mjs`

### Task 2: Reward Redemption Records and Business Rules

**Files:**
- Create: `frontend/src/utils/reward-redemption.js`
- Create: `frontend/src/utils/reward-redemption.test.mjs`
- Modify: `frontend/src/pages/fans/tabs/MallTab.jsx`
- Modify: `frontend/src/pages/fans/tabs/MallTab.static.test.mjs`

**Interfaces:**
- Produces: `createPendingRedemption({ fan, item, code, now })`
- Produces: `validateRewardPickup({ redemption, store, inventoryItem, now })`
- Produces: `confirmRewardPickup({ localDb, redemption, store, inventoryItem, pickedUpBy, now })`

- [ ] **Step 1: Write failing utility tests**

Cover pending redemption creation, S-level success, non-S rejection, used-code rejection, expired-code rejection, and insufficient stock rejection.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/utils/reward-redemption.test.mjs`

- [ ] **Step 3: Implement utility module**

Implement status constants, 7-day expiry, validation messages, transactional localDb update, and negative inventory movement.

- [ ] **Step 4: Update Fan Rewards**

Use `createPendingRedemption` so Fan redemption records include `pending_pickup`, `expires_at`, and S-level pickup copy.

- [ ] **Step 5: Run focused tests**

Run: `cd frontend && npx vitest run src/utils/reward-redemption.test.mjs src/pages/fans/tabs/MallTab.static.test.mjs`

### Task 3: Store Center Reward Pickup

**Files:**
- Modify: `frontend/src/pages/store-owner/StoreOwnerPage.jsx`
- Modify: `frontend/src/pages/store-owner/StoreOwnerPage.static.test.mjs`

**Interfaces:**
- Consumes: `validateRewardPickup`
- Consumes: `confirmRewardPickup`
- Produces: Store owner `Reward Pickup` tab/action that accepts a redemption code.

- [ ] **Step 1: Write failing static tests**

Assert Store Owner page imports reward redemption utilities, exposes `Reward Pickup`, checks S-level eligibility, and calls `confirmRewardPickup`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/store-owner/StoreOwnerPage.static.test.mjs`

- [ ] **Step 3: Implement Store pickup tab**

Add code input, lookup, clear validation states, success/failure messages, and S-level-only confirmation.

- [ ] **Step 4: Run focused tests**

Run: `cd frontend && npx vitest run src/pages/store-owner/StoreOwnerPage.static.test.mjs src/utils/reward-redemption.test.mjs`

### Task 4: Secondary Modal Readability Hardening

**Files:**
- Modify: `frontend/src/index.css`
- Create or modify: relevant static test for modal hardening if an existing CSS/static test is available.

**Interfaces:**
- Produces: Stable light modal/select/input surfaces for Admin secondary and tertiary pages.

- [ ] **Step 1: Write failing style test**

Add a static assertion for a shared class/scope such as `.admin-liquid-shell .ant-modal-content`, `.ant-modal .ant-select-selector`, and `.ant-modal-footer`.

- [ ] **Step 2: Run test to verify it fails**

Run the relevant static test with Vitest.

- [ ] **Step 3: Implement CSS hardening**

Add scoped modal/select/input/footer overrides that keep modal content readable without changing `.env` or dependencies.

- [ ] **Step 4: Verify with tests and browser**

Run focused tests, then use the open browser flow to inspect the Materials Add modal.

### Task 5: Full Verification

**Files:**
- No new feature files unless tests reveal an issue.

- [ ] **Step 1: Run complete tests**

Run: `cd frontend && npm test`

- [ ] **Step 2: Run production build**

Run: `cd frontend && npm run build`

- [ ] **Step 3: Summarize remaining risks**

Record whether external Supabase Edge Function/RPC work remains for production registration and pickup transactions.

