# UWELL CRM Supabase RLS Acceptance

Last updated: 2026-07-05

## Goal

Before an external preview, Supabase must enforce permissions at the database layer, not only through hidden frontend menus.

This means:

- Admin and Manager can operate company-wide data.
- Rep can only see assigned-store work.
- Store owner can only see own store-facing data.
- Fan can only see own private fan records.
- Anonymous visitors cannot read protected CRM tables directly.

## Identity Rules

| Identity | Should Access | Should Not Access |
|---|---|---|
| Admin | All company operational data, settings, stores, fans, campaigns, materials, visits | Nothing except future super-admin-only areas |
| Manager | Company operational data, stores, fans, campaigns, materials, visits | Admin-only destructive/system actions |
| Rep | Assigned stores, own visits, assigned tasks, assigned store evaluations and campaign reports | Other reps' stores, unrelated fans, company settings |
| Store owner | Own store, own store material records, own store campaigns/reviews/scans/fans | Other stores, other stores' material/scans/fans |
| Fan | Own profile/fan row, own points, check-ins, rewards, scans, redemptions | Other fans' private data, store/admin operations |

## Migration Added

`supabase/migrations/20260705000100_rls_role_policies.sql`

The migration adds:

- `profiles.role` support for `store_owner`.
- `stores.owner_profile_id` to bind store owners to a Supabase profile.
- `stores.rep_id` to bind field reps to assigned stores.
- Helper functions:
  - `current_profile_role()`
  - `is_admin_or_manager()`
  - `is_admin_role()`
  - `is_rep_assigned_to_store(store_id)`
  - `is_store_owner(store_id)`
  - `is_fan_owner(fan_id)`
  - `can_access_store(store_id)`
  - `can_access_fan(fan_id)`
- RLS policies for the main CRM tables.
- No `anon` or broad `public` table policies for protected CRM data.

## SQL Acceptance Checks

Run after applying migrations to the preview Supabase project.

## Real Preview Identity Binding

Create these Supabase Auth users first in Dashboard > Authentication > Users:

- `admin@uwell.com`
- `manager@uwell.com`
- `rep1@uwell.com`
- `store.owner@uwell.com`
- `fan.preview@uwell.com`

Then bind those real Auth UUIDs into the CRM tables:

```powershell
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm"
$env:SUPABASE_ACCESS_TOKEN="NEW_TOKEN_HERE"
npx --no-install supabase db query --linked --file supabase/acceptance/preview-identity-binding.sql
npx --no-install supabase db query --linked --file supabase/acceptance/preview-identity-checks.sql
```

The binding SQL:

- upserts `public.profiles` using the real `auth.users.id`;
- binds `stores.rep_id` to `rep1@uwell.com`;
- binds `stores.owner_profile_id` to `store.owner@uwell.com`;
- binds `fans.user_id` to `fan.preview@uwell.com`;
- creates a small preview store/fan record if the phone-based preview rows do not exist.

Do not reuse an access token that has appeared in chat or screenshots. Revoke it and generate a new one before running the remote command.

If preview Auth users are missing and you explicitly want local preview accounts, run:

```powershell
npx --no-install supabase db query --linked --file supabase/acceptance/create-preview-auth-users.sql
```

Those temporary preview users use password `admin`. Change or delete them before any broader external preview.

```sql
-- 1. Confirm every protected table has RLS enabled.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles', 'stores', 'visits', 'fans', 'fan_points_log',
    'fan_checkins', 'mall_redemptions', 'scan_records',
    'materials', 'material_stocks', 'material_inbound',
    'material_outbound', 'campaigns', 'campaign_tasks',
    'campaign_reports', 'qr_codes', 'store_evaluations',
    'store_tasks'
  )
order by tablename;
```

```sql
-- 2. Confirm policies exist and only target authenticated users.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

```sql
-- 3. Confirm no protected table policy grants anon access.
select schemaname, tablename, policyname, roles
from pg_policies
where schemaname = 'public'
  and roles::text ilike '%anon%';
```

Expected result for check 3: zero rows.

## Browser Flow Acceptance

Use external preview with:

- `VITE_ALLOW_LOCAL_AUTH_FALLBACK=false`
- `VITE_ALLOW_LOCAL_DB_FALLBACK=false`

Then verify:

1. Admin login can open Admin dashboard, stores, fans, visits, campaigns, materials, settings.
2. Manager login can open operating pages but cannot perform admin-only restricted actions.
3. Rep login only shows field-work pages and cannot open settings by direct URL.
4. Rep data lists only assigned stores, visits, evaluations, tasks, and campaign reports.
5. Store owner login opens only own Store Center and cannot fetch another store's detail URL/data.
6. Fan login opens only own Fan Center data and cannot fetch another fan's points/rewards/scans.
7. Logged-out visitor can open public entry pages but cannot directly query CRM data.

## Current Remaining Decision

Store portal is currently business-login oriented in the local demo flow. For a real Supabase external preview, store owners should be bound to Supabase Auth profiles through `stores.owner_profile_id`; otherwise database-level RLS cannot reliably know which store owner is making the request.
