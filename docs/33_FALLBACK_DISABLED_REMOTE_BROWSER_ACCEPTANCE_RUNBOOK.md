# UWELL CRM Fallback-disabled Remote Browser Acceptance Runbook

Date: 2026-07-29

Task: Task-154

Status: execution runbook only. This document does not execute remote QA, change `.env`, change database, change API/RPC, change permissions, install dependencies, or modify runtime UI code.

## Purpose

Task-151 proved the local real-route trial path. Task-153 identified the next production-readiness gap: the same business path must be verified against a controlled Supabase preview environment with local auth and local database fallback disabled.

This runbook defines the exact route matrix, role matrix, evidence format, pass criteria, and stop conditions for the future Task-155 execution.

## Required Environment

Use a controlled preview environment, not production.

Required environment facts to record before execution:

| Field | Required value |
|---|---|
| Preview project id | Supabase project id or preview environment label, without secrets |
| Preview app URL | Public or local preview URL used by Playwright |
| Migration status | Confirmed applied through `20260718000700_internal_store_rpc_scope.sql` |
| Test account owner | Person/team responsible for preview accounts |
| Rollback approach | Restore point, disposable preview DB, or documented reset process |
| Local auth fallback | `VITE_ALLOW_LOCAL_AUTH_FALLBACK=false` |
| Local DB fallback | `VITE_ALLOW_LOCAL_DB_FALLBACK=false` |

Do not store API keys, service role keys, access tokens, passwords beyond approved demo-password docs, or `.env` values in the repo.

## Required Accounts

Use preview-bound accounts aligned to these roles:

| Role | Required purpose |
|---|---|
| Fan | Fan Center path and fan-safe store exposure |
| Store Owner | Own active S Store, bound to a known S Store such as `s-real-012` or preview equivalent |
| Admin | Full backend S Store, Rewards, Reviews, Users, Audit visibility |
| Manager | Assigned-region boundary, can read assigned-region internal S Store data only |
| Rep | Assigned field/S Store work and direct S Store admin route denial |
| Anonymous | Protected data and route denial checks |

## Route Matrix

Run at both viewports:

1. `390x844`
2. `1151x698`

### Fan

| Step | Route | Required result |
|---|---|---|
| F1 | `/fan-app.html#/fan-entry` | Login renders without local fallback indicator or hidden demo-only bypass. |
| F2 | `/fan-app.html#/fan-center` | Fan Home renders real account state. |
| F3 | Fan Scan tab | Scan rules and action entry render; no internal S Store data. |
| F4 | Fan Rewards tab | Rewards render; no S Store sell-through, inventory, replenishment, downgrade, correction, or audit fields. |
| F5 | Fan Community tab | Community surface renders without route or media breakage. |
| F6 | Fan Me tab | Account/history/help entries render. |
| F7 | Fan Stores/Map entry if present | Store presentation is fan-safe, such as `UWELL Brand Store`; internal S Store columns are absent. |

### Store Owner

| Step | Route | Required result |
|---|---|---|
| S1 | `/store-app.html#/store-login` | Store login renders and enters the preview-bound Store Owner account. |
| S2 | `/store-app.html#/store-owner` Home | Store identity and execution command render from preview data. |
| S3 | Verify tab | Controlled verification/pickup actions render; store cannot manually award arbitrary points. |
| S4 | Activities tab | Official/store activity states render; approval boundary remains visible. |
| S5 | S Report tab | Sell-through/product/material forms and submitted-history area render for own active S Store. |
| S6 | S Report submit smoke | If safe preview data is prepared, one controlled submit goes through RPC and creates history/audit evidence. |
| S7 | Me tab | Store profile/photo readiness renders. |

### Admin

| Step | Route | Required result |
|---|---|---|
| A1 | `/#/admin` | Admin login renders and enters backend. |
| A2 | `/#/app/dashboard` | Dashboard loads from preview data without local fallback. |
| A3 | `/#/app/stores/s-stores` | S Store Management list renders; active S Store data is visible. |
| A4 | S Store detail | Detail page renders status, sell-through, inventory, replenishment, history, and detail entry. |
| A5 | Rewards | Reward operations render from preview path. |
| A6 | Reviews | Review queue renders from preview path. |
| A7 | Users | User management renders for Admin. |
| A8 | Audit Log if included in route | Audit records are visible to Admin where implemented. |

### Manager Boundary

| Step | Route | Required result |
|---|---|---|
| M1 | `/#/admin` | Manager login succeeds. |
| M2 | `/#/app/stores/s-stores` | Assigned-region S Store data is visible if seeded; unrelated-region internal S Store data is not visible. |
| M3 | Direct unrelated S Store detail URL | Must show restricted/not-found/null state, not full unrelated-region data. |

### Rep Boundary

| Step | Route | Required result |
|---|---|---|
| R1 | `/#/admin` | Rep login succeeds. |
| R2 | Direct `/#/app/stores/s-stores` | Route is blocked, redirected, or shows no unauthorized S Store management surface. |
| R3 | Field Visit/S Store detail route if prepared | Assigned work renders; unrelated S Store operating data remains hidden. |

### Anonymous

| Step | Route | Required result |
|---|---|---|
| X1 | Direct backend app route | Redirects to login or blocks access. |
| X2 | Direct protected fan/store/internal routes | Does not reveal protected data. |

## Browser QA Metrics

Each audited state must record:

1. viewport;
2. role;
3. route;
4. entered expected shell;
5. page-level horizontal overflow;
6. visible broken images;
7. console errors and page errors;
8. visible fallback/local-demo markers;
9. internal-data leak candidates;
10. route block/redirect state for forbidden paths;
11. screenshot path.

Required JSON output:

```text
frontend/output/playwright/task-155-fallback-disabled-remote-qa/fallback-disabled-remote-results.json
```

Recommended screenshot folder:

```text
frontend/output/playwright/task-155-fallback-disabled-remote-qa/screenshots/
```

## Pass Criteria

Task-155 can pass only if:

1. Fan, Store Owner, Admin, Manager, Rep, and Anonymous checks complete at both viewports or have documented role-specific reason for exclusion.
2. Page-level horizontal overflow total is `0`.
3. Visible broken images total is `0`.
4. Fallback/local-demo markers are absent in fallback-disabled preview mode.
5. Remote Supabase/RLS/RPC failures surface as visible failures or captured errors; they do not silently fall back to localDb.
6. Fan sees no internal S Store operating data.
7. Rep cannot access Admin/Manager S Store Management.
8. Manager cannot read unrelated-region internal S Store data.
9. Store Owner can only operate own Store/S Store data.
10. Admin can access required backend operations.
11. If a safe submit smoke is included, related RPC/audit evidence is recorded.

## Stop Conditions

Stop Task-155 and do not proceed to wider external trial if any condition appears:

1. Any preview migration is missing or out of order.
2. App enters local/demo fallback while fallback is configured as disabled.
3. Fan or Anonymous can read protected S Store operating data.
4. Store Owner can operate another store or edit locked history.
5. Rep can manage S Store status or correct S Store history.
6. Manager can read unrelated-region internal S Store data.
7. Critical S Store mutation succeeds without audit evidence.
8. Page-level horizontal overflow appears on a key trial route.
9. Broken media blocks product, reward, login, or proof content.
10. Login/session state mixes accounts across roles.

## Execution Notes For Task-155

1. Do not edit `.env` directly from Codex unless the user separately instructs and provides a safe environment strategy.
2. Prefer a temporary shell environment or already-deployed preview configuration for fallback-disabled values.
3. Use preview-only data and accounts.
4. Record project identifiers and account role labels, not secrets.
5. If a submit/correction smoke test writes data, use disposable preview rows or clearly labeled test records.
6. If remote credentials or preview URL are unavailable, Task-155 should stop as blocked and not fake remote evidence with local mode.

## Expected Final Task-155 Output

Task-155 final report should include:

1. preview environment label/project id without secrets;
2. route and role matrix result;
3. JSON artifact path;
4. screenshots folder;
5. command results for:
   - focused static tests, if any script/test is added;
   - `npm test`;
   - `npm run build`;
   - fallback-disabled browser QA script;
6. Vite warning status;
7. Go/No-go decision for wider external preview trial;
8. open defects with severity and exact evidence.
