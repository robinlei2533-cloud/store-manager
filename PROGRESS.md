# UWELL CRM Project Progress

Last updated: 2026-07-09

## Project Positioning

This project is the UWELL CRM trial-operations MVP for three connected portals:

- Fan portal: consumer-facing, English-first.
- Store portal: store-owner-facing, English-first.
- Admin / manager / field-rep portal: internal operations, Chinese-first.

The product goal is not a simple demo. It is intended to become a trial-ready operating system for fan growth, store operations, field visits, campaign execution, material inventory, complaints, and city-based store/fan data.

Current stage: local trial MVP / pre-public-launch refinement.

Estimated completion:

- Trial MVP completion: about 75%.
- Public production launch readiness: about 45%.

## Current Real Project

Primary project path:

`C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm`

Frontend path:

`C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend`

Active branch:

`codex/uwell-trial-ops-sync`

GitHub repository:

`https://github.com/robinlei2533-cloud/store-manager`

Latest important commits:

- `03ee776 add trial ops supabase alignment migration`
- `a04915d fix admin settings readability`
- `03ca7d2 fix remaining low contrast text surfaces`
- `69350c7 refine typography and contrast system`
- `775705a checkpoint ui motion refinement`

GitHub status:

- Branch `codex/uwell-trial-ops-sync` has been pushed successfully to GitHub.
- PR URL provided by GitHub:
  `https://github.com/robinlei2533-cloud/store-manager/pull/new/codex/uwell-trial-ops-sync`

Supabase status:

- Supabase remote project was updated successfully.
- Migration `20260704_trial_ops_alignment.sql` is now present both locally and remotely.
- Final migration check showed:
  - local: `20260704`
  - remote: `20260704`

## Local URLs

Use local Vite dev server:

`http://127.0.0.1:5173/`

Important routes:

- Fan entry:
  `http://127.0.0.1:5173/fan-app.html#/fan-entry`
- Fan center:
  `http://127.0.0.1:5173/fan-app.html#/fan-center`
- Store login:
  `http://127.0.0.1:5173/store-app.html#/store-login`
- Store owner center:
  `http://127.0.0.1:5173/store-app.html#/store-owner`
- Admin login:
  `http://127.0.0.1:5173/index.html#/admin`
- Admin dashboard:
  `http://127.0.0.1:5173/index.html#/app/dashboard`

Known local demo accounts:

- Admin: `admin@uwell.com` / `admin`
- Store: store ID `s-real-001`, phone `504875886`

## Completed Work

### Fan Portal

- Fan entry page redesigned around the approved premium white UWELL Fans Club direction.
- Main title uses `Uwell Fans Club`.
- Subtitle direction uses `I Wish You Well`.
- Old dark outer frame, old scrolling product banner, and old lower activity cards were removed.
- Product bubble visuals use CALIBURN product images provided by the user.
- Bio-digital background effect was integrated behind the entry hero.
- Fan registration includes required country and city selectors.
- Fan registration includes lightweight age and privacy / terms confirmations.
- Fan center bottom navigation was fixed to stay on one line.
- Fan center settings removed the store-entry button.
- Fan and store external portals are set to English-first.

### Store Portal

- Store login / registration flow exists.
- Store registration includes store name, contact, phone, country, city, and optional address.
- Newly registered store enters trial / review style flow rather than full formal operations.
- Store owner center shows key dashboard concepts:
  - store level
  - campaign status
  - material inventory
  - activity status
  - claim / restock records
- Store portal copy was moved toward English-first.
- Store login test account has been verified before:
  - store ID `s-real-001`
  - phone `504875886`

### Admin / Manager / Field Rep Portal

- Admin and field-rep logic was separated.
- Admin / manager can access broader company operations.
- Field reps should only focus on assigned store operations:
  - store visits
  - inspections
  - ratings
  - campaign execution
  - material records
  - complaint reply entry
- Admin dashboard has operational data panels.
- Store management supports country / city fields and filters.
- Right-top settings button and settings panel were repaired:
  - stronger contrast
  - fixed positioning
  - close button added
  - `CN中文` removed
  - panel title changed to `系统设置`

### Data / Supabase

- Supabase schema/migration alignment was added and pushed.
- Important fields added or aligned:
  - `profiles.country`
  - `profiles.city`
  - `fans.country`
  - `fans.city`
  - `stores.country`
  - `stores.city`
  - `stores.status`
  - `stores.owner_name`
  - `stores.owner_phone`
  - `stores.display_status`
  - `stores.rating_status`
  - `scan_records.qr_code_id`
  - `scan_records.points_earned`
  - `scan_records.scanned_at`
- RPC/helper functions aligned:
  - `get_low_stock_count`
  - `get_visit_trend`
  - `get_scan_trend`
  - `scan_qr_code`
- The migration was adjusted because the remote `scan_records` table did not have `created_at`; `get_scan_trend` now uses `scanned_at`.

### UI / Visual Polish

- Global typography and contrast pass was done.
- Main font direction was unified around Inter / Barlow / system fonts.
- Buttons received better pressed / readable states.
- Multiple low-contrast white-on-light issues were fixed.
- Admin login layout was repaired for 744px and 1024px widths.
- Admin settings panel was verified:
  - no `CN中文`
  - has close button
  - fixed within viewport
  - no horizontal overflow

## Verification Already Completed

### 2026-07-05 Three-Portal Acceptance Pass

- Browser acceptance was completed against local Vite. An intermediate run used `http://127.0.0.1:5174/` because port `5173` was occupied; the final verified run passed on the standard `http://127.0.0.1:5173/`.
- `frontend/scripts/ux-smoke.cjs` was repaired for the current approved Fan Entry design and expanded into a three-portal flow check.
- Passed browser checks at:
  - 390px mobile
  - 768px tablet
  - 1440px desktop
- Covered flows:
  - Fan Entry hero, settings, join/sign-in modal, registration country/city, age/privacy confirmations, registration into Fan Center.
  - Fan Center home actions, bottom navigation, scan/activity/rewards/stores/profile views, fan settings without store-entry exposure.
  - Store login/register, country/city registration, pending review entry into Store Owner, Overview/Display/Campaigns/Materials tabs, store settings.
  - Admin login, dashboard, stores, visits, evaluation, campaigns, materials, fans, settings/users.
  - Field rep login and direct settings access block.
- Fixes from this pass:
  - Store Owner mobile tabs no longer overflow by removing the non-essential `Materials (n)` count from the tab label.
  - Store Owner edit form no longer calls `setFieldsValue` before the modal form is mounted; form values are applied when opening the edit modal.
  - Admin mobile tabs now use a compact one-line grid layout to avoid short tab labels overflowing.
  - Leaflet maps now disable zoom/fade transition animation and use safer teardown guards to avoid `_leaflet_pos` errors during rapid route changes.
- Verification commands:
  - `UX_BASE_URL=http://127.0.0.1:5173 node scripts/ux-smoke.cjs` passed.
  - `npm run build` passed.
  - Existing Node `.test.mjs` / `.static.test.mjs` files all passed before the Vitest migration.

### 2026-07-05 Test Command Wiring

- Added `vitest` as a frontend dev dependency.
- Added `npm test` script in `frontend/package.json`.
- Switched existing lightweight `.test.mjs` and `.static.test.mjs` files from Node's `node:test` import to Vitest's `test` import.
- Added Vitest include config in `vite.config.js` so `npm test` runs only the intended `src/**/*.test.mjs` files and does not accidentally run Playwright e2e specs.
- Verification commands:
  - `npm test` passed: 7 test files, 16 tests.
  - `npm run build` passed.

### 2026-07-05 Fan Entry Particle Removal / Local Access Check

- Investigated the user's "cannot open" report for `http://127.0.0.1:5173/index.html#/admin`.
- Confirmed local Vite was listening on port `5173` and both `127.0.0.1` and `localhost` returned HTTP 200.
- Confirmed with Playwright that the admin login page renders text successfully with no page-level JavaScript error.
- Removed the Fan Entry bio-digital particle background because it no longer served the approved visual direction.
- Deleted the now-unused `BioDigitalBackground.jsx` component and removed its CSS class from `src/index.css`.
- Verified Fan Entry in browser automation:
  - Join / Sign in CTA visible.
  - Removed particle canvas count is `0`.
  - Mobile screenshot saved at `frontend/output/fan-entry-no-particles-mobile.png`.
- Verification commands:
  - `npm test` passed: 7 test files, 16 tests.
  - `npm run build` passed.

### 2026-07-05 Store Center Particle Removal / Admin Readability Fix

- Removed the store app entry-level `bg-particles` canvas and inline particle animation from `frontend/store-app.html`.
- Removed the Store Owner background video node from `StoreOwnerPage.jsx`.
- Added Store Owner CSS overrides so the page uses a calm light gradient without gold particle/radial background noise.
- Fixed Admin workspace Select/Input/Tag/disabled-button readability:
  - Ant Design 6 Select root nodes now use white backgrounds and dark readable text.
  - Disabled select/input states now use light beige backgrounds with visible dark text.
  - Admin tags use readable dark text on light semantic surfaces.
- Browser verification:
  - Store Owner `canvasCount=0` and `bg-particles=0`.
  - Admin Store Management filter selects render as white/light controls with dark text.
  - Screenshots saved at `frontend/output/store-owner-no-particles.png` and `frontend/output/admin-stores-readable.png`.
- Verification commands:
  - `npm test` passed: 7 test files, 16 tests.
  - `npm run build` passed.

### 2026-07-05 Admin Audit Page Crash / Background Cleanup

- Fixed the Admin Audit page runtime crash by importing the missing Ant Design `Spin` component in `AuditLogPage.jsx`.
- Removed the Audit page's local `bg-radial-top` wrapper in local-demo messaging so it no longer reintroduces gold radial background effects.
- Added Admin workspace CSS hardening:
  - hide canvas effects inside `.admin-liquid-shell`;
  - remove the Admin scrim's gold radial highlight;
  - force `.admin-ref-content` to use no background image.
- Browser verification after admin login:
  - `#/app/settings/audit` no longer shows `Unexpected Application Error`.
  - `Spin is not defined` is gone.
  - visible canvas count is `0`.
  - Audit page resolves to the readable empty state `No audit logs found`.
  - Screenshot saved at `frontend/output/admin-audit-after-login-wait.png`.
- Verification commands:
  - `npm test` passed: 7 test files, 16 tests.
  - `npm run build` passed.

### 2026-07-05 Fan Rewards Readability Fix

- Fixed the Fan Center rewards help alert selected in browser review:
  - `How rewards work` title now uses dark readable text.
  - The reward instructions now use a clear dark-brown text on a warm light background.
  - The alert icon and border now match the readable light theme.
- Fixed rewards card helper text such as `more points needed` / `Ready to redeem` so it is no longer white-on-white.
- Browser verification:
  - Checked at 599 x 698 viewport.
  - Screenshot saved at `frontend/output/fan-reward-help-fixed-final.png`.
  - Computed colors confirm title and description are dark readable values.
- Verification commands:
  - `npm test` passed: 7 test files, 16 tests.
  - `npm run build` passed.

### 2026-07-05 Three-Portal Acceptance / Particle Closure

- Continued the planned three-portal browser acceptance pass after the latest user approval.
- Repaired `frontend/scripts/ux-smoke.cjs` so it matches the current no-particle design direction instead of expecting the removed bio-digital background.
- Added a smoke-test guard against reintroducing particle/background canvases:
  - `#bg-particles`
  - `.bg-particles`
  - `.fe-bio-digital-canvas`
  - `.fe-luxury-canvas`
- Removed the remaining Fan Entry canvas animation:
  - deleted the unused `CaliburnHeroCanvas.jsx` component;
  - replaced it with a static CALIBURN product image layer so the hero keeps real product visuals without animated canvas effects.
- Removed the Admin entry `index.html` inline `#bg-particles` canvas and animation script, which was the remaining yellow particle source on the admin login page.
- Browser acceptance:
  - `node scripts/ux-smoke.cjs` passed across mobile, tablet, and desktop.
  - Supplemental browser checks showed `canvasCount=0` and no horizontal overflow for:
    - Fan Entry
    - Fan Center
    - Store Login
    - Store Owner
    - Admin Login
  - Screenshots saved under `frontend/output/acceptance-2026-07-05/`.
- Verification commands:
  - `npm test` passed: 7 test files, 16 tests.
  - `npm run build` passed.

### 2026-07-05 Real Trial Data Pack

- Continued into the recommended Phase 2 real trial data pass.
- Added a seed-data enhancement layer in `frontend/src/services/db/seedData.js`:
  - normalized all seeded stores with `country`, `city`, `status`, `owner_name`, `owner_phone`, `display_status`, `rating_status`, and assigned `rep_id`;
  - normalized all seeded fans with `email`, `country`, `city`, `points`, and `total_contribution`;
  - added `scanned_at` to seeded scan records for dashboard/report compatibility;
  - added material request examples covering `pending`, `approved`, and `rejected` states;
  - added `trial_accounts` documentation data for admin, manager, rep, store, and fan demo use.
- Added seeded local `auth` records for the main staff demo accounts:
  - `admin@uwell.com / admin`
  - `manager@uwell.com / admin`
  - `rep1@uwell.com / admin`
  - `rep2@uwell.com / admin`
  - `rep3@uwell.com / admin`
- Added `auth` to local DB table initialization and bumped the local DB version from `5.3` to `5.4`, so existing browser localStorage reinitializes with the improved trial data.
- Added `frontend/src/services/db/seedData.test.mjs` to lock the trial data requirements:
  - demo accounts exist;
  - stores have city-operation fields;
  - fans and scan records are ready for fan-center demos;
  - material requests include pending/approved/rejected states.
- Browser verification after clearing localStorage:
  - local DB version initialized as `5.4`;
  - stores: `80`;
  - fans: `8`;
  - auth records: `5`;
  - material requests: `3`;
  - missing store city/owner/status fields: `0`;
  - missing fan city/email fields: `0`.
- Verification commands:
  - `npx vitest run src/services/db/seedData.test.mjs` passed: 1 file, 4 tests.
  - `npm test` passed: 8 files, 20 tests.
  - `npm run build` passed.
  - `node scripts/ux-smoke.cjs` passed across mobile, tablet, and desktop.

### 2026-07-05 UX Copy / Visual Closure And Ant Design 6 Cleanup

- Continued Phase 3 after user approval.
- Cleaned Admin global shell visible mojibake:
  - field-rep menu labels now show `地推工作台`, `负责门店`, `活动执行`;
  - complaint menu labels now show `粉丝客诉` and `客诉回复`;
  - Admin settings panel title and close label now show `系统设置` and `关闭设置`.
- Kept Fan and Store external entry flows English-first.
- Replaced Ant Design 6 deprecated APIs in active user flows:
  - `Statistic.valueStyle` -> `styles.content`;
  - `Modal.destroyOnClose` -> `destroyOnHidden`;
  - mobile Admin `Drawer.width` -> `size`;
  - mobile Admin `Drawer.styles.content` -> `styles.section`;
  - static Admin login `message.*` -> `App.useApp()`;
  - Admin dashboard AntD `List` usage replaced with a small local `CompactList` wrapper to avoid the deprecated `List` component warning.
- Browser warning verification showed no AntD warnings on Admin login, Admin dashboard, Admin stores list, Admin audit, Admin materials, Admin settings drawer, Fan center, and Store login.
- Verification commands:
  - `npm test` passed: 8 files, 20 tests.
  - `node scripts/ux-smoke.cjs` passed across mobile, tablet, and desktop.
  - `npm run build` passed.

Recent verified commands:

- `npm test` passed: 8 files, 20 tests.
- `node scripts/ux-smoke.cjs` passed across mobile, tablet, and desktop.
- `npm run build` passed.
- GitHub push succeeded for branch `codex/uwell-trial-ops-sync`.
- Supabase `db push` succeeded after retry.
- Supabase `migration list` confirmed `20260704` exists remotely.

Recent browser/UI checks:

- Admin login page verified at 744px and 1024px with no horizontal overflow.
- Admin settings panel verified:
  - text shows `系统设置 / 系统管理员 (管理员) / 切换语言 / 中文 / 退出登录`
  - no `CN中文`
  - close button exists
  - no horizontal overflow

Note:

- A later `ux-smoke.cjs` run started after the user clarified the request. It first failed because the 5173 server was not running, then after starting the server it failed on the fan-entry title assertion. This should be rechecked before using `ux-smoke.cjs` as a final gate, because the script may be expecting an older selector/text state or the current page may need a small copy/selector adjustment.

## Known Issues / Open Risks

### High Priority

1. Public launch readiness is not complete.
   - No final production deployment process has been locked.
   - No custom domain / SSL / monitoring / analytics setup is confirmed.

2. Ant Design 6 deprecation warnings remain.
   - Known warnings include `Statistic.valueStyle`, `Modal.destroyOnClose`, `List`, `Alert.message`, static `message`, and Drawer style APIs.
   - They did not block the acceptance pass, but should be cleaned up in a future compatibility pass.

### Medium Priority

4. Fan entry settings still contains a code path that can link to store login.
   - Fan center settings has had the store-entry button removed.
   - But `FanEntryPage.jsx` still contains a settings item pointing to `/store-app.html#/store-login`.
   - Need product decision: keep store login discoverable on public entry, or remove it for a cleaner fan-only entry.

5. English-first cleanup is not fully complete.
   - Fan and store portals are mostly English-first.
   - Some demo/seed content and internal mixed Chinese/English copy remains.

6. Real trial data has a usable local demo pack, but final production trial curation is still needed.
   - Local seed data now includes normalized stores, fans, staff auth records, and material request examples.
   - Before external trial, confirm the final real account list and whether demo passwords should remain enabled.

7. Dashboard data is still partially demo/fallback driven.
   - Supabase is now aligned, but the app still keeps local fallback behavior for trial/demo resilience.
   - Need decide when to harden Supabase-first behavior for live testing.

### Lower Priority

8. Build warnings show large chunks.
   - Not blocking for trial MVP.
   - Optimize later with code splitting if performance becomes a problem.

9. Local Docker is not running.
   - Supabase remote migration worked.
   - Local Supabase status/cache commands warn because Docker Desktop is not active.

10. Temporary local artifacts are untracked.
   - Examples:
     - `frontend/.playwright-cli/`
     - `frontend/output/`
     - `manual-upload/*.patch`
     - `*.bundle`
   - These are intentionally not committed unless explicitly needed.

## Recommended Next Plan

### Phase 1: Write/Rerun Acceptance Checklist

Goal: turn the current trial MVP into a clearly verified local acceptance version.

1. Fix or update `scripts/ux-smoke.cjs` so it matches the current approved fan-entry design.
2. Add/confirm checks for:
   - fan entry
   - fan registration country/city
   - fan center settings no store entry
   - store login with `s-real-001 / 504875886`
   - store registration country/city and review state
   - admin login
   - field-rep login menu restriction
3. Run checks at:
   - 390px mobile
   - 768px tablet
   - 1440px desktop

### Phase 2: Real Trial Data Pass

Goal: make the product feel operational instead of demo-like.

1. Prepare final trial accounts:
   - admin
   - manager
   - at least 2 field reps
   - 5-10 stores
   - 5-10 fans
2. Prepare 2-3 active campaigns.
3. Prepare material inventory and low-stock examples.
4. Prepare complaint/reply examples.

### Phase 3: UX Copy and Visual Closure

Goal: make fan/store external portals smooth for real English users.

1. Fan portal English copy cleanup.
2. Store portal English copy cleanup.
3. Admin Chinese copy cleanup.
4. Fix remaining low-contrast text and inconsistent font areas.
5. Confirm settings panels and modal layering across all three portals.

### Phase 4: Pre-Launch Decision

Goal: decide whether to stay local trial or deploy externally.

1. If local trial only:
   - keep 5173 validation
   - keep GitHub/Supabase sync
2. If external preview:
   - choose Vercel / Netlify / other deployment
   - configure env vars
   - verify Supabase auth and RLS
3. If public launch:
   - domain
   - privacy policy / terms
   - analytics
   - error monitoring
   - backup plan

## Useful Commands

Start local dev server:

```powershell
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"
npm run dev -- --host 127.0.0.1
```

Build:

```powershell
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"
npm run build
```

Run UX smoke:

```powershell
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"
node scripts/ux-smoke.cjs
```

Push GitHub branch:

```powershell
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"
git push -u origin codex/uwell-trial-ops-sync
```

Push Supabase migrations:

```powershell
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm"
$env:SUPABASE_ACCESS_TOKEN="YOUR_TOKEN_HERE"
npx supabase db push --yes
```

Check Supabase migrations:

```powershell
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm"
$env:SUPABASE_ACCESS_TOKEN="YOUR_TOKEN_HERE"
npx supabase migration list
```

## Handoff Notes For New Conversations

If a new Codex conversation starts, read this file first, then inspect:

1. `frontend/src/pages/fan-entry/FanEntryPage.jsx`
2. `frontend/src/pages/fans/FanCenterPage.jsx`
3. `frontend/src/pages/store-owner/StoreEntryPage.jsx`
4. `frontend/src/pages/store-owner/StoreOwnerPage.jsx`
5. `frontend/src/components/layout/AppLayout.jsx`
6. `frontend/src/index.css`
7. `frontend/scripts/ux-smoke.cjs`
8. `supabase/migrations/20260704_trial_ops_alignment.sql`

Current recommended next action:

Move into pre-launch decision work: choose local trial vs external preview, then lock deployment, env vars, Supabase auth/RLS behavior, domain/SSL, analytics, monitoring, privacy, and terms.

### 2026-07-05 Pre-Launch Decision Start

- User confirmed the next focus should be pre-launch decision work.
- Recommended direction: run a controlled external preview first, not full public launch yet.
- Added `PRELAUNCH-DECISION.md` with the current readiness decision, deployment recommendation, and blocking checklist.
- Current recommendation:
  - use Vercel for a controlled external preview;
  - use `frontend` as the deployment root;
  - prefer `frontend/vercel.json` because it preserves the three HTML entries;
  - do not use the root `vercel.json` as-is because it rewrites all routes to `index.html`;
  - keep local trial available, but set `VITE_ALLOW_LOCAL_AUTH_FALLBACK=false` when testing real Supabase data externally.
- Current high-priority pre-preview risks:
  - deployment config duplication between root and `frontend`;
  - local fallback can hide Supabase failures in external preview;
  - root migrations enable RLS but do not contain complete role policies for all tables;
  - monitoring is still a stub;
  - privacy policy and terms copy need to exist before real user data collection.
- Verification after adding the pre-launch decision document:
  - `npm test` passed: 8 files, 20 tests.
  - `npm run build` passed; only the existing large chunk warning remains.
  - `node scripts/ux-smoke.cjs` passed: three-portal UX acceptance checks passed.
- Decision items to lock next:
  - local-only trial vs external preview vs public launch;
  - deployment provider and preview URL;
  - environment variable list without editing `.env` blindly;
  - Supabase auth, RLS, and local fallback behavior;
  - domain / SSL timing;
  - analytics, error monitoring, backup plan;
  - privacy policy and terms readiness.

### 2026-07-05 Deployment Config / Preview Fallback Hardening

- Continued after user approved the next pre-launch step.
- Added `frontend/src/services/api/helpers.test.mjs`:
  - verified real-data preview can disable data-layer local fallback with `VITE_ALLOW_LOCAL_DB_FALLBACK=false`;
  - verified local development can still use local fallback;
  - verified demo preview can explicitly opt in with `VITE_ALLOW_LOCAL_DB_FALLBACK=true`.
- Updated `frontend/src/services/api/helpers.js`:
  - added `shouldAllowLocalDbFallback`;
  - changed `withFallback` so Supabase failures are thrown in strict external preview instead of silently switching to localStorage.
- Added `frontend/src/utils/deployConfig.test.mjs` to lock Vercel three-entry routing for both root and `frontend` configs.
- Updated root `vercel.json`:
  - removed the build-time `npm install` command from `buildCommand`;
  - added `installCommand` using pnpm frozen lockfile for root-level Vercel imports;
  - added direct rewrites for `fan-app.html` and `store-app.html`.
- Updated `frontend/.env.example` with:
  - `VITE_ALLOW_LOCAL_AUTH_FALLBACK=false`;
  - `VITE_ALLOW_LOCAL_DB_FALLBACK=false`.
- Updated `PRELAUNCH-DECISION.md` to mark deployment config as preview-ready and identify the next blockers:
  - choose demo-preview vs real-data-preview;
  - verify Supabase RLS;
  - add minimal privacy/terms copy before real users.
- Verification:
  - `npx vitest run src/services/api/helpers.test.mjs` first failed because `shouldAllowLocalDbFallback` did not exist, then passed after implementation.
  - `npx vitest run src/utils/deployConfig.test.mjs` first failed because root `vercel.json` lacked Fan/Store rewrites, then passed after config alignment.
  - `npm test` passed: 10 files, 25 tests.
  - `npm run build` passed; only the existing large chunk warning remains.
  - `node scripts/ux-smoke.cjs` passed: three-portal UX acceptance checks passed.

### 2026-07-05 Next Decision: Supabase RLS And UI Timing

- User confirmed the next recommended focus: Supabase RLS permission acceptance.
- Planned RLS acceptance scope:
  - Admin can see and manage company-wide operating data.
  - Manager can see company-wide operating data except restricted system settings.
  - Field rep can only see assigned-store/assigned-work data.
  - Store owner can only see and update their own store-facing data.
  - Fan can only see and update their own fan profile, points, rewards, scans, and activity records.
- UI timing decision:
  - Continue UI readability and polish fixes before preview.
  - Avoid large layout redesigns after RLS/deployment lock unless they are clearly needed.
  - After all production foundations are ready, UI can still be modified, but changes should be handled as controlled iterations with smoke tests/build checks after each round.

### 2026-07-05 Supabase RLS Permission Acceptance Pass

- Continued into Supabase RLS permission acceptance after user approval.
- Confirmed the existing migrations enabled RLS on some tables but did not define complete `CREATE POLICY` coverage.
- Added `supabase/migrations/20260705000100_rls_role_policies.sql`:
  - adds `store_owner` as a supported `profiles.role`;
  - adds `stores.owner_profile_id` for Store owner binding;
  - adds `stores.rep_id` for field-rep assignment binding;
  - adds helper functions for role and ownership checks:
    - `current_profile_role`
    - `is_admin_or_manager`
    - `is_admin_role`
    - `is_rep_assigned_to_store`
    - `is_store_owner`
    - `is_fan_owner`
    - `can_access_store`
    - `can_access_fan`
  - enables RLS and creates authenticated-only policies for the core CRM tables across Admin / Manager / Rep / Store / Fan boundaries.
- Added `SUPABASE-RLS-ACCEPTANCE.md` with:
  - human-readable identity access matrix;
  - SQL checks for RLS/policy coverage;
  - browser-flow checks for external preview;
  - a note that real Store owner preview should bind stores to Supabase Auth profiles through `stores.owner_profile_id`.
- Added `frontend/src/utils/supabaseRlsPolicies.test.mjs`:
  - first failed because the RLS migration did not exist;
  - passed after the migration was added.
- Verification:
  - `npx vitest run src/utils/supabaseRlsPolicies.test.mjs` passed: 1 file, 4 tests.
  - `npm test` passed: 11 files, 29 tests.
  - `npm run build` passed; only the known large chunk warning remains.
  - `node scripts/ux-smoke.cjs` passed: three-portal UX acceptance checks passed.
- Remaining RLS deployment step:
  - apply the new migration to the remote Supabase project;
  - create/bind real preview users for Admin, Manager, Rep, Store owner, and Fan;
  - run the SQL checks and browser-flow checks from `SUPABASE-RLS-ACCEPTANCE.md`.

### 2026-07-05 Supabase Remote RLS Push Attempt

- Continued the next step: prepare to apply the RLS migration to remote Supabase.
- Confirmed Supabase CLI is available without installing dependencies:
  - `npx --no-install supabase --version` returned `2.109.0`.
- Confirmed linked Supabase project ref:
  - `rdsrgpnvzcchqlsghsrq`.
- Remote migration commands are currently blocked by missing credentials:
  - `npx --no-install supabase migration list` failed with `Access token not provided`.
  - `npx --no-install supabase db push --yes` failed with `Access token not provided`.
- No `.env` file was edited and no dependencies were installed.
- Next required action:
  - provide a valid `SUPABASE_ACCESS_TOKEN` in the terminal session or run `supabase login`;
  - then rerun `npx --no-install supabase db push --yes`;
  - after push, rerun `npx --no-install supabase migration list` and the SQL checks from `SUPABASE-RLS-ACCEPTANCE.md`.

### 2026-07-05 Supabase Remote RLS Migration Applied

- User provided a Supabase access token for the current terminal session.
- Used the token only as a temporary process environment variable; no `.env` file was edited.
- Verified the remote project before push:
  - project ref: `rdsrgpnvzcchqlsghsrq`;
  - `npx --no-install supabase migration list` showed local `20260705000100` was not yet remote.
- First `db push` attempt failed due to a transient TLS handshake timeout while initializing the Supabase login role.
- Retried `npx --no-install supabase db push --yes`; the migration applied successfully:
  - `20260705000100_rls_role_policies.sql`.
- The push ended with a Docker Desktop local-cache warning only; the remote migration itself finished successfully.
- Verified with `npx --no-install supabase migration list`:
  - local `20260705000100`;
  - remote `20260705000100`.
- Security note:
  - because the access token appeared in chat, rotate/revoke it in Supabase Account Settings after this work.
- Next recommended step:
  - create or confirm real Supabase Auth preview users for Admin / Manager / Rep / Store owner / Fan;
  - bind `stores.rep_id`, `stores.owner_profile_id`, and `fans.user_id`;
  - run the SQL and browser acceptance checks from `SUPABASE-RLS-ACCEPTANCE.md`.

### 2026-07-05 Supabase Preview Identity Binding Prepared

- Continued into the real preview identity binding step.
- Confirmed current terminal is not authenticated for remote Supabase queries:
  - `npx --no-install supabase db query --linked "select current_database() as db, current_user as role;"` failed with `Access token not provided`.
- Did not reuse the previously pasted access token because it has appeared in chat and should be revoked/rotated.
- Added `supabase/acceptance/preview-identity-binding.sql`:
  - requires real Supabase Auth users for `admin@uwell.com`, `manager@uwell.com`, `rep1@uwell.com`, `store.owner@uwell.com`, and `fan.preview@uwell.com`;
  - upserts matching `public.profiles` rows using real `auth.users.id` UUIDs;
  - binds `stores.rep_id` to the real field-rep profile;
  - binds `stores.owner_profile_id` to the real store-owner profile;
  - binds `fans.user_id` to the real fan profile;
  - creates a small phone-based preview store/fan record if needed so UUID primary keys remain valid on the remote schema.
- Added `supabase/acceptance/preview-identity-checks.sql` to report:
  - missing Auth users;
  - missing/mismatched profile roles;
  - Store rep/owner binding status;
  - Fan user binding status.
- Added `frontend/src/utils/supabasePreviewBindings.test.mjs`:
  - first failed because the SQL files did not exist;
  - passed after the binding/check SQL files were added.
- Verification:
  - `npx vitest run src/utils/supabasePreviewBindings.test.mjs` passed: 1 file, 4 tests.
  - `npm test` passed: 12 files, 33 tests.
- Next required action:
  - create the five real Supabase Auth preview users in Dashboard;
  - generate a new Supabase access token;
  - run the two SQL files via `supabase db query --linked`;
  - then run the RLS SQL checks and browser-flow checks.

### 2026-07-05 Supabase Preview Users Bound And RLS SQL Accepted

- User approved reusing the previously pasted Supabase access token for this step.
- Used the token only as a temporary process environment variable; no `.env` file was edited.
- First `preview-identity-binding.sql` run connected to remote but failed because four Auth users were missing:
  - `manager@uwell.com`
  - `rep1@uwell.com`
  - `store.owner@uwell.com`
  - `fan.preview@uwell.com`
- Added `supabase/acceptance/create-preview-auth-users.sql` to create missing preview Auth users with temporary password `admin`.
- Adjusted the Auth creation SQL for the current remote Supabase Auth schema:
  - removed manual writes to generated `auth.users.confirmed_at`;
  - removed manual writes to generated `auth.identities.email`.
- Created/confirmed five remote Auth users:
  - `admin@uwell.com`
  - `manager@uwell.com`
  - `rep1@uwell.com`
  - `store.owner@uwell.com`
  - `fan.preview@uwell.com`
- Re-ran `supabase/acceptance/preview-identity-binding.sql`; binding succeeded:
  - remote preview store id: `bc13408d-ca13-4d22-91a7-f1aac5f11973`;
  - remote preview fan id: `5420d620-7f42-4319-a2c4-c8a45391cb2f`;
  - `stores.rep_id` bound to `rep1@uwell.com`;
  - `stores.owner_profile_id` bound to `store.owner@uwell.com`;
  - `fans.user_id` bound to `fan.preview@uwell.com`.
- Re-ran `supabase/acceptance/preview-identity-checks.sql`; all returned `status: ok`.
- RLS SQL acceptance initially found six legacy `anon` policies:
  - `profiles_public_fan_read`
  - `profiles_public_fan_registration`
  - `stores_public_read`
  - `stores_public_trial_registration`
  - `fans_public_read`
  - `fans_public_trial_registration`
- Added migration `supabase/migrations/20260705000200_drop_public_trial_policies.sql` to remove those public trial policies.
- Updated `frontend/src/utils/supabaseRlsPolicies.test.mjs` so the cleanup migration is covered by tests.
- Pushed migration `20260705000200_drop_public_trial_policies.sql` to remote Supabase.
  - First push attempt hit a TLS handshake timeout.
  - Retry succeeded.
  - Docker Desktop warning only affected local migration cache, not remote migration application.
- Final RLS SQL summary:
  - `rls_enabled_tables`: 18
  - `protected_table_count`: 18
  - `tables_with_policy`: 18
  - `policy_table_count`: 18
  - `anon_policy_count`: 0
- `npx --no-install supabase migration list` confirmed local and remote both include `20260705000200`.
- Verification:
  - `npx vitest run src/utils/supabaseRlsPolicies.test.mjs` passed: 1 file, 5 tests.
  - `npm test` passed: 12 files, 34 tests.
- Security note:
  - revoke/rotate the pasted Supabase access token after this session;
  - change or delete the temporary preview users before broader external preview.
- Next recommended step:
  - run browser login/data-flow acceptance against real Supabase preview with local fallback disabled;
  - verify Admin / Manager / Rep / Store / Fan cannot cross data boundaries in the actual app UI.

### 2026-07-06 Real Browser RLS Permission Acceptance

- Ran production-preview browser acceptance at `http://127.0.0.1:4173` after building with:
  - `VITE_ALLOW_LOCAL_AUTH_FALLBACK=false`
  - `VITE_ALLOW_LOCAL_DB_FALLBACK=false`
- Repaired remote preview Auth users so all five test identities can sign in with the temporary password `admin`:
  - `admin@uwell.com`
  - `manager@uwell.com`
  - `rep1@uwell.com`
  - `store.owner@uwell.com`
  - `fan.preview@uwell.com`
- Root cause of Auth failure:
  - four SQL-created Auth users had nullable token/metadata fields that caused Supabase Auth login to return `Database error querying schema`;
  - `admin@uwell.com` existed but did not use the expected temporary password.
- Verified Auth API now returns 200 for all five preview users.
- Fixed Rep assigned-store browser flow:
  - added `getScopedStoreRows` in `frontend/src/utils/uwellRoleAccess.js`;
  - updated `StoreListPage.jsx` so reps use Supabase-returned rows instead of replacing them with local demo stores;
  - browser verified `rep1@uwell.com` sees exactly the bound `UWELL Preview Store` and cannot access fan list or settings by direct URL.
- Fixed Fan real-data display:
  - changed Fan Center query from `initialData` to `placeholderData` so local fans do not mask remote Supabase fan data;
  - browser verified `fan.preview@uwell.com` shows `UWELL Preview Fan`, not local `Ahmed / f-001`.
- Fixed Store owner real Supabase login:
  - Store Entry now supports owner email/password login while preserving the original store ID/phone flow;
  - browser verified `store.owner@uwell.com / admin` creates a Supabase session and opens remote `UWELL Preview Store`, not local `s-real-001`.
- Browser permission results:
  - Admin: can access dashboard, stores, fans, users, audit.
  - Manager: can access operating pages and fan list; direct settings/users and audit URLs redirect back to dashboard.
  - Rep: can access dashboard and assigned store only; direct fan list and settings URLs redirect back to dashboard.
  - Store owner: can access only the bound remote store owner center.
  - Fan: can access only the bound remote fan center.
- Visual checks during browser acceptance:
  - Fan / Store mobile checks had `canvasCount=0`;
  - no horizontal overflow in the verified mobile Fan and Store flows.
- Added tests:
  - `frontend/src/utils/uwellRoleAccess.test.mjs`
  - `frontend/src/pages/store-owner/StoreEntryPage.static.test.mjs`
  - expanded `frontend/src/pages/fans/FanCenterPage.static.test.mjs`
- Verification:
  - `npx vitest run src/utils/uwellRoleAccess.test.mjs` passed.
  - `npx vitest run src/pages/fans/FanCenterPage.static.test.mjs` passed.
  - `npx vitest run src/pages/store-owner/StoreEntryPage.static.test.mjs` passed.
  - `npm test` passed: 13 files, 37 tests.
  - `npm run build` passed; only the known large chunk warning remains.
- Known remaining issue:
  - `node scripts/ux-smoke.cjs` against strict preview fails in the Store public-registration branch because unauthenticated store creation is now correctly blocked by RLS with 401. Product decision needed: use a controlled registration API / Edge Function, or require authenticated store-owner registration for real preview.
- Security note:
  - the Supabase access token pasted in chat should be revoked/rotated;
  - the temporary preview user password `admin` should be changed before any broader external preview.

### 2026-07-06 Fan Center Modal Readability Closure

- Continued the browser UI acceptance round after the user selected unreadable Fan Center modal areas.
- Fixed the Fan scan-code modal:
  - added scoped modal classes in `frontend/src/pages/fans/tabs/ScanTab.jsx`;
  - removed the old dark inline modal styling that made Ant Design modal layers look muddy;
  - added a clear light modal surface, readable title/body text, white input field, and stronger submit button treatment.
- Fixed the Fan redemption-success modal:
  - updated `frontend/src/pages/fans/tabs/MallTab.jsx`;
  - narrowed the modal to a more readable width;
  - separated the success message from the redemption-code panel so long codes do not feel like they overflow;
  - added wrapping and contrast-safe code styling.
- Added high-specificity Ant Design 6 modal styles in `frontend/src/index.css`:
  - covers both `.ant-modal-content` and `.ant-modal-container`, because the browser selection often targets the container layer;
  - keeps the modal surface opaque and readable after the entry animation settles.
- Added/updated regression tests:
  - `frontend/src/pages/fans/tabs/ScanTab.static.test.mjs`;
  - `frontend/src/pages/fans/tabs/MallTab.static.test.mjs`.
- Browser visual verification at `http://127.0.0.1:4173/fan-app.html#/fan-center`:
  - scan-code modal has a stable light background and dark readable text;
  - redemption-success modal has no visible text overflow and the redemption code wraps cleanly;
  - screenshots saved under `frontend/output/playwright/`.
- Verification:
  - `npm test` passed: 19 test files, 47 tests.
  - `npm run build` passed; only the known Vite chunk-size / plugin timing warnings remain.

### 2026-07-06 Local Archive Checkpoint

- User requested a local archive/progress update.
- Updated this `PROGRESS.md` checkpoint so the next session can continue without reconstructing context from chat.
- Current practical project state:
  - three portals are usable locally and in strict preview-style browser checks;
  - core Supabase RLS migration and preview identity binding have been applied and verified;
  - Admin / Manager / Rep / Store / Fan permission boundaries have passed real browser acceptance;
  - Fan / Store visible particle effects have been removed from the reviewed flows;
  - latest known Fan modal readability issues have been fixed and verified.
- Current important local preview URL:
  - `http://127.0.0.1:4173`
- Current preview accounts:
  - Admin: `admin@uwell.com` / `admin`
  - Manager: `manager@uwell.com` / `admin`
  - Rep: `rep1@uwell.com` / `admin`
  - Store: `store.owner@uwell.com` / `admin`
  - Fan: `fan.preview@uwell.com` / `admin`
- Remaining decisions before external preview or public release:
  - rotate/revoke the Supabase access token that appeared in chat;
  - change or delete the temporary `admin` preview passwords;
  - decide store public registration behavior under strict RLS:
    - controlled registration API / Edge Function, or
    - authenticated store-owner registration only;
  - lock deployment target and environment variables;
  - add/confirm privacy policy and terms;
  - decide monitoring/analytics/error reporting setup.
- Recommended next action:
  - make the store public-registration decision first, because strict RLS currently blocks unauthenticated store creation by design;
  - then run one final full browser acceptance pass across Fan / Store / Admin after that decision is implemented.

### 2026-07-06 Reward Pickup RPC Productionization

- User confirmed the next step after Supabase RLS acceptance: productionize the fan reward pickup closure.
- Added Supabase migration:
  - `supabase/migrations/20260706000100_reward_pickup_rpc.sql`
  - creates `public.confirm_reward_pickup(p_redeem_code text)` as the authoritative transaction boundary.
- RPC behavior:
  - requires an authenticated store owner;
  - finds the store bound to `stores.owner_profile_id = auth.uid()`;
  - rejects non-S-level stores;
  - locks the redemption row with `FOR UPDATE`;
  - rejects missing, already used, unavailable, or expired codes;
  - locks the matched `material_stocks` row with `FOR UPDATE`;
  - deducts both `quantity` and `qty` safely;
  - writes a `material_outbound` record;
  - marks the redemption as `picked_up` with pickup store, owner, and timestamp.
- Added frontend API wrapper:
  - `frontend/src/services/api/rewards.js`
  - exports `confirmRewardPickupRemote()`, calling Supabase RPC in remote mode while preserving the local demo fallback path.
- Updated Store Owner reward pickup:
  - `frontend/src/pages/store-owner/StoreOwnerPage.jsx`
  - confirmation now calls the remote RPC when Supabase is active.
- Added repeatable Supabase acceptance setup:
  - `supabase/acceptance/reward-pickup-rpc-setup.sql`
  - prepares S-level preview store, reward material, inventory stock, and `UW-RPCHECK1`.
- Remote Supabase verification:
  - `supabase db push --linked` applied `20260706000100_reward_pickup_rpc.sql`;
  - setup SQL returned preview store level `S`, code `UW-RPCHECK1`, stock `3`;
  - logged in as `store.owner@uwell.com` / `admin` and called RPC;
  - RPC returned `status: picked_up` and `remaining_quantity: 2`;
  - repeated RPC call correctly rejected with `Code already used`.
- Verification:
  - `npm test` passed: 22 test files, 59 tests.
  - `npm run build` passed; only the known Vite large chunk warning remains.
- Security note:
  - the Supabase access token used in this session appeared in chat and should be revoked/rotated;
  - preview passwords are still temporary and should be changed before a broader external preview.

### 2026-07-06 External Preview Reward Closure

- Deployed a strict external Vercel preview from `frontend/dist`:
  - `https://dist-nt8w5s95b-robinlei2533-2668s-projects.vercel.app`
  - build used Supabase env values with local auth/db fallback disabled.
- Vercel project note:
  - deployment protection was disabled for the temporary `dist` preview project so the browser acceptance can open without a Vercel login.
- Fixed production reward closure gaps found during real browser acceptance:
  - fan reward redemption now creates a Supabase `mall_redemptions` row through `createRewardRedemptionRemote()`;
  - store reward pickup no longer lets local demo stock validation block remote RPC confirmation;
  - remote pickup check shows `Remote pickup will be verified by the server`, then `confirm_reward_pickup` remains the authoritative validator.
- Prepared preview acceptance data through authenticated admin RLS:
  - `fan.preview@uwell.com` points set to `1000`;
  - `UWELL Preview Store` confirmed as S-level;
  - `UWELL Lighter` material and store stock prepared at `5`.
- Real external browser acceptance on the Vercel preview:
  - fan login succeeded;
  - fan redeemed `UWELL Lighter` and received code `UW-EDK6C564`;
  - store owner login succeeded;
  - S-level store checked the code and confirmed pickup through RPC;
  - repeat confirmation rejected with `Code already used`.
- Remote database confirmation:
  - `mall_redemptions.redeem_code = UW-EDK6C564` is now `picked_up`;
  - `UWELL Lighter` stock for `UWELL Preview Store` decreased from `5` to `4`.
- Verification:
  - `npm test` passed: 22 test files, 59 tests.
  - `npm run build` passed; only the known Vite chunk-size / plugin timing warnings remain.
- Security note:
  - the Vercel token pasted in chat should be revoked/rotated after deployment work;
  - the earlier Supabase token should also be revoked/rotated.

### 2026-07-07 Fan Center Activity Readability Archive

- User requested another local archive after checking the Fan Center activity detail modal.
- Fixed Fan Center campaign/activity readability issues:
  - `frontend/src/pages/fans/tabs/CampaignTab.jsx`
    - campaign cards now use explicit readable light surfaces;
    - activity progress percentages are visible on the card;
    - campaign detail modal has a scoped `fan-campaign-detail-modal` class;
    - status tags no longer rely on Ant Design default dark tag rendering.
  - `frontend/src/index.css`
    - added scoped light modal styles for Fan campaign detail;
    - added light readable styles for campaign type/status tags;
    - locked completed status to a light grey/cream surface instead of black.
- Fixed Fan Center task behavior from the same acceptance pass:
  - daily check-in now awards `+5` points;
  - local seed fan IDs such as `f-001` route through local DB instead of attempting Supabase UUID writes;
  - Fan Center prioritizes saved local fan session data so point changes are visible immediately.
- Added fan store-visit closure design document:
  - `docs/fan-store-visit-task-closure-2026-07-07.md`
  - decision: store-visit tasks should be closed by S-level store verification code, not fan self-photo auto-completion.
- Browser verification:
  - local preview used `http://127.0.0.1:4174/fan-app.html#/fan-center`;
  - real path verified: Home -> View activity -> Past campaigns -> G5 Launch Promotion detail;
  - screenshot saved at `frontend/output/playwright/fan-campaign-detail-light.png`;
  - modal and `Completed` status tag now render on light readable surfaces.
- Verification:
  - `npm test -- CampaignTab.static.test.mjs` passed: 1 file, 3 tests.
  - `npm test` passed: 25 test files, 68 tests.
  - `npm run build` passed; only the known Vite chunk-size / plugin timing warnings remain.
- GitHub / Supabase status:
  - current branch: `codex/uwell-trial-ops-sync`;
  - GitHub remote: `origin https://github.com/robinlei2533-cloud/store-manager.git`;
  - latest Supabase migration remains `20260706000100_reward_pickup_rpc.sql`;
  - no new Supabase schema migration was needed for this UI/task-readability checkpoint.
- Preview accounts remain:
  - Admin: `admin@uwell.com` / `admin`
  - Manager: `manager@uwell.com` / `admin`
  - Rep: `rep1@uwell.com` / `admin`
  - Store: `store.owner@uwell.com` / `admin`
  - Fan: `fan.preview@uwell.com` / `admin`
- Next recommended work:
  - implement the S-level store visit verification flow from the new design doc;
  - continue full secondary/tertiary page UI audit for remaining dark-edge or overflow cases;
  - before broader preview, rotate the previously pasted Supabase and Vercel tokens and replace temporary `admin` passwords.

### 2026-07-07 Trial Operation Seal Preparation

- User requested Stage 3 trial environment sealing and Stage 4 team documentation:
  - rotate Supabase / Vercel tokens;
  - replace all temporary passwords;
  - lock Vercel environment variables;
  - prepare trial accounts and real inventory;
  - deploy a new external preview;
  - run final Fan / Store / Admin acceptance on the real preview URL;
  - document reward pickup, store confirmation, S-level store rules, error handling, and backend record lookup.
- Repository changes prepared for trial account hardening:
  - replaced local seed `admin/admin` staff passwords with role-specific trial passwords;
  - added explicit trial store owner and fan preview credentials to seed data;
  - bound the local trial store owner to an S-level store for reward pickup testing;
  - changed local auth fallback so it must match records in the local `auth` table instead of accepting arbitrary passwords;
  - updated admin login copy from "any email and password" to assigned trial account wording.
- Team document added:
  - `docs/trial-operations-playbook-2026-07-07.md`
  - covers fan redemption, S-level store pickup, store responsibilities and incentives, exception handling, backend lookup paths, and the seal checklist.
- Trial account set for preview verification:
  - Admin: `admin@uwell.com` / `UwellAdmin@2026`
  - Manager: `manager@uwell.com` / `UwellManager@2026`
  - Rep: `rep1@uwell.com` / `UwellRep@2026`
  - Store: `store.owner@uwell.com` / `UwellStore@2026`
  - Fan: `fan.preview@uwell.com` / `UwellFan@2026`
- Security boundary:
  - tokens pasted in chat must be treated as exposed and revoked in Supabase / Vercel;
  - Supabase Auth user passwords must be updated in Supabase Auth as well as in local seed data;
  - `.env` was not edited.
- Verification completed:
  - `npm test` passed: 29 test files, 78 tests;
  - `npm run build` passed; only the known Vite chunk-size / plugin timing warnings remain;
  - local build preview `http://127.0.0.1:4176/` passed mobile three-portal acceptance:
    - Fan: `/fan-app.html#/fan-center`;
    - Store: `/store-app.html#/store-owner`;
    - Admin dashboard plus stores, visits, campaigns, fans, and materials list routes;
    - all checked pages reported no horizontal overflow at 390px width;
    - screenshots saved under `frontend/output/playwright/trial-seal-local/`.
- External deployment status:
  - Vercel CLI is installed but local login is unavailable;
  - the provided Vercel token returned `missing_scope` / `No teams available`;
  - retrying with the previously inferred scope returned `scope-not-existent`;
  - the no-auth fallback deploy service now returns CLI guidance instead of a claimable preview URL;
  - a new external preview still requires a Vercel token with access to the target account/project.
- Supabase status:
  - Supabase CLI was not available locally; `npx supabase --version` attempted a temporary CLI fetch and reported `2.109.1`, but no project files were changed;
  - Supabase Auth passwords still need to be changed in Supabase control plane or through an approved Admin API flow;
  - previously pasted Supabase / Vercel tokens still need to be revoked in their dashboards.

### 2026-07-08 Trial Operation Preview Seal

- User confirmed the new Supabase and Vercel tokens are available and asked to continue through trial operation readiness.
- Fixed the last external-preview reward closure issue:
  - `MallTab` now persists the latest successful redemption result in `sessionStorage`;
  - the redemption code remains visible even if fan points refresh causes a parent rerender;
  - the displayed pickup code now uses the remote `mall_redemptions.redeem_code` when Supabase returns it.
- Added regression coverage:
  - `MallTab.static.test.mjs` now checks that the redemption code persistence path exists.
- Supabase trial data was aligned:
  - Auth passwords reset for Admin, Manager, Rep, Store, and Fan trial accounts;
  - fan preview points reset to `1000`;
  - `.env` was not edited.
- New external preview deployed:
  - Preview URL: `https://dist-k7h86y8vq-robinlei2533-2668s-projects.vercel.app`
  - Inspect URL: `https://vercel.com/robinlei2533-2668s-projects/dist/8XpRTUR6jZQ1HBR1QnmGRJFbAmn4`
- Verification completed:
  - `npm test` passed: 29 test files, 83 tests.
  - `npm run build` passed; only the known Vite chunk-size warning remains.
  - Real external browser acceptance passed on mobile viewport:
    - fan login succeeded;
    - fan redeemed `UWELL Lighter`;
    - redemption created Supabase `mall_redemptions` and `fan_points_log` rows with HTTP 201;
    - code `UW-N4ANJBML` was visible in the fan UI;
    - S-level store login succeeded;
    - store checked the code in Reward Pickup;
    - `confirm_reward_pickup` RPC returned HTTP 200;
    - page showed `Reward pickup confirmed`.
  - Admin external preview acceptance passed on mobile viewport:
    - admin login succeeded;
    - dashboard opened;
    - Stores, Fans, and Materials list pages reported no horizontal overflow at 390px width.
  - Supabase database confirmation:
    - `mall_redemptions.redeem_code = UW-N4ANJBML` status is `picked_up`;
    - pickup store id is `bc13408d-ca13-4d22-91a7-f1aac5f11973`;
    - `UWELL Lighter` stock is now `3`.
  - Browser screenshots saved under:
    - `frontend/output/playwright/trial-final-preview-20260708/`;
    - `frontend/output/playwright/trial-final-preview-20260708-admin/`.
- Trial operation accounts:
  - Admin: `admin@uwell.com` / `UwellAdmin@2026`
  - Manager: `manager@uwell.com` / `UwellManager@2026`
  - Rep: `rep1@uwell.com` / `UwellRep@2026`
  - Store: `store.owner@uwell.com` / `UwellStore@2026`
  - Fan: `fan.preview@uwell.com` / `UwellFan@2026`
- Trial operation readiness:
  - status: ready for small-scope trial operation on the preview URL;
  - still do not promote to production domain until the user has manually reviewed the preview and token rotation is completed in the provider dashboards.

### 2026-07-09 Fan / Store / Admin Issue Fix Archive

- User requested a focused fix pass for the previously reported trial-operation issues, without expanding into unrelated roadmap work.
- Fan center fixes:
  - fixed the reward redemption success modal getting stuck after clicking redeem;
  - closing the redemption modal now clears the stored latest redemption result from `sessionStorage`, so the modal does not immediately reopen;
  - changed the activity module from the old "join campaign" flow to `UWELL Knowledge Hub`;
  - added fan engagement tasks for UWELL knowledge reading, UWELL social sharing, and UWELL social like/comment actions;
  - completing each engagement task grants the configured fan points and records the task in `fan_engagement_tasks` to prevent duplicate claiming;
  - kept historical campaign cards as readable guide/detail content instead of writing old `campaign_claims` records.
- Fan scan and registration fixes:
  - scan entry now explains that mobile browsers can open the camera when supported and desktop users can continue with manual code input;
  - camera startup now checks `navigator.mediaDevices?.getUserMedia` before requesting camera access;
  - fan registration modal now has a visible `Back to sign in` button;
  - fan registration modal can scroll on short screens and keeps the close button visible.
- Store center fix:
  - store registration now creates a Supabase Auth owner account with email/password;
  - the created Auth user id is bound to the store through `owner_profile_id`, allowing later email/password login to match the registered store;
  - local fallback still stores preview passwords only locally and does not send `owner_password_preview` to remote store creation.
- Admin center staff registration fixes:
  - staff account modal now asks for employee name instead of store name;
  - role options are now Employee and Admin only;
  - removed the Fan option from staff registration;
  - staff role dropdown now uses a light readable popup style instead of the black dropdown surface.
- Files changed in this fix pass:
  - `frontend/src/pages/fans/tabs/MallTab.jsx`
  - `frontend/src/pages/fans/tabs/CampaignTab.jsx`
  - `frontend/src/pages/fans/tabs/ScanTab.jsx`
  - `frontend/src/pages/fan-entry/FanEntryPage.jsx`
  - `frontend/src/pages/store-owner/StoreEntryPage.jsx`
  - `frontend/src/pages/login/LoginPage.jsx`
  - `frontend/src/utils/translations.js`
  - `frontend/src/index.css`
  - focused static regression tests under the same feature areas.
- Verification completed before this archive entry:
  - targeted tests passed: `npm test -- MallTab.static.test.mjs CampaignTab.static.test.mjs ScanTab.static.test.mjs FanEntryPage.static.test.mjs StoreEntryPage.static.test.mjs LoginPage.static.test.mjs`
    - 6 test files passed;
    - 25 tests passed.
  - full test suite passed:
    - `npm test`
    - 30 test files passed;
    - 91 tests passed.
  - production build passed:
    - `npm run build`
    - Vite build succeeded;
    - only the known chunk-size / plugin timing warnings remain.
- Scope note:
  - this archive entry records the focused fixes requested by the user;
  - no `.env` file was edited;
  - no new dependency was installed;
  - unrelated untracked files were left untouched.

### 2026-07-09 Trial Issue Second Pass / Backend Risk Check

- User requested another focused fix pass before saving and uploading:
  - fan reward redemption must not fail or get stuck;
  - fan activity should open official UWELL reading/social destinations and then allow task check-in for points;
  - daily check-in and activity point grants must continue working even if Supabase point writes are temporarily blocked;
  - mobile scan copy must clearly indicate camera support;
  - store owner email/password login must work after registration;
  - rep/admin Chinese UI must not mix English labels in the Chinese workspace;
  - staff account creation must show employee name and only Employee/Admin roles.
- Additional code fixes completed:
  - `MallTab` now issues a local pickup code if remote `mall_redemptions` insertion is unavailable, so fans still receive a usable redemption code during trial operation;
  - `createRewardRedemptionRemote` now has a reward-specific local fallback even when generic DB fallback is disabled;
  - fan activity tasks now open `https://www.myuwell.com/news/all` and `https://www.instagram.com/uwell.tech/` before task confirmation;
  - `addFanPoints` now falls back to the local points log if Supabase point log / fan update calls fail;
  - store registration now keeps a local trial login mirror after remote registration, covering Supabase email-confirmation delays;
  - store owner local trial login is allowed on local preview and Vercel preview hosts;
  - rep workspace default language is Chinese for all roles;
  - rep dashboard/sidebar hard-coded English labels were replaced with translation keys;
  - staff role dropdown remains on a light surface and shows Employee/Admin only.
- Backend / Supabase risk check:
  - current formal Supabase migrations include RLS for `fan_points_log`, `fan_checkins`, and `mall_redemptions`;
  - `confirm_reward_pickup` RPC validates authenticated store owner binding, S-level eligibility, one-time code status, expiry, inventory mapping, stock deduction, outbound record creation, and redemption status update in one transaction;
  - no Supabase service-role key or Vercel token was found in source files scanned;
  - legacy `database/one_shot_setup.sql` still contains broad open policies and should remain historical/local-only, not be used to overwrite the trial database.
- Verification completed:
  - targeted tests passed: 9 files, 28 tests;
  - full `npm test` passed: 31 test files, 93 tests;
  - `npm run build` passed; only known Vite chunk-size and plugin timing warnings remain;
  - local production preview ran at `http://127.0.0.1:4176/`;
  - browser acceptance passed for:
    - fan activity link opening, reward code modal close, and scan camera guidance before the preview fan points were depleted by repeated redemption checks;
    - store desktop email/password login reaching the store center;
    - rep dashboard Chinese labels;
    - admin staff modal employee-name field and light Employee/Admin role dropdown.
- Trial data note:
  - repeated redemption acceptance consumed points from `fan.preview@uwell.com`;
  - before handing the next external preview to the user, reset the fan preview points or create a fresh fan trial account with enough points for reward redemption checks.
- External deployment:
  - deployed with Vercel CLI using the provided Vercel token and explicit scope `robinlei2533-2668s-projects`;
  - deployment URL: `https://frontend-q7okp20mz-robinlei2533-2668s-projects.vercel.app`;
  - inspect URL: `https://vercel.com/robinlei2533-2668s-projects/frontend/JofWYAzeKLFv7hPjvSmCajWYTnTh`;
  - Vercel CLI reported the deployment target as `production` even though the command did not pass `--prod`.
- Workflow notes:
  - no `.env` file was edited;
  - no new dependency was installed;
  - unrelated untracked files remain untouched.
