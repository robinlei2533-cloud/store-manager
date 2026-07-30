# UWELL CRM Trial Issue Log And Launch Checklist

Date: 2026-07-30

Task: Task-159 status refresh after local trial handoff package.

Status: current trial issue log shows no local customer/demo QA blocker after Task-151 and Task-158. Production launch remains blocked until online remote acceptance is completed.

## Purpose

Convert the latest final trial path rehearsal into a clear launch-control checklist and remove stale Task-147 polish gates that were fixed or superseded.

This document is for trial readiness control. It does not change database schema, API behavior, permissions, business rules, environment variables, dependencies, or runtime UI code.

Primary references:

1. `docs/25_TRIAL_OPERATION_READINESS.md`
2. `docs/26_TRIAL_OPERATION_REHEARSAL_LOG.md`
3. `frontend/output/playwright/task-151-final-path-rehearsal-qa/final-path-rehearsal-results.json`
4. `docs/32_PRODUCTION_READINESS_ACCEPTANCE_GAP.md`
5. `docs/34_PRODUCTION_TRIAL_OPERATIONS_OWNER_MATRIX.md`
6. `docs/36_TRIAL_HANDOFF_PACKAGE_AND_FINAL_GO_NO_GO.md`

## Trial Readiness Summary

Internal trial path: Go.

Controlled customer/demo walkthrough: Go, based on Task-151 local real-route QA.

The core trial story can be demonstrated:

```text
Fan trust and activity
-> Store execution and S Store reporting
-> Backend S Store, reward, review, user, and boundary visibility
-> UWELL uses terminal data to improve campaigns, rewards, replenishment, and brand support
```

Task-151 did not find current route, overflow, broken-media, permission, or diagnostics blockers in the checked states.

Task-158 fixed the later Fan Entry short-desktop viewport regression and confirmed `1216x578`, `390x844`, and `1151x698` with page-level horizontal overflow `0`.

## Issue Classification

### Blockers

No blocker was found by Task-151.

A blocker means the issue prevents the core trial story from being demonstrated, breaks a portal route, exposes forbidden data, or violates a confirmed business or permission rule.

### Resolved Or Superseded Prior Gates

| Prior ID | Former issue | Current status |
|---|---|---|
| T147-P1 | Store S Report history empty for `s-real-012`. | Resolved by Task-148 and passed Task-151 Store S Report checks. |
| T147-P2 | Backend S Store Management desktop table visually squeezed/clipped. | Resolved by Task-148 and passed Task-151 Admin S Store checks. |
| T147-P3 | Fan Rewards cards could pass under fixed bottom navigation. | Resolved by Task-148 and passed later route QA. |
| T147-W2 | Large chunk warning was listed with `[PLUGIN_TIMINGS]`. | Chunk warning remains absent after Task-149; `[PLUGIN_TIMINGS]` remains known. |
| T147-W3 | AntD deprecated candidates. | Real Admin route cleanup/triage was handled earlier; not a current Task-151 blocker. |

### Current Known Non-blocking Warnings

| ID | Area | Warning | Current meaning | Action |
|---|---|---|---|---|
| T152-W1 | Build | Vite `[PLUGIN_TIMINGS]` diagnostic. | Existing Vite/Rolldown build diagnostic, not introduced by Task-151 or Task-152. | Track as later build tooling cleanup. |
| T152-W2 | Production readiness | Local trial readiness is not the same as production acceptance. | Local real-route QA passed, but remote-mode and operational ownership evidence remain separate. | Complete production acceptance before public launch. |

## Demo Account Positioning

Use accounts intentionally during trial:

| Role | Account | Password | Trial use |
|---|---|---|---|
| Fan | `fan.preview@uwell.com` | `UwellFan@2026` | Main Fan App demo. |
| Store owner | `store.owner@uwell.com` | `UwellStore@2026` | Main Store App demo, bound to `s-real-012`. |
| Admin | `admin@uwell.com` | `UwellAdmin@2026` | Main Backend demo with full closed-loop visibility. |
| Manager | `manager@uwell.com` | `UwellManager@2026` | Regional boundary demo only. |
| Rep boundary | `rep2@uwell.com` | `UwellRep@2026` | Access-boundary demo only. |

Demo rule:

Use Admin for the main S Store operations story. Use Manager and Rep to prove boundaries, not to replace the Admin walkthrough.

## Launch Checklist

### Fan App

Before trial:

1. Real Fan App opens through `fan-app.html#/fan-entry` or `fan-app.html#/fan-center`.
2. Home shows membership identity, points, growth, action cards, reward, community, and account entries.
3. Scan opens and shows product-code rules.
4. Rewards shows mall content, categories, available points, locks/review states, and pickup/level wording.
5. Community shows content and interaction surface.
6. Me shows account and secondary entries.
7. Bottom navigation does not cover essential final content.
8. Page-level horizontal overflow remains `0`.
9. No visible broken images.
10. Fan-facing pages do not expose internal S Store operational data.

### Store App

Before trial:

1. Store App login works with `store.owner@uwell.com`.
2. Login path enters `s-real-012`.
3. Store Home shows execution command and readiness.
4. Verify is reachable.
5. Activities is reachable.
6. S Report is reachable for the active S Store account.
7. S Report shows V1 report and history/demo evidence.
8. Me/profile/photo readiness is reachable.
9. Store cannot manually award arbitrary fan points.
10. Page-level horizontal overflow remains `0`.
11. No visible broken images.

### Backend

Before trial:

1. Admin login works with `admin@uwell.com`.
2. Dashboard loads.
3. S Store Management loads with active S Store data and detail entry.
4. Rewards page renders.
5. Reviews page renders.
6. Users page renders.
7. Manager regional boundary remains visible and permission-consistent.
8. Rep direct S Store Management access remains blocked or redirected.
9. Page-level horizontal overflow remains `0`.
10. No visible broken images.

## Go / No-go Criteria

### Internal Trial Go

Current status: Go.

The system is ready for internal trial rehearsal when:

1. all three portals load;
2. demo accounts work;
3. Admin can show S Store data;
4. Store owner can reach S Report;
5. Fan can show the member/store/reward path;
6. permissions do not expose forbidden S Store data to Fan or Rep;
7. page-level horizontal overflow remains `0` in checked viewports.

Task-151 meets these criteria.

### Controlled Customer/Demo Go

Current status: Go based on local real-route QA.

Use the Task-151 artifact as the latest acceptance evidence:

```text
frontend/output/playwright/task-151-final-path-rehearsal-qa/final-path-rehearsal-results.json
```

### Production Launch No-go Until Separate Acceptance

Do not treat local trial readiness as full production readiness.

Production launch still requires:

1. remote-mode page-level acceptance;
2. controlled Supabase/RLS/API acceptance evidence where applicable;
3. production fallback behavior review;
4. final account/data setup;
5. operational ownership for reviews, risks, rewards, S Store reports, and replenishment follow-up.

Task-153 production-readiness audit decision:

1. Local internal trial remains Go.
2. Controlled demo walkthrough remains Go.
3. Wider external preview trial is Conditional Go after fallback-disabled page-level remote QA. Task-155 was skipped by user request, so this evidence is still missing.
4. Production launch remains No-go until:
   - fallback-disabled browser acceptance is completed;
   - remote S Store page-level workflows are proven;
   - final production environment/account/data setup is recorded;
   - named operations ownership is assigned.

Task-156 ownership update:

1. The operations owner matrix exists in `docs/34_PRODUCTION_TRIAL_OPERATIONS_OWNER_MATRIX.md`.
2. It defines owner roles, backup roles, response expectations, evidence fields, daily rhythm, and stop-condition escalation.
3. Named people/teams are still placeholders and must be filled by the business before wider external trial or production launch.

Task-159 handoff update:

1. The local trial handoff and final Go/No-go package exists in `docs/36_TRIAL_HANDOFF_PACKAGE_AND_FINAL_GO_NO_GO.md`.
2. Local internal trial and controlled demo remain Go.
3. Wider external preview remains Conditional Go.
4. Production launch remains No-go until fallback-disabled remote QA, live asset acceptance, named owner assignments, and online deployment evidence are complete.

## Next Recommended Work

Next phase should start online deployment readiness in this order:

1. GitHub repository and release branch hygiene.
2. Supabase preview/production environment preflight.
3. Vercel preview deployment configuration.
4. Fallback-disabled remote browser QA execution against the deployed preview URL.
5. Live external asset/dependency acceptance.

After Task-159, the next implementation, QA, or deployment work should only start from fresh user-confirmed scope and current repository status. Do not repeat Task-148 through Task-159 unless a new QA artifact proves regression.
