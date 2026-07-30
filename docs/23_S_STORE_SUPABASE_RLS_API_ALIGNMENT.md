# UWELL CRM S Store Supabase / RLS / API Alignment Plan

Date: 2026-07-18

## Purpose

This document defines the production-boundary alignment plan for S Store V1.

It is a planning document. It does not mean the related Supabase migrations, RLS policies, RPCs, API changes, permissions, or production deployment have already been implemented.

Primary references:

- `19_S_STORE_BRAND_GROWTH_LOOP.md`
- `20_S_STORE_V1_IMPLEMENTATION_PLAN.md`
- `21_BACKEND_GOVERNANCE_V1_PLAN.md`
- `05_DATABASE.md`
- `06_API.md`
- `07_RBAC.md`

## Current Situation

S Store V1 is currently implemented as a local/demo closed loop.

Completed local/demo capabilities include:

1. Backend S Store Management list and detail pages.
2. S Store status operations for downgrade and restore.
3. Downgraded S Store recovery visibility.
4. Store App S Store Report for active S Stores.
5. Field Rep S Store Visit detail flow.
6. Backend replenishment task creation and completion.
7. S Store contribution aggregation from existing source records.
8. Fan-facing `UWELL Brand Store` presentation.
9. Local Audit Log writes for S Store service actions.

The production boundary is not complete yet:

1. S Store dedicated tables do not exist in Supabase migrations.
2. S Store dedicated RLS policies do not exist.
3. `frontend/src/services/api/s-stores.js` is local/demo only.
4. S Store mutations are not protected by Supabase RPCs or backend transaction boundaries.
5. S Store audit writes are local/demo only.
6. Production fallback behavior may hide Supabase or RLS problems if not disabled during acceptance.

## Production Alignment Goal

Move S Store V1 from local/demo behavior to a production-ready data boundary without changing the confirmed business rules.

The goal is:

```text
Supabase tables and constraints
-> RLS data scope
-> controlled API/RPC mutations
-> audit records
-> existing backend/store/field/fan pages read the same service contracts
```

This should make the S Store loop trustworthy enough for real terminal-store data:

```text
S Store status
-> sell-through
-> inventory
-> field visit intelligence
-> replenishment
-> fan/store contribution
-> backend brand-growth decisions
```

## Data Object Mapping

### Stores Current S Store State

Production location:

```text
public.stores
```

Required columns:

| Column | Type direction | Purpose |
|---|---|---|
| `is_s_store` | boolean | Whether this store is currently selected as an S Store identity record |
| `s_store_status` | text | Current S Store operating status |
| `became_s_at` | timestamptz | When the store became an S Store |
| `s_store_source` | text | Backend-managed source, such as selected from A-level store |
| `cooperation_note` | text | Backend cooperation note |
| `owner_profile_id` | uuid | Store owner identity binding |
| `rep_id` | uuid | Field rep assignment |

Status values should stay aligned with existing docs:

```text
active
needs_follow_up
paused
downgraded
under_review
```

Implementation note:

Do not create a second competing store-level system. S Store identity extends the existing `stores` record.

### S Store Status History

Production table:

```text
public.s_store_status_history
```

Required fields:

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `store_id` | Related store |
| `action_type` | promote, downgrade, restore, pause, correction |
| `before_status` | Previous S Store status |
| `after_status` | New S Store status |
| `reason` | Required operating reason |
| `note` | Optional detail |
| `operator_id` | Actor profile |
| `action_at` | Action time |
| `related_record_id` | Optional related downgrade/recovery/correction record |
| `created_at` | Creation time |
| `updated_at` | Update time |

Rules:

1. Status changes must write history.
2. Downgrade and restore require reason.
3. Manager scope is region-based.
4. Store owners, reps, and fans cannot change S Store status.

### S Store Sell-through

Production table:

```text
public.s_store_sell_through
```

Required fields:

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `store_id` | S Store |
| `period_type` | weekly or monthly |
| `period_start` | Period start date |
| `period_end` | Period end date |
| `open_system_sold_qty` | Open-system sold quantity |
| `disposable_sold_qty` | Disposable sold quantity |
| `submitted_by` | Store owner or backend operator |
| `submitted_at` | Submission time |
| `locked` | Store history lock |
| `corrected_by` | Backend correction operator |
| `corrected_at` | Correction time |
| `correction_reason` | Required correction reason |
| `correction_note` | Optional correction detail |
| `created_at` | Creation time |
| `updated_at` | Update time |

Rules:

1. V1 only tracks weekly/monthly open-system and disposable sold quantities.
2. No SKU-level sell-through in V1.
3. Submitted records are locked for stores.
4. Backend corrections require correction metadata and audit trail.
5. Production should prevent duplicate period submissions per store and period.

Recommended uniqueness:

```text
unique(store_id, period_type, period_start, period_end)
```

### S Store Product Inventory Snapshots

Production table:

```text
public.s_store_product_inventory_snapshots
```

Required fields:

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `store_id` | S Store |
| `open_system_current_stock` | Open-system current stock |
| `open_system_target_stock` | Open-system target stock |
| `disposable_current_stock` | Disposable current stock |
| `disposable_target_stock` | Disposable target stock |
| `open_system_low_stock` | Derived low-stock flag |
| `disposable_low_stock` | Derived low-stock flag |
| `low_stock` | Any low-stock flag |
| `submitted_by` | Submitter |
| `submitted_at` | Submission time |
| `locked` | Store history lock |
| `note` | Optional note |
| `corrected_by` | Backend correction operator |
| `corrected_at` | Correction time |
| `correction_reason` | Required correction reason |
| `created_at` | Creation time |
| `updated_at` | Update time |

Low-stock rule:

```text
current stock <= target stock / 3
```

Rules:

1. Store owners submit snapshots for their own active S Store only.
2. Snapshots remain historical and locked for stores.
3. Low-stock flags should be computed consistently by service/RPC rules.

### S Store Material Inventory Snapshots

Production table:

```text
public.s_store_material_inventory_snapshots
```

Required fields:

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `store_id` | S Store |
| `material_type` | Material category/type |
| `current_quantity` | Current material quantity |
| `target_quantity` | Target material quantity |
| `low_stock` | Derived low-stock flag |
| `submitted_by` | Submitter |
| `submitted_at` | Submission time |
| `locked` | Store history lock |
| `note` | Optional note |
| `corrected_by` | Backend correction operator |
| `corrected_at` | Correction time |
| `correction_reason` | Required correction reason |
| `created_at` | Creation time |
| `updated_at` | Update time |

Rules:

1. Material inventory is separate from product inventory.
2. Store owners submit only new snapshots.
3. Backend corrections require audit trail.

### S Store Visit Details

Production table:

```text
public.s_store_visit_details
```

Required fields:

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `visit_id` | Existing field visit record |
| `store_id` | S Store |
| `field_rep_id` | Field rep |
| `inventory_status` | Inventory observation |
| `display_status` | Display observation |
| `sell_through_observation` | Field-observed sales movement |
| `competitor_situation` | Competitor situation |
| `hot_brands` | Hot market brands |
| `hot_flavors` | Hot flavors |
| `consumer_feedback` | Consumer feedback |
| `market_notes` | Latest market situation |
| `support_needed` | Support request |
| `replenishment_needed` | Whether replenishment is needed |
| `visit_photos` | Photo references |
| `submitted_by` | Submitter |
| `submitted_at` | Submission time |
| `created_at` | Creation time |
| `updated_at` | Update time |

Rules:

1. The existing `visits` table remains the primary visit container.
2. S Store details are attached to a visit record.
3. Field reps can submit for assigned stores only.
4. Admin/Manager can read within scope and correct later if a correction flow is confirmed.

### S Store Replenishment Tasks

Production table:

```text
public.s_store_replenishment_tasks
```

Required fields:

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `store_id` | S Store |
| `trigger_source` | low_stock, field_visit, store_request, backend |
| `item_type` | open_system, disposable, material, mixed |
| `requested_quantity` | Requested quantity |
| `assigned_rep_id` | Responsible field rep |
| `status` | pending, in_progress, completed, cancelled |
| `created_by` | Creator |
| `created_at` | Creation time |
| `completed_by` | Completion operator |
| `completed_at` | Completion time |
| `completion_photos` | Required completion evidence |
| `note` | Optional note |
| `updated_at` | Update time |

Rules:

1. Completion requires photos.
2. Field reps can complete assigned tasks only.
3. Admin/Manager can create and manage tasks within scope.
4. Automatic task creation from low-stock should be a later confirmed task.

### S Store Contribution Metrics

Do not create a manual contribution table for V1.

Contribution reads should aggregate from existing operational records:

| Source table | Contribution signal |
|---|---|
| `campaign_claims` | Brand Store event verifications |
| `mall_redemptions` | Reward pickups at S Stores |
| `scan_records` | Store-linked scans |
| `fan_engagement_tasks` | Fan engagement tasks linked to stores |

Rules:

1. Missing source data should show zero or empty state.
2. Do not invent contribution numbers.
3. Suspicious scans should not count when risk flags exist in later Risk Center work.

### Audit Logs

Production table or service:

```text
public.audit_logs
```

Required audit coverage:

1. Promote store to S.
2. Downgrade S Store to A.
3. Restore S Store.
4. Pause S Store.
5. Submit sell-through.
6. Submit product inventory.
7. Submit material inventory.
8. Submit S Store visit detail.
9. Create replenishment task.
10. Complete replenishment task.
11. Correct locked sell-through or inventory records.

Recommended fields:

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `actor` | Actor label |
| `user_id` | Actor profile id |
| `role` | Actor role |
| `region` | Actor/store region |
| `action_type` | Operation name |
| `target_type` | store, s_store_record, replenishment_task |
| `target_id` | Target id |
| `target` | Target label |
| `before_value` | JSON/text before value |
| `after_value` | JSON/text after value |
| `reason` | Required where applicable |
| `source_module` | `s_store_management` |
| `category` | `s_store` |
| `severity` | low, medium, high, critical |
| `created_at` | Creation time |

## RLS Direction

### Helper Functions Needed

Existing helpers:

1. `current_profile_role()`
2. `is_admin_or_manager()`
3. `is_admin_role()`
4. `is_rep_assigned_to_store(store_id)`
5. `is_store_owner(store_id)`
6. `is_fan_owner(fan_id)`
7. `can_access_store(store_id)`
8. `can_access_fan(fan_id)`

Additional helper direction:

| Helper | Purpose |
|---|---|
| `is_active_s_store(store_id)` | Checks current S Store identity and active status |
| `can_manage_s_store(store_id)` | Admin or assigned-region Manager can manage S Store status |
| `can_submit_s_store_report(store_id)` | Store owner can submit own active S Store report |
| `can_submit_s_store_visit(store_id)` | Rep assigned to store, Manager, or Admin can submit visit detail |
| `can_manage_s_store_replenishment(store_id, assigned_rep_id)` | Admin/Manager or assigned rep task scope |

Manager region scope is currently broader than final production needs in some helpers. Before production S Store RLS, Manager assigned-region logic should be explicit and testable.

### RLS Policy Direction

| Table | Select | Insert | Update | Delete |
|---|---|---|---|---|
| `stores` S fields | Admin/Manager scoped, assigned Rep, owner, fan-safe read through normal store access | Existing store creation rules | S Store status only through controlled Admin/Manager path | Admin only |
| `s_store_status_history` | Admin all, Manager region, related Rep read if needed | Admin/Manager controlled action only | No normal update | Admin only if ever allowed |
| `s_store_sell_through` | Admin/Manager region, own Store Owner, assigned Rep read if needed | own active S Store owner, Admin/Manager | backend correction only | no normal delete |
| `s_store_product_inventory_snapshots` | Admin/Manager region, own Store Owner, assigned Rep | own active S Store owner, Admin/Manager | backend correction only | no normal delete |
| `s_store_material_inventory_snapshots` | Admin/Manager region, own Store Owner, assigned Rep | own active S Store owner, Admin/Manager | backend correction only | no normal delete |
| `s_store_visit_details` | Admin/Manager region, assigned Rep, own Store Owner read if approved | assigned Rep, Admin/Manager | backend correction only | no normal delete |
| `s_store_replenishment_tasks` | Admin/Manager region, assigned Rep, own Store Owner read | Admin/Manager, assigned Rep when triggered from visit | Admin/Manager or assigned Rep completion path | no normal delete |
| `audit_logs` | Admin all, Manager region | controlled service/RPC only | no normal update | Admin only if ever allowed |

Fan access:

Fans should not read S Store operational tables. Fans only receive fan-safe store presentation through existing store discovery logic.

## API / Service Boundary

The existing service contract should remain stable where possible:

### Read Services

| Function | Production behavior |
|---|---|
| `getSStores(filters)` | Supabase-first S Store list with scoped RLS |
| `getSStoreDetail(storeId, options)` | Supabase-first detail read with explicit downgraded recovery option |
| `getSStoreStatusHistory(storeId)` | Read status history |
| `getSStoreSellThroughHistory(storeId)` | Read sell-through history |
| `getSStoreInventoryHistory(storeId)` | Read product inventory snapshots |
| `getSStoreMaterialInventoryHistory(storeId)` | Read material inventory snapshots |
| `getSStoreVisitDetails(storeId)` | Read S Store visit details |
| `getReplenishmentTasks(filters)` | Read replenishment tasks |
| `getSStoreContributionMetrics(storeId)` | Aggregate from existing operational records |

### Mutation Services

| Function | Production boundary |
|---|---|
| `submitSStoreSellThrough(payload, profile)` | RPC or controlled insert with active S Store and owner checks |
| `submitSStoreInventory(payload, profile)` | RPC or controlled insert with low-stock computation |
| `submitSStoreMaterialInventory(payload, profile)` | RPC or controlled insert with low-stock computation |
| `submitSStoreVisitDetail(payload, profile)` | Controlled insert linked to existing visit |
| `createReplenishmentTask(payload, profile)` | Controlled Admin/Manager/Rep action |
| `completeReplenishmentTask(taskId, payload, profile)` | Controlled completion requiring photos |
| `downgradeSStoreToA(storeId, payload, profile)` | RPC transaction updates store, writes history and audit |
| `restoreSStore(storeId, payload, profile)` | RPC transaction updates store, writes history and audit |

High-risk actions should follow the same production pattern as reward pickup:

```text
one business action
-> one RPC or controlled service boundary
-> permission check
-> data update
-> history write
-> audit write
-> transaction success/failure
```

## Recommended Implementation Sequence

### Task-052: S Store Supabase Schema Draft

Scope:

1. Add a migration draft for S Store fields on `stores`.
2. Add S Store dedicated production tables.
3. Add indexes and constraints.
4. Add static tests that confirm the migration contains required tables and constraints.

No page changes.

Current status:

- Completed in Task-052 as an additive migration draft:
  - `supabase/migrations/20260718000100_s_store_schema.sql`.
- Static coverage added:
  - `frontend/src/utils/s-store-supabase-schema.static.test.mjs`.
- The migration was not executed against a remote Supabase project.
- RLS policies remain Task-053.

### Task-053: S Store RLS Policy Draft

Scope:

1. Add helper functions for S Store scope checks.
2. Add RLS policies for S Store tables.
3. Add SQL acceptance checks.
4. Add static tests for no anon policies on protected S Store tables.

No UI changes.

Current status:

- Completed in Task-053 as a policy-only migration draft:
  - `supabase/migrations/20260718000200_s_store_rls_policies.sql`.
- Static coverage added:
  - `frontend/src/utils/s-store-rls-policies.static.test.mjs`.
- The migration defines scoped helper functions and policies for the S Store tables.
- The migration was not executed against a remote Supabase project.
- Supabase-first service reads were completed in Task-054.

### Task-054: S Store Service Supabase Reads

Scope:

1. Make `s-stores.js` Supabase-first for read APIs.
2. Keep local fallback for local/demo mode.
3. Preserve existing page contracts.
4. Add focused service tests.

Current status:

- Completed in Task-054.
- `frontend/src/services/api/s-stores.js` now uses Supabase-first reads for:
  - `getSStores`;
  - `getSStoreDetail`;
  - `getSStoreStatusHistory`;
  - `getSStoreSellThroughHistory`;
  - `getSStoreInventoryHistory`;
  - `getSStoreMaterialInventoryHistory`;
  - `getSStoreVisitDetails`;
  - `getReplenishmentTasks`;
  - `getSStoreContributionMetrics`.
- Local/demo fallback remains available through the existing helper boundary.
- Contribution metrics still aggregate from source records:
  - `campaign_claims`;
  - `mall_redemptions`;
  - `scan_records`;
  - `fan_engagement_tasks`.
- No manual S Store contribution table was added.
- S Store mutation services remain local/demo behavior and are reserved for Task-055.

### Task-055: S Store Controlled Mutations / RPCs

Scope:

1. Add RPCs or tightly controlled service writes for status changes, reports, inventory, visits, and replenishment completion.
2. Keep downgrade/restore transactional.
3. Keep low-stock computation consistent.
4. Require completion photos for replenishment completion.

Current status:

- Completed in Task-055 as a controlled mutation RPC draft:
  - `supabase/migrations/20260718000300_s_store_controlled_mutations.sql`.
- Static coverage added:
  - `frontend/src/utils/s-store-controlled-mutations.static.test.mjs`.
- `frontend/src/services/api/s-stores.js` now calls Supabase RPCs for S Store writes when a real browser Supabase runtime is available.
- Local/demo behavior remains preserved through local implementations and fallback boundaries.
- The migration was not executed against a remote Supabase project.
- The RPC draft includes:
  - report submission RPCs;
  - visit detail RPC;
  - replenishment create/complete RPCs;
  - downgrade/restore RPCs;
  - low-stock computation;
  - required completion photos;
  - status history writes;
  - S Store audit helper calls.
- Final production `audit_logs` table alignment remains Task-056.

### Task-056: Production Audit Log Alignment

Scope:

1. Add production `audit_logs` table if not already present.
2. Route S Store critical operations into production audit records.
3. Ensure audit reads are scoped by role and region.

Current status:

- Completed in Task-056 as a production Audit Log alignment draft:
  - `supabase/migrations/20260718000400_audit_logs_production_alignment.sql`.
- Static coverage added:
  - `frontend/src/utils/audit-logs-production.static.test.mjs`.
- Shared Audit Log service coverage added:
  - `frontend/src/services/api/audit-logs.static.test.mjs`.
- `frontend/src/services/api/audit-logs.js` now normalizes the production audit payload shape and calls `write_audit_log` when a real browser Supabase runtime is available.
- Local/demo Audit Log writes remain preserved through `localDb`.
- The migration was not executed against a remote Supabase project.
- S Store `write_s_store_audit` was aligned to write JSONB-compatible before/after values.

### Task-057: S Store Production Acceptance

Scope:

1. Run Supabase RLS acceptance checks.
2. Verify Admin, Manager, Rep, Store Owner, and Fan boundaries.
3. Verify local fallback disabled mode does not hide production failures.
4. Verify existing frontend tests and build.

Static acceptance direction:

1. Confirm the four production-boundary migrations are ordered as schema, RLS, controlled RPC mutations, then Audit Log alignment.
2. Confirm every protected S Store operating table has RLS enabled and scoped policies.
3. Confirm protected S Store operating tables do not expose `anon`, `public`, or direct fan policies.
4. Confirm frontend S Store mutation services call only the confirmed controlled RPC names.
5. Confirm S Store critical RPCs write through the S Store audit helper and the shared Audit Log service writes through `write_audit_log`.
6. Confirm fallback-disabled production acceptance is documented and covered by static tests so local/demo fallback does not hide production Supabase/RLS/RPC failures.

Runtime acceptance note:

The static acceptance pass does not execute migrations against a Supabase project. A future controlled Supabase preview run should still apply the migration draft sequence and verify real Admin, Manager, Rep, Store Owner, and Fan sessions before production launch.

Current status:

- Completed in Task-057 as static production acceptance coverage:
  - `frontend/src/utils/s-store-production-acceptance.static.test.mjs`.
- Static acceptance now verifies:
  - migration order from schema to RLS to controlled RPC mutations to Audit Log alignment;
  - RLS coverage for every protected S Store operating table;
  - no direct `anon`, `public`, or fan policies on protected S Store operating tables;
  - frontend S Store mutations use the confirmed RPC names;
  - S Store critical RPCs write through S Store audit helper boundaries;
  - shared Audit Log writes use the production `write_audit_log` helper;
  - fallback-disabled production acceptance is documented and test-covered.
- The migration drafts were not executed against a Supabase project.
- Real role-session Supabase acceptance remains a future controlled environment task.

### Task-058: Backend Correction Flows

Scope:

1. Add backend correction UI for locked sell-through and inventory history.
2. Require reason and correction metadata.
3. Write audit log.
4. Keep store history read-only.

Current status:

- Completed in Task-058 for locked S Store operating history:
  - sell-through;
  - product inventory;
  - material inventory.
- Backend S Store Detail now exposes guarded correction actions for those locked records.
- S Store service now exposes:
  - `correctSStoreSellThrough`;
  - `correctSStoreInventory`;
  - `correctSStoreMaterialInventory`;
  - `canCorrectSStoreHistory`.
- Correction service behavior:
  - requires `correction_reason`;
  - keeps records locked;
  - writes `corrected_by`;
  - writes `corrected_at`;
  - writes `correction_reason`;
  - writes `correction_note`;
  - recomputes low-stock flags for product and material inventory;
  - writes Audit Log records.
- Added controlled correction RPC migration draft:
  - `supabase/migrations/20260718000500_s_store_correction_flows.sql`.
- The migration draft was not executed against a Supabase project.
- Store App S Store submitted history remains read-only for stores.

Production RPCs added:

1. `correct_s_store_sell_through`
2. `correct_s_store_product_inventory`
3. `correct_s_store_material_inventory`

This task happened after schema/RLS/API alignment and static production acceptance. Real Supabase preview acceptance remains required before production launch.

### Task-059: Supabase Preview Acceptance Readiness

Scope:

1. Define the controlled real Supabase preview acceptance checklist.
2. Keep the task non-destructive.
3. Confirm the exact migration order for preview validation.
4. Confirm role, RPC, Audit Log, fallback-disabled, and frontend acceptance evidence requirements.

Current status:

- Completed in Task-059 as documentation and static acceptance readiness only:
  - `docs/24_SUPABASE_PREVIEW_ACCEPTANCE_CHECKLIST.md`;
  - `frontend/src/utils/supabase-preview-acceptance-checklist.static.test.mjs`.
- The checklist covers:
  - required preview environment;
  - migration order from S Store schema through correction RPCs;
  - Admin, Manager, Rep, Store Owner, Fan, and anonymous role-boundary checks;
  - all S Store controlled RPC acceptance checks;
  - Audit Log write/read acceptance;
  - data integrity acceptance;
  - frontend preview acceptance with `VITE_ALLOW_LOCAL_DB_FALLBACK=false`;
  - stop conditions and evidence to record.
- No migration was executed.
- No Supabase project was contacted.
- No `.env` file was changed.
- No production database was changed.

Runtime acceptance note:

Real Supabase preview execution remains a separate future task. It should only begin after explicit confirmation, preview environment details, test accounts, and rollback/restoration approach are ready.

### Task-060 / Task-061: Preview Execution And Fan-safe Store Exposure Fix

Task-060 executed the S Store production-boundary migrations in the connected Supabase preview project and found one blocking data-boundary gap:

1. Fan could not read protected S Store operating tables.
2. Fan could still directly select internal S Store columns from an accessible `stores` row:
   - `is_s_store`;
   - `s_store_status`;
   - `s_store_source`;
   - `cooperation_note`.

Root cause:

`stores_select_scoped` grants row access through `can_access_store(id)`. PostgreSQL RLS is row-level and does not hide role-sensitive columns after a row is visible.

Task-061 added:

1. `supabase/migrations/20260718000600_fan_safe_store_exposure.sql`.
2. `get_fan_safe_stores(p_filters jsonb)` for fan-facing store discovery.
3. `get_internal_stores(p_filters jsonb)` for backend/store/field internal reads.
4. `get_internal_store(p_store_id uuid)` for internal detail reads.
5. Revoked broad direct `stores` SELECT from `authenticated`.
6. Granted only safe direct `stores` columns to `authenticated`.
7. Updated frontend store services:
   - Fan map/store discovery uses fan-safe API.
   - Backend/S Store reads use internal RPCs.

Preview retest result:

1. Fan direct internal-column `stores` query is blocked with permission denied.
2. Fan-safe RPC succeeds and returns only presentation-safe fields.
3. Fan internal RPC call is blocked.
4. Manager internal RPC call succeeds and returns full internal S Store fields.

Remaining preview note:

Fallback-disabled browser acceptance with `VITE_ALLOW_LOCAL_DB_FALLBACK=false` still needs a dedicated final run.

## Acceptance Criteria

Task-051A is complete when:

1. The production table mapping is documented.
2. RLS direction is documented for Admin, Manager, Rep, Store Owner, and Fan.
3. API/RPC boundaries are documented.
4. The safest implementation sequence is documented.
5. No code, database migration, API behavior, permission behavior, or `.env` file is changed.

Future implementation tasks should be accepted only when:

1. Existing S Store local/demo behavior still passes tests.
2. Supabase migrations have static coverage.
3. RLS policies prevent anonymous access.
4. Store owners cannot access or modify other stores.
5. Store owners cannot edit locked S Store history.
6. Reps cannot manage S Store status.
7. Managers are scoped by assigned region where applicable.
8. Fans cannot read S Store operational data.
9. Critical S Store mutations write audit records.
10. `npm test` and `npm run build` pass.

## Risks

1. Database risk: S Store tables add historical business data and must not be rushed into production without migration review.
2. Permission risk: UI hiding is not enough; RLS must block direct table access.
3. Transaction risk: downgrade/restore and replenishment completion touch multiple records and should not be implemented as loose frontend updates.
4. Audit risk: local Audit Log behavior is not enough for production accountability.
5. Fallback risk: local fallback can hide Supabase or RLS failures during preview if not disabled.
6. Scope risk: adding automatic replenishment, SKU-level sell-through, pricing analysis, or S Store incentives would be new business scope and requires separate confirmation.
7. Fan-facing risk: fans should continue to see only `UWELL Brand Store` and fan-safe store information, not operational status or internal reasons.

## Development Gate

This document does not authorize database or API implementation by itself.

Before Task-053 or any later implementation begins, the agent must still output:

1. requirement analysis;
2. impact analysis;
3. files to modify;
4. database impact;
5. API impact;
6. permission impact;
7. other page impact;
8. risks;
9. wait for user confirmation.
