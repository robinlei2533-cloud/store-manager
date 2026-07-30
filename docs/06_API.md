# UWELL CRM API Specification

## Current API Layer

Current API files live in `frontend/src/services/api`.

The API layer supports Supabase calls with local fallback in some modules. This is useful for trial, but production behavior must be Supabase-first and auditable.

## Current API Groups

| Group | Main Functions |
|---|---|
| Campaigns | get/create/update/delete campaigns, tasks, reports |
| Dashboard | dashboard stats, visit trend, store distribution, scan trend |
| Evaluations | store evaluation CRUD |
| Fans | fan list/detail, points log, add fan points |
| Materials | material catalog, stocks, inbound, outbound |
| Points | point rules and level rules |
| Products | product CRUD |
| Profiles | staff/profile list and update |
| QR Codes | code CRUD, scan code, scan records |
| Rewards | create redemption, confirm pickup |
| Stores | store CRUD |
| Visits | visit CRUD, sales, photos |

## API Design Principles

- API functions must map to one business concept.
- Do not put reward logic inside materials APIs.
- Do not put scan-code logic inside fan UI components.
- Do not put permission decisions only inside page components.
- Local fallback must not silently hide production errors in final launch mode.
- Every mutation that affects rules, points, rewards, stock, or permissions must be auditable.

## Required API Documentation For New Work

Every new API or API change must document:

1. Function name
2. Purpose
3. Input
4. Output
5. Error cases
6. Permission requirement
7. Database tables touched
8. Whether local fallback is allowed

## Supabase RPCs Currently Known

- `get_low_stock_count`
- `get_visit_trend`
- `get_scan_trend`
- `scan_qr_code`
- `confirm_reward_pickup`
- `write_audit_log`
- `submit_s_store_sell_through`
- `submit_s_store_product_inventory`
- `submit_s_store_material_inventory`
- `submit_s_store_visit_detail`
- `create_s_store_replenishment_task`
- `complete_s_store_replenishment_task`
- `downgrade_s_store_to_a`
- `restore_s_store`
- `correct_s_store_sell_through`
- `correct_s_store_product_inventory`
- `correct_s_store_material_inventory`

## Planned S Store Production API Boundary

Task-051 documented the S Store production API/RPC alignment direction in:

- `23_S_STORE_SUPABASE_RLS_API_ALIGNMENT.md`

The existing local/demo service contract should remain the starting point:

- S Store reads:
  - `getSStores`
  - `getSStoreDetail`
  - `getSStoreStatusHistory`
  - `getSStoreSellThroughHistory`
  - `getSStoreInventoryHistory`
  - `getSStoreMaterialInventoryHistory`
  - `getSStoreVisitDetails`
  - `getReplenishmentTasks`
  - `getSStoreContributionMetrics`
- S Store mutations:
  - `submitSStoreSellThrough`
  - `submitSStoreInventory`
  - `submitSStoreMaterialInventory`
  - `submitSStoreVisitDetail`
  - `createReplenishmentTask`
  - `completeReplenishmentTask`
  - `downgradeSStoreToA`
  - `restoreSStore`
  - `correctSStoreSellThrough`
  - `correctSStoreInventory`
  - `correctSStoreMaterialInventory`

Task-054 status:

- S Store read APIs are now Supabase-first with local/demo fallback.
- Existing page contracts and function names are preserved.

Task-055 status:

- S Store write APIs now have controlled Supabase RPC draft boundaries.
- Existing frontend service function names and page contracts are preserved.
- Local/demo write behavior remains available when no real browser Supabase runtime is present.
- The RPC migration is a draft and has not been executed against a remote Supabase project.

Task-056 status:

- The shared Audit Log service now has a production `write_audit_log` RPC draft boundary.
- Local/demo Audit Log behavior remains available through `localDb`.
- The Audit Log migration is a draft and has not been executed against a remote Supabase project.

Task-058 status:

- Backend S Store correction flows now have local/demo service behavior and a controlled Supabase RPC draft boundary.
- Existing frontend service names and page contracts are preserved.
- Corrections apply only to locked S Store sell-through, product inventory, and material inventory history.
- Corrections require a reason, keep records locked, and write Audit Log records.
- The correction migration is a draft and has not been executed against a remote Supabase project.

High-risk S Store mutations should be implemented as controlled Supabase RPCs or equivalent transaction-safe service boundaries when production work begins.
