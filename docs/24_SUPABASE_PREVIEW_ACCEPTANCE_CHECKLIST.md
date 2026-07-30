# UWELL CRM Supabase Preview Acceptance Checklist

Date: 2026-07-18

Latest preview execution status:

Task-060 ran the first real Supabase preview execution against project `rdsrgpnvzcchqlsghsrq` / `store-manager`.

Result:

1. Migration execution passed for the five S Store production-boundary migrations.
2. Preview role identity binding passed.
3. Role-session REST/RPC acceptance passed 48 of 49 checks.
4. Blocking gap found:
   - Fan cannot read protected S Store operating tables, which is correct.
   - Fan can still directly select internal S Store columns from the accessible `stores` row:
     - `is_s_store`;
     - `s_store_status`;
     - `s_store_source`;
     - `cooperation_note`.

Task-061 added and executed `20260718000600_fan_safe_store_exposure.sql` to close this gap in preview:

1. Fan direct selection of internal `stores` columns is now blocked.
2. Fan store discovery can use `get_fan_safe_stores`.
3. Fan cannot call internal store RPCs.
4. Manager can still use internal store RPCs for backend/S Store operations.

Task-062 completed fan-side fallback-disabled browser acceptance with `VITE_ALLOW_LOCAL_DB_FALLBACK=false`.

Task-064 adds `20260718000700_internal_store_rpc_scope.sql` to scope internal store RPC reads:

1. Global `can_access_store` remains unchanged for legacy modules.
2. `get_internal_store` and `get_internal_stores` use a stricter internal read helper.
3. Manager cannot read unrelated-region internal store RPC data.
4. Preview API retest passed for Admin, Manager, Rep, Store Owner, and Fan internal store RPC boundaries.

Task-065 final closeout:

1. Final focused Step 11 API/RPC closeout passed.
2. The known Task-060, Task-062, and Task-063 blockers are closed in preview.
3. The S Store Supabase/RLS/RPC production-boundary line is ready to move from low-level permission hardening to page-level UX/browser acceptance.

Task-154 runbook update:

1. Fallback-disabled remote browser acceptance is now defined in `docs/33_FALLBACK_DISABLED_REMOTE_BROWSER_ACCEPTANCE_RUNBOOK.md`.
2. This runbook is the required preparation step before Task-155 execution.
3. Task-154 did not execute remote browser QA, change `.env`, modify database, change permissions, or contact Supabase.
4. Task-155 should use the runbook to capture page-level Fan, Store Owner, Admin, Manager, Rep, and Anonymous evidence with local auth and local DB fallback disabled.

Task-161 environment preflight update:

1. Supabase preview/production environment requirements are now recorded in `docs/38_SUPABASE_PREVIEW_PRODUCTION_ENVIRONMENT_PREFLIGHT.md`.
2. The preflight did not connect to Supabase, execute migrations, edit `.env`, configure Vercel, or run browser QA.
3. Before Task-155 can be retried, Task-162 must provide a non-localhost Vercel preview URL with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ALLOW_LOCAL_AUTH_FALLBACK=false`, and `VITE_ALLOW_LOCAL_DB_FALLBACK=false`.
4. Localhost remains insufficient for proving auth fallback-disabled behavior because local auth fallback is enabled for localhost/127.0.0.1/::1.

## Purpose

This checklist defines the controlled Supabase preview acceptance process for the S Store production boundary.

It is a readiness document. It does not execute migrations, connect to Supabase, modify `.env`, create users, change permissions, or change production data.

No production database is changed by this checklist.

## Non-Destructive Task Boundary

Task-059 is documentation and static acceptance readiness only.

Do not execute migrations from Codex in this task.
Do not modify .env.
Do not run `npm install`.
Do not run `pip install`.
Do not add new dependencies.
Do not use production data for first acceptance.
Do not add S Store business rules during acceptance.

Real Supabase preview execution requires a separate explicit confirmation after a preview project, test accounts, and rollback approach are prepared.

## Required Preview Environment

Before runtime acceptance, prepare a controlled Supabase preview project with:

1. A disposable or restorable database.
2. Preview-only Admin account.
3. Preview-only Manager account with assigned region or city.
4. Preview-only Rep account assigned to one S Store.
5. Preview-only Store Owner account bound to one active S Store.
6. Preview-only Fan account.
7. At least one active S Store in the Manager region.
8. At least one S Store outside the Manager region.
9. At least one non-S Store.
10. Fallback disabled with `VITE_ALLOW_LOCAL_DB_FALLBACK=false`.

Fallback disabled means remote Supabase, RLS, or RPC failures must surface as failures instead of silently switching to localDb.

## Migration Order

Apply or validate migrations in this exact order:

1. `20260718000100_s_store_schema.sql`
2. `20260718000200_s_store_rls_policies.sql`
3. `20260718000300_s_store_controlled_mutations.sql`
4. `20260718000400_audit_logs_production_alignment.sql`
5. `20260718000500_s_store_correction_flows.sql`
6. `20260718000600_fan_safe_store_exposure.sql`
7. `20260718000700_internal_store_rpc_scope.sql`

Stop acceptance if any migration fails.

Do not skip a migration.
Do not reorder migrations.
Do not manually patch the preview database to bypass a failing migration.

## Role Boundary Acceptance

### Admin

Expected:

1. Admin can access all S Store data.
2. Admin can read S Store status history.
3. Admin can read sell-through, product inventory, material inventory, visit details, replenishment tasks, and Audit Log records.
4. Admin can run controlled S Store status, replenishment, and correction RPCs when required inputs are valid.

### Manager

Expected:

1. Manager can manage assigned-region S Store status.
2. Manager can correct assigned-region S Store sell-through and inventory history.
3. Manager can read assigned-region Audit Log records.
4. Manager cannot access unrelated-region S Store data.
5. Manager cannot read unrelated-region internal store RPC data.
6. Manager cannot correct unrelated-region S Store history.

### Rep

Expected:

1. Rep can submit assigned S Store visit detail.
2. Rep can complete assigned replenishment tasks when completion evidence is present.
3. Rep cannot manage S Store status.
4. Rep cannot correct sell-through or inventory history.
5. Rep cannot read unrelated S Store operating data.

### Store Owner

Expected:

1. Store Owner can submit own active S Store report.
2. Store Owner can submit own active S Store product inventory.
3. Store Owner can submit own active S Store material inventory.
4. Store Owner can read own submitted locked history where policy allows.
5. Store Owner cannot edit locked history.
6. Store Owner cannot submit reports for another store.
7. Store Owner cannot manage S Store status.

### Fan

Expected:

1. Fan cannot read S Store operating tables.
2. Fan cannot call S Store operating RPCs.
3. Fan can only see fan-safe S Store presentation through existing store discovery, such as `UWELL Brand Store`.
4. Fan must not see sell-through, inventory, replenishment tasks, downgrade reasons, correction metadata, or Audit Log data.

### anonymous

Expected:

1. anonymous cannot read protected S Store operating tables.
2. anonymous cannot call S Store operating RPCs.
3. anonymous cannot read Audit Log records.

## RPC Acceptance

Verify successful and blocked behavior for:

1. `submit_s_store_sell_through`
2. `submit_s_store_product_inventory`
3. `submit_s_store_material_inventory`
4. `submit_s_store_visit_detail`
5. `create_s_store_replenishment_task`
6. `complete_s_store_replenishment_task`
7. `downgrade_s_store_to_a`
8. `restore_s_store`
9. `correct_s_store_sell_through`
10. `correct_s_store_product_inventory`
11. `correct_s_store_material_inventory`
12. `write_audit_log`

Required negative checks:

1. Sell-through submission fails for non-owner Store Owner.
2. Product inventory submission fails for non-owner Store Owner.
3. Material inventory submission fails for non-owner Store Owner.
4. S Store visit submission fails for unassigned Rep.
5. S Store status management fails for Rep, Store Owner, Fan, and anonymous.
6. Replenishment completion requires photos.
7. Correction requires a reason.
8. Correction fails for Rep, Store Owner, Fan, and anonymous.
9. Manager correction fails for unrelated-region S Store records.

Required positive checks:

1. Store Owner can submit own active S Store sell-through.
2. Store Owner can submit own active S Store product inventory.
3. Store Owner can submit own active S Store material inventory.
4. Rep can submit assigned S Store visit detail.
5. Rep can complete assigned replenishment task with photos.
6. Manager can downgrade and restore assigned-region S Store with reason.
7. Manager can correct assigned-region S Store records with reason.
8. Admin can complete all critical S Store operations with valid inputs.

## Audit Log Acceptance

Audit Log records must be written for:

1. Submit sell-through.
2. Submit product inventory.
3. Submit material inventory.
4. Submit S Store visit detail.
5. Create replenishment task.
6. Complete replenishment task.
7. Downgrade S Store to A.
8. Restore S Store.
9. Correct sell-through.
10. Correct product inventory.
11. Correct material inventory.

Audit Log read expectations:

1. Admin can read all Audit Log records.
2. Manager can read matching-region Audit Log records.
3. Rep cannot directly read Audit Log records.
4. Store Owner cannot directly read Audit Log records.
5. Fan cannot directly read Audit Log records.
6. anonymous cannot directly read Audit Log records.

## Data Integrity Acceptance

Verify:

1. S Store sell-through period uniqueness prevents duplicate submissions for the same store, period type, period start, and period end.
2. Store-submitted records remain locked.
3. Corrections keep records locked.
4. Corrections preserve original record identity.
5. Corrections write correction metadata.
6. Product inventory low-stock flag follows `current stock <= target stock / 3`.
7. Material inventory low-stock flag follows `current stock <= target stock / 3`.
8. Downgrade and restore write S Store status history.
9. Fans do not receive internal S Store fields through fan-facing pages.

## Frontend Preview Acceptance

With preview Supabase values and `VITE_ALLOW_LOCAL_DB_FALLBACK=false`, verify:

1. Backend S Store Management loads from Supabase.
2. Backend S Store Detail loads from Supabase.
3. Store App S Store Report submits through RPC.
4. Field Visit S Store detail submits through RPC.
5. Backend correction modal saves through correction RPC.
6. Failed RLS/RPC calls surface visible errors and do not silently switch to localDb.
7. Existing local/demo mode still works when preview Supabase values are absent.

Detailed page-level browser acceptance matrix:

```text
docs/33_FALLBACK_DISABLED_REMOTE_BROWSER_ACCEPTANCE_RUNBOOK.md
```

Required Task-155 artifact path:

```text
frontend/output/playwright/task-155-fallback-disabled-remote-qa/fallback-disabled-remote-results.json
```

## Stop Conditions

Stop acceptance and do not proceed to production if:

1. Any migration fails.
2. Any protected table is accessible to Fan or anonymous.
3. Store Owner can modify locked history.
4. Rep can manage S Store status or correct sell-through/inventory history.
5. Manager can access unrelated-region S Store operating data.
6. Manager can read unrelated-region internal store RPC data.
7. Any critical S Store mutation succeeds without Audit Log evidence.
8. Fallback disabled mode still hides remote Supabase/RLS/RPC failures.

## Evidence To Record

Record:

1. Supabase preview project identifier, without secrets.
2. Migration execution date and operator.
3. Test account role labels, without passwords.
4. Passed and failed role-boundary checks.
5. RPC success and failure evidence.
6. Audit Log sample record ids.
7. Frontend build and test command results.
8. Known residual risks.

Do not store API keys, passwords, service role keys, or `.env` values in project docs.

## Runtime Acceptance Notes

### 2026-07-18 / Task-063

Preview project:

- `rdsrgpnvzcchqlsghsrq`

Status:

- Internal-role acceptance rerun partially completed.
- Stop condition remains open because Manager internal S Store read scoping is not yet aligned with this checklist.

Passed evidence:

1. Admin, Manager, Rep, Store Owner, and Fan preview Auth logins succeeded.
2. Preview identity binding succeeded for:
   - `profiles`;
   - active S Store `rep_id`;
   - active S Store `owner_profile_id`;
   - preview Fan `user_id`.
3. Store Owner own S Store sell-through, product inventory, and material inventory submissions succeeded.
4. Store Owner duplicate/other-store/locked-history negative checks passed.
5. Rep assigned S Store visit detail and replenishment task create/complete flows passed.
6. Replenishment completion without photos was blocked.
7. Rep S Store status management was blocked.
8. Manager assigned-region correction and downgrade/restore flows passed.
9. Admin material correction passed.
10. Fan and anonymous protected S Store table/RPC checks passed.
11. Audit Log read boundaries passed for Admin, Manager, Rep, Store Owner, Fan, and anonymous.
12. Manager unrelated-region operating-row direct read and correction were blocked.

Blocked evidence:

1. Manager can read an unrelated-region S Store through `get_internal_store`.
2. Root cause identified:
   - `get_internal_store` / `get_internal_stores` use legacy `can_access_store`.
   - Legacy `can_access_store` grants broad `admin_or_manager` store read access.
   - S Store-specific operating table and correction boundaries correctly use scoped helpers and did not expose unrelated-region operating rows.

Next required action:

Create a separate confirmed task to scope internal S Store RPC reads without casually changing global store access rules.

### 2026-07-18 / Task-064

Preview project:

- `rdsrgpnvzcchqlsghsrq`

Status:

- Internal store RPC read scoping blocker fixed in preview.

Migration executed:

- `20260718000700_internal_store_rpc_scope.sql`

Passed evidence:

1. Admin can read outside-region internal store data.
2. Manager can read assigned-region internal store data.
3. Manager cannot read unrelated-region internal store RPC data.
4. Rep can read assigned internal store data.
5. Store Owner can read own internal store data.
6. Fan remains blocked from internal store RPCs.
7. Manager internal store list excludes the unrelated-region S Store.

Runtime note:

- `get_internal_store` returns a null-shaped composite through PostgREST when no internal store is authorized for the requested id. Treat `id = null` as no internal store returned.

### 2026-07-18 / Task-065

Preview project:

- `rdsrgpnvzcchqlsghsrq`

Status:

- Final Step 11 API/RPC closeout passed.

Closeout result:

1. Preview role logins were available for Admin, Manager, Rep, Store Owner, and Fan.
2. Admin can read outside-region internal store data.
3. Manager can read assigned-region internal store data.
4. Manager cannot read unrelated-region internal store data.
5. Rep can read assigned internal store data.
6. Store Owner can read own internal store data.
7. Fan remains blocked from internal store RPCs.
8. Fan-safe store RPC returns no internal S Store keys.
9. Fan and anonymous cannot read protected S Store rows.
10. Store Owner can submit own S Store sell-through.
11. Manager can correct assigned-region sell-through.
12. Rep cannot manage S Store status.
13. Fan cannot call S Store operating mutation RPCs.
14. Admin can read S Store Audit Log records.
15. Fan cannot directly read Audit Log records.

Passed:

- 16 checks passed.
- 0 checks failed.

Next phase:

- Stop the low-level Supabase/RLS hardening loop unless a new production-boundary issue is found.
- Move to internal S Store page-level browser acceptance and then Store App / Field Rep real workflow UX acceptance.
