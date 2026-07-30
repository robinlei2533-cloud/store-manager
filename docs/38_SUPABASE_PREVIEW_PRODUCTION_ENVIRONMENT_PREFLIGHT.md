# UWELL CRM Supabase Preview/Production Environment Preflight

Date: 2026-07-30

Task: Task-161

Status: environment readiness preflight only. No Supabase connection, migration execution, database change, API change, permission change, `.env` edit, dependency install, Vercel change, deployment, source-code change, or business-rule change was executed.

## Purpose

This document defines the Supabase environment facts that must be confirmed before moving from local trial readiness into Vercel preview deployment and fallback-disabled remote browser QA.

It is intentionally non-secret and non-destructive. It records what needs to be known, not the private values themselves.

## Current Evidence Basis

| Evidence | Status |
|---|---|
| Latest project progress | `PROGRESS.md` top task was Task-160 before this preflight |
| Supabase preview checklist | `docs/24_SUPABASE_PREVIEW_ACCEPTANCE_CHECKLIST.md` |
| S Store RLS/API alignment | `docs/23_S_STORE_SUPABASE_RLS_API_ALIGNMENT.md` |
| Fallback-disabled browser QA runbook | `docs/33_FALLBACK_DISABLED_REMOTE_BROWSER_ACCEPTANCE_RUNBOOK.md` |
| GitHub/release hygiene preflight | `docs/37_GITHUB_REPOSITORY_AND_BRANCH_HYGIENE_PREFLIGHT.md` |
| Local env template | `frontend/.env.example` |
| Runtime Supabase client and fallback behavior | `frontend/src/services/supabase.js`, `frontend/src/services/api/helpers.js`, `frontend/src/stores/authStore.js` |

## Required Environment Facts

Record these before applying migrations, deploying, or running remote QA:

| Field | Required decision or evidence | Current status |
|---|---|---|
| Supabase project label/id | Preview project id and production project id, without secrets | Preview docs reference `rdsrgpnvzcchqlsghsrq` / `store-manager`; final target still needs confirmation |
| Environment target | Preview first, production only after preview acceptance | Preview-first required |
| Migration status | Confirmed applied through `20260718000700_internal_store_rpc_scope.sql` | Local migration files exist; live target status must be verified in Supabase dashboard/CLI by an approved operator |
| Test accounts | Fan, Store Owner, Admin, Manager, Rep, Anonymous boundary checks | Account labels can be recorded; do not write passwords or keys into docs |
| Role bindings | Manager region, Rep assigned store, Store Owner own active S Store, Admin full access | Must be confirmed against the selected Supabase project |
| Seed data | At least one active S Store, one unrelated-region S Store, and one non-S Store | Required before browser QA |
| Reset/rollback plan | Disposable preview DB, restore point, or documented reset process | Required before any write smoke |
| Storage/media policy | Buckets and public/private access for trial images/videos/proof media | Must be checked before external preview if Supabase storage is used |
| Vercel env handoff | Values entered in Vercel dashboard, not committed | Required for Task-162 |

## Required Migration Order

Do not skip or reorder S Store production-boundary migrations:

1. `20260718000100_s_store_schema.sql`
2. `20260718000200_s_store_rls_policies.sql`
3. `20260718000300_s_store_controlled_mutations.sql`
4. `20260718000400_audit_logs_production_alignment.sql`
5. `20260718000500_s_store_correction_flows.sql`
6. `20260718000600_fan_safe_store_exposure.sql`
7. `20260718000700_internal_store_rpc_scope.sql`

Earlier baseline migrations also exist locally:

1. `20260628000000_init.sql`
2. `20260703000100_trial_ops_city_status.sql`
3. `20260704_trial_ops_alignment.sql`
4. `20260705000100_rls_role_policies.sql`
5. `20260705000200_drop_public_trial_policies.sql`
6. `20260706000100_reward_pickup_rpc.sql`

For a fresh Supabase project, confirm the complete migration chain and dependencies before applying only the S Store subset.

## Required Vercel Environment Variables

These values must be set through Vercel project/team environment configuration, not committed to Git:

```text
VITE_SUPABASE_URL=<preview-or-production-project-url>
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_ALLOW_LOCAL_AUTH_FALLBACK=false
VITE_ALLOW_LOCAL_DB_FALLBACK=false
```

Do not add service role keys to the frontend environment.

## Runtime Fallback Findings

### Database fallback

`frontend/src/services/api/helpers.js` allows local DB fallback when:

1. `VITE_SUPABASE_URL` is absent;
2. `VITE_ALLOW_LOCAL_DB_FALLBACK=true`;
3. the flag is not explicitly false and the app is running in dev mode.

When `VITE_ALLOW_LOCAL_DB_FALLBACK=false` and a Supabase URL exists, `withFallback()` throws Supabase errors instead of switching to `localDb`.

### Auth fallback

`frontend/src/stores/authStore.js` enables local auth fallback on localhost/127.0.0.1/::1 and in dev mode.

Implication: localhost cannot prove final fallback-disabled auth behavior. Task-163 must run against a non-localhost Vercel preview URL with fallback flags set to `false`.

### Supabase client creation

`frontend/src/services/supabase.js` creates a Supabase client only when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist in a browser runtime.

If either value is missing, the module uses a no-op proxy. This protects local demo mode, but it is a release risk because a misconfigured preview can look alive while not proving real Supabase behavior.

## Stop Conditions

Stop before Vercel preview QA or production launch if any of these are true:

1. Vercel preview/prod lacks `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.
2. `VITE_ALLOW_LOCAL_AUTH_FALLBACK` or `VITE_ALLOW_LOCAL_DB_FALLBACK` is not explicitly `false` in preview/prod.
3. Migration status for the target Supabase project is unknown or not confirmed through `20260718000700_internal_store_rpc_scope.sql`.
4. Supabase migrations remain unreviewed/untracked and there is no controlled migration source.
5. Test role bindings are missing, especially Store Owner to own S Store and Manager to assigned region.
6. No reset/rollback plan exists before write smoke tests.
7. First destructive or write smoke is attempted against production instead of a controlled preview target.
8. Remote app silently falls back to local auth/local DB.
9. Fan or anonymous users can read protected S Store operating data.
10. Store Owner, Rep, or Manager role boundaries differ from `docs/24_SUPABASE_PREVIEW_ACCEPTANCE_CHECKLIST.md`.

## Release Handoff Checklist

Before Task-162:

1. Confirm GitHub release inclusion policy for `supabase/migrations/*`.
2. Confirm whether `rdsrgpnvzcchqlsghsrq` / `store-manager` remains the preview project.
3. Confirm preview vs production target names.
4. Confirm migration operator and migration evidence location.
5. Confirm preview account labels and role bindings.
6. Confirm no secrets will be written to repo docs or `.env`.
7. Confirm Vercel project/team target.

Before Task-163:

1. Vercel preview URL exists.
2. Vercel preview env vars are configured.
3. Local auth and local DB fallback are disabled in that preview.
4. Task-154 browser matrix is ready to run.
5. Any write smoke uses disposable or clearly labeled preview data.

## Current Go/No-go

| Level | Decision | Reason |
|---|---|---|
| Continue to Task-162 Vercel preview configuration | Conditional Go | Supabase requirements are now documented, but Vercel target/env values still need dashboard-side confirmation |
| Run Task-163 fallback-disabled remote browser QA | No-go until Task-162 | Needs a non-localhost preview URL with Supabase env vars and fallback disabled |
| Production launch | No-go | Needs remote QA evidence, live asset acceptance, named owner assignments, and final cutover decision |

## Next Task

Task-162: Vercel Preview Deployment Configuration.

Task-162 has been recorded in:

```text
docs/39_VERCEL_PREVIEW_DEPLOYMENT_CONFIGURATION.md
```

It documents the recommended Vercel preview project setup, environment-variable handoff, route smoke path, and stop conditions. It did not deploy or configure production.
