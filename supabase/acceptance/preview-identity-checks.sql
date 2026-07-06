-- UWELL CRM preview identity checks.
--
-- Run after preview-identity-binding.sql:
-- npx --no-install supabase db query --linked --file supabase/acceptance/preview-identity-checks.sql

WITH expected_users(email, expected_role) AS (
  VALUES
    ('admin@uwell.com', 'admin'),
    ('manager@uwell.com', 'manager'),
    ('rep1@uwell.com', 'rep'),
    ('store.owner@uwell.com', 'store_owner'),
    ('fan.preview@uwell.com', 'fan')
),
auth_profiles AS (
  SELECT
    expected_users.email,
    expected_users.expected_role,
    users.id AS auth_user_id,
    profiles.id AS profile_id,
    profiles.role AS profile_role
  FROM expected_users
  LEFT JOIN auth.users users
    ON lower(users.email) = expected_users.email
  LEFT JOIN public.profiles profiles
    ON profiles.id = users.id
),
store_binding AS (
  SELECT
    stores.id AS store_id,
    stores.rep_id,
    rep_user.email AS rep_email,
    stores.owner_profile_id,
    owner_user.email AS owner_email
  FROM public.stores
  LEFT JOIN auth.users rep_user
    ON rep_user.id = stores.rep_id
  LEFT JOIN auth.users owner_user
    ON owner_user.id = stores.owner_profile_id
  WHERE stores.phone = '504875886' OR stores.owner_phone = '504875886'
  ORDER BY stores.updated_at DESC NULLS LAST
  LIMIT 1
),
fan_binding AS (
  SELECT
    fans.id AS fan_id,
    fans.user_id,
    fan_user.email AS fan_email,
    fans.store_id
  FROM public.fans
  LEFT JOIN auth.users fan_user
    ON fan_user.id = fans.user_id
  WHERE fans.phone = '+966501234001'
  ORDER BY fans.updated_at DESC NULLS LAST
  LIMIT 1
)
SELECT
  'auth_profile' AS check_type,
  email AS subject,
  CASE
    WHEN auth_user_id IS NULL THEN 'missing_auth_user'
    WHEN profile_id IS NULL THEN 'missing_profile'
    WHEN profile_role <> expected_role THEN 'wrong_profile_role'
    ELSE 'ok'
  END AS status,
  auth_user_id::text AS auth_user_id,
  profile_role AS detail
FROM auth_profiles
UNION ALL
SELECT
  'stores.rep_id',
  COALESCE(rep_email, 'preview store'),
  CASE WHEN rep_email = 'rep1@uwell.com' THEN 'ok' ELSE 'wrong_or_missing_rep' END,
  rep_id::text,
  store_id::text
FROM store_binding
UNION ALL
SELECT
  'stores.owner_profile_id',
  COALESCE(owner_email, 'preview store'),
  CASE WHEN owner_email = 'store.owner@uwell.com' THEN 'ok' ELSE 'wrong_or_missing_owner' END,
  owner_profile_id::text,
  store_id::text
FROM store_binding
UNION ALL
SELECT
  'fans.user_id',
  COALESCE(fan_email, 'preview fan'),
  CASE WHEN fan_email = 'fan.preview@uwell.com' THEN 'ok' ELSE 'wrong_or_missing_fan' END,
  user_id::text,
  fan_id::text
FROM fan_binding
ORDER BY check_type, subject;
