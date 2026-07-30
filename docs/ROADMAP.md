# UWELL CRM Roadmap

Last updated: 2026-07-18

## Current Status

### Completed

- Fan entry/login exists.
- Fan center has real functional modules: Home, Activities, Community, Rewards, Stores, Me, check-in, scan, invite, old fan verification, and help.
- Fan app real UI/IA polish has progressed through Task-034 and should continue from `frontend/src/pages/fans`, not `/preview/fan`.
- Store login/register exists.
- Store owner center exists.
- Backend Dashboard exists.
- Store, visit, evaluation, campaign, material, fan, settings modules exist.
- Supabase migrations and local DB exist.
- Role model for admin/manager/rep/fan exists.
- S Store brand-growth strategy is documented in `19_S_STORE_BRAND_GROWTH_LOOP.md`.
- S Store V1 implementation boundary is documented in `20_S_STORE_V1_IMPLEMENTATION_PLAN.md`.
- S Store V1 local/demo data foundation started in Task-039:
  - current S Store fields on stores;
  - status history;
  - sell-through;
  - product inventory;
  - material inventory;
  - S Store visit details;
  - replenishment tasks;
  - pure rule helpers and local service boundary.
- S Store local/demo service actions write Audit Log records as of Task-040.
- Backend S Store Management has progressed through Task-044:
  - Task-041: read-only S Store management list;
  - Task-042: read-only S Store detail;
  - Task-043: status operation UI for downgrade/restore;
  - Task-044: downgraded S Store recovery visibility.
- S Store V1 local/demo loop has progressed through Task-049:
  - Task-045: Store App S Store Report;
  - Task-046: Field Rep S Store Visit detail;
  - Task-047: Backend S Store replenishment creation/completion;
  - Task-048: S Store contribution aggregation;
  - Task-049: fan-facing `UWELL Brand Store` presentation in the real fan portal.
- Production hardening baseline:
  - Task-050 resolved the 3 known historical static test mismatches;
  - full `npm test` now passes in the frontend baseline: 84 files, 333 tests.
- Backend Governance V1 is documented in `21_BACKEND_GOVERNANCE_V1_PLAN.md`.
- Fan Growth and Points Economy is documented in `22_FAN_GROWTH_AND_POINTS_ECONOMY.md`.
- Backend Governance RBAC foundation has progressed through Task-037:
  - Task-035: data/list scope;
  - Task-036: detail/id scope;
  - Task-037: shared action permission matrix.

### In Progress

- Product roadmap consolidation around five main lines:
  - Backend Governance;
  - S Store terminal brand nodes;
  - Store/S Store execution;
  - Fan Growth and points economy;
  - Brand Growth / ROI dashboards.
- Existing fan UI pass is paused unless a new confirmed task resumes it.
- S Store V1 is broadly complete in local/demo mode through fan-facing presentation; production Supabase/RLS/API alignment remains a separate confirmed direction.
- Fan Growth remains a planned direction until implementation tasks are separately confirmed.
- Backend Governance foundation is partially implemented in frontend/local mode, but production API/RLS enforcement and unified Audit Log service still require later tasks.

### To Optimize

- Backend Governance foundation:
  - RBAC data scope;
  - Audit Log;
  - Reviews V1;
  - Risk Center V1.
- S Store V1 foundation:
  - S Store status;
  - sell-through;
  - product inventory;
  - material inventory;
  - field rep visit detail;
  - replenishment follow-up.
- Store/S Store execution:
  - Store App S Store Report;
  - Field Rep S Store Visit;
  - replenishment proof photos;
  - low-stock workflow.
- Fan Growth:
  - Daily routine cap;
  - Membership Journey;
  - reward tiers;
  - campaign freshness.
- Brand Growth dashboard:
  - S Store health;
  - sell-through;
  - replenishment;
  - points/reward cost;
  - activity and S Store contribution.
- API/local fallback production boundary.
- Database rule consistency and auditability.
- Arabic/RTL support.
- Version and backup cleanup.

### Current Bugs / Risks

1. Preview fan page is not the final product direction and may mislead development.
2. Old features and new UI can mix into a confusing interface.
3. Some rules exist in docs, constants, local DB, Supabase, and page logic at the same time.
4. Local fallback may hide production Supabase/RLS problems.
5. Multiple backups and `.bak` files make version source unclear.
6. S Store and Fan Growth are documented as future directions; implementation must not assume they already exist.
7. Backend Governance foundation has initial frontend/local RBAC coverage, but production API/RLS enforcement and unified Audit Log service are still incomplete.
8. Production Supabase/RLS/API alignment is not yet complete for S Store V1.

## Strategic Roadmap

### Phase 1: Backend Governance Foundation

Goal:

Make backend operations trustworthy before adding more closed-loop data.

Planned modules:

- RBAC foundation and data-scope audit.
- Audit Log service.
- Reviews V1:
  - store registration/profile;
  - store level / S Store status;
  - store photo;
  - store-created activity;
  - high-value reward;
  - old fan verification.
- Risk Center V1:
  - scan risk;
  - points risk;
  - reward risk;
  - S Store data risk.

Primary reference:

- `21_BACKEND_GOVERNANCE_V1_PLAN.md`

### Phase 2: S Store V1 Data Foundation

Goal:

Create the terminal brand-store data foundation.

Planned scope:

- current S Store identity/status on stores;
- S Store status history;
- weekly/monthly open-system and disposable sell-through;
- product inventory snapshots;
- material inventory snapshots;
- S Store visit detail attached to field visits;
- replenishment tasks.

Current status:

- Local/demo foundation completed in Task-039.
- S Store service behavior and local Audit Log writes added in Task-040.
- Backend S Store Management read-only entry/list page added in Task-041.
- Backend S Store Detail read-only page added in Task-042.
- Backend S Store status operation UI added in Task-043.
- Downgraded S Store recovery visibility added in Task-044.
- Store App S Store Report added in Task-045.
- Field Rep S Store Visit detail added in Task-046.
- Backend S Store replenishment task creation/completion added in Task-047.
- S Store contribution aggregation added in Task-048.
- Fan-facing `UWELL Brand Store` presentation added in Task-049.
- S Store Supabase/RLS/API alignment plan completed in Task-051.
- S Store Supabase schema draft migration added in Task-052.
- S Store RLS policy draft migration added in Task-053.
- S Store Supabase-first read service alignment added in Task-054.
- S Store controlled mutation/RPC draft alignment added in Task-055.
- Production Audit Log schema/RLS/service draft alignment added in Task-056.
- S Store static production acceptance added in Task-057.
- Backend correction flows for locked S Store history added in Task-058.
- Supabase preview acceptance readiness checklist added in Task-059.
- Real Supabase preview execution and automatic replenishment creation are not implemented yet.

Primary references:

- `19_S_STORE_BRAND_GROWTH_LOOP.md`
- `20_S_STORE_V1_IMPLEMENTATION_PLAN.md`
- `23_S_STORE_SUPABASE_RLS_API_ALIGNMENT.md`

### Phase 3: Store And Field Execution

Goal:

Let terminal stores and field reps submit the data needed for brand control.

Planned scope:

- Store App S Store Report:
  - sell-through;
  - product inventory;
  - material inventory;
  - locked history.
- Field Rep S Store Visit:
  - inventory;
  - display;
  - sell-through observation;
  - competitors;
  - hot brands/flavors;
  - consumer feedback;
  - replenishment needs;
  - photos.
- Low-stock to replenishment loop.

Primary references:

- `20_S_STORE_V1_IMPLEMENTATION_PLAN.md`

### Phase 4: Fan Growth Rules And Activity Freshness

Goal:

Make fan engagement sustainable, cost-aware, and connected to S Stores.

Planned scope:

- Daily routine cap: 50 points/day.
- Points source visibility.
- Membership Journey:
  - Bronze / New fan;
  - Silver / Active fan;
  - Gold / Core fan;
  - Diamond / VIP fan.
- Reward tiers:
  - Normal;
  - Premium;
  - Diamond / High-value;
  - Experience.
- Campaign freshness:
  - always-on;
  - weekly/monthly;
  - campaign/launch.

Primary reference:

- `22_FAN_GROWTH_AND_POINTS_ECONOMY.md`

### Phase 5: Brand Growth Dashboard

Goal:

Help UWELL make brand decisions from terminal data instead of relying only on importer/wholesaler market signals.

Planned scope:

- S Store Overview:
  - Active S Stores;
  - new/downgraded S Stores;
  - low-stock S Stores;
  - weekly/monthly open-system and disposable sales;
  - replenishment status;
  - Brand Store event verifications;
  - reward pickups at S Stores.
- Points and reward cost visibility.
- Activity contribution.
- S Store contribution.
- Later ROI analysis when source data becomes stable.

Primary references:

- `19_S_STORE_BRAND_GROWTH_LOOP.md`
- `22_FAN_GROWTH_AND_POINTS_ECONOMY.md`

## Recommended Next Implementation Task

Do not switch back to fan visual UI or preview pages for this phase.

Current production-hardening status:

```text
S Store Step 11 low-level Supabase/RLS/RPC hardening is closed in preview.
```

Why:

- S Store V1 now has local/demo data objects, service/rule boundaries, behavior tests, local Audit Log writes, Backend > Stores > S Store Management, S Store Detail, status operations, downgraded recovery visibility, Store App S Store Report, Field Rep S Store Visit detail, Backend S Store replenishment creation/completion, S Store contribution aggregation, and fan-facing `UWELL Brand Store` presentation.
- Task-060 executed the S Store migration sequence in the real Supabase preview project and exposed a Fan direct-column leakage issue on `stores`.
- Task-061 closed the fan-safe store exposure gap with safe fan store RPCs and internal store RPCs.
- Task-062 completed fallback-disabled fan browser acceptance.
- Task-063 restored internal preview role acceptance and exposed the Manager unrelated-region internal store RPC gap.
- Task-064 closed the Manager internal store RPC read-boundary gap without changing global `can_access_store`.
- Task-065 final Step 11 API/RPC closeout passed with 16 checks and 0 failures.

Recommended next major implementation direction:

```text
Trial Operation Preparation
```

Recommended order:

1. Trial demo account and route readiness.
2. Closed-loop rehearsal across Fan App, Store App, and Backend.
3. Trial issue log and launch checklist.
4. Targeted polish only for issues discovered during rehearsal.
5. Trial operation handoff.
6. Remote-mode page-level acceptance after local trial paths are stable.

The next confirmed task should still start with impact analysis before code:

- verify trial accounts and real routes before changing features;
- keep existing S Store business rules unchanged;
- do not add new incentive rules, automatic replenishment, SKU-level sell-through, price analysis, or fan UI redesign unless separately confirmed;
- do not modify `.env` or install dependencies.

Primary reference:

- `25_TRIAL_OPERATION_READINESS.md`

Before implementation, the task must still output:

1. requirement analysis;
2. impact analysis;
3. files to modify;
4. database impact;
5. API impact;
6. permission impact;
7. other page impact;
8. risks;
9. wait for user confirmation.
