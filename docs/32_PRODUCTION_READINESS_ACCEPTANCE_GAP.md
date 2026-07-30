# UWELL CRM Production Readiness Acceptance Gap

Date: 2026-07-29

Task: Task-153

Status: production-readiness evidence audit, refreshed by Task-159 handoff. No runtime code, database, API, permission, dependency, deployment, or `.env` change.

## Executive Conclusion

Local/internal trial path: Go.

Controlled demo walkthrough: Go, based on Task-151 real-route QA and Task-158 Fan Entry viewport correction.

Production launch: No-go until the remaining remote-mode acceptance evidence is completed.

This is not because the local product path is broken. The current gap is evidence and production-boundary closure: remote Supabase mode, fallback-disabled browser behavior, final account/data setup, and operational ownership must be proven before treating the system as production-ready.

## Evidence Reviewed

1. `PROGRESS.md`
   - Latest completed task before this audit: Task-152.
   - Task-151 final real-route rehearsal passed.
2. `docs/25_TRIAL_OPERATION_READINESS.md`
   - Internal trial and controlled demo are marked Go.
   - Production launch remains separate.
3. `docs/27_TRIAL_ISSUE_LOG_AND_LAUNCH_CHECKLIST.md`
   - No Task-151 customer/demo QA blocker.
   - Production launch remains blocked until separate acceptance.
4. `docs/23_S_STORE_SUPABASE_RLS_API_ALIGNMENT.md`
   - S Store Supabase/RLS/RPC production boundary has been planned, drafted, and partially preview-accepted through Task-065.
5. `docs/24_SUPABASE_PREVIEW_ACCEPTANCE_CHECKLIST.md`
   - Preview migrations and low-level role/RPC checks reached Task-065 closeout.
   - Next phase is page-level browser acceptance with production-like fallback settings.
6. `SUPABASE-RLS-ACCEPTANCE.md`
   - Defines the original RLS acceptance expectations and notes that direct frontend hiding is not enough.
7. `docs/06_API.md`
   - Local fallback must not silently hide production errors in final launch mode.
8. `docs/07_RBAC.md`
   - RBAC must protect service/API queries and mutations, not only sidebar visibility.
9. `frontend/output/playwright/task-151-final-path-rehearsal-qa/final-path-rehearsal-results.json`
   - Latest local real-route browser QA evidence.
10. `docs/38_SUPABASE_PREVIEW_PRODUCTION_ENVIRONMENT_PREFLIGHT.md`
   - Records Supabase preview/production environment facts, migration requirements, Vercel env handoff, fallback risks, and stop conditions before remote QA.

## What Is Already Satisfied

| Area | Status | Evidence |
|---|---|---|
| Local three-portal route rehearsal | Satisfied | Task-151: 34 page states passed |
| Local horizontal overflow | Satisfied | Task-151: total `0` |
| Local visible broken images | Satisfied | Task-151: total `0` |
| Fan protected-data exposure in local route QA | Satisfied | Task-151: candidates `0` after reviewed exclusions |
| Store owner trial path | Satisfied | Task-151: `store.owner@uwell.com` enters `s-real-012` |
| Store S Report local demo evidence | Satisfied | Task-148 and Task-151 |
| Admin S Store, Rewards, Reviews, Users checks | Satisfied | Task-151 |
| Manager regional boundary local route QA | Satisfied | Task-151 |
| Rep direct S Store block/redirect local route QA | Satisfied | Task-151 |
| S Store RLS/RPC low-level preview closeout | Largely satisfied | Task-065 in `docs/24...` reports 16 checks passed, 0 failed |
| Supabase environment preflight checklist | Satisfied as documentation | Task-161: `docs/38_SUPABASE_PREVIEW_PRODUCTION_ENVIRONMENT_PREFLIGHT.md` |
| Chunk-size warning | Satisfied for current build threshold | Task-152 notes chunk warning remains absent after Task-149 |
| Fan Entry short desktop regression | Satisfied | Task-158: `1216x578`, `390x844`, and `1151x698` passed with horizontal overflow `0` |
| Trial handoff package | Satisfied | Task-159: `docs/36_TRIAL_HANDOFF_PACKAGE_AND_FINAL_GO_NO_GO.md` |

## Remaining Gaps

### P0: Must Complete Before Production Launch

| ID | Gap | Severity | Why it matters | Acceptance evidence needed |
|---|---|---|---|---|
| PRD-153-P0-1 | Fallback-disabled browser acceptance is not the latest full-path evidence. | High | Task-151 proves local real routes. Production launch needs proof that remote Supabase/RLS/RPC errors do not disappear behind local fallback. | Browser QA on Fan, Store, Admin, Manager, Rep with `VITE_ALLOW_LOCAL_DB_FALLBACK=false` and `VITE_ALLOW_LOCAL_AUTH_FALLBACK=false`, plus result JSON. |
| PRD-153-P0-2 | Production environment/account/data setup is not recorded as final. | High | Trial accounts are documented for local/demo. Production needs account ownership, region assignment, store owner binding, seeded S Store records, and rollback/restoration notes without secrets. | Environment checklist with role labels, project id, migration date/operator, account binding status, and no secrets. |
| PRD-153-P0-3 | Remote page-level S Store workflow acceptance is still separate from low-level RPC acceptance. | High | Task-065 proves low-level boundaries. Production needs the actual UI pages to submit/read through remote service paths. | Page-level QA proving Backend S Store list/detail, Store S Report submit/history, Field Visit S Store detail, correction modal, and Audit Log visibility under fallback-disabled mode. |
| PRD-153-P0-4 | Production operational ownership is not assigned. | High | Reviews, rewards, risks, S Store reports, replenishment, audit exceptions, and account management need named owners before real users enter. | Owner matrix for each queue/action, including response expectation and escalation path. |

Task-161 update:

The Supabase preview/production environment preflight checklist has been created:

```text
docs/38_SUPABASE_PREVIEW_PRODUCTION_ENVIRONMENT_PREFLIGHT.md
```

This closes the checklist/documentation part of PRD-153-P0-2. It does not close final production environment setup because live Supabase project status, migration operator/date, role bindings, Vercel env values, rollback/reset readiness, and fallback-disabled remote browser QA still need external confirmation.

Task-156 update:

The owner matrix has been created:

```text
docs/34_PRODUCTION_TRIAL_OPERATIONS_OWNER_MATRIX.md
```

This closes the structure of the ownership gap but does not close named ownership. Business still needs to fill the named owner and backup fields before wider external trial or production launch.

### P1: Should Complete Before Wider External Trial

| ID | Gap | Severity | Why it matters | Acceptance evidence needed |
|---|---|---|---|---|
| PRD-153-P1-1 | Remote signup and new-user onboarding under RLS is not the latest proven path. | Medium | Existing docs focus on seeded accounts. External trials may create new Fan or Store users. | Focused remote tests for fan signup/sign-in and store owner sign-in/onboarding boundaries, or decision to disable self-signup for trial. |
| PRD-153-P1-2 | Local fallback behavior needs presenter/ops policy. | Medium | Local fallback is useful for demo, but harmful if mistaken for production. | Written policy: which environments allow fallback, which env vars must be false for preview/prod, and expected visible failure behavior. |
| PRD-153-P1-3 | Asset/CDN resilience is not production-accepted. | Medium | Local QA found no visible broken images, but production external assets may change or time out. | Asset source inventory and fallback strategy for critical fan/store/admin images/videos. |

Task-157 update:

Asset and external dependency inventory has been created:

```text
docs/35_PRODUCTION_ASSET_AND_EXTERNAL_DEPENDENCY_ACCEPTANCE.md
```

This closes the inventory and strategy documentation gap, but live external-asset verification remains separate because Task-157 did not browse, download, replace, or runtime-test external media.
| PRD-153-P1-4 | Build performance warning tracking is still manual. | Medium | `[PLUGIN_TIMINGS]` is known, but production release notes should classify it clearly. | Build log attached to production acceptance package with warning status and decision. |

Task-159 update:

The trial handoff package has been created:

```text
docs/36_TRIAL_HANDOFF_PACKAGE_AND_FINAL_GO_NO_GO.md
```

This closes the local trial handoff summary gap. It does not close production launch because online deployment, fallback-disabled remote QA, live asset acceptance, final environment/account/data setup, and named owner assignments remain separate.

### P2: Can Complete During Trial Hardening

| ID | Gap | Severity | Why it matters | Acceptance evidence needed |
|---|---|---|---|---|
| PRD-153-P2-1 | Full production E2E regression suite is not automated as a repeatable release gate. | Low | Current QA artifacts are task-specific. A repeatable release script reduces drift. | One named release QA script covering the accepted route/account matrix. |
| PRD-153-P2-2 | Docs and code stack naming remain inconsistent in places. | Low | `AGENTS.md` says TypeScript, while many app files are JSX. This is process debt, not a trial blocker. | Decision record: keep current JSX baseline or plan future TS migration. |
| PRD-153-P2-3 | Monolithic CSS remains a maintainability risk. | Low | It increases future edit risk but does not block trial. | Later CSS modularization plan, not part of production acceptance. |

## Recommended Task Sequence

### Task-154: Fallback-disabled Remote Browser Acceptance Plan

Scope:

1. Define the exact environment, route matrix, role matrix, stop conditions, and evidence format for fallback-disabled remote browser QA.
2. Do not change code or `.env`.
3. Do not execute remote destructive actions.

Files:

1. `docs/32_PRODUCTION_READINESS_ACCEPTANCE_GAP.md`
2. `docs/24_SUPABASE_PREVIEW_ACCEPTANCE_CHECKLIST.md`
3. `PROGRESS.md`

Acceptance:

1. Clear remote QA runbook exists.
2. Stop conditions are explicit.
3. Required screenshots/result JSON paths are named.

Current status:

Completed in Task-154 as documentation/runbook only:

```text
docs/33_FALLBACK_DISABLED_REMOTE_BROWSER_ACCEPTANCE_RUNBOOK.md
```

Task-154 did not run remote QA, did not change `.env`, did not contact Supabase, and did not change runtime code. Task-155 remains the actual execution step.

### Task-155: Fallback-disabled Remote Browser QA Execution

Scope:

1. Run the Task-154 route matrix against the controlled preview environment.
2. Confirm Fan, Store, Admin, Manager, Rep behavior with local auth/db fallback disabled.
3. Record result JSON and screenshots.

Files:

1. QA artifacts under `frontend/output/playwright/task-155-fallback-disabled-remote-qa/`
2. `docs/24_SUPABASE_PREVIEW_ACCEPTANCE_CHECKLIST.md`
3. `docs/27_TRIAL_ISSUE_LOG_AND_LAUNCH_CHECKLIST.md`
4. `PROGRESS.md`

Acceptance:

1. Page-level horizontal overflow remains `0`.
2. No visible broken images.
3. Remote S Store reads/writes use Supabase/RPC paths.
4. Forbidden access is visibly blocked or redirected.
5. Remote failures do not silently fall back to localDb.

### Task-156: Production Trial Operations Owner Matrix

Scope:

1. Define ownership for reviews, rewards, risks, S Store reports, replenishment, audit exceptions, user/account management, and incident handling.
2. Keep it documentation-only unless the user separately asks to implement account/permission changes.

Files:

1. New or updated operations handoff doc.
2. `docs/25_TRIAL_OPERATION_READINESS.md`
3. `docs/27_TRIAL_ISSUE_LOG_AND_LAUNCH_CHECKLIST.md`
4. `PROGRESS.md`

Acceptance:

1. Every critical queue/action has an owner.
2. Every production stop condition has an escalation path.

Current status:

Completed in Task-156 as documentation-only:

```text
docs/34_PRODUCTION_TRIAL_OPERATIONS_OWNER_MATRIX.md
```

Named person/team assignments remain a business handoff requirement.

### Task-157: Production Asset And External Dependency Acceptance

Scope:

1. Inventory critical visual/video/font/map assets.
2. Identify external dependencies and fallback strategy.
3. Only download or replace assets after separate confirmation.

Files:

1. New asset acceptance doc.
2. `PROGRESS.md`

Acceptance:

1. Critical product/brand visuals have a source and fallback decision.
2. Broken external assets are classified before wider trial.

Current status:

Completed in Task-157 as documentation-only:

```text
docs/35_PRODUCTION_ASSET_AND_EXTERNAL_DEPENDENCY_ACCEPTANCE.md
```

No assets were downloaded, replaced, compressed, or removed.

## Go / No-go Summary

| Launch level | Current decision | Reason |
|---|---|---|
| Local internal trial | Go | Task-151 passed real routes locally; Task-158 fixed the latest Fan Entry viewport regression. |
| Controlled demo walkthrough | Go | Task-151 and Task-158 leave no current local customer/demo blocker. |
| Wider external trial on preview | Conditional Go | Needs fallback-disabled page-level remote QA, live asset/dependency acceptance, and named owner assignments. |
| Production launch | No-go | Needs online deployment evidence, remote acceptance, final environment/account/data setup, and operations ownership. |

## Next Online Phase

The next work should move from local readiness to online deployment readiness:

1. GitHub repository and release branch hygiene.
2. Supabase preview/production environment preflight.
3. Vercel preview deployment configuration.
4. Fallback-disabled remote browser QA execution.
5. Live external asset/dependency acceptance.
6. Production launch cutover decision.

## Non-goals

This audit does not authorize:

1. database changes;
2. API or RPC changes;
3. permission changes;
4. `.env` changes;
5. dependency installation;
6. product UI redesign;
7. business-rule changes;
8. preview/fan implementation work.
