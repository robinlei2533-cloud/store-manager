# UWELL CRM Vercel Preview Deployment Configuration

Date: 2026-07-30

Task: Task-162

Status: Vercel preview deployment configuration handoff only. No Vercel CLI deploy, production deploy, GitHub push, branch creation, staging, `.env` edit, secret write, Supabase connection, migration execution, database/API/permission/business-rule change, dependency install, or runtime source-code change was executed.

## Purpose

This document defines the Vercel preview project configuration needed before fallback-disabled remote browser QA.

It prepares the deployment path, but it does not create the deployment or store secret values.

## Official Configuration References

Reviewed current Vercel/Vite references:

1. Vercel Vite framework docs: `https://vercel.com/docs/frameworks/frontend/vite`
2. Vercel project configuration docs: `https://vercel.com/docs/project-configuration`
3. Vercel `vercel.json` docs: `https://vercel.com/docs/project-configuration/vercel-json`
4. Vercel build configuration docs: `https://vercel.com/docs/builds/configure-a-build`
5. Vercel environment variables docs: `https://vercel.com/docs/environment-variables`
6. Vite env variable docs: `https://vite.dev/guide/env-and-mode`

## Local Project Findings

| Item | Current state | Release impact |
|---|---|---|
| Frontend package | `frontend/package.json` with `build: vite build`, `test: vitest run` | Vercel must build from the `frontend` app, not from an empty repo root package |
| Lockfile | `frontend/pnpm-lock.yaml` exists | Vercel install should use the frontend lockfile |
| Build output | Vite outputs `frontend/dist` when run from `frontend` | Output directory depends on selected Vercel Root Directory |
| Entrypoints | `index.html`, `fan-app.html`, `store-app.html` | Rewrites must preserve Admin/Fan/Store entries |
| Frontend Vercel config | `frontend/vercel.json` exists and includes rewrites plus cache headers | Recommended when Vercel Root Directory is `frontend` |
| Root Vercel config | `vercel.json` exists and runs commands through `cd frontend` | Acceptable fallback if Vercel Root Directory is repo root |
| Local Vercel link folder | `frontend/.vercel` exists and is ignored | Do not commit it |
| Vercel CLI | `frontend/node_modules/.bin/vercel.cmd` exists locally | Do not deploy until user confirms target/project/env values |

## Recommended Vercel Project Mode

Recommended mode for the preview project:

| Setting | Value |
|---|---|
| Import source | GitHub repository selected after Task-160 release inclusion review |
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Install Command | Vercel default for detected lockfile, or `pnpm install --frozen-lockfile` if manually overridden |
| Build Command | `npm run build` or current `frontend/vercel.json` value `npx vite build` |
| Output Directory | `dist` |
| Production Branch | Do not set to the release candidate branch until preview QA passes |

This mode uses `frontend/vercel.json` and keeps routing/cache behavior close to the actual frontend app.

Fallback mode if the Vercel project must use repository root:

| Setting | Value |
|---|---|
| Root Directory | repo root |
| Config file | root `vercel.json` |
| Install Command | `cd frontend && pnpm install --frozen-lockfile` |
| Build Command | `cd frontend && npm run build` |
| Output Directory | `frontend/dist` |

Do not mix the two modes in one Vercel project. Pick one Root Directory and validate the matching config file.

## Required Preview Environment Variables

Set these in Vercel Dashboard for the Preview environment. Do not commit them to GitHub and do not write the values into project docs:

```text
VITE_SUPABASE_URL=<preview-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<preview-anon-public-key>
VITE_ALLOW_LOCAL_AUTH_FALLBACK=false
VITE_ALLOW_LOCAL_DB_FALLBACK=false
```

Notes:

1. `VITE_` variables are bundled into the frontend at build time, so they must not contain private service-role secrets.
2. The Supabase anon key is public by design, but it still belongs in Vercel environment configuration, not committed source.
3. Preview and Production should use separate Supabase project/keys unless the business explicitly accepts shared preview data risk.
4. Changing Vercel environment variables requires a redeploy before the frontend bundle reflects the new values.

## Required GitHub Release Inputs

Before importing or redeploying from GitHub, confirm the release inclusion list from Task-160:

| Group | Required decision |
|---|---|
| Core frontend runtime | Include reviewed `frontend/src/**`, HTML entries, Vite config, tests |
| Admin Ops untracked pages | Include if they are required by current real Admin routes |
| Supabase migrations | Include approved migrations or document another controlled migration source |
| Local UWELL assets | Include if real Fan/Store/Admin routes depend on them |
| Preview-only pages | Exclude unless explicitly approved |
| Generated output and local folders | Exclude |
| `.env` and secrets | Exclude |

Do not use `git add .`.

## Preview Smoke Path After Deployment

After a preview URL exists, run a non-destructive smoke before full Task-163:

1. Open preview root:
   - expected: Admin entry or configured redirect renders.
2. Open Fan entry:
   - `/fan-app.html#/fan-entry`;
   - expected: real Fan login renders without local demo fallback marker.
3. Open Store entry:
   - `/store-app.html#/store-login`;
   - expected: Store login renders.
4. Open Admin login:
   - `/#/admin`;
   - expected: Admin login renders.
5. Attempt seeded preview role login only after account labels are confirmed.
6. Confirm browser console does not show missing env/Supabase initialization errors.
7. Confirm no route falls into local demo data when fallback flags are disabled.

## Stop Conditions

Stop before Task-163 if any condition appears:

1. Vercel project Root Directory is unclear or inconsistent with the selected `vercel.json`.
2. Preview deployment is built from a branch that does not include required untracked source/assets/migrations.
3. `.env`, `.env.local`, service role keys, access tokens, or passwords are staged or committed.
4. Preview environment variables are missing or scoped only to Production.
5. `VITE_ALLOW_LOCAL_AUTH_FALLBACK` or `VITE_ALLOW_LOCAL_DB_FALLBACK` is not explicitly `false`.
6. Supabase project/migration status is unknown.
7. Preview URL is localhost, a local tunnel, or otherwise not a Vercel preview URL suitable for fallback-disabled auth verification.
8. Build output directory mismatch causes Vercel to deploy an empty or stale app.
9. Fan/Store/Admin entry routes return 404 or route to the wrong shell.
10. Production deployment is requested before preview QA evidence exists.

## Task-162 Decision

Current decision:

| Level | Decision | Reason |
|---|---|---|
| Proceed to real Vercel preview setup | Conditional Go | Configuration path is documented, but user must confirm Vercel project/team, GitHub release branch, and environment variable handling |
| Run Task-163 fallback-disabled remote browser QA | No-go until preview URL exists | Needs a deployed non-localhost preview with Supabase env vars and fallback disabled |
| Production deploy | No-go | Preview QA and cutover evidence are not complete |

## Next Task

Task-163: Fallback-disabled Remote Browser QA Execution.

Task-163 should only begin after:

1. a Vercel preview URL exists;
2. Preview env vars are configured;
3. Supabase preview project and migrations are confirmed;
4. preview test accounts and role bindings are confirmed;
5. user confirms that remote browser QA may use those preview accounts.
