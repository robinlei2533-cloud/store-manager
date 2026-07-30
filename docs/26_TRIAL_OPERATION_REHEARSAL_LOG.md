# UWELL CRM Trial Operation Rehearsal Log

Date: 2026-07-28

Task: Task-151 evidence refreshed for Task-152 documentation handoff.

Status: final real-route trial path rehearsal passed.

## Purpose

Record the latest real three-portal rehearsal evidence and remove stale Task-147 issue wording after the targeted fixes in Task-148, Task-149, and Task-150.

This document update does not change database schema, API behavior, permissions, business rules, environment variables, dependencies, or runtime UI code.

## Scope

Routes covered by Task-151:

1. Fan Entry: `http://127.0.0.1:5173/fan-app.html#/fan-entry`
2. Fan Center: `http://127.0.0.1:5173/fan-app.html#/fan-center`
3. Store Login: `http://127.0.0.1:5173/store-app.html#/store-login`
4. Store Owner: `http://127.0.0.1:5173/store-app.html#/store-owner`
5. Admin Login: `http://127.0.0.1:5173/#/admin`
6. Admin Dashboard: `http://127.0.0.1:5173/#/app/dashboard`
7. Admin S Store Management: `http://127.0.0.1:5173/#/app/stores/s-stores`
8. Admin Rewards: `http://127.0.0.1:5173/#/app/rewards`
9. Admin Reviews: `http://127.0.0.1:5173/#/app/reviews`
10. Admin Users: `http://127.0.0.1:5173/#/app/settings/users`

Accounts covered:

1. Fan: `fan.preview@uwell.com` / `UwellFan@2026`
2. S Store owner: `store.owner@uwell.com` / `UwellStore@2026`, bound to `s-real-012`
3. Admin: `admin@uwell.com` / `UwellAdmin@2026`
4. Manager: `manager@uwell.com` / `UwellManager@2026`
5. Rep boundary: `rep2@uwell.com` / `UwellRep@2026`

## Browser QA Summary

Task-151 used real browser QA at:

1. `390x844`
2. `1151x698`

Results:

1. Audited page states: `34`.
2. Page-level horizontal overflow total: `0`.
3. Visible broken images total: `0`.
4. Fan entered states: `10`.
5. Fan Scan, Rewards, and Community checks: passed.
6. Fan internal-data leak candidates after excluding known fan-facing reward pickup/level-protection wording: `0`.
7. Store entered states for `s-real-012`: `10`.
8. Store Verify and S Report checks: passed.
9. Admin entered states: `10`.
10. Admin S Store, Rewards, Reviews, and Users checks: passed.
11. Manager S Store boundary observed: passed.
12. Rep direct S Store route redirected/blocked: passed.
13. Diagnostics count: `0`.

Artifact folder:

```text
frontend/output/playwright/task-151-final-path-rehearsal-qa
```

Structured result:

```text
frontend/output/playwright/task-151-final-path-rehearsal-qa/final-path-rehearsal-results.json
```

## Rehearsal Outcome

### Fan App

Passed:

1. Fan login and real Fan Center path are available.
2. Home, Scan, Rewards, Community, and Me were checked in the final path.
3. No page-level horizontal overflow was found.
4. No visible broken images were found.
5. No forbidden internal S Store data exposure was found after reviewing known fan-facing reward wording.

### Store App

Passed:

1. Store owner login enters `s-real-012`.
2. Home, Verify, Activities, S Report, and Me are usable in the final path.
3. S Report checks passed after the Task-148 history/demo-evidence fix.
4. No page-level horizontal overflow was found.
5. No visible broken images were found.

### Backend

Passed:

1. Admin Dashboard loads.
2. Admin S Store Management, Rewards, Reviews, and Users checks passed.
3. Manager regional boundary remains visible and permission-consistent.
4. Rep direct S Store route is redirected or blocked.
5. No page-level horizontal overflow was found.
6. No visible broken images were found.

## Superseded Task-147 Issues

The following Task-147 findings should no longer be treated as open blockers:

1. Store S Report history empty for `s-real-012`: resolved by Task-148.
2. Backend S Store Management desktop table readability: resolved by Task-148.
3. Fan Rewards bottom-navigation clearance: resolved by Task-148.
4. Trial-readiness target/warning polish: handled by Task-149 and Task-150.
5. Final closed-loop path confidence: confirmed by Task-151.

## Current Trial Finding

Blockers:

1. None found by Task-151 for internal trial or controlled customer/demo walkthrough.

Known warning:

1. Vite `[PLUGIN_TIMINGS]` remains an existing build diagnostic.
2. `chunk larger than 300 kB` warning remains absent after Task-149.

## Recommended Presenter Flow

1. Fan: Login -> Home -> Scan -> Rewards -> Community -> Me.
2. Store: Login as `s-real-012` owner -> Home -> Verify -> Activities -> S Report -> Me.
3. Admin: Login -> Dashboard -> S Store -> Rewards -> Reviews -> Users.
4. Manager: show regional boundary.
5. Rep: show direct S Store route blocked or redirected.

Do not restart broad redesign from this rehearsal log. Future implementation work should target only fresh real-page evidence.
