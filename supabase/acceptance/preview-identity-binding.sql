-- UWELL CRM preview identity binding.
--
-- Before running:
-- 1. Create these users in Supabase Dashboard > Authentication > Users:
--    admin@uwell.com
--    manager@uwell.com
--    rep1@uwell.com
--    store.owner@uwell.com
--    fan.preview@uwell.com
-- 2. Run this file with:
--    npx --no-install supabase db query --linked --file supabase/acceptance/preview-identity-binding.sql
--
-- This file does not create Auth users or store passwords. It binds existing
-- auth.users IDs into public.profiles, stores.rep_id, stores.owner_profile_id,
-- and fans.user_id so RLS can make real database decisions.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  missing_emails text;
BEGIN
  WITH expected(email) AS (
    VALUES
      ('admin@uwell.com'),
      ('manager@uwell.com'),
      ('rep1@uwell.com'),
      ('store.owner@uwell.com'),
      ('fan.preview@uwell.com')
  )
  SELECT string_agg(expected.email, ', ' ORDER BY expected.email)
  INTO missing_emails
  FROM expected
  LEFT JOIN auth.users users
    ON lower(users.email) = expected.email
  WHERE users.id IS NULL;

  IF missing_emails IS NOT NULL THEN
    RAISE EXCEPTION 'Missing Supabase Auth preview users: %', missing_emails;
  END IF;
END $$;

WITH expected_profiles(email, role, name, phone, country, city) AS (
  VALUES
    ('admin@uwell.com', 'admin', 'UWELL Preview Admin', '+966500000001', 'Saudi Arabia', 'Riyadh'),
    ('manager@uwell.com', 'manager', 'UWELL Preview Manager', '+966500000002', 'Saudi Arabia', 'Riyadh'),
    ('rep1@uwell.com', 'rep', 'UWELL Preview Rep 1', '+966500000003', 'Saudi Arabia', 'Riyadh'),
    ('store.owner@uwell.com', 'store_owner', 'UWELL Preview Store Owner', '504875886', 'Saudi Arabia', 'Riyadh'),
    ('fan.preview@uwell.com', 'fan', 'UWELL Preview Fan', '+966501234001', 'Saudi Arabia', 'Riyadh')
),
auth_profiles AS (
  SELECT
    users.id,
    expected_profiles.role,
    expected_profiles.name,
    expected_profiles.phone,
    expected_profiles.country,
    expected_profiles.city
  FROM expected_profiles
  JOIN auth.users users
    ON lower(users.email) = expected_profiles.email
)
INSERT INTO public.profiles (id, role, name, phone, country, city, created_at, updated_at)
SELECT id, role, name, phone, country, city, now(), now()
FROM auth_profiles
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    updated_at = now();

WITH rep_profile AS (
  SELECT users.id
  FROM auth.users users
  WHERE lower(users.email) = 'rep1@uwell.com'
),
owner_profile AS (
  SELECT users.id
  FROM auth.users users
  WHERE lower(users.email) = 'store.owner@uwell.com'
),
existing_store AS (
  SELECT id
  FROM public.stores
  WHERE phone = '504875886' OR owner_phone = '504875886'
  ORDER BY created_at NULLS LAST
  LIMIT 1
),
inserted_store AS (
  INSERT INTO public.stores (
    name,
    address,
    level,
    chain_name,
    chain_store_count,
    contact,
    phone,
    country,
    city,
    status,
    owner_name,
    owner_phone,
    display_status,
    rating_status,
    rep_id,
    owner_profile_id,
    created_at,
    updated_at
  )
  SELECT
    'UWELL Preview Store',
    'Riyadh preview route',
    'B',
    'UWELL Preview',
    1,
    'UWELL Preview Store Owner',
    '504875886',
    'Saudi Arabia',
    'Riyadh',
    'active',
    'UWELL Preview Store Owner',
    '504875886',
    'approved',
    'evaluated',
    rep_profile.id,
    owner_profile.id,
    now(),
    now()
  FROM rep_profile, owner_profile
  WHERE NOT EXISTS (SELECT 1 FROM existing_store)
  RETURNING id
),
target_store AS (
  SELECT id FROM existing_store
  UNION ALL
  SELECT id FROM inserted_store
  LIMIT 1
)
UPDATE public.stores
SET rep_id = (SELECT id FROM rep_profile),
    owner_profile_id = (SELECT id FROM owner_profile),
    country = COALESCE(country, 'Saudi Arabia'),
    city = COALESCE(city, 'Riyadh'),
    status = COALESCE(status, 'active'),
    owner_name = COALESCE(owner_name, contact, 'UWELL Preview Store Owner'),
    owner_phone = COALESCE(owner_phone, phone, '504875886'),
    display_status = COALESCE(display_status, 'approved'),
    rating_status = COALESCE(rating_status, 'evaluated'),
    updated_at = now()
WHERE id = (SELECT id FROM target_store);

WITH fan_profile AS (
  SELECT users.id
  FROM auth.users users
  WHERE lower(users.email) = 'fan.preview@uwell.com'
),
target_store AS (
  SELECT id
  FROM public.stores
  WHERE phone = '504875886' OR owner_phone = '504875886'
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
),
existing_fan AS (
  SELECT id
  FROM public.fans
  WHERE phone = '+966501234001'
  ORDER BY created_at NULLS LAST
  LIMIT 1
),
inserted_fan AS (
  INSERT INTO public.fans (
    store_id,
    user_id,
    name,
    phone,
    level,
    points,
    total_contribution,
    country,
    city,
    created_at,
    updated_at
  )
  SELECT
    target_store.id,
    fan_profile.id,
    'UWELL Preview Fan',
    '+966501234001',
    'gold',
    100,
    100,
    'Saudi Arabia',
    'Riyadh',
    now(),
    now()
  FROM fan_profile, target_store
  WHERE NOT EXISTS (SELECT 1 FROM existing_fan)
  RETURNING id
),
target_fan AS (
  SELECT id FROM existing_fan
  UNION ALL
  SELECT id FROM inserted_fan
  LIMIT 1
)
UPDATE public.fans
SET user_id = (SELECT id FROM fan_profile),
    store_id = COALESCE(store_id, (SELECT id FROM target_store)),
    name = COALESCE(name, 'UWELL Preview Fan'),
    phone = COALESCE(phone, '+966501234001'),
    level = COALESCE(level, 'gold'),
    points = COALESCE(points, 100),
    total_contribution = COALESCE(total_contribution, points, 100),
    country = COALESCE(country, 'Saudi Arabia'),
    city = COALESCE(city, 'Riyadh'),
    updated_at = now()
WHERE id = (SELECT id FROM target_fan);

COMMIT;

SELECT
  'stores.rep_id / stores.owner_profile_id / fans.user_id bound' AS result,
  stores.id AS store_id,
  stores.rep_id,
  stores.owner_profile_id,
  fans.id AS fan_id,
  fans.user_id
FROM public.stores
JOIN public.fans ON fans.store_id = stores.id
WHERE (stores.phone = '504875886' OR stores.owner_phone = '504875886')
  AND fans.phone = '+966501234001'
LIMIT 1;
