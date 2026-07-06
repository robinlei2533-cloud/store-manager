-- Create missing Supabase Auth preview users for RLS acceptance.
-- Temporary preview password for these accounts: admin
--
-- Run with:
-- npx --no-install supabase db query --linked --file supabase/acceptance/create-preview-auth-users.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH preview_users(email, display_name) AS (
  VALUES
    ('manager@uwell.com', 'UWELL Preview Manager'),
    ('rep1@uwell.com', 'UWELL Preview Rep 1'),
    ('store.owner@uwell.com', 'UWELL Preview Store Owner'),
    ('fan.preview@uwell.com', 'UWELL Preview Fan')
),
inserted_users AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_change,
    email_change,
    email_change_confirm_status,
    reauthentication_token,
    is_sso_user,
    is_anonymous
  )
  SELECT
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    preview_users.email,
    crypt('admin', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', preview_users.display_name),
    false,
    now(),
    now(),
    null,
    '',
    '',
    0,
    '',
    false,
    false
  FROM preview_users
  WHERE NOT EXISTS (
    SELECT 1
    FROM auth.users users
    WHERE lower(users.email) = preview_users.email
  )
  RETURNING id, email
)
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  inserted_users.id::text,
  inserted_users.id,
  jsonb_build_object(
    'sub', inserted_users.id::text,
    'email', inserted_users.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  now(),
  now()
FROM inserted_users
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.identities identities
  WHERE identities.provider = 'email'
    AND identities.user_id = inserted_users.id
);
