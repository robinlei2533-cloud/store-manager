# UWELL CRM Trial Ops Audit - 2026-07-04

## Scope

This audit covers the current local 5173 trial build of the UWELL CRM project:

- Fan portal: `fan-app.html#/fan-entry`, `fan-app.html#/fan-center`
- Store portal: `store-app.html#/store-login`, `store-app.html#/store-owner`
- Admin / internal portal: dashboard, campaigns, stores, visits, evaluations, materials, fans, complaints, data management
- Frontend build/runtime checks
- Supabase schema alignment against frontend API expectations

Current product principles:

- Fan portal: English-first
- Store portal: English-first
- Admin / manager / rep portal: Chinese-first
- Current target: local trial-operation MVP, not public production launch

## Verification Evidence

Commands run from the frontend project root:

```powershell
node --test src/components/layout/AppLayout.static.test.mjs src/pages/fan-entry/FanEntryPage.static.test.mjs src/pages/fans/FanCenterPage.static.test.mjs src/pages/fans/tabs/CampaignTab.static.test.mjs src/pages/store-owner/StoreOwnerPage.static.test.mjs src/utils/trialOps.test.mjs src/utils/uwellRoleAccess.test.mjs
npm run build
node output\trial-full-audit.mjs
node output\network-audit.mjs
```

Latest results:

- Static tests: 16/16 pass
- Production build: success
- Full page audit: all audited pages have `mojibake: 0`, `overflow: 0`, `console: 0`, `requestFailures: 0`
- Network audit: no Supabase 400/404 or business API failures observed; only OpenStreetMap tile `ERR_ABORTED` events remain

## Current Frontend Status

### Fan Portal

Status: local trial-ready.

Completed in the current iteration:

- Fan entry and fan center are English-first.
- Real demo path works: fan entry -> join/sign in -> continue as demo fan -> fan center.
- Fan center settings area is clearer: Language, settings gear, fan avatar.
- Fan center visible copy has no mojibake in core paths.
- Fan bottom navigation stays on one line.
- Store recommendation and reward/activity cards render without viewport overflow.

Remaining fan-side refinement:

- Continue consumer UX polish on activity understanding, scan/redeem flow, and login/register trust copy.
- Replace demo-style data with real trial data after Supabase schema is fully aligned.

### Store Portal

Status: local trial-ready.

Completed in previous/current iterations:

- Store portal is English-first.
- Store login and store owner center render without console errors, mojibake, or overflow.
- Store owner center shows store level, activity/status panels, material information, and owner-facing actions.

Remaining store-side refinement:

- Continue checking the full real owner workflow after Supabase schema is applied: registration -> pending review -> login -> activity/material updates.
- Reduce remaining sample-data feel in store dashboard cards.

### Admin / Internal Portal

Status: local trial-ready for review; production data alignment still pending.

Completed in current iteration:

- Admin core routes audited with zero mojibake, overflow, console errors, and request failures.
- Dashboard Leaflet map internal overflow is contained and excluded from false-positive page-level overflow checks.
- Store list table width is compressed to fit the admin content area.
- Store list Chinese labels such as latest rating, rep assignment, and scoring are verified as readable in source/runtime.

Remaining admin-side refinement:

- Continue adding real operational data in dashboard, store management, materials, complaints, and campaigns.
- After real Supabase data is enabled, re-check manager and rep role data scopes.

## Supabase / Backend Alignment

Status: schema patch prepared, not yet applied to cloud.

Frontend API expectations were compared against the local schema. Most tables exist, but the trial version needed extra fields and RPC helpers for current frontend flows.

New non-destructive migration prepared:

```text
supabase/migrations/20260704_trial_ops_alignment.sql
```

The migration adds or aligns:

- `profiles.country`, `profiles.city`
- `fans.country`, `fans.city`
- `stores.country`, `stores.city`, `stores.status`, `stores.owner_name`, `stores.owner_phone`, `stores.display_status`, `stores.rating_status`
- `material_stocks.qty`, `material_stocks.safety_stock`
- `scan_records.qr_code_id`, `scan_records.points_earned`, `scan_records.scanned_at`
- RPC helpers: `get_low_stock_count`, `get_visit_trend`, `get_scan_trend`, `scan_qr_code`

Important caveat:

- This migration has not been executed against the remote Supabase project in this audit.
- Frontend still contains trial local fallback switches for analytics/material/evaluation/scan-record stability.
- The next backend milestone is to apply this migration, verify real cloud reads/writes, then reduce local fallback usage module by module.

## Git / Storage Status

Current branch:

```text
codex/uwell-trial-ops-sync
```

Current state:

- Branch is ahead of remote by 5 commits.
- There are uncommitted working tree changes from the trial-ops fixes.
- Untracked generated/debug artifacts exist and should not be committed blindly: `.playwright-cli/`, `output/`, local backup/bundle folders.

Recommended before upload:

1. Review the diff.
2. Stage only source, docs, and Supabase migration files needed for this version.
3. Commit as a trial-ops checkpoint.
4. Push to GitHub only after user confirmation.
5. Apply Supabase migration only after user confirmation.

## Remaining Risks

1. Cloud database not fully proven

Local UI and build are stable, but cloud Supabase schema/RPC changes are only prepared, not executed.

2. Trial local fallbacks still active

They protect the MVP from breaking while schema is incomplete, but they must be reduced before production launch.

3. Public deployment not verified

This audit targets local `127.0.0.1:5173`; public hosting, custom domain, SEO, analytics, monitoring, and production privacy/terms are not completed.

4. Product data still needs real trial content

Some dashboards and lists still use local/demo-like records. Real store, fan, activity, inventory, and complaint data should be added for trial use.

## Recommended Next Plan

1. Create a clean Git checkpoint

- Exclude generated audit output and local backups.
- Include source fixes, docs, and `supabase/migrations/20260704_trial_ops_alignment.sql`.

2. Apply Supabase migration in a controlled step

- Run the non-destructive migration in Supabase SQL editor or CLI.
- Verify country/city registration writes, material stock reads, QR scan RPC, and dashboard RPCs.

3. Disable local-first fallbacks gradually

- Start with dashboard analytics.
- Then materials.
- Then evaluations.
- Then scan records / QR scanning.

4. Real-data trial pass

- Fan: register/login -> center -> campaign -> store recommendation -> scan/reward.
- Store: register -> pending review -> approved login -> material/activity updates.
- Admin/rep: verify menu scope, store assignment, visits, ratings, complaints.

5. UI refinement pass

- Fan login visual polish.
- Activity detail clarity.
- Store owner dashboard copy/data density.
- Admin data cards and empty states.

6. Pre-public launch pass

- Privacy/terms final text.
- Domain/deployment strategy.
- SEO/meta only if public marketing surface is needed.
- Monitoring/analytics.