# UWELL CRM Project Progress

Last updated: 2026-07-16

## 2026-07-16 Task-025 Fan Home Visual & IA Polish

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/FanCenterPage.jsx`.
   - Reworked Fan Home into a focused growth-first shell:
     - existing member growth card remains at the top;
     - new `Today's power moves` mission area highlights the two core daily actions;
     - Check-in remains an instant action and keeps the `View streak` secondary entry;
     - Scan remains a Home secondary entry through the existing Scan page;
     - recommended activity is reduced to one focused card;
     - recommended reward is reduced to one preview card;
     - nearby store entry is reduced to one lightweight card while preserving exposure wording;
     - recent point activity is kept as a lighter feed.
   - Kept Home routes into real fan sections:
     - Activities;
     - Rewards;
     - Stores;
     - Check-in detail;
     - Scan.
   - Did not use `/preview/fan`.
2. Updated `frontend/src/pages/fans/FanCenterPage.static.test.mjs`.
   - Added Task-025 regression coverage for the focused Home growth IA.
   - Updated the Check-in detail regression to match the new Home action grid.
   - Kept coverage that core Home entries still route to real fan sections.
3. Updated `frontend/src/index.css`.
   - Added scoped `.fan-shell .fan-home-*` styles.
   - Preserved UWELL yellow-green theme, readable contrast, fixed bottom nav compatibility, and mobile layout.
   - Fixed mobile action-card text wrapping after screenshot review.
4. Added browser QA artifacts under:
   - `frontend/output/playwright/task-025-home-polish/`

Why:

Task-024 concluded that the fan shell structure was correct, but Home still felt like stacked modules instead of a young, growth-oriented fan center. Task-025 focuses Home visual hierarchy without changing business behavior.

Pages affected:

1. Fan Center Home:
   - `fan-app.html#/fan-center`

Database impact:

None.

No schema, seed data, Supabase, RLS, localDb structure, backend API, `.env`, point rule, scan rule, reward rule, or store exposure rule was changed.

Business logic impact:

None.

Existing behavior preserved:

1. Daily check-in remains once per day through existing `handleTaskCheckIn`.
2. `View streak` still opens the Check-in detail page.
3. Scan still opens the existing Scan secondary page.
4. Activity, reward, store, and recent point records still use existing data.
5. Store exposure wording and `fan_home_recommended` compatibility remain in source.

Other page impact:

No intended impact on:

1. Activities
2. Community
3. Rewards
4. Stores
5. Me
6. Check-in detail
7. Scan detail
8. Store portal
9. Admin portal
10. `/preview/fan`

Verification:

1. Red test first:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Failed as expected because `fan-home-shell` and the Task-025 focused Home IA were missing.
2. Focused tests:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/FanStoresExposure.static.test.mjs`
   - Passed: 2 files, 19 tests.
3. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain:
     - plugin timing;
     - large chunk warning.
4. Browser QA:
   - Script:
     - `node output/playwright/task-025-home-polish/qa-home.mjs`
   - Checked:
     - 390px mobile;
     - 768px tablet;
     - 1440px desktop.
   - Confirmed:
     - `.fan-home-shell` rendered;
     - `.fan-home-mission-control` rendered;
     - 2 Home action cards rendered;
     - 3 spotlight cards rendered;
     - `.fan-bottom-nav` computed position is `fixed`;
     - no horizontal overflow;
     - no console errors in the checked flow.
   - Screenshots:
     - `frontend/output/playwright/task-025-home-polish/mobile-home.png`
     - `frontend/output/playwright/task-025-home-polish/tablet-home.png`
     - `frontend/output/playwright/task-025-home-polish/desktop-home.png`
   - Report:
     - `frontend/output/playwright/task-025-home-polish/report.json`
5. Full test suite:
   - `npm test`
   - Failed with 3 existing/non-Task-025 static test failures:
     - `src/stores/languagePersistence.static.test.mjs`
       - expects FanCenterPage not to force English via `setLang('en')` / `ensureEnglishFirst`;
     - `src/utils/legal-content.static.test.mjs`
       - expects legal content to mention `30 days`, while current source says `7 days`;
     - `src/pages/fans/tabs/InviteAndGuide.static.test.mjs`
       - expects `Earn 50 Points`, while current invite copy says the fan earns `{INVITE_REWARD_POINTS} points`.

Known verification notes:

1. The full-page mobile screenshot shows fixed bottom navigation over the stitched screenshot. This is the normal full-page screenshot artifact for fixed nav, not a layout failure.
2. The full test failures listed above were not changed in Task-025 scope and should be handled only through separate confirmed tasks.
3. The project requirement says default language is English and Arabic is future work; this conflicts with the existing language persistence static test. Do not change language behavior without a separate confirmed language task.

Next recommendation:

Task-026:
Fan Home follow-up visual QA / polish closeout.

Recommended scope:

1. Review Task-025 mobile/tablet/desktop screenshots.
2. Decide whether Home action cards should be more compact on mobile or remain current large game-action cards.
3. If approved, do a small spacing-only pass.
4. Keep database, business rules, permissions, store portal, and admin portal unchanged.

## 2026-07-16 Task-020 Fan Check-in Entry Flow Fix

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/FanCenterPage.jsx`.
   - Added `handleOpenCheckInDetails`.
   - Added a stable `View streak` entry in the Home daily action area.
   - Kept the existing one-tap check-in behavior:
     - if the fan has not checked in today, the primary Check-in button awards points;
     - if the fan has already checked in, the primary Check-in button opens the Check-in detail page through existing logic.
   - Changed the Home check-in primary button copy from the old separator style to `+5 pts` to avoid odd separator rendering.
2. Updated `frontend/src/pages/fans/FanCenterPage.static.test.mjs`.
   - Added regression coverage that Home exposes a separate Check-in detail entry.
   - Locked the path from Home to `CheckInTab`.
3. Updated `frontend/src/index.css`.
   - Added scoped styles:
     - `.fan-checkin-home-actions`;
     - `.fan-checkin-detail-link`.

Why:

Task-019 found that the Check-in detail page existed in code but was not reachable through a stable user path. Home -> Check in performed the daily check-in action and stayed on Home. Fans had no clear way to open the streak/week/progress detail page.

Pages affected:

1. Fan Center Home:
   - `fan-app.html#/fan-center`
2. Fan Center Check-in secondary page:
   - opened through Home -> `View streak`.

Database impact:

None.

No schema, seed, Supabase, RLS, localDb structure, or `.env` change was made.

Existing data used:

1. `fan_checkins`
2. `fan_points_log`
3. existing fan point state

Permissions impact:

None.

No fan/store/admin permission behavior changed.

Other page impact:

No intended impact on:

1. Activities
2. Community
3. Rewards
4. Stores
5. Me
6. Scan
7. Store portal
8. Admin portal

Verification:

1. Red test first:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Failed as expected before implementation because `handleOpenCheckInDetails`, `View streak`, and the Home detail entry were missing.
2. Focused test:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Passed: 1 file, 14 tests.
3. Fan portal regression:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/CheckInTab.static.test.mjs src/pages/fans/tabs/ScanTab.static.test.mjs src/pages/fans/tabs/InviteTab.static.test.mjs src/pages/fans/tabs/HowItWorksTab.static.test.mjs src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/CommunityTab.static.test.mjs src/pages/fans/tabs/CampaignTab.static.test.mjs src/pages/fans/tabs/MapTab.exposure.static.test.mjs`
   - Passed: 9 files, 46 tests.
4. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain:
     - plugin timing;
     - large chunk warning.
5. Browser verification:
   - Opened `http://127.0.0.1:5173/fan-app.html#/fan-center`.
   - Injected local demo fan session:
     - `fan_logged_in = true`;
     - `store_manager_current_user = f-001`.
   - Confirmed Home shows `View streak`.
   - Clicked `View streak`.
   - Confirmed `.fan-checkin-page` rendered.
   - Confirmed bottom nav remained `fixed`.
   - Confirmed no horizontal overflow at 390px mobile width.
   - Screenshots saved:
     - `frontend/output/playwright/task-020-checkin-entry/mobile-home-view-streak.png`
     - `frontend/output/playwright/task-020-checkin-entry/mobile-checkin-detail.png`

Known verification notes:

1. Browser QA intentionally blocked remote media/font resources, producing expected `net::ERR_FAILED` console entries.
2. This task did not change check-in point rules. The Home quick action still awards points only through existing daily check-in logic.

Next recommendation:

Task-021:
Fan secondary-page return behavior unification.

Recommended scope:

1. Track source tab before opening secondary pages.
2. Return Home for Home-launched pages:
   - Scan;
   - Check-in.
3. Return Me for Me-launched pages:
   - Invite;
   - Guide;
   - Old fan verification.
4. Do not change database or business rules.

## 2026-07-16 Task-019 Fan Secondary Page Visual QA

Current status:

Completed with one follow-up issue found.

Changed:

1. No production code was changed.
2. No UI code was changed.
3. No database, permission, API, or `.env` change was made.
4. Generated browser QA screenshots under:
   - `frontend/output/playwright/task-019-secondary-qa/`
5. Generated QA report:
   - `frontend/output/playwright/task-019-secondary-qa/report.json`

Why:

Task-018 changed Check-in and Old fan verification UI. Before moving to another feature task, the fan secondary pages needed real browser verification instead of only static tests.

Pages checked:

1. Scan
2. Invite friends
3. New user guide
4. Old fan verification
5. Check-in entry behavior

Pages affected:

None by code change.

Visual QA target pages:

1. `fan-app.html#/fan-center`
2. Home -> Scan product
3. Me -> Invite friends
4. Me -> New user guide
5. Me -> Existing fan verification
6. Home -> Check in

Database impact:

None.

Permissions impact:

None.

Other page impact:

None.

Verification:

1. Local access:
   - `http://127.0.0.1:5173/fan-app.html#/fan-center`
   - Returned HTTP 200.
2. Browser QA used demo fan session:
   - `fan_logged_in = true`
   - `store_manager_current_user = f-001`
3. Screenshots captured at:
   - 390px mobile;
   - 768px tablet;
   - 1440px desktop.
4. Passing screenshot pages:
   - `mobile-scan.png`
   - `mobile-invite.png`
   - `mobile-guide.png`
   - `mobile-oldfan.png`
   - `tablet-scan.png`
   - `tablet-invite.png`
   - `tablet-guide.png`
   - `tablet-oldfan.png`
   - `desktop-scan.png`
   - `desktop-invite.png`
   - `desktop-guide.png`
   - `desktop-oldfan.png`
5. Browser metrics from `report.json` confirmed for Scan, Invite, Guide, and Old fan verification:
   - target selector found;
   - bottom navigation found;
   - bottom navigation position is `fixed`;
   - bottom is `0px`;
   - no horizontal overflow at 390, 768, or 1440 widths.

Known verification notes:

1. Console showed `Failed to load resource: net::ERR_FAILED` because the QA script intentionally blocked external media/fonts including video and remote font resources. This was expected and not a page JavaScript crash.
2. Full-page screenshots can show the fixed bottom nav over the middle of a long stitched screenshot. This is a screenshot stitching artifact, not a real scrolling-position failure.
3. Scan page is functionally accessible and passes fixed-nav / overflow checks, but still has relatively high text density on mobile because it explains multiple scan-code classes.

Follow-up issue found:

1. Check-in secondary page is not currently reachable through a stable user path.
   - Home -> Check in performs the daily check-in action.
   - After the first click, the Home button text changes to `Checked in · +5`.
   - The page remains on Home.
   - The script could not open `.fan-checkin-page` through normal user interaction.
2. This means Task-018's Check-in UI exists in code, but Task-019 could not visually validate it through the real user flow.

Next recommendation:

Task-020:
Fan Check-in entry flow fix.

Recommended scope:

1. Analyze whether Home Check-in should:
   - perform instant check-in only;
   - open Check-in detail only;
   - or perform check-in and then expose a `View streak` / `Details` entry.
2. Confirm the intended UX before coding.
3. After confirmation, make Check-in detail reachable without changing point rules.
4. Re-run Task-019 screenshots for Check-in at mobile, tablet, and desktop.

## 2026-07-16 Task-018 Fan Secondary Page Consistency Pass

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/tabs/CheckInTab.jsx`.
   - Kept existing daily check-in logic.
   - Kept `fan_checkins` reads/writes.
   - Kept `addFanPoints` before local check-in record creation.
   - Kept configurable `operationalRules.checkInPoints`.
   - Rebuilt the page into a recovered fan secondary shell:
     - yellow-green hero;
     - points / level / today status cards;
     - one-week check-in strip;
     - clear check-in action card;
     - level progress card.
   - Removed old dense Ant Card layout, old purple-blue gradient, and `liquid-glass` usage from the check-in page.
2. Updated `frontend/src/pages/fans/FanCenterPage.jsx`.
   - Rebuilt the existing fan verification secondary page.
   - Kept existing old fan proof upload logic.
   - Kept `old_fan_verifications` local records.
   - Kept review status behavior and approved `+100` display.
   - Replaced the old `Card className="fan-panel"` and inline white text with scoped recovered fan UI:
     - verification hero;
     - status card;
     - upload card;
     - submission history list.
3. Updated static tests:
   - `frontend/src/pages/fans/tabs/CheckInTab.static.test.mjs`;
   - `frontend/src/pages/fans/FanCenterPage.static.test.mjs`.
   - Added regression checks that Check-in and Old fan verification use recovered fan styling and do not fall back to the old dense structures.
4. Updated `frontend/src/index.css`.
   - Added scoped `.fan-checkin-*` styles.
   - Added scoped `.fan-verification-*` styles.
   - No store/admin global style change was intended.

Why:

Task-017 finished Me, Invite, and Guide recovery, but secondary pages still had inconsistent old UI. Check-in and Old fan verification were the clearest remaining conflicts:

1. Check-in still used dense Ant cards, old gradients, and `liquid-glass`.
2. Old fan verification still used a plain card, inline styles, and high text density.
3. Both pages needed to match the current confirmed fan direction: yellow-green, youthful, low text density, and clear action-first structure.

Pages affected:

1. Fan Center secondary Check-in page:
   - `fan-app.html#/fan-center`
   - Home -> Check in.
2. Fan Center secondary Old fan verification page:
   - `fan-app.html#/fan-center`
   - Me -> Existing fan verification;
   - Settings -> My verification.

Database impact:

None.

No schema, seed data, Supabase, RLS, table, localDb structure, auth, or `.env` changes were made.

Existing data used:

1. `fan_checkins`
2. `fan_points_rules`
3. `old_fan_verifications`
4. `fan_points_log` through existing point awarding flow

Permissions impact:

None.

No fan, store, admin, upload review, or account permission logic was changed.

Other page impact:

No intended impact on:

1. Home
2. Activities
3. Community
4. Rewards
5. Stores
6. Me
7. Store portal
8. Admin portal
9. `/preview/fan`

Verification:

1. Red tests were added first:
   - `npm test -- src/pages/fans/tabs/CheckInTab.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs`
   - Failed as expected before implementation because the new check-in and verification shells were missing.
2. Focused tests:
   - `npm test -- src/pages/fans/tabs/CheckInTab.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs`
   - Passed: 2 files, 15 tests.
3. Fan portal regression:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/CheckInTab.static.test.mjs src/pages/fans/tabs/ScanTab.static.test.mjs src/pages/fans/tabs/InviteTab.static.test.mjs src/pages/fans/tabs/HowItWorksTab.static.test.mjs src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/CommunityTab.static.test.mjs src/pages/fans/tabs/CampaignTab.static.test.mjs src/pages/fans/tabs/MapTab.exposure.static.test.mjs`
   - Passed: 9 files, 45 tests.
4. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain:
     - plugin timing;
     - large chunk warning.

Known verification notes:

1. This task did not run a fresh Playwright screenshot pass. The next visual QA task should capture mobile, tablet, and desktop screenshots for Check-in and Old fan verification.
2. The current task intentionally did not change secondary-page return routing. Back still follows the current existing shell behavior.

Follow-up notes:

1. If the user wants secondary pages opened from Me to return to Me instead of Home, that should be a separate confirmed flow task.
2. Image upload for old fan verification remains local/demo behavior. Real upload storage, moderation, and backend review rules require a separate confirmed task.
3. Continue avoiding broad global CSS cleanup until the fan portal is visually stable.

Next recommendation:

Task-019:
Fan secondary-page visual QA and screenshot pass.

Recommended scope:

1. Run local browser screenshot checks for:
   - Check-in;
   - Scan;
   - Invite;
   - Guide;
   - Old fan verification.
2. Verify at:
   - 390px mobile;
   - 768px tablet;
   - 1440px desktop.
3. Confirm:
   - fixed bottom nav remains visible;
   - no horizontal overflow;
   - text contrast is readable;
   - no old dense card style remains on these secondary pages.

## 2026-07-15 Task-014A Fan Activities Page Recovery

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/tabs/CampaignTab.jsx`.
   - Kept existing official engagement task logic.
   - Kept `fan_engagement_tasks` records and `addFanPoints` for official quick tasks.
   - Kept official campaign sections: Ongoing, Upcoming, Past.
   - Kept store activities from `filterFanVisibleStoreActivities`.
   - Rebuilt the Activities page layout into a clearer activity hub:
     - hero section;
     - official quick actions;
     - official activities;
     - store activities;
     - store activity four-step verification flow.
   - Added visible store activity flow:
     - Join;
     - Visit store;
     - Store verifies;
     - Points added.
   - Kept store activity points as verification-based, not instant claim.
2. Updated `frontend/src/pages/fans/tabs/CampaignTab.static.test.mjs`.
   - Added regression coverage for the recovered activity hub layout.
   - Added regression coverage that store activities do not become direct instant point claims.
3. Updated `frontend/src/index.css`.
   - Added scoped `fan-activity-*` styles for hero, section headers, quick grid, store verification strip, empty state, and store event poster.
   - Added mobile layout handling for the activity hero and store verification strip.

Why:

The Activities page already had the right business functions, but the presentation was still too close to a dense card list. The page needed to match the confirmed fan IA:

1. Top area: quick official earning tasks.
2. Main area: official activities.
3. Store area: store activities with clear offline verification.
4. Less text density and clearer fan-facing action language.

Pages affected:

1. Fan Center main Activities tab:
   - `fan-app.html#/fan-center`
   - Bottom nav -> Activities.

Database impact:

None.

No schema, seed, Supabase, RLS, table, or `.env` changes were made.

Existing data used:

1. `campaigns`
2. `fan_engagement_tasks`
3. `fan_points_log`

Permissions impact:

None.

Other page impact:

No intended impact on Home, Scan, Community, Rewards, Stores, Me, Store portal, or Admin portal.

Verification:

1. Red test first:
   - `npm test -- src/pages/fans/tabs/CampaignTab.static.test.mjs`
   - Failed as expected before implementation because the new activity hub layout and store verification flow were missing.
2. Focused tests:
   - `npm test -- src/pages/fans/tabs/CampaignTab.static.test.mjs`
   - Passed: 1 file, 9 tests.
3. Fan shell regression:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/CampaignTab.static.test.mjs`
   - Passed: 2 files, 21 tests.
4. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain:
     - plugin timing;
     - large chunk warning.
5. Browser verification:
   - Opened real fan center at `http://127.0.0.1:5173/fan-app.html#/fan-center`.
   - Used local demo fan `f-001`.
   - Entered Activities from the bottom nav.
   - Confirmed `.fan-activity-page` rendered.
   - Confirmed no horizontal overflow at:
     - 390px mobile;
     - 768px tablet;
     - 1440px desktop.
   - Screenshots saved:
     - `frontend/output/playwright/task-014-activities/mobile-activities-final.png`
     - `frontend/output/playwright/task-014-activities/tablet-activities-final.png`
     - `frontend/output/playwright/task-014-activities/desktop-activities-final.png`

Known verification notes:

1. Screenshot script blocked external images/fonts/media to avoid slow network loading; this created expected `net::ERR_FAILED` console entries for those blocked resources.
2. Bottom navigation remains fixed as required.
3. The full-page mobile screenshot shows fixed bottom nav over the stitched screenshot in the middle; this is expected from full-page screenshot stitching with fixed elements, not a page route failure.

Follow-up notes:

1. This task did not change campaign database rules.
2. This task did not make store activities award points directly.
3. Store activity points remain tied to store verification and existing rules.
4. Future refinement can add real activity images/posters after product assets are selected.

Next recommendation:

Task-015: Fan Community page recovery.

Recommended scope:

1. Keep existing `CommunityTab.jsx` business functions.
2. Make Community look like a real feed:
   - composer at top;
   - fan and official posts;
   - like/comment actions;
   - small point-rule hint only.
3. Preserve daily limits:
   - like +1, max 10/day;
   - comment +2, max 5/day;
   - first post +10.
4. Do not change database rules without a separate confirmed task.

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
  - first deployment accidentally targeted the `frontend` Vercel project and was protected by Vercel login/SSO;
  - final public preview was deployed to the existing `dist` project;
  - public preview URL: `https://dist-8h0wygkqa-robinlei2533-2668s-projects.vercel.app`;
  - inspect URL: `https://vercel.com/robinlei2533-2668s-projects/dist/B9mTm1V7JRWK7S9WQKnYP2x6pkBB`;
  - external smoke check confirmed Fan Entry, Store Login, and Admin Login pages load publicly.
- Workflow notes:
  - no `.env` file was edited;
  - no new dependency was installed;
  - unrelated untracked files remain untouched.

### 2026-07-09 Fan Activity / Store Campaign / Reward Rules Closure

- User confirmed the third-point activity plan and asked to implement it:
  - store owners can apply for store activities from Store Center;
  - approved store activities should automatically appear in Fan Center;
  - official UWELL article / Instagram engagement tasks should grant points after a 10-second visible stay;
  - reward exchange rules should be made explicit before trial operation.
- Store activity closure:
  - Store Center Campaigns now supports activity application submission;
  - submitted activities are saved as pending, hidden from fans by default;
  - Admin Campaign Detail now supports approving or rejecting store applications;
  - approved activities become ongoing and fan-visible;
  - Fan Center shows nearby approved store activities by city.
- Fan official task closure:
  - added UWELL article reading task linked to `https://www.myuwell.com/news/all`;
  - added UWELL Instagram viewing task linked to `https://www.instagram.com/uwell.tech/`;
  - added like/comment/share engagement task;
  - tasks require 10 visible seconds before claiming points;
  - the timer pauses when the browser tab is hidden;
  - each fan can claim each task once per day.
- Reward rule closure:
  - Fan Center now displays a clear reward tier guide:
    - 50-100 points: starter gifts;
    - 150-300 points: standard merchandise;
    - 300-600 points: pods / accessories / coupons;
    - 800-1500 points: devices / VIP rewards, limited to one per month;
  - rewards continue to require S-level store pickup and store-side verification for inventory deduction.
- Preview fallback fix:
  - demo fan entry now initializes seed data when the browser has a current DB version but an empty fan table;
  - Fan Center now allows local fan fallback when the saved current user has a matching local fan record, preventing the preview-only "No fan profile found" dead end.
- Supporting files:
  - added `frontend/src/utils/fanActivityRules.js`;
  - added `frontend/src/utils/fanActivityRules.test.mjs`;
  - added implementation plan and design notes under `docs/superpowers/`.
- Verification completed before this archive entry:
  - focused tests passed:
    - `npm test -- src/pages/fans/tabs/CampaignTab.static.test.mjs src/utils/fanActivityRules.test.mjs`;
    - 2 test files passed;
    - 11 tests passed.
  - full test suite passed:
    - `npm test`;
    - 32 test files passed;
    - 99 tests passed.
  - production build passed:
    - `npm run build`;
    - Vite build succeeded with only known chunk-size / plugin timing warnings.
  - local browser acceptance passed on `http://127.0.0.1:4178/` for:
    - store activity application submission;
    - pending activity hidden from fans;
    - approval making the activity visible in Fan Center;
    - reward rules display;
    - official article task opening the UWELL URL and granting points after the 10-second visible stay.
  - refreshed local production preview acceptance passed on `http://127.0.0.1:4179/` after the preview fallback fix:
    - demo fan profile opens successfully;
    - official article task writes a `UWELL Engagement` +5 points record;
    - store email/password login reaches Store Center;
    - store activity application starts pending and hidden;
    - approved same-city store activity appears in Fan Center;
    - reward exchange rules are visible;
    - admin campaign detail page loads the submitted activity.
- Scope note:
  - no `.env` file was edited;
  - no new dependency was installed;
  - no new Supabase migration was required because the feature reuses existing campaign records with additional client-side fields.

### 2026-07-09 Fan Activity Display Copy Simplification

- User reviewed the live preview and confirmed the points task logic should stay, but the lower activity content should stop showing invented participation steps.
- Fan activity page changes:
  - kept UWELL article reading, Instagram viewing, and like/comment/share points tasks;
  - kept the 10-second visible-stay claim logic and `UWELL Engagement` points write;
  - removed the old `View guide` action from official campaign cards;
  - removed the generic Step 1 / Step 2 / Step 3 participation guide from campaign details;
  - official and store campaign cards now show concrete facts: time range, organizer, and reward / benefit;
  - campaign detail modal now shows organizer, time, location, reward / benefit, and status;
  - mobile detail modal fields collapse to one column for readability.
- Verification completed:
  - focused static test passed:
    - `npm test -- src/pages/fans/tabs/CampaignTab.static.test.mjs`;
    - 1 test file passed;
    - 7 tests passed.
  - test assertions now explicitly protect the official article / Instagram / like-comment-share engagement tasks from accidental removal.

### 2026-07-15 Fan Portal Recovery / Navigation And IA Record

Current status:

- The project has shifted back to a controlled Senior Tech Lead workflow:
  - analyze first;
  - list impact;
  - wait for confirmation;
  - then develop;
  - record every change in project docs.
- This record only covers the latest fan-portal recovery tasks. It does not claim that the full dirty working tree is ready for production.

Modified in the latest fan-portal pass:

1. Fan navigation shell
   - Changed the real Fan Center bottom navigation toward the confirmed six-tab structure:
     `Home / Activities / Community / Rewards / Stores / Me`.
   - Kept compatibility aliases for older internal tab names such as `campaigns`, `mall`, and `profile`.
   - Purpose: align the real fan portal with the confirmed product IA without deleting existing fan functions.

2. Fan Home information architecture cleanup
   - Simplified Home into clearer daily-use sections:
     member growth, check-in, scan product, recommended activity, nearby UWELL stores, and rewards to aim for.
   - Reduced visible rule/copy density on Home.
   - Purpose: make Home feel like a usable fan entry screen instead of a mixed function dump.

3. Fan Activities page structure
   - Renamed the misleading `Read UWELL care guide` task to `Learn`.
   - Changed the large `UWELL Knowledge Hub` heading to a more direct `Activities` direction.
   - Reorganized activity content around:
     - points earning actions;
     - official activities;
     - store activities;
     - empty state for unavailable store activities.
   - Removed reward exchange rules from Activities because reward rules belong in Rewards, not Activities.
   - Purpose: reduce confusion between learning tasks, official activities, store activities, and reward rules.

Why these changes were made:

- The user confirmed that the new UI should be an upgrade of the existing website, not a replacement that removes old functions.
- The real fan portal needed to preserve existing capabilities while improving navigation, UI hierarchy, and usage logic.
- The earlier implementation risked becoming a mix of old UI, preview UI, and incomplete new logic. This pass was intended to move back toward controlled, product-led cleanup.

Pages affected:

- Fan Center main shell:
  - `frontend/src/pages/fans/FanCenterPage.jsx`
- Fan Activities:
  - `frontend/src/pages/fans/tabs/CampaignTab.jsx`
- Related static tests:
  - `frontend/src/pages/fans/FanCenterPage.static.test.mjs`
  - `frontend/src/pages/fans/tabs/CampaignTab.static.test.mjs`
  - `frontend/src/pages/fans/tabs/MallTab.inventory-copy.test.mjs`

Database impact:

- No database schema changes.
- No Supabase migration added.
- No `.env` file edited.
- No new dependency installed.
- No intentional permission/RBAC change.

Verification status:

- Passed focused fan navigation/static tests:
  - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
- Passed focused fan activities/rewards tests:
  - `npm test -- src/pages/fans/tabs/CampaignTab.static.test.mjs src/pages/fans/tabs/MallTab.inventory-copy.test.mjs`
- Passed build:
  - `npm run build`
- Full test suite is not fully green at this checkpoint. Known remaining failures:
  - `src/stores/languagePersistence.static.test.mjs`
    - current cause: Fan Center still has English-forcing behavior that conflicts with language persistence expectations.
  - `src/pages/fans/FanStoresExposure.static.test.mjs`
    - current cause: Store Map / S-A exposure / storefront trust cues are not fully aligned with the planned fan store-map exposure model.

Current state:

## 已完成

✅ Project roadmap documentation system created under `docs/`.

✅ Safe baseline identified:
`eb87aaea5c9c8c481c5940e7caa41388d8e16ec4`

✅ Fan portal recovery direction confirmed:
real fan portal must keep old functions while upgrading UI, navigation, and information hierarchy.

✅ Fan bottom navigation direction started:
`Home / Activities / Community / Rewards / Stores / Me`.

✅ Fan Home started moving toward daily-use structure.

✅ Fan Activities started moving away from confusing `Knowledge Hub` wording and into clearer activity sections.

## 开发中

🟡 Fan real-page upgrade:
navigation, Home, Activities, Community, Rewards, Store Map, and Me still need to be completed against the confirmed MD plans.

🟡 Store Map recovery:
map display, S/A/B/C store visibility, recommended store exposure, storefront photo, and service tags need another controlled pass.

🟡 Language consistency:
default English plus Arabic/RTL support is planned, but current language persistence still has failing tests.

## 待优化

🔴 UI consistency:
real fan pages still need a complete screenshot review to prevent old UI and new UI mixing.

🔴 Text density:
some fan/store/admin pages still contain too much dense text.

🔴 Cross-portal consistency:
store portal and admin portal should not be redesigned until fan portal sample passes.

🔴 Documentation-to-implementation discipline:
future tasks must start from PRD / Business Rules / Design System / Progress, then list files and risks before coding.

## 当前 Bug / Risk

1. Full test suite has known failures in language persistence and fan store exposure tests.

2. The working tree contains many unrelated historical modified/untracked files, so any next development must be scoped carefully.

3. Some old preview/design files remain in the repository and may confuse future implementation if not clearly separated from real app pages.

4. Fan Store Map is not yet at the expected product standard: the user expects real map-style display and S/A/B/C store classification visibility, not only store recommendation cards.

## 下一任务建议

Task-009:
Fan Store Map recovery analysis only.

Before coding, produce:

1. Current Store Map old functions inventory.
2. Confirmed desired Store Map functions from the MD plans.
3. Gap list.
4. Files to modify.
5. Database impact.
6. Permission impact.
7. UI acceptance checklist.

Only after confirmation should implementation begin.

Task-010:
Fan Community page recovery analysis.

Task-011:
Fan Rewards page recovery analysis.

Task-012:
Fan Me page recovery analysis.

### 2026-07-15 Task-009 Fan Store Map Recovery

修改了什么:

1. Fan Center 的 Home / Stores 门店入口接入现有后台曝光规则:
   - 使用 `sortStoresForFanExposure`;
   - 使用 `getStoreExposureScore`;
   - 支持 `fan_home_recommended`, `fan_map_highlighted`, `reward_pickup_recommended`, `eligible_for_store_events_display` 等现有曝光字段。

2. Stores 页面从“推荐门店说明 + 地图”升级为更清楚的粉丝可见 Store Map:
   - 顶部说明改为 Store map;
   - 加入 Featured store picks;
   - 展示门店等级、电话、Navigate;
   - 展示 Storefront photo / Trust photo pending;
   - 展示 Activity store / Pickup eligible / Display reviewed;
   - 继续保留原 `MapTab` 的 Leaflet 地图、S/A/B/C 筛选、地图 marker 和门店详情能力。

3. 修复粉丝端底部导航固定规则:
   - 明确 `.fan-shell .fan-bottom-nav` 和 `.fan-center-liquid-shell .fan-bottom-nav` 必须 `position: fixed`;
   - 三端浏览器验收确认 computed style 为 `fixed`。

4. 修复门店照片缺失时的 UWELL 占位图文字过大问题:
   - 占位文字缩小并居中，避免手机端压到门店名称。

为什么修改:

- 用户明确要求 Store Map 不能丢失旧网站功能，不能只显示推荐店铺卡片。
- 粉丝端 Stores 应该是地图优先，能看到 S/A/B/C 门店、推荐曝光、导航、门店照片和支持服务。
- 底部主导航必须像手机系统导航一样固定在底部，不允许随页面滚动消失或变成普通布局。

修改影响哪些页面:

- 影响:
  - `fan-app.html#/fan-center` 的 Home 附近门店入口;
  - `fan-app.html#/fan-center` 的 Stores 主导航页面。
- 不影响:
  - Store Owner 门店端;
  - Admin 后台端;
  - `/preview/fan`;
  - 活动、社区、兑奖、扫码的业务规则。

修改哪些数据库:

- 无数据库修改。
- 无 Supabase migration。
- 无 RLS / 权限修改。
- 无 `.env` 修改。
- 无新依赖。

修改文件:

- `frontend/src/pages/fans/FanCenterPage.jsx`
- `frontend/src/pages/fans/FanCenterPage.static.test.mjs`
- `frontend/src/index.css`
- `PROGRESS.md`

验证:

- RED:
  - `npm test -- src/pages/fans/tabs/MapTab.exposure.static.test.mjs src/pages/fans/FanStoresExposure.static.test.mjs`
  - 初始失败 3 项，确认 Fan Center 门店入口未接入曝光规则和照片/能力标签。
- GREEN:
  - `npm test -- src/pages/fans/tabs/MapTab.exposure.static.test.mjs src/pages/fans/FanStoresExposure.static.test.mjs`
  - 2 files passed, 5 tests passed.
- 固定导航回归:
  - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
  - 1 file passed, 11 tests passed.
- 合并聚焦测试:
  - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/MapTab.exposure.static.test.mjs src/pages/fans/FanStoresExposure.static.test.mjs`
  - 3 files passed, 16 tests passed.
- Build:
  - `npm run build` passed.
  - Only known Vite chunk-size / plugin timing warnings remain.
- Browser screenshots:
  - `frontend/output/playwright/task-009-store-map/mobile-home.png`
  - `frontend/output/playwright/task-009-store-map/mobile-stores-final.png`
  - `frontend/output/playwright/task-009-store-map/tablet-home.png`
  - `frontend/output/playwright/task-009-store-map/tablet-stores.png`
  - `frontend/output/playwright/task-009-store-map/desktop-home.png`
  - `frontend/output/playwright/task-009-store-map/desktop-stores.png`
- Browser verification result:
  - mobile/tablet/desktop nav position: `fixed`;
  - map exists;
  - 3 featured store cards exist;
  - no horizontal overflow;
  - no console error captured.

后续注意事项:

1. 当前门店名称来自 seed/demo 数据，部分看起来不像真实门店名，后续需要真实门店数据清理。

2. Storefront photo 当前多数为 pending，因为 seed 数据里缺少真实门店门口照片；后续门店注册/前三次登录提醒上传后，粉丝端会自然显示真实照片。

3. `frontend/src/index.css` 已经很大，后续不要继续无边界追加全局样式；粉丝端样式应继续用 `.fan-*` 范围控制。

4. Store Map 这一步只恢复和优化展示，不修改门店评级规则和曝光计算规则。

下一步建议:

Task-010:
Fan Community 页面恢复分析。

目标:

- 保留旧社区功能;
- 让页面真正像社区 feed;
- 发布帖子、点赞、评论、积分说明保留但不喧宾夺主;
- 先分析影响和文件，再等确认开发。

### 2026-07-15 Task-010 Fan Community Recovery

What changed:

1. Reworked the Fan Community page from a points-rule dashboard into a real community feed:
   - composer first;
   - lightweight points hint;
   - post feed as the main content;
   - each post shows avatar, author, Official/Fan tag, category, date, like, comment, and comment input.

2. Preserved the existing community business logic:
   - publish post;
   - like;
   - comment;
   - like points;
   - comment points;
   - first valid daily post points;
   - daily point limits;
   - duplicate-like prevention;
   - self-like no-points behavior;
   - short post/comment validation.

3. Added fan-facing display mapping for old internal demo community content:
   - no database schema change;
   - no seed deletion;
   - internal operational wording is not exposed in the Fan Community UI.

4. Added scoped `.fan-community-*` styles:
   - only affects Fan Community;
   - does not modify Store Owner;
   - does not modify Admin;
   - avoids broad global Ant Design overrides.

Why changed:

- The confirmed fan plan requires Community to feel like a real fan feed, not a rules panel.
- Points rules must remain visible but should not dominate the page.
- Old demo community content included internal operations language that is not appropriate for fans.

Pages affected:

- Affected:
  - `fan-app.html#/fan-center` > Community.
- Not affected:
  - Home;
  - Activities;
  - Rewards;
  - Stores;
  - Me;
  - Store Owner;
  - Admin;
  - `/preview/fan`.

Database impact:

- No database schema change.
- No Supabase migration.
- No RLS or permission change.
- No `.env` change.
- No new dependency.
- Original seed data was not modified; fan-facing display mapping is applied inside `CommunityTab.jsx`.

Files changed:

- `frontend/src/pages/fans/tabs/CommunityTab.jsx`
- `frontend/src/pages/fans/tabs/CommunityTab.static.test.mjs`
- `frontend/src/index.css`
- `PROGRESS.md`

Verification:

- RED:
  - `npm test -- src/pages/fans/tabs/CommunityTab.static.test.mjs`
  - failed as expected because the old page had no feed shell, composer, post card, or lightweight rule hint.
- GREEN:
  - `npm test -- src/pages/fans/tabs/CommunityTab.static.test.mjs`
  - 1 file passed, 4 tests passed.
- Fan shell plus Community:
  - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/CommunityTab.static.test.mjs`
  - 2 files passed, 15 tests passed.
- Build:
  - `npm run build` passed.
  - Only known Vite chunk-size / plugin timing warnings remain.
- Browser screenshot:
  - `frontend/output/playwright/task-010-community/mobile-community-final.png`
  - `frontend/output/playwright/task-010-community/tablet-community.png`
  - `frontend/output/playwright/task-010-community/desktop-community.png`
- Browser verification:
  - composer exists;
  - lightweight rule hint exists;
  - 12 post cards render;
  - bottom nav is fixed;
  - no horizontal overflow;
  - no console error captured;
  - no internal operational terms detected in rendered Community page.

Follow-up notes:

1. The page still uses local/demo data. Real launch should define moderation, reporting, official account, and content review workflows.

2. The display mapping is a short-term protection so fans do not see internal demo content. Long term, demo data should be split into fan-facing community seed and internal ops feed.

3. Image/video posts were not added in Task-010. Upload, review, storage, and safety rules need separate confirmation.

4. Community points still use the existing single rule path. Do not create a second points logic path during UI work.

Next recommendation:

Task-011:
Fan Rewards recovery analysis.

### 2026-07-15 Task-011 Fan Rewards Recovery

Current status:

Completed.

Changed:

1. Reworked the real Fan Rewards page into a point mall layout:
   - hero header with available points;
   - reward rule summary strip;
   - compact rules helper;
   - category filter bar;
   - product-style reward grid;
   - image placeholder slot for every reward;
   - reward status tags.

2. Preserved existing redemption logic:
   - `createPendingRedemption`;
   - `createRewardRedemptionRemote`;
   - `addFanPoints`;
   - local fallback redemption record;
   - sessionStorage pickup-code persistence;
   - redemption success modal;
   - inline redemption code fallback.

3. Added fan-facing reward states:
   - Available;
   - Almost there;
   - Out of stock;
   - Review required.

4. Synchronized legal reward copy with the actual redemption logic:
   - Normal rewards: A/S pickup;
   - Premium rewards: S pickup;
   - Diamond/high-value rewards: backend review before pickup;
   - default validity period: 7 days.

Why:

- The confirmed product direction says Rewards should remain a point mall, not become a dense rule page.
- The previous UI had too much rule text above the mall and looked like generic cards instead of a fan-facing reward shop.
- `legal-content.js` said S-level-only pickup and 30-day validity, while the actual redemption logic uses A/S, S, Diamond review, and 7-day validity. This conflict would confuse fans and store users.

Pages affected:

- Affected:
  - `fan-app.html#/fan-center` > Rewards.
- Indirectly affected:
  - Home reward previews still open the Rewards page.
- Not affected:
  - Activities;
  - Community;
  - Stores;
  - Me;
  - Store Owner;
  - Admin;
  - database schema;
  - permissions.

Database impact:

- No database schema change.
- No Supabase migration.
- No RLS or permission change.
- No `.env` change.
- No new dependency.

Files changed:

- `frontend/src/pages/fans/tabs/MallTab.jsx`
- `frontend/src/pages/fans/tabs/MallTab.static.test.mjs`
- `frontend/src/pages/fans/tabs/MallTab.redemption.static.test.mjs`
- `frontend/src/utils/legal-content.js`
- `frontend/src/index.css`
- `PROGRESS.md`

Verification:

1. RED tests:
   - `npm test -- src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/MallTab.redemption.static.test.mjs`
   - Failed as expected because point mall classes and synchronized reward rules were not implemented yet.

2. GREEN focused tests:
   - `npm test -- src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/MallTab.redemption.static.test.mjs src/pages/fans/tabs/MallTab.inventory-copy.test.mjs`
   - Passed: 3 files, 10 tests.

3. Fan shell regression:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/MallTab.redemption.static.test.mjs src/pages/fans/tabs/MallTab.inventory-copy.test.mjs`
   - Passed: 4 files, 21 tests.

4. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain: large chunks and plugin timing.

5. Browser verification:
   - Opened `http://127.0.0.1:5173/fan-app.html#/fan-center`.
   - Navigated to Rewards.
   - Mobile/tablet/desktop verified:
     - 8 reward cards render;
     - 8 image slots render;
     - 8 status tags render;
     - bottom nav position is fixed;
     - no console errors;
     - no horizontal overflow.
   - Screenshots:
     - `frontend/output/playwright/task-011-rewards/mobile-rewards-final.png`
     - `frontend/output/playwright/task-011-rewards/tablet-rewards.png`
     - `frontend/output/playwright/task-011-rewards/desktop-rewards.png`

Follow-up notes:

1. This task did not modify `MALL_ITEMS` reward catalog values. Prize names, points, and future real images should be discussed separately.

2. True level-lock rules need a separate product decision. Current Task-011A only shows current redemption type/status from existing rules and does not create new reward-level database fields.

3. Reward image slots are placeholders. Real reward images can be added later without changing the page structure.

4. The full-page Playwright screenshot shows the fixed bottom nav in the middle of the long stitched image; this is normal for full-page screenshots of fixed elements. Browser verification confirmed computed position is `fixed`.

Next recommendation:

Task-012:
Fan Me page recovery analysis.

### 2026-07-15 Task-012 Fan Me Account Center Recovery

Current status:

Completed.

Changed:

1. Reworked the real Fan Me page from a simple button list into an account center:
   - member hero;
   - avatar, name, phone/member id, current level;
   - available points;
   - current level and progress to next level;
   - history shortcuts;
   - growth/utility shortcuts;
   - language card;
   - sign out action.

2. Preserved existing secondary functions and routes:
   - Invite friends keeps using `InviteTab`;
   - Existing fan verification keeps using the current old-fan verification flow;
   - New user guide keeps using `HowItWorksTab`;
   - Community, Rewards, Scan, and Activities keep their existing pages and logic.

3. Added Me page shortcuts:
   - Points history;
   - Reward history;
   - Scan history;
   - Activity history;
   - Invite friends;
   - Existing fan verification;
   - New user guide;
   - Community;
   - Language.

4. Added scoped `.fan-me-*` styles:
   - no broad Ant Design override;
   - no store/admin UI changes;
   - yellow-green fan account-center visual direction.

Why:

- The confirmed product direction says Me should be account, progress, histories, and secondary utilities.
- The previous Me page preserved the old functions but presented them as a plain button stack, making it unclear what the fan can do there.
- Invite friends and old fan verification were specifically identified as important functions that must not be lost.

Pages affected:

- Affected:
  - `fan-app.html#/fan-center` > Me.
- Existing secondary pages retained:
  - Invite friends;
  - Existing fan verification;
  - New user guide;
  - Community;
  - Rewards;
  - Scan;
  - Activities.
- Not affected:
  - Store Owner;
  - Admin;
  - database schema;
  - permissions;
  - reward redemption logic;
  - scan rules;
  - community point rules.

Database impact:

- No database schema change.
- No Supabase migration.
- No RLS or permission change.
- No `.env` change.
- No new dependency.

Files changed:

- `frontend/src/pages/fans/FanCenterPage.jsx`
- `frontend/src/pages/fans/FanCenterPage.static.test.mjs`
- `frontend/src/index.css`
- `PROGRESS.md`

Verification:

1. RED:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Failed as expected because Me did not yet contain account-center classes, history grid, utility grid, or language card.

2. GREEN:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Passed: 1 file, 12 tests.

3. Final focused regression:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/MallTab.redemption.static.test.mjs src/pages/fans/tabs/MallTab.inventory-copy.test.mjs`
   - Passed: 4 files, 22 tests.

4. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain: large chunks and plugin timing.

5. Browser verification:
   - Opened `http://127.0.0.1:5173/fan-app.html#/fan-center`.
   - Navigated to Me.
   - Mobile/tablet/desktop verified:
     - bottom nav position is fixed;
     - nav text is `Home|Activities|Community|Rewards|Stores|Me`;
     - member hero renders;
     - 4 history shortcuts render;
     - 4 utility shortcuts render;
     - language card renders;
     - no horizontal overflow.
   - Screenshots:
     - `frontend/output/playwright/task-012-me/mobile-me-final.png`
     - `frontend/output/playwright/task-012-me/tablet-me.png`
     - `frontend/output/playwright/task-012-me/desktop-me.png`

Known verification note:

- Browser console captured Google Fonts network timeouts from `fonts.googleapis.com`.
- This is an external network resource issue, not a Me page runtime error and not caused by Task-012.

Follow-up notes:

1. Task-012A did not build full detailed history pages. It added clear history shortcuts and preserved existing target pages.

2. If detailed histories are needed, split into Task-012B:
   - Points history detail;
   - Reward history detail;
   - Scan history detail;
   - Activity history detail.

3. Header language switcher still exists. Me now also exposes language as an account setting entry, which matches the PRD. If the UI feels duplicated later, we can decide whether to keep both or move language fully into Me.

Next recommendation:

Task-013:
Fan Scan page recovery analysis.

Goal:

- preserve camera/manual scan;
- make unique-code validation states clear;
- show daily 3-scan point limit;
- keep UWELL-only anti-cheat messaging;
- analyze impact and files first, then wait for confirmation.

## Task-010A - Fan entry local cache blocker fix

Date:

2026-07-15

Current status:

Completed.

Changed:

1. Updated local development Service Worker handling in:
   - `frontend/fan-app.html`
   - `frontend/store-app.html`
   - `frontend/index.html`
2. Updated Service Worker cache behavior in:
   - `frontend/public/sw.js`
3. Local development hosts now unregister existing Service Workers and clear `uwell-crm-*` caches.
4. Local development hosts no longer register `/sw.js`.
5. `/sw.js` cache version changed from `uwell-crm-v1` to `uwell-crm-v2`.
6. `/sw.js` no longer caches Vite development module paths such as `/src/` and `/@vite/`.

Why:

The fan entry page showed:

`The requested module '/src/utils/trialOps.js' does not provide an export named 'findFanByReferralCode'`.

Current source and current dev-server response both contained the export, so the root cause was stale browser/Service Worker cache serving an older module version. This blocked `fan-app.html#/fan-entry` and made UI/function verification unreliable.

Pages affected:

1. Fan entry:
   - `fan-app.html#/fan-entry`
2. Store entry:
   - `store-app.html`
3. Admin/main app:
   - `index.html`

Database impact:

None.

Permissions impact:

None.

Verification:

1. `npm test -- src/pages/fan-entry/FanEntryPage.static.test.mjs`
   - Passed: 1 file, 5 tests.
2. `npm run build`
   - Passed.
   - Existing Vite warnings remain: plugin timing and large chunk warning.
3. Browser verification with Playwright:
   - Opened `http://127.0.0.1:5173/fan-app.html#/fan-entry`.
   - No console errors.
   - No page error.
   - Service Worker registrations on local host: `0`.
   - Page content rendered successfully.
   - Screenshot saved at `frontend/output/playwright/task-010a-fan-entry-cache-fix/mobile-fan-entry.png`.

Follow-up notes:

1. If the user's current browser tab is already controlled by the old Service Worker, one normal refresh may be required after this update.
2. This task did not change fan business logic, UI layout, database, rewards, map, activities, or community logic.
3. Production can still use `/sw.js`; the change only prevents local dev from being polluted by stale source-module cache.

Next recommendation:

Continue with Task-011 only after confirming the fan entry page opens locally:

Task-011:
Fan Rewards recovery analysis.

### Project Documentation Map

The current MD documentation system is intended to prevent future AI/developer drift:

- `docs/00_PROJECT_VISION.md`
  - Defines what the product is and what direction it must not deviate from.
- `docs/01_PRODUCT_BIBLE.md`
  - Highest-level product principles and conflict-resolution rules.
- `docs/02_PRD.md`
  - Functional requirements by module.
- `docs/03_USER_FLOW.md`
  - User flows for Fan, Store, Admin, Manager, and Field Rep.
- `docs/04_INFORMATION_ARCH.md`
  - Page/module/navigation structure.
- `docs/05_DATABASE.md`
  - Database structure, table purpose, key fields, and relationships.
- `docs/06_API.md`
  - API and RPC behavior reference.
- `docs/07_RBAC.md`
  - Role and permission rules.
- `docs/08_DESIGN_SYSTEM.md`
  - UI style, visual rules, layout rules, and consistency standards.
- `docs/09_BUSINESS_RULES.md`
  - Points, rewards, scans, store ratings, activities, materials, visits, and operational rules.
- `docs/10_AI_RULES.md`
  - AI/developer workflow rules, including analyze-before-coding.
- `docs/11_TASK_TEMPLATE.md`
  - Standard format for every future task.
- `docs/12_TEST_CASE.md`
  - Test checklist and acceptance rules.
- `docs/13_CODE_REVIEW.md`
  - Code review standards.
- `docs/14_VERSION_BASELINE.md`
  - Version/baseline audit and recommended starting point.
- `docs/15_DIRTY_WORKING_TREE_AUDIT.md`
  - Dirty working tree classification and risk notes.
- `docs/16_CLEANUP_STRATEGY.md`
  - Cleanup and recovery strategy.
- `docs/17_FAN_REAL_MODULE_BASELINE.md`
  - Real fan module function inventory and preservation baseline.
- `docs/18_FAN_NAVIGATION_IMPLEMENTATION_PLAN.md`
  - Fan navigation implementation plan.
- `docs/ROADMAP.md`
  - Longer-term development route.
- `docs/CHANGELOG.md`
  - Documentation/system change log.
- `PROGRESS.md`
  - Current project progress and operational status log. This is the main file for:
    - 当前状态;
    - 已完成;
    - 开发中;
    - 待优化;
    - 当前 Bug;
    - 下一任务.
---

## 2026-07-15 Task-013A Fan Scan Page Recovery

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/tabs/ScanTab.jsx`.
   - Kept the existing scan business rules and UWELL code classification.
   - Added a clear two-action scan entry: Use phone camera and Enter code manually.
   - Added `initialManual` support to the scan modal so desktop/manual entry is directly accessible.
   - Passed the real daily limit state with `scanLimitReached={scansRemaining <= 0}`.
   - Fixed the daily-limit modal flow so recognition can continue after the fan chooses manual entry.
   - Reworked recent scan records into a status-focused list.
   - Normalized old scan records without `scan_status`: records with points now display as `points awarded`.
   - Updated Scan page `Alert` usage from `message` to `title` to avoid the current Ant Design warning.
2. Updated `frontend/src/pages/fans/tabs/ScanTab.static.test.mjs`.
   - Added regression coverage for visible manual entry, real daily limit state, recent scan record status UI, and daily-limit recognition behavior.
3. Updated `frontend/src/index.css`.
   - Added scoped `fan-scan-*` styles for the manual scan button, recent scan panel/list/items, and readable warning alert text.

Why:

The Scan page already had strong business logic, but the UI needed to match the recovered fan experience:

1. Fans must immediately understand what they can scan.
2. Desktop/manual code input must be visible, not hidden inside camera fallback only.
3. Daily scan limit must not disable recognition.
4. Recent scan records must clearly show status and point result.
5. Scan page should keep the yellow-green youth/game-growth style already accepted for fan UI.

Pages affected:

1. Fan Center secondary Scan page: `fan-app.html#/fan-center`, Home -> Scan product.
2. Fan Me shortcut: Me -> Scan history opens the same Scan page.

Database impact:

None.

No schema, seed, Supabase, RLS, table, or `.env` changes were made.

Existing data used:

1. `scan_records`
2. `qr_codes`
3. `fan_points_rules`
4. `fan_points_log`

Permissions impact:

None.

Other page impact:

No intended impact on Rewards, Activities, Community, Stores, Me, Store portal, or Admin portal.

Verification:

1. Red test first:
   - `npm test -- src/pages/fans/tabs/ScanTab.static.test.mjs`
   - Failed as expected before implementation because manual entry direct mode, real daily limit state, and status-focused recent records were missing.
2. Focused tests:
   - `npm test -- src/pages/fans/tabs/ScanTab.static.test.mjs`
   - Passed: 1 file, 6 tests.
3. Fan shell regression:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/ScanTab.static.test.mjs`
   - Passed: 2 files, 18 tests.
4. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain: plugin timing and large chunk warning.
5. Browser verification:
   - Opened real fan center at `http://127.0.0.1:5173/fan-app.html#/fan-center`.
   - Used local demo fan `f-001`.
   - Entered Scan through Home -> Scan product.
   - Confirmed `.fan-scan-page` rendered.
   - Confirmed no horizontal overflow at 390px mobile, 768px tablet, and 1440px desktop.
   - Screenshots saved:
     - `frontend/output/playwright/task-013-scan/mobile-scan-final.png`
     - `frontend/output/playwright/task-013-scan/tablet-scan-final.png`
     - `frontend/output/playwright/task-013-scan/desktop-scan-final.png`

Known verification notes:

1. Screenshot script blocked external images/fonts/media to avoid slow network loading; this created expected `net::ERR_FAILED` console entries for those blocked resources.
2. After changing Scan page Alert props to `title`, the Ant Design `Alert message is deprecated` warning no longer appeared in the final screenshot run.
3. Bottom navigation remains fixed as required.

Follow-up notes:

1. This task did not change production anti-cheat or server validation.
2. Product scan points still require matched official/admin-generated QR records.
3. Local pattern recognition can still recognize possible UWELL codes, but does not grant product scan points without validation.
4. Camera availability still depends on browser/device support; manual entry remains the required fallback.
5. The global `frontend/src/index.css` file remains large and historically dirty; future UI work should continue using scoped selectors.

Next recommendation:

Task-014: Fan Activities page recovery.

Recommended scope:

1. Keep existing `CampaignTab.jsx` business functions.
2. Restore Activities page structure:
   - top quick point tasks: Learn / Like / Comment / Share;
   - Official Activities section;
   - Store Activities section with empty state;
   - store verification explanation kept short.
3. Move reward-tier-heavy content out of Activities if still present.
4. Do not change campaign database rules without a separate confirmed task.

## 2026-07-15 Task-015A Fan Community Poster And Image Framework

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/tabs/CommunityTab.jsx`.
   - Added a lightweight UWELL community hero poster at the top of the Community page.
   - Added product chips for `G5 Lite`, `Caliburn Air`, and `G5 Lite KOKO`.
   - Added an `Add photo` UI entry in the composer.
   - Added image placeholder framework for community posts.
   - Limited visible media placeholders to the first 2 feed posts so the page does not become a wall of repeated image boxes.
   - Kept existing post, like, comment, and community points logic.
2. Updated `frontend/src/pages/fans/tabs/CommunityTab.static.test.mjs`.
   - Added regression checks for the poster, product showcase, photo entry, media placeholder, and no storage/upload implementation.
   - Added a check that the media placeholder remains lightweight through `index < 2`.
3. Updated `frontend/src/index.css`.
   - Added scoped `fan-community-*` styles for the poster, product showcase, photo entry, media placeholder, composer, feed, and post cards.

Why:

The user asked whether the forum top area should include a UWELL product or brand poster and whether forum posts can include images.

Decision:

1. Yes, Community should have a small UWELL brand/product poster because it improves product atmosphere and makes the page feel less text-only.
2. Yes, Community should support image presentation in the UI framework.
3. Real upload is intentionally not implemented yet because it would affect storage, moderation, database fields, and review rules.

Pages affected:

1. Fan Center Community tab:
   - `fan-app.html#/fan-center`
   - Bottom nav -> Community.

Database impact:

None.

No schema, seed, Supabase Storage, RLS, table, or `.env` changes were made.

Permissions impact:

None.

No upload permission, content review permission, admin moderation permission, or storage policy was added.

Other page impact:

No intended impact on Home, Activities, Scan, Rewards, Stores, Me, Store portal, Admin portal, or `/preview/fan`.

Verification:

1. Focused Community test:
   - `npm test -- src/pages/fans/tabs/CommunityTab.static.test.mjs`
   - Passed: 1 file, 5 tests.
2. Fan shell regression:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/CommunityTab.static.test.mjs`
   - Passed: 2 files, 17 tests.
3. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain:
     - plugin timing;
     - large chunk warning.
4. Browser screenshots:
   - Opened real fan center at `http://127.0.0.1:5173/fan-app.html#/fan-center`.
   - Entered Community from fixed bottom nav.
   - Confirmed no horizontal overflow at 390px, 768px, and 1440px.
   - Confirmed bottom nav computed style is `fixed`.
   - Confirmed 12 post cards render.
   - Confirmed media placeholders are limited to 2.
   - Screenshots saved:
     - `frontend/output/playwright/task-015-community/mobile-community-final.png`
     - `frontend/output/playwright/task-015-community/tablet-community-final.png`
     - `frontend/output/playwright/task-015-community/desktop-community-final.png`

Known verification notes:

1. Screenshot script blocked external images/fonts/media to keep verification deterministic; this created expected `net::ERR_FAILED` console entries for blocked external resources.
2. The Community feed still shows 12 demo posts from seed/local data. If the mobile page feels too long, a separate task should define a feed paging or "show more" rule instead of silently hiding data.

Follow-up notes:

1. Real photo upload requires a separate confirmed task covering:
   - database fields;
   - Supabase Storage or another upload storage;
   - file size/type limits;
   - moderation/review;
   - abuse/report workflow;
   - admin visibility.
2. Product/brand poster art is currently UI framework, not final product asset placement.

Next recommendation:

Task-016:
Fan Rewards / Redeem page recovery.

Recommended scope:

1. Keep existing reward and redemption business logic.
2. Restore category-based reward browsing.
3. Add image slots for rewards without real asset dependency.
4. Keep level lock, points shortage, stock status, and high-value pending review states clear.
5. Do not change redemption database rules without separate confirmation.

## 2026-07-15 Task-016 Fan Rewards Page Recovery

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/tabs/MallTab.jsx`.
   - Kept the existing reward redemption logic.
   - Kept `createPendingRedemption`, `createRewardRedemptionRemote`, local fallback redemption, session-stored redemption code, and `addFanPoints`.
   - Removed unused Ant Design imports from this file.
   - Added category item counts to the reward filter buttons.
   - Added a clearer `Browse rewards` catalog section.
   - Added a four-step redemption strip:
     - Choose;
     - Redeem;
     - Get code;
     - Pick up.
   - Added explicit reward image placeholder text for every reward without real image assets.
   - Reduced the main rules copy so the page behaves more like a mall and less like a rules page.
   - Preserved fixed redemption copy:
     - Available points are deducted;
     - lifetime growth points are never deducted;
     - normal rewards use A/S pickup;
     - premium rewards use S pickup;
     - Diamond luxury rewards require backend approval;
     - normal status uses `pending_pickup`;
     - Diamond status uses `pending_review`.
2. Updated `frontend/src/pages/fans/tabs/MallTab.static.test.mjs`.
   - Added regression coverage for category counts, the Browse rewards section, image placeholders, and redemption flow strip.
3. Updated `frontend/src/index.css`.
   - Added scoped `fan-reward-*` styles for:
     - catalog section;
     - section header;
     - category count pills;
     - redemption flow strip;
     - reward image placeholder;
     - compact policy note.

Why:

The Rewards page already had important business logic, but it needed to better match the confirmed fan product direction:

1. Rewards should feel like a points mall.
2. Fans should browse by category quickly.
3. Reward cards should reserve image space for future reward assets.
4. Rules should remain available but should not dominate the first experience.
5. Existing redemption and pickup rules must not be lost.

Pages affected:

1. Fan Center Rewards tab:
   - `fan-app.html#/fan-center`
   - Bottom nav -> Rewards.

Database impact:

None.

No schema, seed, Supabase, RLS, table, inventory, reward catalog, or `.env` changes were made.

Permissions impact:

None.

No backend review, store pickup, admin reward, or store verification permission was changed.

Other page impact:

No intended impact on Home, Activities, Scan, Community, Stores, Me, Store portal, Admin portal, or `/preview/fan`.

Verification:

1. Red test:
   - `npm test -- src/pages/fans/tabs/MallTab.static.test.mjs`
   - Failed as expected before implementation because category counts, Browse rewards, image placeholder text, and flow strip were missing.
2. Focused Rewards test:
   - `npm test -- src/pages/fans/tabs/MallTab.static.test.mjs`
   - Passed: 1 file, 6 tests.
3. Rewards regression tests:
   - `npm test -- src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/MallTab.redemption.static.test.mjs src/pages/fans/tabs/MallTab.inventory-copy.test.mjs`
   - Passed: 3 files, 10 tests.
4. Fan shell plus Rewards regression:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/MallTab.redemption.static.test.mjs src/pages/fans/tabs/MallTab.inventory-copy.test.mjs`
   - Passed: 4 files, 22 tests.
5. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain:
     - plugin timing;
     - large chunk warning.
6. Browser screenshots:
   - Opened real fan center at `http://127.0.0.1:5173/fan-app.html#/fan-center`.
   - Entered Rewards from fixed bottom nav.
   - Confirmed no horizontal overflow at 390px, 768px, and 1440px.
   - Confirmed bottom nav computed style is `fixed`.
   - Confirmed 8 reward cards render.
   - Confirmed 6 category buttons render.
   - Confirmed 8 reward image slots render.
   - Confirmed 4 redemption flow steps render.
   - Screenshots saved:
     - `frontend/output/playwright/task-016-rewards/mobile-rewards-final.png`
     - `frontend/output/playwright/task-016-rewards/tablet-rewards-final.png`
     - `frontend/output/playwright/task-016-rewards/desktop-rewards-final.png`

Known verification notes:

1. Screenshot script blocked external images/fonts/media to keep verification deterministic; this created expected `net::ERR_FAILED` console entries for blocked external resources.
2. Full-page screenshots show fixed bottom navigation repeated within the stitched screenshot; this is a screenshot artifact of fixed positioning, not a route or layout failure.
3. Real reward images are not implemented in this task. The UI now has image slots ready for later assets.

Follow-up notes:

1. Do not add real reward upload/image management without a separate confirmed task because that may affect database fields, storage, moderation, and admin reward catalog management.
2. Do not hard-code fan level requirements in the frontend. Reward level requirements should come from configurable reward catalog data when that task is approved.
3. Existing `MALL_ITEMS` still has only 8 demo rewards; future reward expansion should be handled through the backend reward catalog plan.

Next recommendation:

Task-017:
Fan Me page recovery.

Recommended scope:

1. Keep profile, points, level, histories, invite, old fan verification, guide, and language entry.
2. Make Me an account center, not another marketing page.
3. Surface history entries clearly:
   - points history;
   - redemption history;
   - scan history;
   - activity/community history if available.
4. Keep Invite, Old fan verification, and Guide as secondary entries, not bottom nav items.
5. Do not change user account, auth, or language persistence rules without separate confirmation.

## 2026-07-15 Task-017 Fan Me Page Recovery

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/FanCenterPage.jsx`.
   - Kept Me as the fan account center.
   - Added account overview metrics:
     - point records;
     - reward redemptions;
     - product scans;
     - activity task records.
   - Added recent history panels for:
     - points;
     - rewards;
     - scans;
     - activities.
   - Read existing local data only:
     - `fan_points_log`;
     - `mall_redemptions`;
     - `scan_records`;
     - `fan_engagement_tasks`.
   - Kept existing secondary entries:
     - Invite friends;
     - Existing fan verification;
     - New user guide;
     - Community;
     - Language;
     - Sign out.
   - Replaced heavy default empty states in Me history panels with lightweight text rows.
2. Updated `frontend/src/pages/fans/tabs/InviteTab.jsx`.
   - Kept referral code generation, copy-link behavior, and +50 invite reward copy.
   - Reworked UI into a scoped recovered fan shell:
     - hero;
     - referral code card;
     - stat grid;
     - rule note.
3. Updated `frontend/src/pages/fans/tabs/HowItWorksTab.jsx`.
   - Kept onboarding guidance for scan, check-in, activities, community, levels, invite, and old fan verification.
   - Reworked UI into a lightweight guide shell.
4. Added static tests:
   - `frontend/src/pages/fans/tabs/InviteTab.static.test.mjs`;
   - `frontend/src/pages/fans/tabs/HowItWorksTab.static.test.mjs`.
5. Updated `frontend/src/pages/fans/FanCenterPage.static.test.mjs`.
   - Added regression coverage for Me overview, history panels, history lists, and lightweight empty rows.
6. Updated `frontend/src/index.css`.
   - Added scoped styles:
     - `fan-me-overview-strip`;
     - `fan-me-history-panel`;
     - `fan-me-history-list`;
     - `fan-me-empty-row`;
     - `fan-invite-*`;
     - `fan-guide-*`.

Why:

The Me page needed to become a clear fan account center instead of only a list of entry buttons. The user also required old functions to remain available while the fan portal UI is upgraded.

This task improves the page without changing business rules:

1. Fans can immediately see account status and recent records.
2. Invite, old fan verification, and guide remain secondary utilities.
3. The page stays aligned with the confirmed bottom navigation model.

Pages affected:

1. Fan Center Me tab:
   - `fan-app.html#/fan-center`
   - Bottom nav -> Me.
2. Me secondary pages:
   - Invite friends;
   - New user guide;
   - Existing fan verification entry remains available.

Database impact:

None.

No schema, seed, Supabase, RLS, auth, language persistence, or `.env` changes were made.

Permissions impact:

None.

No account, invite, old fan review, language, store, or admin permission logic was changed.

Other page impact:

No intended impact on Home, Activities, Community, Rewards, Stores, Store portal, Admin portal, or `/preview/fan`.

Verification:

1. Red tests:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Failed as expected before implementation because Me overview/history panel structures were missing.
   - `npm test -- src/pages/fans/tabs/InviteTab.static.test.mjs src/pages/fans/tabs/HowItWorksTab.static.test.mjs`
   - Failed as expected before implementation because Invite and Guide still used old shells.
2. Focused tests:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Passed: 1 file, 12 tests.
   - `npm test -- src/pages/fans/tabs/InviteTab.static.test.mjs src/pages/fans/tabs/HowItWorksTab.static.test.mjs`
   - Passed: 2 files, 2 tests.
3. Fan recovery regression set:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/InviteTab.static.test.mjs src/pages/fans/tabs/HowItWorksTab.static.test.mjs src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/CommunityTab.static.test.mjs`
   - Passed: 5 files, 25 tests.
4. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain:
     - plugin timing;
     - large chunk warning.
5. Browser screenshots:
   - Opened real fan center at `http://127.0.0.1:5173/fan-app.html#/fan-center`.
   - Entered Me from fixed bottom nav.
   - Confirmed no horizontal overflow at 390px, 768px, and 1440px.
   - Confirmed bottom nav computed style is `fixed`.
   - Confirmed 4 overview metrics render.
   - Confirmed 4 history panels render.
   - Confirmed Invite and Guide secondary pages open.
   - Screenshots saved:
     - `frontend/output/playwright/task-017-me/mobile-me-final.png`
     - `frontend/output/playwright/task-017-me/tablet-me-final.png`
     - `frontend/output/playwright/task-017-me/desktop-me-final.png`
     - `frontend/output/playwright/task-017-me/mobile-invite-final.png`
     - `frontend/output/playwright/task-017-me/mobile-guide-final.png`

Known verification notes:

1. Screenshot script blocked external images/fonts/media to keep verification deterministic; this created expected `net::ERR_FAILED` console entries for blocked external resources.
2. Full-page screenshots may show fixed bottom navigation repeated within the stitched page. This is a screenshot artifact of fixed positioning, not a route or layout failure.
3. Reward/activity history depends on existing demo/local records. Empty rows are shown when no records exist.

Follow-up notes:

1. This task did not create full standalone history detail pages. It only added account-center summaries and kept existing navigation into feature pages.
2. This task did not change invite reward logic.
3. This task did not change old fan verification review logic.
4. This task did not change language persistence or Arabic/RTL behavior.

Next recommendation:

Task-018:
Fan secondary page consistency pass.

Recommended scope:

1. Review secondary pages reached from Me:
   - old fan verification;
   - check-in detail;
   - scan detail;
   - invite;
   - guide.
2. Make sure every secondary page has:
   - clear return behavior;
   - fixed bottom nav still visible;
   - low text density;
   - readable yellow-green fan styling.
3. Do not change business rules or database without separate confirmation.

## 2026-07-16 Task-021 Fan Secondary Page Return Behavior

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/FanCenterPage.jsx`.
   - Added `returnView` state to remember where a fan launched a secondary page.
   - Added `openSecondaryView(view, from)` as the unified secondary-page entry helper.
   - Added `handleSecondaryBack()` so the secondary page Back button returns to the remembered source.
   - Updated Home secondary entries:
     - Scan product returns to Home.
     - Check-in detail returns to Home.
   - Updated Me secondary entries:
     - Invite friends returns to Me.
     - Existing fan verification returns to Me.
     - New user guide returns to Me.
     - Scan history opens Scan with Me as the return source.
   - Kept main bottom navigation as direct tab switching.
2. Updated `frontend/src/pages/fans/FanCenterPage.static.test.mjs`.
   - Added regression coverage for source-aware secondary-page return behavior.
   - Updated existing Home Scan and Check-in detail assertions to use the unified secondary-page helper.

Why:

Secondary pages previously used a hard-coded Back action to Home. This made Me-launched utilities feel broken because users returned to the wrong place after opening Invite, Guide, or Existing fan verification. The fix preserves the confirmed navigation model while making Back behavior match user expectations.

Pages affected:

1. Fan Center:
   - `fan-app.html#/fan-center`
2. Fan secondary pages:
   - Scan;
   - Invite friends;
   - Existing fan verification;
   - New user guide.
3. Check-in detail source tracking was updated, but the Check-in page itself still renders as its own detail view and should be reviewed in the next secondary-page UI pass if a visible Back bar is required there.

Database impact:

None.

No schema, seed data, Supabase, localDb table, RLS, auth, `.env`, points rule, scan rule, reward rule, or permission change was made.

Permissions impact:

None.

No fan, store, admin, manager, or field-rep permission behavior was changed.

Other page impact:

No intended impact on Store portal, Admin portal, login pages, Rewards logic, Scan validation, Activities, Community, or `/preview/fan`.

Verification:

1. Red test:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Failed as expected before implementation because `returnView`, `openSecondaryView`, and `handleSecondaryBack` did not exist.
2. Focused test:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Passed: 1 file, 15 tests.
3. Fan regression set:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/CheckInTab.static.test.mjs src/pages/fans/tabs/ScanTab.static.test.mjs src/pages/fans/tabs/InviteTab.static.test.mjs src/pages/fans/tabs/HowItWorksTab.static.test.mjs src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/CommunityTab.static.test.mjs src/pages/fans/tabs/CampaignTab.static.test.mjs src/pages/fans/tabs/MapTab.exposure.static.test.mjs`
   - Passed: 9 files, 47 tests.
4. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain:
     - plugin timing;
     - large chunk warning.
5. Browser verification:
   - Opened real fan app through `http://127.0.0.1:5173/fan-app.html#/fan-entry`.
   - Continued as demo fan.
   - Verified Me -> Invite friends -> Back returns to Me.
   - Verified Home -> Scan product -> Back returns to Home.
   - Verified `.fan-bottom-nav` computed position is `fixed`.
   - Verified no horizontal overflow at 390px.
   - Verified no browser console errors in the checked flow.

Known verification notes:

1. A new Playwright session redirects to `#/fan-entry` without login state. Browser validation used the existing `Continue as demo fan` flow.
2. The Home page does not currently use a `.fan-home-shell` wrapper class; browser validation used visible Home text (`Today at a glance`) instead.
3. Check-in detail has source tracking, but it does not yet share the same visible secondary Back bar as Scan / Invite / Guide. This should be handled as a separate UI consistency task if required.

Follow-up notes:

1. Do not expand this helper into a route-history system unless a future task requires browser back-button support.
2. Do not change business rules or database state as part of return-behavior tasks.
3. If Task-022 reviews Check-in detail, decide first whether it should receive the same secondary page header.

Next recommendation:

Task-022:
Fan Check-in detail visible Back bar / secondary page consistency review.

Recommended scope:

1. Analyze whether Check-in detail should use the same secondary wrapper as Scan / Invite / Guide.
2. Confirm impact before coding because this may touch Check-in visual structure.
3. Preserve check-in rules:
   - once per day;
   - points added by system;
   - no database or permission changes.

## 2026-07-16 Task-022 Fan Check-in Detail Back Bar Consistency

Current status:

Completed.

Changed:

1. Updated `frontend/src/pages/fans/FanCenterPage.jsx`.
   - Added `checkin` to the shared secondary `viewMap`.
   - Removed the direct `activeView === 'checkin'` render branch.
   - Check-in detail now uses the same `.fan-secondary-view` and `.fan-subpage-bar` wrapper as Scan, Invite, Guide, and Existing fan verification.
   - Kept `CheckInTab` itself unchanged.
2. Updated `frontend/src/pages/fans/FanCenterPage.static.test.mjs`.
   - Updated the Check-in detail regression test to require:
     - `checkin` exists in the shared secondary view map;
     - the old direct Check-in render branch is removed.

Why:

Task-021 added source-aware return behavior, but Check-in still rendered as its own detail view without the visible Back bar. This conflicted with the confirmed rule that secondary fan pages should have a clear return control.

Pages affected:

1. Fan Center Check-in detail:
   - Home -> `View streak`;
   - Home -> Check-in when already checked today;
   - Me -> Points history.
2. The visible secondary header now shows:
   - Back;
   - `Daily check-in`.

Database impact:

None.

No schema, seed data, Supabase, localDb table, RLS, auth, `.env`, points rule, scan rule, reward rule, or permission change was made.

Permissions impact:

None.

No fan, store, admin, manager, or field-rep permission behavior was changed.

Business logic impact:

None.

Check-in still uses the existing `CheckInTab` logic:

1. one check-in per day;
2. points awarded by existing `addFanPoints`;
3. local `fan_checkins` record creation remains unchanged;
4. no new reward, scan, activity, or community rule was added.

Other page impact:

No intended impact on:

1. Home content;
2. Activities;
3. Community;
4. Rewards;
5. Stores;
6. Me;
7. Store portal;
8. Admin portal;
9. `/preview/fan`.

Verification:

1. Red test:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Failed as expected before implementation because `checkin` was not in the secondary `viewMap`.
2. Focused test:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs`
   - Passed: 1 file, 15 tests.
3. Fan regression set:
   - `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/CheckInTab.static.test.mjs src/pages/fans/tabs/ScanTab.static.test.mjs src/pages/fans/tabs/InviteTab.static.test.mjs src/pages/fans/tabs/HowItWorksTab.static.test.mjs src/pages/fans/tabs/MallTab.static.test.mjs src/pages/fans/tabs/CommunityTab.static.test.mjs src/pages/fans/tabs/CampaignTab.static.test.mjs src/pages/fans/tabs/MapTab.exposure.static.test.mjs`
   - Passed: 9 files, 47 tests.
4. Build:
   - `npm run build`
   - Passed.
   - Existing Vite warnings remain:
     - plugin timing;
     - large chunk warning.
5. Browser verification:
   - Opened real fan app through `http://127.0.0.1:5173/fan-app.html#/fan-entry`.
   - Continued as demo fan.
   - Verified Home -> `View streak` opens Check-in with `.fan-subpage-bar`.
   - Verified Check-in title is `Daily check-in`.
   - Verified Back returns to Home.
   - Verified Me -> Points history opens Check-in with `.fan-subpage-bar`.
   - Verified Back returns to Me.
   - Verified `.fan-bottom-nav` computed position is `fixed`.
   - Verified no horizontal overflow at 390px.
   - Verified no browser console errors in the checked flow.

Known verification notes:

1. A new Playwright session redirects to `#/fan-entry` without login state. Browser validation used the existing `Continue as demo fan` flow.
2. This task intentionally did not redesign Check-in visuals. It only unified the secondary page shell and return behavior.

Follow-up notes:

1. If Check-in vertical spacing looks too loose after longer content is added, review spacing in a separate UI polish task.
2. Do not move Check-in rules or point values into this page wrapper. They should remain in the existing rule/data flow.

Next recommendation:

Task-023:
Fan secondary-page screenshot pass / final fan shell QA.

Recommended scope:

1. Capture mobile, tablet, and desktop screenshots for:
   - Home;
   - Check-in detail;
   - Scan;
   - Invite;
   - Guide;
   - Old fan verification;
   - Me.
2. Confirm:
   - fixed bottom nav remains visible;
   - secondary pages have Back;
   - no horizontal overflow;
   - no concentrated low-contrast text in core action areas.

## 2026-07-16 Task-023 Fan Shell Screenshot QA

Current status:

Completed with one existing remote API warning found.

Changed:

1. No production code was changed.
2. No UI code was changed.
3. No database, permission, API, business rule, or `.env` change was made.
4. Generated browser QA screenshots under:
   - `frontend/output/playwright/task-023-fan-shell-qa/`
5. Generated QA report:
   - `frontend/output/playwright/task-023-fan-shell-qa/report.json`

Why:

Task-021 and Task-022 changed secondary-page return behavior and Check-in secondary shell behavior. Before moving to the next feature/UI task, the fan shell needed real browser verification across phone, tablet, and desktop.

Pages checked:

1. Home
2. Check-in detail
3. Scan
4. Invite friends
5. New user guide
6. Existing fan verification
7. Me

Pages affected:

None by code change.

Visual QA target:

1. `fan-app.html#/fan-entry`
2. Demo fan flow:
   - `Continue as demo fan`
3. Real fan center:
   - `fan-app.html#/fan-center`

Database impact:

None.

Permissions impact:

None.

Business logic impact:

None.

Verification:

1. Environment checks:
   - `npx --version`
   - Result: `10.8.2`
   - `http://127.0.0.1:5173/fan-app.html#/fan-entry`
   - Result: HTTP `200`
2. Browser screenshot QA:
   - Used Playwright against the real local fan app.
   - Used the existing `Continue as demo fan` login flow.
   - Captured screenshots at:
     - 390px mobile;
     - 768px tablet;
     - 1440px desktop.
3. Generated screenshots:
   - `mobile-home.png`
   - `mobile-checkin.png`
   - `mobile-scan.png`
   - `mobile-me.png`
   - `mobile-invite.png`
   - `mobile-guide.png`
   - `mobile-oldfan.png`
   - `tablet-home.png`
   - `tablet-checkin.png`
   - `tablet-scan.png`
   - `tablet-me.png`
   - `tablet-invite.png`
   - `tablet-guide.png`
   - `tablet-oldfan.png`
   - `desktop-home.png`
   - `desktop-checkin.png`
   - `desktop-scan.png`
   - `desktop-me.png`
   - `desktop-invite.png`
   - `desktop-guide.png`
   - `desktop-oldfan.png`
4. QA report summary:
   - Mobile:
     - 7 screenshots;
     - 0 failed layout checks;
     - 1 console error.
   - Tablet:
     - 7 screenshots;
     - 0 failed layout checks;
     - 1 console error.
   - Desktop:
     - 7 screenshots;
     - 0 failed layout checks;
     - 1 console error.
5. Checked rules:
   - `.fan-bottom-nav` computed position is `fixed`.
   - Secondary pages have a visible Back button.
   - No horizontal overflow was detected.
   - The checked pages rendered expected content.

Known verification notes:

1. The console error is an existing remote Supabase REST request returning `400`:
   - `https://rdsrgpnvzcchqlsghsrq.supabase.co/rest/v1/fan_points_log?select=*&fan_id=eq.f-001&order=created_at.desc`
2. The page still renders through the current fallback/local data flow.
3. This task did not attempt to fix the Supabase `fan_points_log` query because that may affect API/data behavior and needs a separate confirmed task.
4. The first QA script attempt used outdated expected text for Guide and Invite. It was corrected after reading the actual rendered text:
   - Guide: `How UWELL Fan Club works`
   - Invite: `Your referral code`

Follow-up notes:

1. Treat the Supabase `fan_points_log` 400 as a separate backend/API investigation task if remote production data accuracy matters before launch.
2. The screenshots should be reviewed visually before starting the next UI polish task.
3. This QA pass confirms structure and navigation behavior, not final visual taste.

Next recommendation:

Task-024:
Fan shell visual review and issue list.

Recommended scope:

1. Review the 21 Task-023 screenshots.
2. Mark UI issues by page and viewport:
   - unclear labels;
   - excessive text;
   - spacing;
   - contrast;
   - image/empty-state needs;
   - CTA priority.
3. Decide which visual issues should become the next implementation task.
