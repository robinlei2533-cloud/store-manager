# UWELL CRM Implementation Audit

Date: 2026-07-12
Status: Active execution checklist

## Purpose

This audit tracks whether the confirmed fan, store, admin/field ops, and cross-portal rules have been implemented in the real local site. It is not a new design spec. It is the implementation evidence map for trial readiness.

## Fan App

Implemented:

- Main navigation uses Home / Activities / Community / Rewards / Stores / Me.
- Home focuses on member growth, check-in, scan, one recommended activity, nearby stores, and rewards.
- Invite Friends and Existing Fan Verification are secondary entries under Me.
- Fan levels use Bronze 0 / Silver 300 / Gold 1000 / Diamond 5000.
- Redemption uses available points and does not downgrade lifetime growth level.
- Reward cards reserve image slots and include level / points / pickup / review status.
- Store page uses fan-facing badges: Featured, Recommended, Reward pickup, Store Events.
- Scan recognizes product, store event, official activity, fan entry, official/social/community, and invalid codes.
- Product scan points are limited to 3 counted scans per day while recognition still works after the limit.
- Fan Home, Check-in, and Scan now read scan points, daily scan limit, check-in points, and store event point range from the shared trial operational rules instead of hardcoded values.
- Community points read like/comment/post points and daily limits from shared trial operational rules, with default like +1, comment +2, first post +10 and anti-abuse checks.
- Missing fan profile uses friendly sign-in recovery instead of technical Back to Home fallback.
- First-entry onboarding modal now appears per fan until dismissed and explains Scan / Check in / Activities / Community.
- Me includes a New User Guide entry so fans can reopen the onboarding flow.
- Onboarding modal supports LTR/RTL layout direction and short English/Arabic copy.
- Home now exposes lightweight Invite Friends and Existing Fan Verification reminder cards, keeping both outside bottom navigation while making them discoverable.
- Activities now uses a real Official / Store Events segmented tab instead of only explanation cards.
- Official activity tab previews online UWELL tasks and routes to official task details.
- Store Events tab reads fan-visible store activities, shows Navigate CTAs, and keeps the store verification loop visible.
- Activity cards now open a real Activity Detail subpage before navigation, with a back button, proof method, reward/source/location summary, step-by-step verification loop, and collapsed anti-duplicate/review rules.
- Rewards now shows pickup eligibility on each reward card and adds a visible "View eligible stores" action so fans can find pickup stores before/after redemption.
- Stores now includes a stable Featured store list with level badge, fan-facing exposure tags, and Navigate links above the map so fans do not have to discover stores only through map markers.
- Me now opens a real Member QR modal with member ID, level, available points, and store-verification copy instead of a temporary toast.
- Home quick action cards now route through the task handler. Daily Check-in performs the check-in action directly and shows an already-checked-in message instead of pushing fans into a secondary legacy check-in screen.
- Fan Home now has a first-screen `Daily mission control` module that compresses the next action, level gap, reward target, and mission progress into three short clickable cards. This strengthens the confirmed game-style yellow-green growth direction without adding a website-style image stack or long explanatory copy.

Partially implemented:

- Arabic RTL switch exists but full copy QA is not complete.
- Activity detail is modal/subview based, but a richer image-led detail page is still light.
- Reward real product images are placeholders until final asset selection.

Next:

- Improve fan visual polish and motion after functional closure is complete.

## Store App

Implemented:

- Main navigation uses Home / Verify / Activities / Me.
- Display/photo upload is not a bottom tab; it appears in Home tasks and Me.
- Store Front Photo and Display Photos are separate with correct purpose copy.
- Missing required photos trigger the first-three-login reminder rule.
- Store users verify participation or pickup only; they cannot issue arbitrary points.
- Store activity verification creates system pending records with duplicate detection.
- Duplicate store activity verification is marked as duplicate and sent toward review.
- Store activity verification now resolves through shared system rules: matched fans receive system-awarded points, duplicate/high-value/unmatched records go to review, and the store user never enters arbitrary points.
- Store activity verification writes `fan_points_log` and updates fan available points plus lifetime growth points when the system decision is `system_awarded`.
- Store-created campaign submission requires cost responsibility confirmation.
- Store-created campaign records include pending review, fan visibility off, cost acknowledgement, support request, and audit log.
- Material requests include requester, store, region, warehouse, campaign relation, priority, and audit log.
- Exposure this week uses store exposure events / verification records instead of hardcoded numbers.
- Home now includes Store operations status, surfacing review feedback for store-created events, material requests, and photos.
- Activities separates UWELL campaigns from My store events, with review state and cost-responsibility reminders.
- Me / Materials shows My material requests with regional warehouse and request status.
- Store photo sections show rejected/needs-update feedback and reupload guidance.
- Home now includes a dynamic Today operating queue with readiness progress, priority labels, and task CTAs for required photos, fan visit verification, campaign result submission, low materials, and store-event review.
- The Today operating queue routes store owners directly to Verify, Activities, or Me instead of leaving important work buried in separate modules.
- Store owner app now has a fixed bottom navigation with Home / Verify / Activities / Me, so routine verification and profile/photo work stay reachable like an app instead of only through dense top tabs.
- Store Home now shows a first-screen Level exposure and pickup rules module with fan map exposure, Home recommendation eligibility, reward pickup permission, and upgrade focus.
- Store Home makes S/A fan exposure and reward pickup rules visible to store owners instead of hiding this value only in backend policy.
- Store owner page no longer forces `setLang("en")`, so a saved Arabic choice can persist instead of being reset when the store app opens.
- Store Home material inventory action now says `Request materials` instead of `Register stock`, keeping inventory modification out of the store-owner surface.
- Store Home now has a first-screen `New store readiness` command module with Photo readiness, Fan service readiness, Activity readiness, and Material readiness cards. It shows the next best action and useful empty states such as `No fan visits yet`, `No store events yet`, and `No material requests yet`, so new store owners know whether to upload photos, verify a fan QR, join official campaigns, or request regional warehouse materials.
- Store Owner local trial now recovers invalid cached `store_owner_store_id` values on localhost/127.0.0.1 without calling the remote store API. It falls back to the first valid local store and writes the corrected store id back to localStorage, preventing stale local demo sessions from producing Supabase 400 errors.

Partially implemented:

- Store app has yellow-green theme but still contains some legacy Ant Design dense surfaces.
- Reward pickup is functional locally, but inventory deduction needs deeper regional stock integration.
- Store staff roles remain out of first phase, matching scope.

Next:

- Improve Store Home hierarchy and empty states for new stores.

## Admin / Field Ops

Implemented:

- Backend login has login only; no public registration.
- Admin-only staff creation exists under Settings > Users.
- Manager/Rep account creation includes role, region/city, assigned area/stores, status, and audit logging.
- Rewards and Scan Codes are independent backend modules.
- Rules is now an independent backend module showing fixed system logic, admin-configurable parameters, review-required changes, fan levels, point channels, activity verification loop, reward catalog governance, store rating, exposure levels, regional warehouses, and risk rules.
- Rules now has editable trial parameters for scan points, daily scan limit, check-in points, community points/limits, store event point range, high-value reward review threshold, and material low-stock threshold.
- Saving editable Rules writes `fan_points_rules` and creates a `rule_setting_changed` Audit Log entry, while fixed system logic remains read-only.
- Editable Rules are consumed by fan-facing scan/check-in surfaces through shared launch-rule utilities, so admin parameter changes are visible in the fan app trial flow.
- Trial operational rules are now seeded as a real `fan_points_rules` record instead of existing only as code fallback, so fresh local databases start with the same shared operational settings consumed by fan, store, admin, and materials workflows.
- Reviews is a unified dynamic pending-work center reading store campaigns, material requests, photo reviews, reward reviews, and store verification risks.
- Reviews actions now mutate source records by type: approve, reject, request more info, escalate, and add note.
- Review actions write audit logs and refresh dynamic counters.
- Risk Center dynamically reads scan records, store verifications, community comments, and high-value redemptions.
- Risk actions update status and write audit logs.
- Rewards backend reads redemption review queue and can approve, reject, or assign pickup store with reward review and audit records.
- Scan Codes supports local batch generation for UWELL code classes, code blocking/unblocking/expiry, and suspicious scan review decisions.
- Dashboard is segmented into core KPI, fan analytics, store analytics, field visit analytics, campaign/verification, and material alerts.
- Materials supports Riyadh, Dammam, and Jeddah warehouses with region visibility copy.
- Materials inventory now computes visible stock, low-stock tags, status, and row highlighting from the current role's visible warehouses only. Field reps no longer see or inherit Dammam/Jeddah inventory totals or alerts when assigned to Riyadh.
- Materials now includes a Store Requests workflow for approving/rejecting/asking-more-info, reserving stock from regional warehouses, creating outbound records, logistics status updates, low-stock alerts, and audit logs.
- Material request approval is idempotent for already reserved requests: duplicate approve actions return the existing request and do not deduct regional warehouse stock or create duplicate outbound records.
- Field Visit creation supports new store visit, repeat visit, evidence photos, display data, campaign delivery context, and next action.
- Field Visit list is now an operational workbench, not only a record table: it shows summary cards for total visits, new store visits, repeat visits, pending reviews, and suggested upgrades.
- Field Visit list supports filters for visit type, region, status, current store level, suggested level, final level, and review status.
- Field Visit table now exposes visit type, store city/region, current level, suggested level, final level, review status, and next action.
- Visit records preserve full store data in local enrichment and Supabase visit queries fetch `stores(*)`, so city/region/level data is available to the workbench.
- Dashboard field visit analytics recognizes the implemented new-store/repeat visit fields and pending suggested-level review states.
- Dashboard low-stock KPI, warehouse cards, and low-stock alert list now use scoped material stock data, so managers see assigned-region warehouse data instead of all warehouses.
- Dashboard now starts with an Operations action center that turns pending reviews, risk triage, regional material requests, and field visit review into visible module-entry cards.
- Dashboard action cards include live counts, priority labels, workstream descriptions, and direct routes to Reviews, Risk Center, Materials, and Field Visits.
- Dashboard now includes a Trial launch readiness matrix connecting the fan growth loop, store service loop, field execution loop, warehouse readiness, and rules/risk control to their backend modules.
- Audit Log now supports visible-log / critical-operation / region-scope summary cards, date range, action type, actor role, region, text search, and CSV export.
- Audit Log access now matches the operations rule: Admin sees all logs; Manager can open Audit Log and sees assigned-region logs only.
- Manager sidebar exposes Audit Log without exposing admin-only Users, Products, or Data Management settings.
- Store rating uses the confirmed 100-point S/A/B/C model with monthly sales worth 20%.
- Rating review can approve/change/request evidence, update store_evaluations, update store level, and write audit logs.

Partially implemented:

- Risk detection is local-rule based for trial data, not production fraud engine.
- Audit Log exists, but filtering/export polish remains basic.
- Material logistics exists as local trial workflow; production later needs server-side stock locking to prevent concurrent deductions.
- Scan Codes local workflow represents code governance; production later needs server-side validation and signed/unique code import from manufacturing or official code provider.

Next:

- Add stronger Audit Log filtering/export and role-specific views.
- Add production API contracts for server-side scan validation and warehouse stock locking.

## Cross-Portal Rules

Implemented:

- Portals are separated by fan-app.html, store-app.html, and index.html backend routes.
- Backend `/app` routes now require at least Rep staff role, so fan sessions cannot enter the admin/field shell even if localStorage contains a fan id.
- Default language is English, Arabic is the only exposed second language in switchers.
- Trial language store now accepts only English and Arabic saved values, defaults to English regardless of browser locale, ignores legacy Chinese saved/browser defaults, and applies Arabic RTL to both `html` and `body` only when Arabic is explicitly saved/selected.
- Email validation rejects malformed/fake-looking addresses in active registration/account creation flows.
- Stores verify only; system awards points.
- Unique product scan and daily counted limit are implemented locally.
- Backend Scan Codes can generate/manage UWELL code classes and review suspicious scan records.
- Reward redemption deducts available points and not lifetime growth points.
- Region-based warehouse visibility exists for manager/rep, with local regional warehouse stock data seeded for Riyadh, Dammam, and Jeddah.
- Critical store campaign, material request, scan code, reward review, risk, rating, and staff creation actions write audit logs.

Partially implemented:

- Historical source comments / legacy inactive constants may still contain old Chinese or mojibake, but current user-visible seed fields, display-review labels, and fan map labels are guarded by tests and render English-first.
- Full Arabic RTL visual QA has not been completed.
- Production server-side anti-fraud is out of local demo scope but interfaces are represented.
- Scan anti-fraud now has an explicit production validation contract: product scan points require official UWELL code validation, local pattern recognition is preview-only, and scan records preserve validator source, validation mode, batch/signature fields, and decision reason.
- Fan Scan no longer auto-creates a claimable product code from a matching text pattern. Only backend/admin-generated code-library records can award product scan points in the local trial.
- Fan Scan duplicate-claim detection ignores prior preview-only unverified scans, so a real backend-imported code will not be blocked just because the same fan previously scanned a lookalike code before official validation existed.
- Admin Scan Codes now exposes the production validation boundary, required product-code fields, and decision statuses so future G4/G5/Caliburn/product/official/community codes can be managed under one contract.

## Verification Evidence

Latest local checks:

- `npm test -- src/pages/fans/tabs/MapTab.exposure.static.test.mjs src/index.static.test.mjs src/utils/uwellClosedLoop.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/CommunityTab.static.test.mjs src/services/db/seedData.test.mjs`: 6 files, 27 tests passed after fan nav, map labels, display-category labels, community action touch targets, and English-first seed/demo-data guards.
- `npm run build`: successful after fan map/navigation/community/admin touch-target polish; known vendor/image chunk-size warning remains.
- `node scripts/qa-cross-portal-smoke.mjs`: fan real login, fan direct deep link, admin real login, admin direct deep link, and store real login all passed with 0 console errors, 0 bad HTTP responses, 0 horizontal overflow, and non-empty app shells.
- `node scripts/qa-portal-maturity.mjs`: 38 fan/store/admin mobile+desktop states checked; all states opened with 0 console errors, 0 bad HTTP responses, 0 horizontal overflow, and non-empty shells. Remaining report items are soft visual QA findings, mainly automated contrast flags on transparent/gradient cards and Ant Design internal select/input-number controls.
- Browser screenshot check: mobile fan bottom navigation now renders 6 stable items without `Community` truncation (`Social` label), and mobile fan Stores no longer exposes `hidden_from_fan_app`; it shows `Unavailable stores are hidden from this list`.
- `npm test`: 66 files, 215 tests passed after this polish pass.
- `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs src/index.static.test.mjs`: 3 files, 31 tests passed after fixing mobile Fan Activities task-card overlap, Store Home material inventory label/value layout, Fan status-chip readability, and Admin Risk Center local contrast.
- `npm run build`: successful after the second UI polish pass; known vendor/image chunk-size warning remains.
- `node scripts/qa-portal-maturity.mjs`: 38 fan/store/admin mobile+desktop states checked again; all opened with 0 console errors, 0 bad HTTP responses, 0 horizontal overflow, and non-empty shells. Admin Risk Center low-contrast findings dropped to a single date-rendering false/soft flag; Fan Activities task cards no longer overlap; Store Home material inventory shows item name and quantity/safety on separate readable lines.
- `node scripts/qa-cross-portal-smoke.mjs`: fan real login, fan direct deep link, admin real login, admin direct deep link, and store real login all passed again with 0 console errors, 0 bad HTTP responses, 0 horizontal overflow, and non-empty shells.
- `npm test`: 66 files, 215 tests passed after the second UI polish pass.
- `npm test -- --run src/pages/dashboard/DashboardPage.static.test.mjs`: 1 file, 7 tests passed after adding the Dashboard `Spec implementation coverage` section for Fan app, Store app, Admin/Field, and Cross-portal rules.
- `npm test -- --run src/pages/dashboard/DashboardPage.static.test.mjs src/components/common/ErrorState.static.test.mjs src/services/db/seedData.test.mjs`: 3 files, 13 tests passed after Dashboard coverage, error-state, and seed-data checks.
- `npm run build`: successful after Dashboard spec coverage section; known vendor/image chunk-size warning remains.
- Browser smoke: desktop Admin Login reached `#/app/dashboard`; Dashboard rendered `SPEC IMPLEMENTATION COVERAGE` with 4 cards: Fan app scheme, Store app scheme, Admin and field scheme, and Cross-portal rules; no console errors.
- `npm test`: 59 files, 182 tests passed after Dashboard spec coverage section.
- `npm test -- --run src/services/db/seedData.test.mjs`: 1 file, 5 tests passed after cleaning user-visible trial seed data for English-first fan/admin/store demos.
- `npm test -- --run src/services/db/seedData.test.mjs src/components/common/ErrorState.static.test.mjs`: 2 files, 6 tests passed after adding the English error-recovery guard.
- `npm test -- --run src/services/db/seedData.test.mjs src/components/common/ErrorState.static.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/dashboard/DashboardPage.static.test.mjs`: 4 files, 22 tests passed after seed-data and error-state cleanup.
- `npm test`: 59 files, 181 tests passed after seed-data and error-state cleanup.
- `npm run build`: successful after seed-data and error-state cleanup; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Fan Entry opened, `Continue as demo fan` reached Fan Center, expected scan/rewards/community/home content rendered, no console errors, and no old Chinese/generic error text appeared.
- Browser smoke: desktop Admin Login with `admin@uwell.com / UwellAdmin@2026` reached `#/app/dashboard`; Dashboard rendered `TRIAL LAUNCH READINESS`, Fan growth loop, Store service loop, and Regional material requests with no console errors.
- `npm test -- --run src/pages/store-owner/StoreOwnerPage.static.test.mjs`: 1 file, 10 tests passed after Store Home level exposure / pickup rules and Arabic persistence guard.
- `npm test -- --run src/pages/dashboard/DashboardPage.static.test.mjs`: 1 file, 6 tests passed after adding the Dashboard trial launch readiness matrix.
- `npm test -- --run src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/dashboard/DashboardPage.static.test.mjs`: 2 files, 16 tests passed after Store/Admin visible framework updates.
- `npm run build`: successful after Store/Admin visible framework updates; known vendor/image chunk-size warning remains.
- Browser smoke: Store mobile Home rendered Level exposure and pickup rules, Fan map exposure, Reward pickup permission, and Upgrade focus; saved Arabic stayed `html/body lang=ar dir=rtl`; no mobile horizontal overflow detected.
- Browser smoke: Admin login reached `#/app/dashboard`; Dashboard rendered Trial Launch Readiness with Fan growth loop, Store service loop, Warehouse readiness, and Rules and risk control.
- `npm test -- src/pages/admin-ops/AdminOpsPages.static.test.mjs src/pages/admin-ops/AdminOperationalRules.static.test.mjs`: 2 files, 6 tests passed.
- `npm run build`: successful after Reviews, Scan Codes, Store Requests, regional stock seed, and workflow updates.
- `npm test`: 54 files, 152 tests passed.
- `npm test -- VisitFieldOps.static.test.mjs DashboardPage.static.test.mjs`: 2 files, 8 tests passed after Field Visit workbench and Dashboard regional-stock updates.
- `npm run build`: successful after Field Visit workbench, visit data enrichment, Dashboard visit analytics, and regional stock scoping updates.
- Browser smoke: admin Reviews, Scan Codes, and Materials > Store Requests rendered expected key content successfully.
- Browser smoke: fan mobile first-entry onboarding, Home after dismissal, and Me > New User Guide entry rendered expected key content successfully.
- Browser smoke: fan mobile demo login rendered Home invite / existing-fan reminders and Activities Official / Store Events tabs successfully.
- Browser smoke: fan mobile Rewards rendered 19 "View eligible stores" actions; Stores rendered 4 featured store cards and 4 Navigate links; Me opened 1 Member QR modal.
- Browser smoke: store mobile Home, Activities, and Me rendered operations status, campaign split, store photos, and regional warehouse content successfully.
- Browser smoke: store mobile Home rendered 3 Today operating queue tasks and 1 readiness progress module; tapping the required photo task routed to the Me tab.
- Browser smoke: admin Field Visits page rendered Field Visits Workbench, new/repeat/pending/upgrade summary cards, level/review/next-action columns, and Riyadh region data.
- Browser smoke: admin Dashboard rendered field visit analytics and all regional warehouses; manager Dashboard rendered Riyadh Warehouse only and did not leak Dammam/Jeddah warehouse text.
- Browser smoke: admin Dashboard rendered 4 Operations action center cards: Pending review queue, Risk Center, Regional material requests, and Field visit review; clicking Pending review queue routed to `#/app/reviews`.
- Browser smoke: admin Audit Log rendered summary cards, filters, search field, and Export CSV; manager Audit Log opened successfully and did not leak the Dammam Warehouse demo target.
- Browser smoke: fan mobile Activities opened a real Activity Detail view with Proof method, collapsed Rules, 6 fixed bottom-nav buttons, and one visible back button.
- Browser smoke: store mobile fixed bottom navigation rendered 4 buttons and routed to Verify, where Fan Participation Verification appeared.
- Browser smoke: admin Rules rendered Operational Rules with Fixed system logic, Admin-configurable parameters, Reward catalog governance, and Riyadh Warehouse content.
- TDD red/green evidence: `npm test -- src/utils/uwellLaunchRules.test.mjs` first failed because `getScanValidationContract` did not exist; after adding the scan validation contract and unverified-preview-only decision, the targeted scan/rules tests passed.
- `npm test -- --run src/utils/uwellLaunchRules.test.mjs src/pages/fans/tabs/ScanTab.static.test.mjs src/pages/admin-ops/AdminOpsPages.static.test.mjs`: 3 files, 19 tests passed after adding the official scan validation boundary.
- `npm run build`: successful after scan anti-fraud validation boundary changes; known large chunk warning remains.
- Browser smoke: fan mobile demo login -> Home -> Scan product rendered `Supported UWELL codes` and `Product scan points require official UWELL code validation`; admin login -> Scan Codes rendered `Production validation boundary`, `server_required_for_points`, and `code_signature`.
- `npm test -- --run src/pages/fans/tabs/ScanTab.static.test.mjs src/utils/uwellLaunchRules.test.mjs`: 2 files, 15 tests passed after fixing preview-only scan records so they do not block later official validation.
- `npm run build`: successful after preview-only duplicate-claim guard; known large chunk warning remains.
- `npm test`: 58 files, 177 tests passed after scan validation contract and preview-only duplicate-claim guard.
- Browser smoke: admin Rules saved Scan points from 5 to 6, persisted `fan_points_rules.trial-operational-rules.settings.scanPoints = 6`, and created one `audit_logs` record with `action_type = rule_setting_changed`.
- Browser smoke: injected trial rules with Scan +7, daily scan limit 4, Check-in +8, and Store Event +30~120; Fan Home displayed +8 / +7 / +30~120 and Fan Scan displayed `/4` plus `Adds +7 points, max 4/day`.
- Browser smoke: after normal store login, injected trial rules with Store Event +40~140 and material low-stock floor 33; Store Activities application modal displayed `Trial rule: 0 for gift-only events, or 40-140 points when requesting UWELL point support.` and Admin Materials > Inventory Dashboard displayed `Trial low-stock floor: 33`.
- Browser smoke: after normal store login and Store Verify input `f-003`, fan points increased from 150 to 175, lifetime growth increased to 175, store verification record became `points_added` with `points_award_status = system_awarded`, and `fan_points_log` wrote `Store activity verification` +25.
- Browser smoke: fan `f-007` with 5,200 available / 5,200 lifetime growth points requested the 5,000-point `Product bundle`; available points became 200, lifetime growth stayed 5,200, level stayed `diamond`, `mall_redemptions` recorded `status = pending_review` / `review_status = pending_review`, and `fan_points_log` wrote `Reward Redemption` -5,000.
- Browser smoke: injected community rules with like +3 limit 2, comment +4 limit 2, post +12 limit 2; Fan Community displayed the injected values, posting valid content wrote `community_point_actions.action_type = post` with 12 points, `fan_points_log` wrote `UWELL Community` +12, available points rose from 1,000 to 1,012, and lifetime growth rose from 5,200 to 5,212.
- `npm test -- src/utils/fanPointsRules.test.mjs src/services/api/fans.static.test.mjs src/utils/reward-redemption.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/MallTab.redemption.static.test.mjs`: 5 files, 21 tests passed after browser-verifying high-value redemption.
- `npm test -- src/pages/fans/tabs/CommunityTab.static.test.mjs src/utils/uwellLaunchRules.test.mjs src/pages/admin-ops/AdminOpsPages.static.test.mjs src/pages/admin-ops/AdminOperationalRules.static.test.mjs`: 4 files, 20 tests passed after community rules consumed editable operational settings.
- `npm run build`: successful after community rules consumed editable operational settings; known large chunk warning remains.
- `npm test`: 55 files, 172 tests passed after community rules consumed editable operational settings.
- TDD red/green evidence: `npm test -- src/pages/admin-ops/admin-ops-workflows.behavior.test.mjs` first failed because duplicate approve deducted Riyadh Warehouse stock from 3 to 1; after the idempotency guard, the same test passed with stock staying 3 and one outbound record.
- `npm test -- src/pages/admin-ops/admin-ops-workflows.behavior.test.mjs src/pages/admin-ops/AdminOperationalRules.static.test.mjs src/pages/admin-ops/AdminOpsPages.static.test.mjs src/pages/materials/MaterialListPage.static.test.mjs src/pages/dashboard/DashboardPage.static.test.mjs`: 4 files, 13 tests passed after duplicate material approval guard.
- `npm run build`: successful after duplicate material approval guard; known large chunk warning remains.
- `npm test`: 56 files, 173 tests passed after duplicate material approval guard.
- TDD red/green evidence: `npm test -- src/stores/languageStore.static.test.mjs` first failed because the language store still accepted/defaulted Chinese and did not apply `body` RTL metadata; after the trial-language guard it passed.
- TDD red/green evidence: `npm test -- src/stores/languagePersistence.static.test.mjs` first failed because Fan Entry, Fan Center, Store Entry, Admin Login, and App Layout forced `setLang('en')` after mount; after removing those overrides it passed.
- `npm test -- src/stores/languagePersistence.static.test.mjs src/stores/languageStore.static.test.mjs src/components/common/LanguageSwitcher.static.test.mjs src/pages/fan-entry/FanEntryPage.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/login/LoginPage.static.test.mjs src/components/layout/AppLayout.static.test.mjs`: 8 files, 33 tests passed after Arabic language persistence fixes.
- TDD red/green evidence: `npm test -- src/stores/languageStore.static.test.mjs` first failed because Arabic browser locale could still become default language; after removing browser-locale auto-switching, the same test passed.
- Browser smoke: with Playwright locale `ar-SA` and no saved `uwell_lang`, Fan Entry stayed `html.lang = en`, `html.dir = ltr`, `body.dir = ltr`, and did not write a saved language; with saved `uwell_lang = ar`, Store Login stayed Arabic RTL.
- `npm test`: 58 files, 176 tests passed after enforcing English default regardless of browser locale.
- `npm run build`: successful after Arabic language persistence fixes; known large chunk warning remains.
- Browser smoke: with `uwell_lang = ar`, Fan Entry, Fan Center, Store Login, and backend dashboard kept `localStorage.uwell_lang = ar`, `html.lang = ar`, `html.dir = rtl`, `body.lang = ar`, `body.dir = rtl`, and `body.dataset.direction = rtl`; pages no longer reset saved Arabic back to English.
- TDD red/green evidence: `npm test -- src/components/layout/AppLayout.static.test.mjs src/pages/login/LoginPage.static.test.mjs` first failed because `/app` did not require staff role and Admin Login redirected any existing user; after requiring `ROLES.REP` for `/app` and checking `STAFF_ROLES`, the same tests passed.
- Browser smoke: anonymous access to `index.html#/app/dashboard` redirected to `#/admin`; a fan session with `store_manager_current_user = f-001` also redirected to `#/admin` without rendering `.admin-liquid-shell`; an admin session with `store_manager_current_user = u-admin` reached `#/app/dashboard` and rendered `.admin-liquid-shell`.
- `npm test`: 58 files, 176 tests passed after Arabic persistence and backend staff-role route guard.
- `npm run build`: successful after browser-verifying high-value redemption; known large chunk warning remains.
- `npm test`: 55 files, 171 tests passed after browser-verifying high-value redemption.
- `npm test -- src/utils/uwellLaunchRules.test.mjs src/pages/store-owner/StoreOwnerPage.operations.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs`: 3 files, 23 tests passed after system-awarded store activity verification.
- `npm test -- src/services/db/localDb.schema.static.test.mjs src/utils/uwellLaunchRules.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs`: 3 files, 18 tests passed after seeding shared trial operational rules.
- `npm run build`: successful after seeded trial operational rules and system-awarded store activity verification.
- `npm test`: 54 files, 169 tests passed after seeded trial operational rules and system-awarded store activity verification.
- `npm test -- src/utils/uwellLaunchRules.test.mjs src/pages/fans/tabs/ScanTab.static.test.mjs src/pages/fans/tabs/CheckInTab.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/admin-ops/AdminOpsPages.static.test.mjs`: 5 files, 25 tests passed after shared operational-rule consumption.
- `npm run build`: successful after shared operational-rule consumption.
- `npm test -- src/pages/admin-ops/AdminOpsPages.static.test.mjs src/components/layout/AppLayout.static.test.mjs`: 2 files, 8 tests passed after editable Rules parameters and audit logging.
- `npm run build`: successful after editable Rules parameters and audit logging.
- `npm test -- src/components/layout/AppLayout.static.test.mjs src/pages/admin-ops/AdminOpsPages.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs`: 4 files, 27 tests passed after Rules module, fan Activity Detail, and store fixed bottom navigation.
- `npm run build`: successful after Rules module, fan Activity Detail, and store fixed bottom navigation.
- `npm test -- --run src/components/common/EmptyState.static.test.mjs src/pages/campaigns/CampaignListPage.static.test.mjs src/pages/fans/ComplaintReplyPage.static.test.mjs src/pages/evaluation/EvalDetailPage.static.test.mjs src/pages/stores/StoreListPage.static.test.mjs src/pages/stores/StoreExposureControl.static.test.mjs src/pages/stores/StoreDetailPage.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/dashboard/DashboardPage.static.test.mjs src/pages/settings/UserManagementPage.static.test.mjs`: 11 files, 36 tests passed after cleaning visible legacy Chinese/mojibake copy and rebuilding store-management review/exposure surfaces.
- `npm test`: 63 files, 186 tests passed after fan/store/admin language cleanup, store management rebuild, and legacy fan login cleanup.
- `npm run build`: successful after the same cleanup; known vendor/image chunk-size warning remains.
- HTTP smoke: `http://127.0.0.1:5173/fan-app.html#/fan-entry`, `http://127.0.0.1:5173/store-app.html#/store-login`, and `http://127.0.0.1:5173/index.html#/admin` all returned `200`.
- Page-source scan: remaining Chinese matches under `frontend/src/pages` are Dashboard comments and `CampaignTab` legacy category mapping keys only; no newly cleaned visible page copy regressed.
- `npm test -- --run src/pages/materials/MaterialStocksPage.region-access.static.test.mjs src/pages/admin-ops/RewardsOpsPage.operations.test.mjs src/utils/uwellLaunchRules.test.mjs`: 3 files, 16 tests passed after tightening regional warehouse visible-stock behavior and reward pickup-store label cleanup.
- `npm test -- --run src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/ScanTab.static.test.mjs src/pages/fans/tabs/CommunityTab.static.test.mjs src/pages/fans/tabs/MallTab.redemption.static.test.mjs src/utils/fanPointsRules.test.mjs`: 5 files, 19 tests passed after fixing Fan Home quick check-in behavior.
- `npm test -- --run src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.operations.test.mjs src/pages/store-owner/StoreOwnerPage.reward-pickup.test.mjs src/pages/store-owner/StoreEntryPage.static.test.mjs`: 4 files, 22 tests passed after replacing the store-owner `Register stock` action with `Request materials`.
- `npm test -- --run src/pages/admin-ops/AdminOpsPages.static.test.mjs src/pages/admin-ops/AdminOperationalRules.static.test.mjs src/pages/admin-ops/admin-ops-workflows.behavior.test.mjs src/pages/settings/UserManagementPage.static.test.mjs src/pages/materials/MaterialStocksPage.region-access.static.test.mjs src/pages/visits/VisitCreatePage.workflow.test.mjs src/pages/visits/VisitFieldOps.static.test.mjs src/utils/uwellRoleAccess.test.mjs src/utils/uwellLaunchRules.test.mjs`: 9 files, 33 tests passed after region-visible warehouse stock and field-rating display cleanup.
- `npm test`: 64 files, 188 tests passed after the latest fan/store/admin rule and permission fixes.
- `npm run build`: successful after the latest fixes; known vendor/image chunk-size warning remains.
- HTTP smoke: `http://127.0.0.1:5173/fan-app.html#/fan-entry`, `http://127.0.0.1:5173/store-app.html#/store-login`, and `http://127.0.0.1:5173/index.html#/admin` all returned `200` after build.
- `npm test -- src/components/layout/AppLayout.static.test.mjs`: 1 file, 5 tests passed after changing backend navigation from the old grouped CRM sidebar into the confirmed operations module structure.
- `npm test -- src/utils/uwellLaunchRules.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/admin-ops/AdminOpsPages.static.test.mjs src/components/layout/AppLayout.static.test.mjs`: 5 files, 41 tests passed after the backend navigation framework update.
- Browser root-cause check: Fan Activities detail did render the proof loop; Playwright originally missed it because the rendered text was uppercase `PROOF METHOD` and the earlier assertion was case-sensitive.
- Browser root-cause check: 5173 was serving the previous `dist/` build, so source edits were not visible until `npm run build` regenerated the local preview bundle.
- `npm run build`: successful after the backend operations navigation framework update; known vendor/image chunk-size warning remains.
- Browser smoke: Admin login with `admin@uwell.com / UwellAdmin@2026` reached `#/app/dashboard`; sidebar text included Dashboard, Stores, Fans, Campaigns, Rewards, Scan Codes, Materials, Field Visits, Reviews, Risk Center, and Settings, and no longer showed the old `CRM Management` module. Screenshot: `frontend/output/playwright/admin-ops-navigation-20260713.png`.
- `npm test`: 64 files, 189 tests passed after the backend operations navigation framework update.
- Added English/Arabic-ready backend operation module translation keys for Stores, Fans, Rewards, Scan Codes, Materials, Field Visits, Reviews, Risk Center, and Rules.
- `npm test -- src/components/layout/AppLayout.static.test.mjs src/components/common/LanguageSwitcher.static.test.mjs src/stores/languageStore.static.test.mjs`: 3 files, 8 tests passed after translating the backend operation module labels.
- `npm test`: 64 files, 189 tests passed after the translated backend operation module labels.
- `npm run build`: successful after translated backend operation module labels; known vendor/image chunk-size warning remains.
- Browser smoke: Admin login with `admin@uwell.com / UwellAdmin@2026` reached `#/app/dashboard`; sidebar included Dashboard, Stores, Fans, Campaigns, Rewards, Scan Codes, Materials, Field Visits, Reviews, Risk Center, Settings; no `nav_ops_` translation keys leaked and `CRM Management` did not appear.
- TDD red/green evidence: `npm test -- src/pages/fans/FanCenterPage.static.test.mjs` first failed because Fan Home did not have `fan-daily-action-rail`; after replacing the old Home task panel with the gamified daily action framework, the targeted test passed.
- Fan Home update: added a `Today action` daily rail with task status, a yellow-green `One pick for you` activity card, and exactly two short quick tips (`First post today`, `Scan left today`) to reduce long-copy dashboard feel.
- `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/index.static.test.mjs src/utils/uwellLaunchRules.test.mjs`: 3 files, 24 tests passed after the Fan Home gamified framework update.
- `npm run build`: successful after the Fan Home gamified framework update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Fan Center at `http://127.0.0.1:5173/fan-app.html#/fan-center` rendered `Today action`, `One pick for you`, `First post today`, `Scan left today`, and all six bottom nav items; horizontal overflow was false. Screenshot: `frontend/output/playwright/fan-home-gamified-20260713.png`.
- TDD red/green evidence: `npm test -- src/pages/fans/FanCenterPage.static.test.mjs` first failed because Fan Rewards did not have `rewardFilter`, `fan-reward-summary-strip`, `fan-reward-filter-bar`, visible lock reason, review note, or level/cost pills; after adding the Rewards framework, the targeted test passed.
- Fan Rewards update: added an `All rewards` filter bar, available-points / member-level / pickup-store / review-rule summary strip, visible locked reward explanation, separate cost and level pills, and explicit `Luxury rewards require UWELL review` notes for high-value rewards.
- `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/index.static.test.mjs src/utils/uwellLaunchRules.test.mjs`: 3 files, 25 tests passed after the Fan Rewards framework update.
- `npm run build`: successful after the Fan Rewards framework update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Fan Center at `http://127.0.0.1:5173/fan-app.html#/fan-center` opened Rewards through the fixed bottom nav and rendered `All rewards`, `Available points`, `Luxury rewards require UWELL review`, `View eligible stores`, and `Locked rewards stay visible`; horizontal overflow was false. Screenshot: `frontend/output/playwright/fan-rewards-framework-20260713.png`.
- `npm test`: 64 files, 191 tests passed after the Fan Rewards framework update.
- TDD red/green evidence: `npm test -- src/pages/fans/FanCenterPage.static.test.mjs` first failed because Fan Activities did not have `fan-activity-summary-strip`, poster slots, reward/proof pills, or store-closure cues; after adding the poster-style activity framework, the targeted tests passed.
- Fan Activities update: added a visible proof summary strip for Official task records and Store scan closure, poster-style activity cards with fixed artwork slots, reward pills, proof pills, CTA labels, and a direct `Go to store map` action before the tab panels.
- `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/index.static.test.mjs`: 2 files, 14 tests passed after the Fan Activities poster framework update.
- `npm run build`: successful after the Fan Activities poster framework update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Fan Center opened Activities through the fixed bottom nav and rendered `Official tasks and Store Events`, `Official tasks are checked by task records`, `Store scan closure`, `Join, visit, show QR, then system adds points`, `Go to store map`, and 3 poster cards; activity detail rendered `Proof method`, and expanding Rules showed duplicate-participation copy. Horizontal overflow was false. Screenshot: `frontend/output/playwright/fan-activities-poster-flow-20260713.png`.
- `npm test`: 64 files, 192 tests passed after the Fan Activities poster framework update.
- TDD red/green evidence: `npm test -- src/pages/fans/tabs/ScanTab.static.test.mjs` first failed because the Fan Scan page did not have `fan-scan-cockpit`, `fan-scan-ring`, `fan-scan-remaining-card`, `fan-scan-code-matrix`, code cards, or result panel; after adding the scan cockpit framework, the targeted tests passed.
- Fan Scan update: replaced the old text-heavy scan card with a scan cockpit showing remaining counted product scans, editable scan point/limit rules, a primary camera CTA, a result panel, and a five-class code matrix for product unique, store event, official activity, fan center entry/social, and non-UWELL codes.
- `npm test -- src/pages/fans/tabs/ScanTab.static.test.mjs src/index.static.test.mjs`: 2 files, 5 tests passed after the Fan Scan cockpit update.
- `npm run build`: successful after the Fan Scan cockpit update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Fan Center opened Scan and rendered `Scan real UWELL product codes`, `Remaining today`, `Only unique UWELL product codes add scan points`, `Product scan points require official UWELL code validation`, `Fan center entry code`, `Official website / social / community`, `Non-UWELL code`, and `This code is not eligible for UWELL points`; 5 scan code cards rendered and horizontal overflow was false. Screenshot: `frontend/output/playwright/fan-scan-cockpit-20260713.png`.
- `npm test`: 64 files, 193 tests passed after the Fan Scan cockpit update.
- TDD red/green evidence: `npm test -- src/pages/store-owner/StoreOwnerPage.static.test.mjs` first failed because Store Verify/Activities did not have `store-verify-workbench`, `store-verify-rule-strip`, method cards, result states, or `store-activity-guidance-strip`; after adding the operational closure workbench, the targeted test passed.
- Store Verify update: replaced the plain verification card with a visible closure workbench: rule strip, system-awarded points / no manual points pills, Scan fan member QR method, Enter Fan ID or email fallback, result-state chips, and existing reward pickup rules.
- Store Activities update: added a guidance strip that makes the activity split operational: Official campaigns first, store-created events require approval, materials/gifts/costs responsibility, and approved events appearing in `Fan Activities > Store Events`.
- `npm test -- src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.operations.test.mjs src/pages/store-owner/StoreOwnerPage.reward-pickup.test.mjs src/index.static.test.mjs src/utils/uwellLaunchRules.test.mjs`: 5 files, 29 tests passed after the Store Verify/Activities closure workbench update.
- `npm run build`: successful after the Store Verify/Activities closure workbench update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Store Owner closed the first-login photo reminder, opened Verify, and rendered `store-verify-workbench`, 2 method cards, `Scan fan member QR`, `Enter Fan ID or email`, and `System awards points after validation`; horizontal overflow was 0. Screenshot: `frontend/output/playwright/store-verify-workbench-20260713.png`.
- Browser smoke: mobile Store Owner opened Activities and rendered `store-activity-guidance-strip`, 3 guidance cards, `Official campaigns first`, `Store-created events require approval`, and `Appears in Fan Activities > Store Events after approval`; horizontal overflow was 0. Screenshot: `frontend/output/playwright/store-activities-guidance-20260713.png`.
- TDD red/green evidence: `npm test -- src/pages/dashboard/DashboardPage.static.test.mjs` first failed because the backend Dashboard did not have `adminCommandSummary`, `admin-command-summary-strip`, or executive summary cards for field visits, fans, stores, level mix, and regional warehouse snapshot; after adding the summary strip, the targeted test passed.
- Admin Dashboard update: added a first-screen `admin-command-summary-strip` with 4 cards: Field team visits, Fan base, Store base, and Regional warehouse snapshot. The cards expose new-store vs repeat-visit counts, new fans, fan level mix, total stores, A/S exposure stores, store level mix, and visible regional warehouse low/out-of-stock summary.
- `npm test -- src/pages/dashboard/DashboardPage.static.test.mjs src/components/layout/AppLayout.static.test.mjs src/pages/admin-ops/AdminOpsPages.static.test.mjs src/pages/admin-ops/AdminOperationalRules.static.test.mjs src/pages/materials/MaterialStocksPage.region-access.static.test.mjs src/utils/uwellRoleAccess.test.mjs`: 6 files, 24 tests passed after the Admin Dashboard executive summary update.
- `npm run build`: successful after the Admin Dashboard executive summary update; known vendor/image chunk-size warning remains.
- Browser smoke: desktop Admin Dashboard rendered 4 `admin-command-summary-card` cards with Field team visits, Fan base, Store base, Regional warehouse snapshot, Fan level mix, Store level mix, and S/A exposure note; horizontal overflow was 0. Screenshot: `frontend/output/playwright/admin-command-summary-desktop-20260713.png`.
- Browser smoke: mobile Admin Dashboard rendered the same 4 command summary cards with no horizontal overflow. Screenshot: `frontend/output/playwright/admin-command-summary-mobile-20260713.png`.
- TDD red/green evidence: `npm test -- src/pages/admin-ops/AdminOpsPages.static.test.mjs` first failed because Reviews and Risk Center did not render `admin-review-workbench` / `admin-risk-cockpit`, source maps, policy maps, or action ladders; after adding the backend decision and risk workbenches, the targeted test passed.
- Admin Reviews update: added a cross-portal decision workbench with `Cross-portal review intake`, 4 source cards for Fan side / Store side / Field side / Risk side, and a decision ladder that makes approve/reject/request-more-info/escalate/note and audit-log behavior visible above the queue.
- Admin Risk Center update: added an anti-fraud cockpit with risk policy cards for product scan fraud, store verification abuse, reward redemption risk, and community point abuse, plus a resolution ladder for freezing/rejecting related points, sending to Reviews, and resolving only after audit note.
- `npm test -- src/pages/admin-ops/AdminOpsPages.static.test.mjs src/pages/admin-ops/admin-ops-workflows.behavior.test.mjs src/pages/admin-ops/AdminOperationalRules.static.test.mjs src/pages/admin-ops/RewardsOpsPage.operations.test.mjs src/index.static.test.mjs`: 5 files, 14 tests passed after the Reviews/Risk workbench update.
- `npm run build`: successful after the Reviews/Risk workbench update; known vendor/image chunk-size warning remains.
- Browser smoke: admin sidebar opened `#/app/reviews`; Reviews rendered `admin-review-workbench`, 4 source cards, 3 decision-ladder rows, `Cross-portal review intake`, and `Decision writes audit log`; horizontal overflow was 0. Screenshot: `frontend/output/playwright/admin-reviews-workbench-20260713.png`.
- Browser smoke: admin sidebar opened `#/app/risk-center`; Risk Center rendered `admin-risk-cockpit`, 4 policy cards, 3 resolution-ladder rows, `Anti-fraud triage`, and `Freeze or reject related points`; horizontal overflow was 0. Screenshot: `frontend/output/playwright/admin-risk-cockpit-20260713.png`.
- TDD red/green evidence: `npm test -- src/pages/admin-ops/AdminOpsPages.static.test.mjs` first failed because Rewards and Scan Codes did not render `admin-reward-cockpit` / `admin-scan-cockpit`, governance maps, code-class maps, or fulfillment/validation ladders; after adding the redemption and scan-code operation cockpits, the targeted tests passed.
- Admin Rewards update: added a reward governance cockpit with catalog/image-slot governance, level and point-cost rules, pickup-store eligibility, luxury reward approval, and a fulfillment ladder stating available points are deducted only, lifetime growth points stay untouched, and eligible A/S pickup stores are assigned.
- Admin Scan Codes update: added a scan anti-fraud cockpit with code-class governance for product unique codes, store/official activity codes, fan entry / website / social / private community codes, and non-UWELL rejection, plus a validation boundary ladder making clear local recognition is not enough for product points and daily counted scan limits remain enforced.
- `npm test -- src/pages/admin-ops/AdminOpsPages.static.test.mjs src/pages/admin-ops/admin-ops-workflows.behavior.test.mjs src/pages/admin-ops/AdminOperationalRules.static.test.mjs src/pages/admin-ops/RewardsOpsPage.operations.test.mjs src/index.static.test.mjs src/utils/uwellLaunchRules.test.mjs`: 6 files, 28 tests passed after the Rewards/Scan Codes cockpit update.
- `npm run build`: successful after the Rewards/Scan Codes cockpit update; known vendor/image chunk-size warning remains.
- Browser smoke: admin sidebar opened `#/app/rewards`; Rewards rendered `admin-reward-cockpit`, 4 governance cards, 3 fulfillment-ladder rows, `UWELL reward governance cockpit`, and `Available points deducted only`; horizontal overflow was 0. Screenshot: `frontend/output/playwright/admin-reward-cockpit-20260713.png`.
- Browser smoke: admin sidebar opened `#/app/scan-codes`; Scan Codes rendered `admin-scan-cockpit`, 4 code-class cards, 3 validation-ladder rows, `UWELL scan anti-fraud cockpit`, and `Local recognition is not enough for product points`; horizontal overflow was 0. Screenshot: `frontend/output/playwright/admin-scan-cockpit-20260713.png`.
- TDD red/green evidence: `npm test -- src/pages/visits/VisitCreatePage.workflow.test.mjs src/pages/visits/VisitFieldOps.static.test.mjs` first failed because the field visit pages did not render `fieldVisitCommandSummary`, `field-visit-command-strip`, `SALES_SCORE_BANDS`, `field-rating-rule-strip`, or the monthly-sales/backend-review rule ladder; after adding the field visit command center and rating-rule framework, the targeted tests passed.
- Field Visits update: added a first-screen `Field visit command center` with 4 cards for New store discovery, Repeat visit follow-up, Level review queue, and Fan exposure linkage. The copy explicitly states S/A confirmed stores can appear in Fan Home recommendations and store map highlights.
- Visit Create update: added a visible S/A/B/C rating rule framework around the new-store scoring form: monthly sales is 20% of the score, C/B/A/S sales bands are visible, and the review ladder states Rep suggestion is not final, Manager can adjust, Admin confirms final level, and S/A final stores can receive Fan Home and map exposure.
- `npm test -- src/pages/visits/VisitCreatePage.workflow.test.mjs src/pages/visits/VisitFieldOps.static.test.mjs src/pages/dashboard/DashboardPage.static.test.mjs src/utils/uwellLaunchRules.test.mjs src/utils/uwellRoleAccess.test.mjs src/index.static.test.mjs`: 6 files, 34 tests passed after the field visit command/rating update.
- `npm run build`: successful after the field visit command/rating update; known vendor/image chunk-size warning remains.
- Browser smoke: admin sidebar opened `#/app/visits/list`; Field Visits rendered `field-visit-command-strip`, 4 command cards, `Field visit command center`, and S/A Fan Home/map exposure linkage; horizontal overflow was 0. Screenshot: `frontend/output/playwright/field-visit-command-center-20260713.png`.
- Browser smoke: `#/app/visits/create` rendered `field-rating-rule-strip`, 4 sales-band cards, 4 review-ladder rows, `Monthly sales is 20% of the S/A/B/C score`, `S potential: 4-6 units / month`, and `Admin confirms final level`; horizontal overflow was 0. Screenshot: `frontend/output/playwright/field-visit-rating-rules-20260713.png`.
- TDD red/green evidence: `npm test -- src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/store-owner/StoreEntryPage.static.test.mjs` first failed because Store Entry did not render `store-entry-photo-expectation` and Store Me did not render `store-photo-material-workbench`; after adding the registration photo expectation and the Store Me photo/material workbench, the same tests passed.
- Store Entry update: added a visible photo expectation block in the store application form explaining that photos are uploaded after account review/login, Storefront photo is shown to fans on the map, Display photos are used for UWELL level review, and missing photos trigger reminders during the first three logins.
- Store Me update: added `store-photo-material-workbench` with a reminder strip, three purpose cards for fan-facing storefront photo, S/A/B/C display-photo review, and regional warehouse request, plus a current warehouse strip showing the store region warehouse and assigned-region inventory boundary.
- `npm test -- src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/store-owner/StoreEntryPage.static.test.mjs`: 2 files, 20 tests passed after the Store photos/materials workbench update.
- `npm run build`: successful after the Store photos/materials workbench update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Store Entry application mode rendered `store-entry-photo-expectation` with Storefront photo / Display photos / first-three-login reminder copy. Screenshot: `frontend/output/playwright/store-entry-photo-expectation-20260713.png`.
- Browser smoke: mobile Store Owner opened Me through the fixed bottom nav and rendered `store-photo-material-workbench`, 3 purpose cards, `Regional warehouse request`, and `Current warehouse`; horizontal overflow was 0. Screenshot: `frontend/output/playwright/store-photo-material-workbench-20260713.png`.
- `npm test`: 64 files, 203 tests passed after the Store photos/materials workbench update.
- TDD red/green evidence: `npm test -- src/pages/fans/FanStoresExposure.static.test.mjs src/pages/fans/tabs/MapTab.exposure.static.test.mjs` first failed because Fan Stores did not render `getStorefrontPhoto` / `store_front_photo` / fan-visible storefront photo UI and MapTab still referenced the old `storefront` category; after linking Fan Stores and MapTab to `store_front_photo`, the targeted tests passed.
- Fan Stores update: fan-facing store recommendations now consume approved Store Front Photo uploads using the same `store_front_photo` category the store portal creates, reserve a visible storefront image frame, show `Storefront photo helps fans recognize this store` or `Trust photo pending`, and expose Activity store / Pickup eligible / Display reviewed capability tags so S/A exposure has a visible reason for fans.
- `npm test -- src/pages/fans/FanStoresExposure.static.test.mjs src/pages/fans/tabs/MapTab.exposure.static.test.mjs src/index.static.test.mjs`: 3 files, 6 tests passed after the Fan Stores photo/exposure linkage update.
- `npm run build`: successful after the Fan Stores photo/exposure linkage update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Fan Center opened Stores through the fixed bottom nav and rendered 4 fan-visible store cards, 4 storefront images from approved `store_front_photo` uploads, 12 capability tags, and the storefront recognition note; horizontal overflow was 0 and console errors were 0. Screenshot: `frontend/output/playwright/fan-stores-photo-exposure-20260713.png`.
- TDD red/green evidence: `npm test -- src/pages/stores/StoreDetailPage.static.test.mjs src/pages/stores/StoreExposureControl.static.test.mjs` first failed because Store Detail did not explain fan exposure readiness/photo linkage and Store photo review did not persist storefront readiness evidence; after adding the Store Detail readiness card and photo-review audit linkage, the targeted tests passed.
- Admin Store Detail update: added `Fan exposure readiness` for each store with exposure score, Storefront photo approved, Display photo reviewed, Fan Home recommendation, Fan map highlight, and Reward pickup eligibility. This makes the backend explain why an S/A store can appear in fan Home/map/reward pickup instead of hiding the logic in policy text.
- Admin Store photo review update: approving/rejecting `store_front_photo` now writes a `Store photo review` audit log and updates `exposure_controls.storefront_photo_approved`, so the fan-facing storefront trust asset has backend evidence.
- `npm test -- src/pages/stores/StoreDetailPage.static.test.mjs src/pages/stores/StoreExposureControl.static.test.mjs src/index.static.test.mjs`: 3 files, 6 tests passed after the Admin Store exposure readiness update.
- `npm run build`: successful after the Admin Store exposure readiness update; known vendor/image chunk-size warning remains.
- Browser smoke: desktop Admin login with `admin@uwell.com / UwellAdmin@2026` opened `#/app/stores/s-real-012`; Store Detail rendered `Fan exposure readiness`, Storefront photo approved, Display photo reviewed, Fan Home recommendation, Fan map highlight, Reward pickup eligibility, 5 Ready states, horizontal overflow 0, and console errors 0. Screenshot: `frontend/output/playwright/admin-store-exposure-readiness-20260713.png`.
- `npm test`: 64 files, 206 tests passed after the Fan Stores photo/exposure linkage and Admin Store exposure readiness updates.
- TDD red/green evidence: `npm test -- src/pages/materials/MaterialStocksPage.region-access.static.test.mjs` first failed because Material Stocks did not render `materialWarehouseCommand`, the regional command strip, request risk cards, warehouse cards, or role-boundary copy; after adding the warehouse operations command center, the targeted tests passed.
- Admin Materials update: Material Stocks now opens with `Regional warehouse command center`, 4 command cards for Visible warehouse scope, Pending store requests, Stock-risk requests, and Low-stock warehouse alerts, plus visible warehouse cards for Riyadh, Dammam, and Jeddah. The page explicitly states the request review boundary and that Field reps can view assigned-region inventory only.
- `npm test -- src/pages/materials/MaterialStocksPage.region-access.static.test.mjs src/index.static.test.mjs`: 2 files, 3 tests passed after the Material warehouse command center update.
- `npm run build`: successful after the Material warehouse command center update; known vendor/image chunk-size warning remains.
- Browser smoke: desktop Admin login with `admin@uwell.com / UwellAdmin@2026` opened `#/app/materials/stocks`; Material Stocks rendered `Regional warehouse command center`, Visible warehouse scope, Pending store requests, Stock-risk requests, Low-stock warehouse alerts, Request review boundary, Field rep assigned-region boundary, 3 warehouse cards, and 4 command cards; horizontal overflow 0 and console errors 0. Screenshot: `frontend/output/playwright/admin-material-warehouse-command-20260713.png`.
- `npm test`: 64 files, 207 tests passed after the Material warehouse command center update.
- TDD red/green evidence: `npm test -- src/pages/fans/FanCenterPage.static.test.mjs` first failed because Fan Activity Detail did not have `fan-activity-detail-poster`, visual orbit, quick fact cards, closure strip, or sticky action; after adding the image-led activity detail framework, the targeted tests passed.
- Fan Activity Detail update: activity detail now opens as a poster-led mobile page with a yellow-green visual orbit, Reward preview / Proof needed / Where to complete quick facts, Join / Complete or Visit / Verify / Earn closure steps, a proof card, rules disclosure, and a sticky action bar. This reduces text scanning and makes the participation proof loop visible before navigation.
- `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/index.static.test.mjs`: 2 files, 15 tests passed after the Fan Activity Detail image-led update.
- `npm run build`: successful after the Fan Activity Detail image-led update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Fan Center opened Activities and the first activity detail; detail rendered 1 poster, 3 quick fact cards, 4 closure steps, sticky action, Reward preview, Proof needed, Where to complete, Join, Verify, and Earn; horizontal overflow was 0 and console errors were 0. Screenshot: `frontend/output/playwright/fan-activity-detail-image-led-20260713.png`.
- `npm test`: 64 files, 208 tests passed after the Fan Activity Detail image-led update.
- TDD red/green evidence: `npm test -- src/pages/store-owner/StoreOwnerPage.static.test.mjs` first failed because Store Home did not render `storeHomeReadiness`, `New store readiness`, four readiness dimensions, or `store-empty-next-step`; after adding the first-login readiness command module and CSS, the same test passed with 13 tests.
- `npm test -- src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.operations.test.mjs src/pages/store-owner/StoreOwnerPage.reward-pickup.test.mjs src/pages/store-owner/StoreEntryPage.static.test.mjs src/index.static.test.mjs`: 5 files, 27 tests passed after the Store Home readiness update.
- `npm run build`: successful after the Store Home readiness update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Store Owner opened `#/store-owner` with real store `s-real-001` and rendered `New store readiness`, 4 readiness cards, 3 empty next-step cards, Photo readiness, Fan service readiness, Activity readiness, Material readiness, `No fan visits yet`, and `Join official campaigns first`; horizontal overflow was 0, console errors were 0, and no 400 responses occurred. Screenshot: `frontend/output/playwright/store-home-readiness-command-20260713.png`.
- TDD red/green evidence: `npm test -- src/pages/fans/FanCenterPage.static.test.mjs` first failed because Fan Home did not render `fanHomeMissionControl`, `Daily mission control`, `Next move`, `Level gap`, `Reward target`, `Mission progress`, or the related CSS hooks. After adding the mission control module, the targeted test passed.
- Runtime bug evidence and fix: first browser smoke after the Fan Home mission module hit `Cannot access ... before initialization` because `fanHomeMissionControl` referenced `nextRewardTarget` before declaration. A new static guard test was added for declaration order, failed red, then passed after moving the mission-control data below reward-target calculation.
- `npm test -- src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/FanStoresExposure.static.test.mjs src/pages/fans/tabs/ScanTab.static.test.mjs src/pages/fans/tabs/MapTab.exposure.static.test.mjs src/index.static.test.mjs`: 5 files, 25 tests passed after the Fan Home mission-control update and TDZ fix.
- `npm run build`: successful after the Fan Home mission-control update; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Fan Center rendered `Daily mission control`, 3 mission cards, `Next move`, `Level gap`, `Reward target`, `Mission progress`, `Today action`, and 6 fixed bottom-nav items; horizontal overflow was 0, console errors were 0, and no 400 responses occurred. Screenshot: `frontend/output/playwright/fan-home-mission-control-20260713.png`.
- TDD red/green evidence: `npm test -- src/pages/store-owner/StoreOwnerPage.static.test.mjs` first failed because Store Owner still allowed invalid cached local store ids to call `getStoreById`. After adding the local-trial host boundary and fallback correction, the targeted store static test passed.
- `npm test -- src/pages/store-owner/StoreOwnerPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.operations.test.mjs src/pages/store-owner/StoreOwnerPage.reward-pickup.test.mjs src/pages/store-owner/StoreEntryPage.static.test.mjs src/index.static.test.mjs`: 5 files, 28 tests passed after the Store Owner invalid-id recovery fix.
- `npm run build`: successful after the invalid-id recovery fix; known vendor/image chunk-size warning remains.
- Browser smoke: mobile Store Owner deliberately started with `store_owner_store_id=store-001`; the page rendered `New store readiness`, corrected localStorage to `s-real-001`, horizontal overflow was 0, console errors were 0, and bad HTTP responses were 0.
- Language/default-entry update: `index.html`, `fan-app.html`, and `store-app.html` now advertise `lang="en"` instead of `zh-CN`; standalone Fan and Store apps fall back to Ant Design English locale; missing translation keys fall back to English or the caller fallback instead of Chinese. This matches the trial rule that English is the default language and Arabic is the only exposed second language.
- `npm test -- src/stores/languageStore.static.test.mjs src/stores/languagePersistence.static.test.mjs src/stores/entryHtmlLanguage.static.test.mjs src/components/common/LanguageSwitcher.static.test.mjs`: 4 files, 6 tests passed after the language/default-entry update.
- `npm run build`: successful after the language/default-entry update; known vendor/image chunk-size warning remains.
- Cross-portal browser QA script added at `frontend/scripts/qa-cross-portal-smoke.mjs` to verify real user entry flows and direct deep links for Fan, Store, and Admin.
- Browser smoke via `node scripts/qa-cross-portal-smoke.mjs`: Fan real login and Fan direct deep link rendered `.fan-shell`; Admin real login and Admin direct deep link rendered `.ant-layout`; Store real login rendered `.so-page.store-liquid-shell`; all checked routes reported console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and no empty Ant root shell.

Known remaining build warning:

- Some chunks exceed 300 kB after minification, mostly vendor libraries. This does not block local trial preview but remains in technical optimization backlog.
- Trial UI readability polish: Fan Rewards locked redemption now uses a true disabled button state when the reward is not redeemable/reviewable, reward status tags use light surfaces with dark text, and Admin Reviews/Rewards/Scan Codes ladder rows use dark readable text on light cards instead of yellow-on-white.
- `npm test -- src/index.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/admin-ops/AdminOpsPages.static.test.mjs`: 3 files, 25 tests passed after the Fan Rewards and Admin ladder readability update.
- `npm run build`: successful after the readability update; known vendor/image chunk-size warning remains.
- Browser QA via `node scripts/qa-portal-maturity.mjs`: 38 portal states opened with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and no empty root shells. The latest Fan Rewards screenshot shows the locked reward state as light disabled controls, while Admin Reviews/Rewards/Scan Codes screenshots show readable decision/fulfillment/validation ladder text. Screenshots: `frontend/output/playwright/maturity/mobile-fan-rewards-2026-07-13t09-00-48-411z.png`, `frontend/output/playwright/maturity/desktop-admin-reviews-2026-07-13t09-00-48-411z.png`, `frontend/output/playwright/maturity/desktop-admin-rewards-2026-07-13t09-00-48-411z.png`, `frontend/output/playwright/maturity/desktop-admin-scan-codes-2026-07-13t09-00-48-411z.png`.
- Browser smoke via `node scripts/qa-cross-portal-smoke.mjs`: Fan real login, Fan direct deep link, Admin real login, Admin direct deep link, and Store real login all opened with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and no empty root shells after the final readability build.
- `npm test`: 66 files, 215 tests passed after the final readability build.
- Remaining maturity QA soft flags are concentrated in gradient/transparent fan/store surfaces, Ant Design internal select/input-number controls, and known large build chunks. These still need future polish before claiming full trial-operation readiness.
- Fan/Store readability polish: Fan Stores map legend now uses a maintained `fan-map-legend` class with darker text and wrapped layout; Fan Activities task CTAs now render as light pill buttons with the mobile grid fixed to `footer footer`; Store Home queue priority chips use a readable light surface instead of black/neon treatment.
- Regression guard: `npm test -- src/index.static.test.mjs src/pages/fans/tabs/MapTab.exposure.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs`: 4 files, 33 tests passed after the Fan Stores/Fan Activities/Store Home readability update.
- `npm run build`: successful after the Fan Stores/Fan Activities/Store Home readability update; known vendor/image chunk-size warning remains.
- Browser QA via `node scripts/qa-portal-maturity.mjs`: 38 portal states opened with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and no empty root shells. Latest screenshots confirmed the Fan Stores map legend is readable and Fan Activities task cards no longer squeeze the third card copy. Screenshots: `frontend/output/playwright/maturity/mobile-fan-stores-2026-07-13t09-21-15-556z.png`, `frontend/output/playwright/maturity/mobile-fan-activities-2026-07-13t09-33-52-273z.png`, `frontend/output/playwright/maturity/mobile-store-home-2026-07-13t09-21-15-556z.png`.
- Browser smoke via `node scripts/qa-cross-portal-smoke.mjs`: Fan real login, Fan direct deep link, Admin real login, Admin direct deep link, and Store real login all opened with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and no empty root shells after this readability pass.
- `npm test`: 66 files, 215 tests passed after this readability pass.
- Fan Home first-screen readability polish: the member balance row now uses a light readable surface instead of dark translucent legacy styling, and the `Daily mission control` headline is explicitly light text on the dark yellow-green mission card. This fixes a real screenshot issue where `Earn today, grow faster` was nearly invisible on mobile.
- Regression guard: `npm test -- src/index.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs`: 2 files, 17 tests passed after the Fan Home contrast update.
- `npm run build`: successful after the Fan Home contrast update; known vendor/image chunk-size warning remains.
- Browser screenshot check: mobile Fan Home top now shows readable available/lifetime points and a readable `Daily mission control` title. Screenshot: `frontend/output/playwright/fan-home-top-mobile-after-contrast-20260713.png`.
- Browser QA via `node scripts/qa-portal-maturity.mjs`: 38 portal states opened with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and no empty root shells. The script still reports soft contrast/touch findings on gradient fan/store surfaces and Ant Design internal controls; manual screenshot review confirmed the fixed Fan Home top issue is resolved, while these soft findings remain part of the pre-launch polish backlog.
- Browser smoke via `node scripts/qa-cross-portal-smoke.mjs`: Fan real login, Fan direct deep link, Admin real login, Admin direct deep link, and Store real login all opened with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and no empty root shells after the Fan Home contrast update.
- `npm test`: 66 files, 215 tests passed after the Fan Home contrast update.
- Admin mobile touch/readability polish: backend real form controls now use 44px hit areas for input/select/date/input-number shells, AntD internal proxy inputs/spinner parts are excluded from the maturity small-target audit, admin table links have a 32px click area, and dashboard/table/list data text uses darker readable colors on light cards.
- Regression guard: `npm test -- src/index.static.test.mjs`: 1 file, 2 tests passed after the admin touch/readability update.
- `npm run build`: successful after the admin touch/readability update; known vendor/image chunk-size warning remains.
- Browser QA via `node scripts/qa-portal-maturity.mjs`: 38 portal states opened with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and no empty root shells. Mobile admin pages no longer appear in the maturity failure list for small targets/contrast. Desktop admin small-target findings are cleared; only isolated desktop date/label contrast soft flags remain.
- Browser smoke via `node scripts/qa-cross-portal-smoke.mjs`: Fan real login, Fan direct deep link, Admin real login, Admin direct deep link, and Store real login all opened with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and no empty root shells after the admin touch/readability update.
- `npm test`: 66 files, 215 tests passed after the admin touch/readability update.
- Fan/store maturity readability closeout: fan/store card surfaces now provide solid contrast surfaces while keeping the yellow-green visual language. Fan Stores' below-map `fan-visible-store-card` list now has a real readable surface, fixing the remaining high-count maturity warning that came from offscreen store list items rather than the map markers.
- Regression guard: `npm test -- src/index.static.test.mjs`: 1 file, 2 tests passed after the fan/store maturity surface guards were added.
- `npm run build`: successful after the fan/store maturity readability closeout; known vendor/image chunk-size warning remains.
- Browser QA via `node scripts/qa-portal-maturity.mjs`: 38 fan/store/admin mobile+desktop states checked; `failures: []`. All states opened with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, empty root shells `0`, and small touch targets `0`. Remaining low-contrast entries are below the maturity failure threshold and are isolated soft flags on transparent/gradient labels, not hard blockers. Latest Fan Stores screenshot: `frontend/output/playwright/maturity/mobile-fan-stores-2026-07-14t02-12-17-074z.png`.
- Browser smoke via `node scripts/qa-cross-portal-smoke.mjs`: Fan real login, Fan direct deep link, Admin real login, Admin direct deep link, and Store real login all passed with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and non-empty app shells.
- `npm test`: 66 files, 215 tests passed after this maturity closeout pass.
- Remaining known trial-readiness gaps: production server-side anti-fraud/scan validation and stock locking are still only represented by local trial contracts; full Arabic RTL visual QA is still incomplete; bundle-size optimization remains in backlog because vendor/image chunks still exceed the warning threshold.
- Trial language boundary closeout: visible language options and Ant Design locale branches are now limited to English and Arabic. `LANGUAGES` no longer exports Chinese as a selectable UI language, Admin/Fan/Store app shells no longer import `antd/locale/zh_CN`, and all three `ConfigProvider` shells now pass `direction={lang === 'ar' ? 'rtl' : 'ltr'}` so Ant Design tables, modals, tabs, forms, and popups receive RTL direction when Arabic is selected.
- Legacy static fan entry cleanup: `public/uwell-fan-login.html` now advertises `lang="en"` instead of `zh-CN`, and the entry-language static test covers it alongside `index.html`, `fan-app.html`, and `store-app.html`.
- Regression guard: `npm test -- src/components/common/LanguageSwitcher.static.test.mjs src/stores/languageStore.static.test.mjs src/stores/languagePersistence.static.test.mjs src/stores/entryHtmlLanguage.static.test.mjs`: 4 files, 9 tests passed after the English/Arabic-only and AntD RTL direction update.
- `npm run build`: successful after the language-boundary update; the Chinese AntD locale removal reduced transformed modules from 4210 to 4203 and `vendor-antd` from roughly 1,416 KB to roughly 1,410 KB raw. Known vendor/image chunk-size warning remains.
- Browser smoke via `node scripts/qa-cross-portal-smoke.mjs`: Fan real login, Fan direct deep link, Admin real login, Admin direct deep link, and Store real login all passed with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and non-empty app shells after adding AntD RTL direction.
- Arabic runtime direction smoke: with `localStorage.uwell_lang = ar`, `fan-app.html#/fan-entry` rendered `documentElement.lang = ar`, `documentElement.dir = rtl`, `body.dir = rtl`, `body.dataset.direction = rtl`, and an AntD RTL class was present. Remaining Arabic gap: core fan/store/admin pages still contain substantial hard-coded English copy, so Arabic trial mode is directionally correct but not fully translated.
- Performance audit summary: current largest trial-performance risks are fan-entry product images (`caliburn-bubble-*.png`, several hundred KB to ~2 MB each), shared `vendor-antd` (~1.41 MB raw), `vendor-charts` (~403 KB raw), `cssCodeSplit: false` loading a single ~300 KB CSS bundle, and `PageTransition` pulling `framer-motion` into fan/store/admin entry paths. No new dependency should be added; next optimization should prioritize product image conversion/compression, CSS code splitting, and removing fan/store first-screen dependence on `framer-motion`.
- Production boundary audit summary: local trial implements scan limits, duplicate checks, store verification, reward pickup, regional warehouse UI filtering, and admin account route protection, but production readiness still requires server-side atomic enforcement for product-code validation, claimed-by uniqueness, daily scan limits, points ledger add/deduct, reward inventory locking, pickup eligibility, store verification eligibility, warehouse RLS/API permissions, and admin-only account creation. These cannot be fully solved by localStorage/UI guards.
- Performance closeout slice: `PageTransition` no longer imports `framer-motion`; it now uses a CSS-only `uw-page-transition` animation with a reduced-motion override. The unused shared `Counter` component was also moved from `framer-motion` to native `IntersectionObserver` plus CSS. A new static guard at `src/components/common/PageTransition.static.test.mjs` prevents production `.jsx/.js` sources from importing `framer-motion` again.
- Build evidence after removing production `framer-motion`: `npm run build` succeeded with 3,802 transformed modules, down from 4,203 after the language-boundary pass. `vendor-motion` is no longer emitted or referenced in `dist`; hard search reported `No vendor-motion or framer-motion references in dist.` Known large chunks remain: `vendor-antd` ~1,410 KB raw, `vendor-charts` ~403 KB raw, and fan-entry product images up to ~2.13 MB.
- Contrast hardening slice: `index.css` now contains `Trial-launch contrast hardening` selectors for fan mission/action buttons, fan map/filter/store tags, store bottom navigation/readiness text, and admin picker/tab/material-region text. This improves machine-detectable solid color surfaces on several previously gradient-only controls while preserving the yellow-green theme.
- Verification after this slice: `npm test -- src/index.static.test.mjs src/components/common/PageTransition.static.test.mjs` passed with 2 files / 5 tests; `node scripts/qa-cross-portal-smoke.mjs` passed for Fan real login, Fan direct deep link, Admin real login, Admin direct deep link, and Store real login with console errors `0`, bad HTTP responses `0`, horizontal overflow `0`, and non-empty shells; full `npm test` passed with 67 files / 221 tests.
- Current maturity QA status: `node scripts/qa-portal-maturity.mjs` still reports `failures: []`, console errors `0`, bad responses `0`, horizontal overflow `0`, and small touch targets `0` across 38 states, but soft low-contrast flags remain on Fan Home mission-control small labels, Store bottom nav/readiness/activity labels, and Admin date/material/tabs labels because the audit script ignores gradients and still finds transparent ancestors in some cases. These are not hard runtime blockers, but they remain part of the trial-polish backlog before claiming mature UI completion.
