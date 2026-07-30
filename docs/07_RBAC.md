# UWELL CRM RBAC Specification

## Roles

| Role | Scope |
|---|---|
| Admin | All regions, all warehouses, all users, all reviews, all rules |
| Manager | Assigned regions, regional reviews, regional operations |
| Field Rep | Assigned region/stores, visit execution, own submissions |
| Store Owner | Own store data and store operations |
| Fan | Own fan account and activity data |

## Backend Account Creation

- Backend login page must only show login.
- Public backend registration is forbidden.
- Only Admin can create Manager and Field Rep accounts.
- Manager cannot create accounts.
- Field Rep cannot create accounts.

## Admin

Can:

- Manage users
- Manage rules
- Manage scan codes
- Manage rewards
- Approve high-value rewards
- Review and change store levels
- Manage all warehouses
- View all audit logs

## Manager

Can:

- View assigned-region dashboard data
- Review assigned-region stores, visits, photos, campaigns, rewards, materials
- View assigned-region warehouse inventory
- Approve/reject assigned-region operational reviews if allowed
- Manage S Store status for assigned-region stores when S Store Management is implemented
- Correct assigned-region S Store operational data with audit trail when allowed

Cannot:

- Create Manager or Field Rep accounts
- View unrelated regions
- Modify global rules unless explicitly approved

## Field Rep

Can:

- Create new store visit
- Create repeat visit
- Submit display data
- Submit suggested store rating
- View assigned-region warehouse availability
- Submit material needs
- Submit S Store visit records, market feedback, replenishment status, and replenishment photos for assigned stores when S Store Management is implemented

Cannot:

- Set final store level
- Approve material requests
- Modify inventory
- Give fan points manually
- Create accounts
- Manage global rules

## Store Owner

Can:

- Manage own store profile
- Upload store front/display photos
- Verify fan activity participation
- Verify reward pickup if store level qualifies
- Submit store-created campaigns
- Request materials
- If selected as an S Store, submit new sell-through, product inventory, and material inventory records for own store

Cannot:

- Give arbitrary points
- Change fan level
- Change reward rules
- Approve high-value rewards
- Access other stores
- Edit historical S Store sell-through or inventory submissions after they are locked

## Fan

Can:

- View and update own profile
- Check in
- Scan eligible codes
- Join activities
- Post/comment/like
- Redeem eligible rewards
- View own histories

Cannot:

- Access other fans' data
- Manually change points
- Bypass level/reward rules

## Region Permission Rule

Region access applies to:

- Dashboard
- Stores
- Field visits
- Materials
- Material requests
- Inventory alerts
- Reviews
- Audit logs
- S Store Management when implemented

## Planned Backend Governance Permission Rules

- RBAC must protect service/API queries and mutations, not only sidebar visibility.
- Admin has all-region governance access.
- Manager can handle assigned-region Reviews and Risk Center items.
- Field Rep can submit visits and evidence, but cannot approve reviews or manage rules.
- Store Owner can operate only own store data.
- Fan can operate only own fan data.
- Forbidden actions must be blocked even when called directly outside the UI.

## Implemented RBAC Foundation Status

As of Task-037, the frontend/local governance foundation has three completed layers:

1. Task-035: list and data-scope foundation.
   - Admin has company scope.
   - Manager has assigned-region operations scope.
   - Field Rep is scoped to assigned stores.
   - Store Owner is scoped to owned stores.
   - Fan is scoped to own fan/store identity.
2. Task-036: detail/id scope hardening.
   - Store, fan, and visit detail pages pass the current operator profile into by-id fetches.
   - Out-of-scope detail records show restricted/not-found states in local/demo mode.
3. Task-037: action permission matrix.
   - Critical backend actions use shared RBAC helpers instead of page-local role checks.

This is not the final production permission system. Supabase/RLS and mutation-level backend enforcement still need separate hardening before production.

## Current Action Permission Matrix

Shared frontend helpers should be used instead of ad hoc page checks.

| Action helper | Admin | Manager | Field Rep | Store Owner | Fan |
|---|---:|---:|---:|---:|---:|
| `canManageGlobalRules` | Yes | No | No | No | No |
| `canManageRewardOps` | Yes | Yes | No | No | No |
| `canAssignRewardPickup` | Yes | Yes | No | No | No |
| `canApproveReview` | Yes | Yes | No | No | No |
| `canManageRiskDecision` | Yes | Yes | No | No | No |
| `canApproveMaterialRequest` | Yes | Yes | No | No | No |
| `canSubmitMaterialRequest` | Yes | Yes | Yes | Yes | No |
| `canUpdateMaterialStock` | Yes | No | No | No | No |
| `canSubmitVisit` | Yes | Yes | Yes | No | No |
| `canSubmitStoreReport` | Yes | Yes | Yes | Yes | No |
| `canConfirmRewardPickup` | Yes | Yes | No | A/S own store only | No |
| `canEditLockedHistory` | Yes | No | No | No | No |

Future S Store V1 permissions should extend this matrix instead of creating page-local role checks.

## Planned S Store Permission Rules

- Admin has full S Store management and audit access.
- Manager can manage S Store status within assigned regions.
- Field Rep can submit S Store visit and replenishment records for assigned stores.
- Store Owner can submit only own S Store reports and cannot edit locked history.
- Fan can view only fan-facing UWELL Brand Store information.

Task-051 documented the S Store production RLS and API boundary direction in:

- `23_S_STORE_SUPABASE_RLS_API_ALIGNMENT.md`

Task-053 added an S Store RLS policy draft migration:

- `supabase/migrations/20260718000200_s_store_rls_policies.sql`

The draft protects:

- S Store current-state fields on `stores`;
- S Store status history;
- S Store sell-through;
- S Store product inventory snapshots;
- S Store material inventory snapshots;
- S Store visit details;
- S Store replenishment tasks;
- S Store audit logs.

Fans must not receive direct access to S Store operational tables. Fan-facing S Store visibility should stay limited to safe store presentation such as `UWELL Brand Store`.

The Task-053 migration was not executed against a remote Supabase project. Production acceptance still requires applying migrations in a controlled environment and running RLS acceptance checks.
