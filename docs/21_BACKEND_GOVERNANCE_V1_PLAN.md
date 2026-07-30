# UWELL CRM Backend Governance V1 Plan

Date: 2026-07-17

## Purpose

This document defines the planned Backend Governance V1 direction for UWELL CRM.

It is a future implementation plan. It does not mean the related code, pages, APIs, database tables, permissions, or dashboards already exist.

Backend Governance is the trust foundation for S Store, Fan Growth, rewards, activities, points, materials, field visits, and operations.

## Current Implementation Snapshot

As of Task-037, the RBAC foundation portion has started moving from plan to implementation in the frontend/local governance layer.

Completed foundation layers:

1. Task-035: RBAC data-scope foundation.
   - Admin company scope.
   - Manager assigned-region operations scope.
   - Field Rep assigned-store scope.
   - Store Owner owned-store scope.
   - Fan own-identity scope.
2. Task-036: detail/id access hardening for store, fan, and visit detail records.
3. Task-037: shared action permission matrix for materials, rewards, reviews, risk decisions, global rules, visits, store reports, reward pickup, and locked-history editing.

Still not complete:

1. A full unified Audit Log service.
2. Mutation-level backend/API enforcement for every critical action.
3. Supabase/RLS verification for production data boundaries.
4. Reviews V1 as a fully unified approval center.
5. Risk Center V1 as a fully connected rule-based risk event system.

Task-040 added a local/demo Audit Log writer for S Store service actions. It covers S Store sell-through, product inventory, material inventory, visit detail, replenishment task creation/completion, downgrade, and restore records.

Task-056 added the first production Audit Log table/RLS/helper draft and wired the shared frontend Audit Log service to `write_audit_log` when a real browser Supabase runtime is available. The migration has not been executed yet, and production Supabase/RLS acceptance still needs a separate task.

Task-058 added backend correction flows for locked S Store sell-through, product inventory, and material inventory history. These corrections require a reason, preserve locked history, write correction metadata, and write Audit Log records. The related correction RPC migration is a draft and has not been executed yet.

## Governance Goal

Backend Governance V1 should make the system answer:

```text
Who can see which data?
Who can approve which operation?
Who changed what and why?
Which behavior looks risky?
What decision was made and where is the record?
```

## Core Governance Modules

Backend Governance V1 has four core parts:

1. RBAC and data scope
2. Audit Log
3. Reviews
4. Risk Center

Recommended implementation order:

```text
RBAC foundation
-> Audit Log service
-> Reviews V1
-> Risk Center V1
-> connect Governance with S Store and Fan Growth
```

## RBAC V1

RBAC must not be only menu hiding.

The rule is:

```text
Users cannot see data outside their scope.
Users cannot operate objects outside their scope.
Users cannot execute actions outside their role.
```

| Role | V1 scope |
|---|---|
| Admin | All regions, warehouses, users, reviews, rules, S Stores, audit logs |
| Manager | Assigned-region data, reviews, risks, and S Store status |
| Field Rep | Assigned-region or assigned-store visit execution, S Store visits, replenishment evidence, own submissions |
| Store Owner | Own store data, verification, pickup, store activities, store reports, S Store reports when applicable |
| Fan | Own fan profile, points, scans, activities, rewards, community actions, histories |

RBAC must protect service/API queries, mutation permission checks, route/page access, backend menus, and database/RLS where applicable.

## Audit Log V1

Audit Log should record key operations that affect business results, permissions, rules, money, points, inventory, levels, reviews, risks, and status.

Audit Log V1 should record:

1. Permission and account changes:
   - create Manager or Field Rep;
   - update user role;
   - update user region;
   - disable or enable backend account.
2. Rule changes:
   - point rules;
   - level rules;
   - reward rules;
   - high-value reward threshold;
   - scan counted daily limit.
3. Store level and S Store operations:
   - update store level;
   - promote store to S;
   - downgrade S Store to A;
   - restore S Store;
   - pause S Store;
   - correct S Store historical sell-through or inventory data.
4. Review decisions:
   - approve;
   - reject;
   - request changes;
   - cancel review.
5. Risk decisions:
   - escalate risk to Review;
   - resolve High/Critical risk;
   - ignore High/Critical risk;
   - freeze or reject business action because of risk.
6. Reward, points, materials, and inventory operations:
   - high-value reward review;
   - reward pickup confirmation;
   - backend manual points correction if ever allowed;
   - points anomaly correction;
   - warehouse inventory update;
   - material request approval;
   - inbound/outbound correction;
   - S Store replenishment completion.

Recommended fields:

- audit id;
- operator id/name/role;
- region;
- action;
- target type/id/label;
- before value;
- after value;
- reason;
- source module;
- category;
- severity;
- created at;
- IP/device when available.

Audit Log should not record ordinary page views, filtering, searching, normal fan check-in, normal fan scan, normal community actions, or normal data viewing.

## Reviews V1

Reviews is the unified approval center. It does not replace source modules, but key pending work should be visible in Reviews.

Reviews V1 should include six review types:

1. Store registration / store profile review
2. Store level change / S Store status change
3. Store display / photo review
4. Store-created activity review
5. High-value reward redemption review
6. Old fan verification

V2 candidates:

- material request review;
- suspicious scan review;
- community abuse review;
- reward stock adjustment review;
- campaign report review;
- S Store sell-through correction review;
- field visit correction review.

Review statuses:

```text
Pending
Approved
Rejected
Changes requested
Cancelled
```

Review actions:

```text
Approve
Reject
Request changes
View source
```

Recommended fields:

- review id;
- review type;
- source module;
- target id;
- submitted by/role;
- region;
- status;
- priority;
- submitted at;
- reviewed by/at;
- decision;
- reason/comment.

All review decisions should write Audit Log.

## Risk Center V1

Risk Center detects suspicious behavior. Reviews approves or rejects business requests. Audit Log records important decisions.

Risk Center V1 should include four risk types:

1. Scan risk
2. Points risk
3. Reward risk
4. S Store data risk

Examples:

- Scan risk: same product code scanned by multiple fans; claimed code scanned again; repeated non-UWELL code submissions.
- Points risk: fan frequently reaches routine cap; short-time repeated points; repeated claim from same activity.
- Reward risk: frequent high-value redemption; abnormal pickup concentration at one store; attempt before review approval.
- S Store data risk: missing sell-through/inventory updates; current stock below target stock / 3; out of stock or unreachable for more than one month; sell-through spike without supporting evidence.

Risk statuses:

```text
Open
In review
Resolved
Ignored
Escalated to Review
```

Risk severity:

```text
Low
Medium
High
Critical
```

High/Critical resolve, ignore, or escalation should write Audit Log.

## Governance Connections

S Store uses governance for:

- RBAC on assigned-region S Store status;
- Audit Log for promote/downgrade/restore/correction;
- Reviews for S Store status changes when configured;
- Risk Center for sell-through, inventory, out-of-stock, and unreachable risks.

Fan Growth uses governance for:

- Reviews for high-value rewards and old fan verification;
- Reviews for store-created activities;
- Risk Center for scan, points, and reward anomalies;
- Audit Log for rule changes and review decisions.

## Page Scope Direction

Reviews suggested tabs:

- All
- Store
- Level / S Store
- Photo
- Activity
- Reward
- Fan

Risk Center suggested tabs:

- All
- Scan
- Points
- Reward
- S Store

Audit Log suggested filters:

- category;
- operator;
- role;
- region;
- target type;
- date range;
- severity.

## Implementation Roadmap

### Task 1: RBAC Foundation Audit

Goal:

- Confirm data-scope checks for Admin, Manager, Field Rep, Store Owner, and Fan.

Acceptance:

- Manager cannot access unrelated-region data.
- Field Rep cannot approve or see unrelated stores.
- Store Owner cannot access other stores.
- Fan cannot access other fans.
- Forbidden actions are blocked outside the UI.

Current status:

- Partially completed through Task-035, Task-036, and Task-037 for frontend/local data scope, detail/id scope, and action-entry checks.
- Remaining work is production-grade API/RLS/mutation enforcement and broader service coverage.

### Task 2: Audit Log Service

Goal:

- Add a single way to record critical operations.

Acceptance:

- Key permission, rule, review, risk, store level, S Store, reward, points, and material operations can write audit records.
- Audit Log can be filtered by category, operator, role, region, target, date, and severity.

Current status:

- Task-056 added a production `audit_logs` schema/RLS/helper draft.
- Task-056 preserved local/demo Audit Log behavior.
- Task-056 added Supabase `write_audit_log` routing in the shared Audit Log service.
- Remaining work is production acceptance and gradual migration of scattered local/demo direct audit writes into the shared service.

### Task 3: Reviews V1

Goal:

- Add unified review queue for the six V1 review types.

Acceptance:

- Admin can see all reviews.
- Manager can see assigned-region reviews.
- Approve/reject/request changes write source object status.
- Review action writes Audit Log.

### Task 4: Risk Center V1

Goal:

- Add rule-based risk event center for the four V1 risk types.

Acceptance:

- Risk events can be created from scan, points, reward, and S Store data rules.
- High/Critical risk decisions write Audit Log.
- Risks can be escalated to Reviews or linked to review decisions.

### Task 5: Governance Connection To S Store And Fan Growth

Goal:

- Ensure S Store and Fan Growth tasks use RBAC, Audit, Reviews, and Risk boundaries.

Acceptance:

- S Store status changes and corrections are audited.
- High-value rewards use Reviews.
- Points/reward/scan anomalies can enter Risk Center.
- Store-created activities use Reviews.

## Verification Direction

Minimum verification categories:

- role data scope;
- forbidden direct action;
- audit record creation;
- review status write-back;
- risk event status transition;
- region scope;
- store own-data scope;
- fan own-data scope;
- no invented dashboard numbers.

Standard commands remain:

```bash
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"
npm test
npm run build
```

Do not run dependency installation commands unless the user explicitly approves.

## Risks

- Permission risk: menu hiding alone is not enough.
- Audit risk: adding audit after business features can lose important early decisions.
- Review scope risk: Reviews V1 should not include too many review types.
- Risk Center scope risk: V1 should stay rule-based, not AI fraud detection.
- Data truth risk: governance pages must use real records and not invented numbers.

## Development Gate

Before any Backend Governance implementation task begins, the agent must still output:

1. requirement analysis;
2. impact analysis;
3. files to modify;
4. database impact;
5. API impact;
6. permission impact;
7. other page impact;
8. risks;
9. wait for user confirmation.

This plan does not authorize code changes by itself.
