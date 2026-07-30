# UWELL CRM S Store V1 Implementation Plan

Date: 2026-07-17

## Purpose

This document defines the planned implementation boundary for S Store V1.

It is a future implementation plan. It does not mean the related code, pages, APIs, database tables, permissions, or dashboards already exist.

Primary product reference:

- `19_S_STORE_BRAND_GROWTH_LOOP.md`

Related governance references:

- `01_PRODUCT_BIBLE.md`
- `02_PRD.md`
- `03_USER_FLOW.md`
- `04_INFORMATION_ARCH.md`
- `05_DATABASE.md`
- `07_RBAC.md`
- `09_BUSINESS_RULES.md`

## V1 Goal

S Store V1 should let UWELL start managing UWELL Brand Stores as terminal brand nodes.

The first implementation loop should be:

```text
Backend sets and manages S Store status
-> S Store submits sell-through, product inventory, and material inventory
-> Field rep submits S Store visit notes and replenishment photos
-> Backend views S Store health, sell-through, inventory, visits, replenishment, and status history
-> Manager/Admin can downgrade or restore S Store status with records
```

## Readiness Snapshot

As of Task-039, the S Store V1 foundation has started in local/demo mode:

1. RBAC list/data-scope foundation has been tightened.
2. Store, fan, and visit detail/id access has been hardened in local/demo mode.
3. A shared backend action permission matrix exists for critical operations.
4. Materials, Rewards Ops, Reviews, Risk Center, and Operational Rules now call shared action permission helpers.
5. Local/demo S Store data objects, rule helpers, and service boundaries exist for the first S Store foundation pass.
6. S Store local/demo service actions write Audit Log records for sell-through, inventory, visit detail, replenishment, downgrade, and restore actions.

S Store V1 should continue from Backend S Store Management read pages, not from fan-facing visual UI first.

Each next S Store implementation task should still produce a fresh impact analysis and wait for confirmation before code. It should not modify Supabase schema, production RLS, seed data, services, or pages without explicit approval.

## Current Recommended Next Step

S Store V1 local/demo implementation has now progressed through:

```text
Task 9: Fan-facing S Store Presentation
```

Task-039 has already added the local/demo foundation for:

- current S Store status on stores;
- S Store status history;
- weekly/monthly sell-through records;
- product inventory snapshots;
- material inventory snapshots;
- S Store visit detail;
- replenishment tasks;
- downgrade/restore records;
- audit-log touchpoints.

Task-041 has started Task 4 in local/demo mode with a read-only Backend > Stores > S Store Management entry, overview cards, filters, and S Store list table.

Task-042 added a dedicated read-only Backend > Stores > S Store Detail page for one S Store's status history, sell-through, product inventory, material inventory, field visit notes, and replenishment records.

Task-043 added the first Backend S Store status operation UI on the S Store Detail page. It uses the existing downgrade/restore services, requires a reason, and preserves the existing status history and audit-log behavior.

Task-044 added downgraded S Store recovery visibility in local/demo mode. Downgraded S Stores remain hidden from the default S Store list/detail reads, but Manager/Admin recovery workflows can explicitly include them and use the existing restore operation.

Task-045 added the first Store App S Store Report entry in local/demo mode. Active S Stores can submit weekly/monthly sell-through, product inventory, and material inventory snapshots through existing S Store services. Submitted records remain locked and visible as read-only history.

Task-046 added the first Field Rep S Store Visit detail flow in local/demo mode. When a repeat visit selects an active S Store, field reps can submit S Store terminal intelligence through the existing visit flow, and Visit Detail can display the submitted S Store visit detail.

Task-047 added the first Backend S Store replenishment loop in local/demo mode. Backend S Store Detail can now create replenishment tasks and complete existing tasks with required completion photo references through existing S Store services.

Task-048 added the first S Store contribution aggregation in local/demo mode. Backend S Store Management and S Store Detail now display contribution metrics aggregated from existing campaign claim, reward pickup, store-linked scan, and fan engagement task records.

Task-049 added fan-facing S Store presentation in the real fan portal. Active S Stores can now appear to fans as `UWELL Brand Store` through shared fan-safe presentation rules, while backend-only operational details remain hidden from fan-facing pages.

Remaining next-step focus:

- resolve known historical static test mismatches;
- use the completed Task-051 Supabase/RLS/API alignment plan before production implementation;
- add backend correction flows for locked S Store sell-through and inventory records if confirmed;
- use the existing S Store service and Audit Log boundary;
- keep Supabase migrations/RLS as a separate confirmed database task.

Task-058 has now added backend correction flows for locked S Store sell-through, product inventory, and material inventory history in local/demo mode, plus a controlled Supabase RPC migration draft. The migration draft has not been executed against a remote Supabase project.

## V1 Scope

### In Scope

1. Backend S Store Management under Stores.
2. Store App S Store Report for S Stores only.
3. Field Rep S Store visit detail and replenishment follow-up.
4. S Store current status and status history.
5. Weekly/monthly sell-through for open-system and disposable products.
6. Product inventory and material inventory snapshots.
7. Low-stock detection based on target stock.
8. Downgrade and restore records.
9. Simple S Store Overview metrics.
10. Service/API boundary for all S Store actions.

### Out Of Scope For V1

1. SKU-level sell-through.
2. Price analysis.
3. Automatic replenishment prediction.
4. S Store exclusive rewards.
5. Complex ROI dashboard.
6. Importer or wholesaler modules.
7. Large fan app redesign.
8. Automatic sales inference from product scans.
9. Full incentive policy for S/A stores.

## Data Strategy

Use the current store record for current identity and status. Use dedicated historical records for business events and operating data.

Recommended direction:

```text
stores: current S Store identity and status
S Store history objects: status changes, sell-through, inventory, materials, replenishment
visits: existing field visit main record
S Store visit detail: S Store-specific market feedback attached to visits
existing activity/reward/scan records: contribution aggregation
```

### Stores Current State

The store record should expose current S Store state when implemented:

- current store level;
- whether the store is an S Store;
- S Store status;
- became-S date;
- S Store source;
- cooperation note.

Do not create a separate competing store-level system.

### S Store Status History

Status history is required for:

- promote to S;
- downgrade to A;
- restore to S;
- pause;
- status correction.

Each record should keep:

- store;
- action type;
- before status;
- after status;
- reason;
- operator;
- action time;
- note.

### S Store Sell-through Records

Sell-through should be historical and period-based.

V1 fields:

- store;
- period type: weekly or monthly;
- period start;
- period end;
- open-system sold quantity;
- disposable sold quantity;
- submitted by;
- submitted at;
- locked status;
- correction metadata when backend correction is needed.

Stores cannot edit locked historical records.

### S Store Product Inventory Snapshots

Product inventory should be stored as snapshots.

V1 fields:

- store;
- open-system current stock;
- disposable current stock;
- open-system target stock;
- disposable target stock;
- low-stock flag;
- submitted by;
- submitted at;
- note.

Low stock:

```text
current stock <= target stock / 3
```

### S Store Material Inventory Snapshots

Material inventory should be separate from product inventory.

V1 fields:

- store;
- material type;
- current quantity;
- target quantity;
- low-stock flag;
- submitted by;
- submitted at;
- note.

### S Store Visit Detail

The existing field visit main record should remain the primary visit container.

S Store-specific details should be attached as a detail record.

V1 fields:

- visit;
- store;
- field rep;
- inventory status;
- display status;
- sell-through observation;
- competitor situation;
- hot brands;
- hot flavors;
- consumer feedback;
- market notes;
- support needed;
- replenishment needed;
- visit photos.

### S Store Replenishment Tasks

Replenishment should be task-like and status-based.

V1 fields:

- store;
- trigger source: low stock, field visit, or store request;
- product/material type;
- requested quantity;
- assigned field rep;
- status: pending, in progress, completed;
- completed at;
- completion photos;
- note.

### Contribution Metrics

Do not duplicate contribution data in V1.

Aggregate from existing operational sources when possible:

- store activity verifications;
- reward pickup records;
- scan records;
- campaign claims;
- store exposure events.

## Service / API Boundary

S Store rules should not live inside page components.

Pages should call S Store services. Services should enforce permissions, business rules, historical writes, and audit behavior where needed.

### Identity And Status Services

V1 actions:

- `getSStores`
- `getSStoreDetail`
- `promoteStoreToS`
- `downgradeSStoreToA`
- `restoreSStore`
- `pauseSStore`
- `getSStoreStatusHistory`

Rules:

- status changes write history;
- Manager/Admin permissions apply;
- downgrade and restore require reason;
- direct page edits to store S Store status are not allowed.

### Store Reporting Services

V1 actions:

- `submitSStoreSellThrough`
- `getSStoreSellThroughHistory`
- `submitSStoreInventory`
- `getSStoreInventoryHistory`
- `submitSStoreMaterialInventory`
- `getSStoreMaterialInventoryHistory`

Rules:

- only S Stores can submit;
- store users can submit only for their own store;
- submitted historical periods are locked;
- backend corrections require correction metadata and audit trail.

### Field Visit And Replenishment Services

V1 actions:

- `submitSStoreVisitDetail`
- `getSStoreVisitDetails`
- `createReplenishmentTask`
- `completeReplenishmentTask`
- `getReplenishmentTasks`

Rules:

- field reps can submit only for assigned stores or assigned regions;
- completed replenishment requires photos;
- low stock can create or suggest replenishment follow-up;
- task status changes should be traceable.

### Overview And Contribution Services

V1 actions:

- `getSStoreOverview`
- `getSStoreContributionMetrics`
- `getLowStockSStores`
- `getSStoreSellThroughTrend`

Rules:

- overview reads and aggregates data;
- overview should not create business records;
- do not invent metrics when source data is missing.

## Rules Utility Boundary

A future rules utility may hold pure S Store rule checks, such as:

- `isLowStock`
- `canStoreSubmitSReport`
- `canDowngradeSStore`
- `canRestoreSStore`
- `isSStoreHistoryLocked`
- `getSStoreFanLabel`

The service layer should call these rules instead of duplicating logic in UI pages.

## Permission Direction

| Role | V1 permission |
|---|---|
| Admin | Full S Store management, correction, audit, and overview access |
| Manager | Manage S Store status and corrections within assigned regions |
| Field Rep | Submit S Store visit details and replenishment completion for assigned stores |
| Store Owner | Submit own S Store sell-through, inventory, and material inventory; view locked history |
| Fan | View only fan-facing UWELL Brand Store information in later fan-facing tasks |

No role should manually give arbitrary fan points through S Store features.

## Page Scope

### Backend

Location:

```text
Backend > Stores > S Store Management
```

V1 pages or sections:

- S Store Overview;
- S Store List;
- S Store Detail;
- Status History;
- Sell-through;
- Product Inventory;
- Material Inventory;
- Field Visit Notes;
- Replenishment Follow-up.

### Store App

Location:

```text
Store App > S Store Report
```

Only visible to S Stores.

V1 forms:

- weekly/monthly sell-through;
- product inventory;
- material inventory.

V1 history:

- submitted sell-through records;
- inventory snapshots;
- material inventory snapshots.

History is read-only for stores.

### Field Rep

Location can be inside the existing Field Visits flow.

V1 additions:

- S Store visit template;
- replenishment needed flag;
- replenishment completion photos.

### Fan App

Fan app S Store presentation is completed in local/demo mode as of Task-049.

The real fan portal can show active S Stores as `UWELL Brand Store` using shared fan-facing presentation rules. The fan view must continue to avoid backend-only operational details such as sell-through, inventory, replenishment tasks, downgrade records, audit records, and raw S Store status fields.

## V1 Task Breakdown

### Task 1: S Store V1 Final Plan

Goal:

- Confirm this implementation plan.
- Confirm data objects, API boundaries, permissions, and task order.

Expected output:

- Approved plan.
- No runtime behavior change.

### Task 2: Data Foundation

Goal:

- Add the minimum data structures needed for S Store V1.

Expected scope:

- current S Store status on stores;
- status history;
- sell-through records;
- product inventory snapshots;
- material inventory snapshots;
- S Store visit detail;
- replenishment tasks.

Acceptance:

- schema/local data model is documented;
- seed/demo data is intentional;
- no unrelated database changes.

Current status:

- Completed in local/demo mode in Task-039.
- Not yet implemented as Supabase migrations or production RLS.

### Task 3: Rules And Service/API Layer

Goal:

- Create unified business actions for S Store features.

Expected scope:

- low-stock rule;
- locked-history rule;
- status change actions;
- sell-through submission;
- inventory submission;
- material inventory submission;
- visit detail submission;
- replenishment task actions;
- overview aggregation.

Acceptance:

- pages do not directly mutate S Store rule fields;
- key actions write history where required;
- permission checks are clear.

Current status:

- Started in Task-039 with pure rules and local/demo service boundaries.
- Task-040 added behavior tests and local/demo Audit Log writes for key S Store actions.
- Remaining work: correction flows, richer overview aggregation, and production API/RLS alignment.

### Task 4: Backend S Store Management

Goal:

- Let Admin/Manager manage and review S Stores.

Expected scope:

- S Store Overview;
- S Store List;
- S Store Detail;
- status change actions;
- downgrade and restore records;
- sell-through/inventory/material/visit/replenishment views.

Acceptance:

- backend can identify S Stores;
- Manager/Admin can manage status by permission;
- low-stock and replenishment status are visible.

Current status:

- Started in local/demo mode in Task-041.
- Completed so far:
  - Backend route `/app/stores/s-stores`;
  - Backend route `/app/stores/s-stores/:id`;
  - Stores sidebar entry `S Store Management`;
  - read-only S Store Overview cards;
  - read-only S Store List with search/status/city/replenishment/low-stock filters;
  - detail navigation to a dedicated S Store Detail route;
  - dedicated S Store Detail page with status history, sell-through, product inventory, material inventory, field visit notes, and replenishment records;
  - first status operation UI for downgrade/restore through existing services with required reasons;
  - downgraded S Store recovery visibility through explicit Manager/Admin read options.
- Not yet completed:
  - write forms;
  - Supabase migrations/RLS and production API alignment.
- Correction flows for locked S Store sell-through, product inventory, and material inventory history were completed in Task-058.

### Task 5: Store App S Store Report

Goal:

- Let S Stores submit terminal data.

Expected scope:

- S-only entry;
- weekly/monthly sell-through form;
- product inventory form;
- material inventory form;
- read-only history.

Acceptance:

- non-S stores cannot access the report;
- store users can submit only for own store;
- submitted records are locked.

Current status:

- Completed in local/demo mode in Task-045.
- Store App now has an S-only `S Report` entry for active S Stores.
- S Stores can submit:
  - weekly/monthly sell-through;
  - product inventory;
  - material inventory.
- Submitted records use existing S Store services and local/demo Audit Log behavior.
- Store users can see locked read-only history.
- Not yet implemented as Supabase migrations/RLS or production API alignment.

### Task 6: Field Rep S Store Visit

Goal:

- Upgrade field visits to collect S Store terminal intelligence.

Expected scope:

- S Store visit template;
- inventory and display observations;
- competitor, hot brand, hot flavor, consumer feedback, and market notes;
- support needed;
- replenishment needed;
- visit photos.

Acceptance:

- field rep can submit S Store visit details;
- records appear in backend S Store Detail;
- no every-visit approval is required.

Current status:

- Completed in local/demo mode in Task-046.
- Repeat Visit now shows `S Store Visit Detail` after selecting an active S Store.
- Field reps can submit:
  - inventory status;
  - display status;
  - sell-through observation;
  - competitor situation;
  - hot brands;
  - hot flavors;
  - consumer feedback;
  - market notes;
  - support needed;
  - replenishment needed;
  - visit photo references through the existing Operational Evidence Photos flow.
- Visit Detail can display the submitted S Store visit detail.
- Automatic replenishment task creation is not included; it remains Task 7.
- Not yet implemented as Supabase migrations/RLS or production API alignment.

### Task 7: Replenishment Loop

Goal:

- Close the low-stock to replenishment loop.

Expected scope:

- low-stock detection;
- replenishment task creation;
- field rep completion;
- completion photos;
- status tracking.

Acceptance:

- low-stock S Stores are visible;
- replenishment tasks can move to completed only with required completion data;
- completed tasks appear in backend.

Current status:

- Completed in local/demo mode in Task-047.
- Backend S Store Detail now exposes:
  - `Create replenishment task`;
  - trigger source;
  - item type;
  - requested quantity;
  - assigned rep;
  - operating note.
- Backend S Store Detail can complete non-completed replenishment tasks with required completion photo references.
- The implementation uses existing S Store service functions:
  - `createReplenishmentTask`;
  - `completeReplenishmentTask`;
  - `getReplenishmentTasks`.
- No automatic replenishment task is created from Store App inventory submission or Field Visit S Store detail submission.
- Not yet implemented as Supabase migrations/RLS or production API alignment.

### Task 8: Contribution Aggregation

Goal:

- Connect existing activity/reward/scan signals to S Store overview and detail.

Expected scope:

- Brand Store event verifications;
- reward pickups at S Stores;
- store-linked scans where available;
- contribution metrics in S Store Detail and Overview.

Acceptance:

- metrics come from existing records;
- missing source data is shown as empty/zero with clear meaning;
- no duplicate manual contribution records are created.

Current status:

- Completed in local/demo mode in Task-048.
- S Store service now exposes `getSStoreContributionMetrics`.
- Contribution metrics are aggregated from existing records only:
  - `campaign_claims`;
  - `mall_redemptions`;
  - `scan_records`;
  - `fan_engagement_tasks`.
- Backend S Store Management now shows:
  - Brand Store Verifications;
  - Reward Pickups;
  - Store-linked Scans;
  - per-store contribution summary in the list.
- Backend S Store Detail now shows:
  - Brand Store Verifications;
  - Reward Pickups;
  - Store-linked Scans;
  - Campaign Contribution;
  - source count table in a `Contribution` tab.
- No manual contribution table or duplicate contribution write model was added.
- Not yet implemented as Supabase migrations/RLS or production API alignment.

### Task 9: Fan-facing S Store Presentation

Goal:

- Use S Store data in fan-facing store discovery and related flows.

Expected scope:

- fan-facing label `UWELL Brand Store`;
- S Store priority where appropriate;
- reward pickup recommendation;
- Brand Store Event display.

Acceptance:

- fan does not see internal operational complexity;
- lower-level stores are not described negatively;
- fan behavior can contribute to S Store metrics where source data exists.

Current status:

- Completed in local/demo mode in Task-049.
- Shared fan-facing helpers now live in `uwellLaunchRules`:
  - `isActiveSStoreForFans`;
  - `getFanFacingStorePresentation`.
- Real fan portal Home/Stores/Map presentation now uses fan-safe labels:
  - `UWELL Brand Store`;
  - `Recommended UWELL partner`;
  - `UWELL partner store`.
- Backend-only operational details remain out of fan-facing sources.
- Not yet implemented as Supabase migrations/RLS or production API alignment.

## Recommended Development Order

1. Task 1: S Store V1 Final Plan
2. Task 2: Data Foundation
3. Task 3: Rules And Service/API Layer
4. Task 4: Backend S Store Management
5. Task 5: Store App S Store Report
6. Task 6: Field Rep S Store Visit
7. Task 7: Replenishment Loop
8. Task 8: Contribution Aggregation
9. Task 9: Fan-facing S Store Presentation

After Task 9, the recommended next implementation should move to production hardening and governance rather than more fan UI polish by default:

1. resolve known historical static test mismatches;
2. complete S Store Supabase migration/RLS/API alignment planning;
3. draft the S Store Supabase schema migration;
4. add S Store RLS policies and production service/RPC boundaries in separate confirmed tasks;
5. add backend correction flows for locked S Store sell-through, inventory, and material inventory records if confirmed.

Task-058 completed the backend correction flow item above. The remaining production hardening step is real Supabase preview acceptance for the drafted schema/RLS/RPC/Audit/correction migration sequence.

Task-051 completed the alignment planning reference:

- `23_S_STORE_SUPABASE_RLS_API_ALIGNMENT.md`

Task-052 added the first additive Supabase schema draft:

- `supabase/migrations/20260718000100_s_store_schema.sql`

The migration draft defines S Store current-state fields on `stores` and the dedicated S Store history/operation tables. It does not add production RLS policies or RPCs.

Do not combine all tasks into one large implementation.

## Verification Direction

Each implementation task should define focused tests before coding.

Minimum verification categories:

- permission scope;
- business rule preservation;
- history records;
- locked history behavior;
- low-stock behavior;
- downgrade/restore record behavior;
- store own-data isolation;
- Manager assigned-region scope;
- Admin full-scope access;
- build/test status.

Standard commands remain:

```bash
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"
npm test
npm run build
```

Known project rule:

- do not run `npm install` or `pip install` unless the user explicitly approves.

## Risks

### Product Risk

S Store must not become a second, conflicting store-level system. It should extend the existing store rating and cooperation model.

### Data Risk

Sell-through, inventory, and status records need history. Storing only current values would make trends, correction, downgrade, and audit weak.

### Permission Risk

Store users must not edit historical records. Field reps must not manage S Store status. Managers must remain region-scoped.

### Scope Risk

Fan-facing S Store improvements should not be mixed into the first backend/store/field-rep foundation unless separately confirmed.

### Reporting Risk

Overview metrics must come from real records. Do not invent operating numbers to fill a dashboard.

## Development Gate

Before any S Store implementation task begins, the agent must still output:

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
