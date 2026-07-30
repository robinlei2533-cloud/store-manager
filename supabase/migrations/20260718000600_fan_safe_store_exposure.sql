-- Task-061: Fan-safe Store Exposure Boundary
--
-- Goal:
-- 1. Keep Fan users away from internal S Store columns on direct stores reads.
-- 2. Provide a safe fan-facing store projection.
-- 3. Preserve internal store reads for Admin, Manager, Rep, and Store Owner through
--    role-aware SECURITY DEFINER RPCs.

ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS exposure_controls JSONB DEFAULT '{}'::jsonb;

REVOKE SELECT ON public.stores FROM anon;
REVOKE SELECT ON public.stores FROM authenticated;

GRANT SELECT (
  id,
  name,
  address,
  lat,
  lng,
  level,
  chain_name,
  chain_id,
  chain_store_count,
  contact,
  phone,
  country,
  city,
  status,
  display_status,
  rating_status,
  exposure_controls,
  created_at,
  updated_at
) ON public.stores TO authenticated;

CREATE OR REPLACE FUNCTION public.get_internal_stores(
  p_filters jsonb DEFAULT '{}'::jsonb
)
RETURNS SETOF public.stores
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(public.current_profile_role(), '') = 'fan' THEN
    RAISE EXCEPTION 'Internal store access is not allowed for Fan users.';
  END IF;

  RETURN QUERY
  SELECT store_row.*
  FROM public.stores AS store_row
  WHERE public.can_access_store(store_row.id)
    AND (
      COALESCE(p_filters->>'level', '') = ''
      OR store_row.level = p_filters->>'level'
    )
    AND (
      COALESCE(p_filters->>'country', '') = ''
      OR store_row.country = p_filters->>'country'
    )
    AND (
      COALESCE(p_filters->>'city', '') = ''
      OR store_row.city = p_filters->>'city'
    )
    AND (
      COALESCE(p_filters->>'status', '') = ''
      OR store_row.status = p_filters->>'status'
    )
    AND (
      COALESCE(p_filters->>'chain_id', '') = ''
      OR store_row.chain_id = p_filters->>'chain_id'
    )
    AND (
      COALESCE(p_filters->>'search', '') = ''
      OR store_row.name ILIKE '%' || (p_filters->>'search') || '%'
    )
  ORDER BY store_row.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_internal_store(
  p_store_id uuid
)
RETURNS public.stores
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store public.stores;
BEGIN
  IF COALESCE(public.current_profile_role(), '') = 'fan' THEN
    RAISE EXCEPTION 'Internal store access is not allowed for Fan users.';
  END IF;

  SELECT store_row.*
  INTO v_store
  FROM public.stores AS store_row
  WHERE store_row.id = p_store_id
    AND public.can_access_store(store_row.id)
  LIMIT 1;

  RETURN v_store;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_internal_stores(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_internal_store(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_fan_safe_stores(
  p_filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  lat numeric,
  lng numeric,
  level text,
  chain_name text,
  phone text,
  country text,
  city text,
  status text,
  display_status text,
  rating_status text,
  exposure_controls jsonb,
  fan_label text,
  trust_copy text,
  pickup_label text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    store_row.id,
    store_row.name,
    store_row.address,
    store_row.lat,
    store_row.lng,
    store_row.level,
    store_row.chain_name,
    store_row.phone,
    store_row.country,
    store_row.city,
    store_row.status,
    store_row.display_status,
    store_row.rating_status,
    store_row.exposure_controls,
    CASE
      WHEN store_row.level = 'S' AND store_row.is_s_store = true THEN 'UWELL Brand Store'
      WHEN store_row.level = 'A' THEN 'Recommended'
      ELSE 'Listed'
    END AS fan_label,
    CASE
      WHEN store_row.level = 'S' AND store_row.is_s_store = true THEN 'Official UWELL brand experience and premium reward pickup readiness'
      WHEN store_row.level = 'A' THEN 'Reviewed UWELL partner with reliable service'
      ELSE 'Visible UWELL partner store'
    END AS trust_copy,
    CASE
      WHEN COALESCE(store_row.exposure_controls->>'reward_pickup_recommended', 'false') = 'true' THEN 'Premium pickup ready'
      ELSE 'Pickup eligible'
    END AS pickup_label,
    store_row.created_at,
    store_row.updated_at
  FROM public.stores AS store_row
  WHERE public.can_access_store(store_row.id)
    AND COALESCE(store_row.exposure_controls->>'hidden_from_fan_app', 'false') <> 'true'
    AND (
      COALESCE(p_filters->>'level', '') = ''
      OR store_row.level = p_filters->>'level'
    )
    AND (
      COALESCE(p_filters->>'country', '') = ''
      OR store_row.country = p_filters->>'country'
    )
    AND (
      COALESCE(p_filters->>'city', '') = ''
      OR store_row.city = p_filters->>'city'
    )
    AND (
      COALESCE(p_filters->>'status', '') = ''
      OR store_row.status = p_filters->>'status'
    )
    AND (
      COALESCE(p_filters->>'search', '') = ''
      OR store_row.name ILIKE '%' || (p_filters->>'search') || '%'
    )
  ORDER BY store_row.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_fan_safe_stores(jsonb) TO authenticated;
