-- Task-064: Internal Store RPC Scope
--
-- Goal:
-- 1. Keep global can_access_store unchanged for legacy backend modules.
-- 2. Scope internal store RPC reads with the stricter S Store production boundary.
-- 3. Prevent Manager users from reading unrelated-region internal store rows through
--    get_internal_store / get_internal_stores.

CREATE OR REPLACE FUNCTION public.can_read_internal_store(target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    CASE
      WHEN public.current_profile_role() = 'fan' THEN false
      ELSE (
        public.is_admin_role()
        OR public.is_manager_for_store(target_store_id)
        OR public.is_rep_assigned_to_store(target_store_id)
        OR public.is_store_owner(target_store_id)
      )
    END,
    false
  );
$$;

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
  WHERE public.can_read_internal_store(store_row.id)
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
    AND public.can_read_internal_store(store_row.id)
  LIMIT 1;

  RETURN v_store;
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_read_internal_store(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_internal_stores(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_internal_store(uuid) TO authenticated;
