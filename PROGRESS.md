# UWELL CRM Project Progress

Last updated: 2026-07-05

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

Recent verified commands:

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

1. Full three-portal acceptance test is not yet complete in this session.
   - Need to manually or automatically run:
     - fan registration -> fan center -> campaign -> store recommendation -> points/rewards
     - store registration -> pending/trial state -> store owner center
     - admin login -> store/fan/campaign/material views
     - field-rep login -> restricted menu/data scope

2. `ux-smoke.cjs` needs review.
   - It failed on the fan-entry title check after the dev server was restarted.
   - Need to confirm whether the page regressed or the smoke script assertion is stale.

3. Public launch readiness is not complete.
   - No final production deployment process has been locked.
   - No custom domain / SSL / monitoring / analytics setup is confirmed.

### Medium Priority

4. Fan entry settings still contains a code path that can link to store login.
   - Fan center settings has had the store-entry button removed.
   - But `FanEntryPage.jsx` still contains a settings item pointing to `/store-app.html#/store-login`.
   - Need product decision: keep store login discoverable on public entry, or remove it for a cleaner fan-only entry.

5. English-first cleanup is not fully complete.
   - Fan and store portals are mostly English-first.
   - Some demo/seed content and internal mixed Chinese/English copy remains.

6. Real trial data still needs curation.
   - Seed data exists and includes realistic stores/campaigns.
   - Before real trial, prepare the exact admin, manager, rep, store, and fan test accounts.

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

Review and repair the acceptance smoke test, then run a full three-portal acceptance pass and update this file with the verified results.
