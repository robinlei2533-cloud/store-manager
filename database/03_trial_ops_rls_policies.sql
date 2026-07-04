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
-- Allow trial fan registration to write the minimal business records created after Supabase Auth signup.
alter table public.profiles enable row level security;
alter table public.fans enable row level security;

drop policy if exists "profiles_public_fan_registration" on public.profiles;
create policy "profiles_public_fan_registration"
on public.profiles
for insert
to anon, authenticated
with check (
  role = 'fan'
  and name is not null
  and length(trim(name)) > 0
  and country is not null
  and city is not null
);

drop policy if exists "profiles_public_fan_read" on public.profiles;
create policy "profiles_public_fan_read"
on public.profiles
for select
to anon, authenticated
using (role = 'fan');

drop policy if exists "fans_public_trial_registration" on public.fans;
create policy "fans_public_trial_registration"
on public.fans
for insert
to anon, authenticated
with check (
  country is not null
  and city is not null
  and coalesce(level, 'bronze') = 'bronze'
  and coalesce(points, 100) = 100
  and coalesce(total_contribution, 0) = 0
);

drop policy if exists "fans_public_read" on public.fans;
create policy "fans_public_read"
on public.fans
for select
to anon, authenticated
using (true);
-- Keep Supabase Auth signup compatible with the trial profile schema.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, name, phone, avatar, country, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'fan'),
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), new.email),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'avatar', ''),
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'city'
  )
  on conflict (id) do update set
    role = excluded.role,
    name = excluded.name,
    phone = excluded.phone,
    avatar = excluded.avatar,
    country = excluded.country,
    city = excluded.city,
    updated_at = now();
  return new;
end;
$$;

