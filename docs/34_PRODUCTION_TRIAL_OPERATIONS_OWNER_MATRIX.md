# UWELL CRM Production Trial Operations Owner Matrix

Date: 2026-07-29

Task: Task-156

Status: operations handoff matrix. No runtime code, database, API, permission, `.env`, dependency, or business-rule change.

## Purpose

Task-153 identified one remaining production-readiness P0 gap that does not require code: production operational ownership is not assigned.

This matrix defines the owner roles, response expectations, escalation path, and evidence needed for every critical trial-operation queue and stop condition. It is written as a handoff template because named people/teams must be confirmed by the business before external trial or production launch.

## Ownership Principles

1. Every live queue needs one primary owner and one backup owner.
2. Admin remains the accountable role for global/system actions.
3. Manager owns assigned-region operational queues.
4. Field Rep owns assigned visit and replenishment execution, not approval.
5. Store Owner owns store-submitted reports, store profile readiness, and pickup execution within allowed rules.
6. Fan support owns fan account/reward/scan confusion, but cannot change points or bypass rules without Admin approval.
7. Any production stop condition escalates to Admin plus technical owner before continuing.

## Owner Role Matrix

| Area | Primary owner role | Backup owner role | Expected response | Evidence to record |
|---|---|---|---|---|
| Admin account/user management | Admin | Technical owner | Same business day for trial accounts; immediate for lockout | User id, role, region, action, approver |
| Manager/Rep assignment | Admin | Manager | Same business day | Assigned region/store ids, effective date |
| Fan account support | Fan support / Admin | Technical owner | Same business day | Fan id, issue type, resolution note |
| Store owner account support | Store ops owner | Admin | Same business day | Store id, owner profile id, login state |
| Reviews queue | Manager by region | Admin | Daily during trial | Review id, decision, reason |
| Reward operations | Admin / reward ops owner | Manager | Daily; same day for high-value rewards | Redemption id, status, pickup store, reviewer |
| Reward pickup exception | Store owner | Manager | Same day | Redemption id, pickup proof, exception note |
| Risk Center | Admin / risk owner | Manager | Same day for high risk; daily for low risk | Risk id, source record, decision |
| S Store report monitoring | Store ops owner | Manager | Weekly report window; next business day for missing report | Store id, period, submission status |
| S Store sell-through correction | Admin | Manager for assigned region | Same business day after evidence received | Record id, before/after, correction reason |
| Product inventory monitoring | Store ops owner | Field Rep | Daily during launch week; then weekly | Store id, low-stock state, snapshot id |
| Material inventory monitoring | Store ops owner | Field Rep | Daily during launch week; then weekly | Store id, material type, snapshot id |
| Replenishment task creation | Manager | Admin | Same day for low-stock trigger | Task id, trigger source, assigned rep |
| Replenishment completion | Assigned Field Rep | Manager | Within agreed field SLA | Task id, completion photos, completed_at |
| Field visit planning | Manager | Field lead | Weekly plan; same day for urgent S Store issue | Visit id, store id, rep id, objective |
| Field visit evidence | Assigned Field Rep | Manager | Same day after visit | Visit id, photos, notes, submitted_at |
| Audit Log review | Admin | Technical owner | Weekly; immediate for critical mutation anomalies | Audit id, actor, action, target |
| Supabase/RLS exception | Technical owner | Admin | Immediate stop-condition review | Error, role, route/RPC, screenshot/log |
| Build/release warning review | Technical owner | Admin | Before release candidate approval | Build log, warning classification |
| Asset/media issue | Brand/content owner | Technical owner | Same business day for broken proof media | Asset URL/path, affected page, fallback action |

## Trial Daily Operating Rhythm

### Daily Opening Check

Owner: Admin with Store ops owner.

Checklist:

1. Confirm Admin Dashboard loads.
2. Confirm S Store Management loads.
3. Check Reviews, Rewards, Risk, S Store reports, and replenishment queues.
4. Confirm no critical media or login issue is reported.
5. Record known warnings and whether they are new.

### Midday Store Check

Owner: Store ops owner with Manager.

Checklist:

1. Review Store Verify exceptions.
2. Check pending reward pickup.
3. Check missing S Report submissions.
4. Check low product/material stock.
5. Assign urgent replenishment or field visit if needed.

### End-of-day Closeout

Owner: Admin with Technical owner.

Checklist:

1. Review open risks and audit anomalies.
2. Confirm no role boundary incident occurred.
3. Confirm unresolved broken-media/login issues.
4. Decide next-day priority.
5. Record open P0/P1 items.

## Stop Condition Escalation

Stop broader trial expansion and escalate if any condition appears:

| Stop condition | First owner | Escalation | Required action |
|---|---|---|---|
| Fan or anonymous sees internal S Store data | Technical owner | Admin | Stop, capture route/screenshot/log, disable affected path if needed |
| Store Owner operates another store | Technical owner | Admin | Stop, capture account/store ids, inspect RLS/API boundary |
| Rep accesses S Store Management | Technical owner | Admin | Stop, capture route and role state |
| Manager sees unrelated-region internal S Store data | Technical owner | Admin | Stop, capture region/store evidence |
| Critical S Store mutation lacks audit evidence | Technical owner | Admin | Stop mutation path until audit write is proven |
| Login/session mixes two roles | Technical owner | Admin | Stop, clear affected session, inspect auth state |
| Production/preview falls back to localDb silently | Technical owner | Admin | Stop, verify env flags and runtime mode |
| Broken media blocks proof content | Brand/content owner | Technical owner | Replace or disable affected proof media |
| Page-level overflow blocks mobile use | Technical owner | Admin | Treat as release blocker for affected route |

## Required Named Assignments Before Wider External Trial

The business must fill these placeholders before inviting external users:

| Function | Named owner | Backup | Notes |
|---|---|---|---|
| Trial commander / final Go-No-go | TBD | TBD | Owns daily decision |
| Technical owner | TBD | TBD | Owns release, errors, RLS/API issues |
| Admin operations owner | TBD | TBD | Owns Admin queues |
| Store operations owner | TBD | TBD | Owns Store Owner and S Store reports |
| Regional manager owner | TBD | TBD | Owns region queues and field assignment |
| Field rep lead | TBD | TBD | Owns visit/replenishment execution |
| Reward operations owner | TBD | TBD | Owns rewards and pickup exceptions |
| Risk/review owner | TBD | TBD | Owns risk/review queue decisions |
| Brand/content owner | TBD | TBD | Owns assets, videos, and copy issues |
| Fan support owner | TBD | TBD | Owns fan account/support issues |

## Launch Decision Effect

This matrix closes the documentation gap for operational ownership design, but it does not by itself make production launch Go.

Current launch stance after Task-156:

1. Local internal trial: Go.
2. Controlled demo walkthrough: Go.
3. Wider external preview trial: Conditional Go, because Task-155 fallback-disabled remote browser QA was skipped by user request and still lacks execution evidence.
4. Production launch: No-go until remote acceptance and named owner assignments are completed.

## Evidence Package For Trial Handoff

Before external trial, attach:

1. latest local QA artifact:
   - `frontend/output/playwright/task-151-final-path-rehearsal-qa/final-path-rehearsal-results.json`;
2. remote fallback-disabled QA artifact if/when completed:
   - `frontend/output/playwright/task-155-fallback-disabled-remote-qa/fallback-disabled-remote-results.json`;
3. this owner matrix with named owner fields filled;
4. latest `npm test` result;
5. latest `npm run build` result and Vite warning classification;
6. open issue list and stop-condition log.
