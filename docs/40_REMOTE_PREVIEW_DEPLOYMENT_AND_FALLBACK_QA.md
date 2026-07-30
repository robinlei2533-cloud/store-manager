# UWELL CRM Remote Preview Deployment And Fallback QA

Date: 2026-07-30

Task: Task-163

Status: Vercel preview deployed and remote smoke executed. Full fallback-disabled role matrix is not yet Go because preview Auth/account binding is not accepted.

## Scope

This task moved the current frontend preview path onto Vercel with Supabase preview environment values and local fallback flags disabled.

No production deployment, Supabase migration execution, database schema change, RLS change, API change, `.env` edit, dependency install, or business-rule change was performed.

## Vercel Preview

Current preview URL:

```text
https://frontend-dbze10wcz-uwell-club.vercel.app
```

Previous preview URL generated during the same task:

```text
https://frontend-5z8h7f1ew-uwell-club.vercel.app
```

Vercel project:

```text
uwell-club/frontend
```

Deployment protection:

1. Initial preview was blocked by Vercel login/SSO protection.
2. Project protection was adjusted through Vercel CLI so the preview URL can be opened directly for browser QA.
3. Production was not promoted.

## Supabase Preview

Preview project used:

```text
rdsrgpnvzcchqlsghsrq / store-manager
```

Supabase project status observed through the Supabase Management API:

```text
ACTIVE_HEALTHY
```

The preview deployment was built with:

```text
VITE_SUPABASE_URL=https://rdsrgpnvzcchqlsghsrq.supabase.co
VITE_ALLOW_LOCAL_AUTH_FALLBACK=false
VITE_ALLOW_LOCAL_DB_FALLBACK=false
```

The anon key was read from Supabase and passed to the Vercel build process. It was not written to `.env`, docs, or Git.

## Runtime Fix Applied

Two fallback paths were tightened before the second preview deployment:

1. Fan login no longer silently calls `signInLocal()` when `isLocalAuthFallbackEnabled()` is false.
2. Store Owner login no longer treats `.vercel.app` as a local preview host for the local owner shortcut.

Files:

1. `frontend/src/pages/fan-entry/FanEntryPage.jsx`
2. `frontend/src/pages/fan-entry/FanEntryPage.static.test.mjs`
3. `frontend/src/pages/store-owner/StoreEntryPage.jsx`
4. `frontend/src/pages/store-owner/StoreEntryPage.static.test.mjs`

## Browser QA Evidence

Artifact folder:

```text
frontend/output/playwright/task-163-fallback-disabled-remote-qa
```

Remote smoke result:

```text
frontend/output/playwright/task-163-fallback-disabled-remote-qa/fallback-disabled-remote-smoke-results.json
```

Remote login smoke after fallback fix:

```text
frontend/output/playwright/task-163-fallback-disabled-remote-qa/fallback-disabled-remote-login-smoke-after-fix-results.json
```

Remote smoke totals after Vercel protection was removed:

| Metric | Result |
|---|---|
| Audited states | 12 |
| Viewports | `390x844`, `1151x698` |
| Navigation errors | 0 |
| Page errors | 0 |
| Console warnings/errors | 0 |
| Page-level horizontal overflow states | 0 |
| Broken image states | 0 |
| Vercel protection states | 0 |
| Missing expected text states | 0 |

Role login smoke after fallback fix:

| Role | Result |
|---|---|
| Fan | Stayed on login after failed preview Auth; no false Fan Center entry |
| Store Owner | Stayed on login after failed preview Auth; no false Store Owner entry |
| Admin | Stayed on login after failed preview Auth; no false Admin Dashboard entry |

Residual evidence:

1. Fan login still initializes `store_manager_db_*` localDb keys during the failed-login path, but it no longer sets `fan_logged_in` or enters Fan Center.
2. Store Owner no longer enters Store Owner through `.vercel.app` local shortcut.
3. Admin login remains on the login page with Supabase Auth 400 candidate.

## Current Decision

| Level | Decision | Reason |
|---|---|---|
| Vercel preview availability | Go | Preview URL opens Fan, Store, and Admin shells directly |
| Basic remote smoke | Go | No route break, overflow, broken image, console error, or Vercel protection blocker in the smoke matrix |
| Fallback-disabled full role QA | No-go | Preview Auth/account binding is not accepted for Fan, Store Owner, and Admin demo credentials |
| Production launch | No-go | Full remote role matrix, owner assignments, asset acceptance, and cutover decision remain incomplete |

## Required Next Fix

Before repeating the full Task-163 role matrix:

1. Confirm or recreate preview Supabase Auth users for:
   - `fan.preview@uwell.com`;
   - `store.owner@uwell.com`;
   - `admin@uwell.com`;
   - `manager@uwell.com`;
   - `rep2@uwell.com`.
2. Confirm each Auth user has the required `profiles` row and role.
3. Confirm Store Owner is bound to `s-real-012` through `owner_profile_id`.
4. Confirm Fan has a matching `fans` row.
5. Rerun fallback-disabled remote role QA after account binding is fixed.

## Security Note

Supabase and Vercel tokens were supplied during the task and used only in local command processes. They should be rotated after preview setup is complete.
