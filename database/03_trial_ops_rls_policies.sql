-- UWELL CRM trial operations RLS policies
-- Apply in Supabase SQL Editor or via Management API after the base schema exists.
-- Goal: allow public store registration to create pending-review stores only.

alter table public.stores enable row level security;

drop policy if exists "stores_public_read" on public.stores;
create policy "stores_public_read"
on public.stores
for select
to anon, authenticated
using (true);

drop policy if exists "stores_public_trial_registration" on public.stores;
create policy "stores_public_trial_registration"
on public.stores
for insert
to anon, authenticated
with check (
  coalesce(status, 'pending_review') = 'pending_review'
  and name is not null
  and length(trim(name)) > 0
  and country is not null
  and city is not null
);
