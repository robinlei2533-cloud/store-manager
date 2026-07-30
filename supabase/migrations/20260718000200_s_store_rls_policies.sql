-- S Store V1 RLS policy draft.
-- Policy-only migration: schema tables were drafted in
-- 20260718000100_s_store_schema.sql. Production RPCs are separate tasks.

CREATE OR REPLACE FUNCTION public.is_manager_for_store(target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.current_profile_role() = 'manager'
    AND target_store_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles AS manager_profile
      JOIN public.stores AS store_row
        ON store_row.id = target_store_id
      WHERE manager_profile.id = auth.uid()
        AND manager_profile.city IS NOT NULL
        AND store_row.city = manager_profile.city
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_s_store(target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    target_store_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.stores AS store_row
      WHERE store_row.id = target_store_id
        AND COALESCE(store_row.is_s_store, false) = true
        AND COALESCE(store_row.s_store_status, 'active') = 'active'
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_s_store(target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.is_admin_role()
    OR public.is_manager_for_store(target_store_id),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_submit_s_store_report(target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.is_active_s_store(target_store_id)
    AND EXISTS (
      SELECT 1
      FROM public.stores AS store_row
      WHERE store_row.id = target_store_id
        AND store_row.owner_profile_id = auth.uid()
        AND public.current_profile_role() = 'store_owner'
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_submit_s_store_visit(target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.can_manage_s_store(target_store_id)
    OR public.is_rep_assigned_to_store(target_store_id),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_s_store_replenishment(
  target_store_id uuid,
  target_assigned_rep_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.can_manage_s_store(target_store_id)
    OR (
      public.current_profile_role() = 'rep'
      AND target_assigned_rep_id = auth.uid()
      AND public.is_rep_assigned_to_store(target_store_id)
    ),
    false
  );
$$;

ALTER TABLE public.s_store_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_sell_through ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_product_inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_material_inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_visit_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_replenishment_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS s_store_status_history_select_scoped ON public.s_store_status_history;
CREATE POLICY s_store_status_history_select_scoped ON public.s_store_status_history
  FOR SELECT TO authenticated
  USING (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_status_history_insert_manager ON public.s_store_status_history;
CREATE POLICY s_store_status_history_insert_manager ON public.s_store_status_history
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_status_history_update_manager ON public.s_store_status_history;
CREATE POLICY s_store_status_history_update_manager ON public.s_store_status_history
  FOR UPDATE TO authenticated
  USING (public.can_manage_s_store(store_id))
  WITH CHECK (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_status_history_delete_admin ON public.s_store_status_history;
CREATE POLICY s_store_status_history_delete_admin ON public.s_store_status_history
  FOR DELETE TO authenticated
  USING (public.is_admin_role());

DROP POLICY IF EXISTS s_store_sell_through_select_scoped ON public.s_store_sell_through;
CREATE POLICY s_store_sell_through_select_scoped ON public.s_store_sell_through
  FOR SELECT TO authenticated
  USING (
    public.can_manage_s_store(store_id)
    OR public.can_submit_s_store_report(store_id)
    OR public.is_rep_assigned_to_store(store_id)
  );

DROP POLICY IF EXISTS s_store_sell_through_insert_reporter ON public.s_store_sell_through;
CREATE POLICY s_store_sell_through_insert_reporter ON public.s_store_sell_through
  FOR INSERT TO authenticated
  WITH CHECK (public.can_submit_s_store_report(store_id));

DROP POLICY IF EXISTS s_store_sell_through_insert_manager ON public.s_store_sell_through;
CREATE POLICY s_store_sell_through_insert_manager ON public.s_store_sell_through
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_sell_through_update_manager ON public.s_store_sell_through;
CREATE POLICY s_store_sell_through_update_manager ON public.s_store_sell_through
  FOR UPDATE TO authenticated
  USING (public.can_manage_s_store(store_id))
  WITH CHECK (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_product_inventory_snapshots_select_scoped ON public.s_store_product_inventory_snapshots;
CREATE POLICY s_store_product_inventory_snapshots_select_scoped ON public.s_store_product_inventory_snapshots
  FOR SELECT TO authenticated
  USING (
    public.can_manage_s_store(store_id)
    OR public.can_submit_s_store_report(store_id)
    OR public.is_rep_assigned_to_store(store_id)
  );

DROP POLICY IF EXISTS s_store_product_inventory_snapshots_insert_reporter ON public.s_store_product_inventory_snapshots;
CREATE POLICY s_store_product_inventory_snapshots_insert_reporter ON public.s_store_product_inventory_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (public.can_submit_s_store_report(store_id));

DROP POLICY IF EXISTS s_store_product_inventory_snapshots_insert_manager ON public.s_store_product_inventory_snapshots;
CREATE POLICY s_store_product_inventory_snapshots_insert_manager ON public.s_store_product_inventory_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_product_inventory_snapshots_update_manager ON public.s_store_product_inventory_snapshots;
CREATE POLICY s_store_product_inventory_snapshots_update_manager ON public.s_store_product_inventory_snapshots
  FOR UPDATE TO authenticated
  USING (public.can_manage_s_store(store_id))
  WITH CHECK (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_material_inventory_snapshots_select_scoped ON public.s_store_material_inventory_snapshots;
CREATE POLICY s_store_material_inventory_snapshots_select_scoped ON public.s_store_material_inventory_snapshots
  FOR SELECT TO authenticated
  USING (
    public.can_manage_s_store(store_id)
    OR public.can_submit_s_store_report(store_id)
    OR public.is_rep_assigned_to_store(store_id)
  );

DROP POLICY IF EXISTS s_store_material_inventory_snapshots_insert_reporter ON public.s_store_material_inventory_snapshots;
CREATE POLICY s_store_material_inventory_snapshots_insert_reporter ON public.s_store_material_inventory_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (public.can_submit_s_store_report(store_id));

DROP POLICY IF EXISTS s_store_material_inventory_snapshots_insert_manager ON public.s_store_material_inventory_snapshots;
CREATE POLICY s_store_material_inventory_snapshots_insert_manager ON public.s_store_material_inventory_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_material_inventory_snapshots_update_manager ON public.s_store_material_inventory_snapshots;
CREATE POLICY s_store_material_inventory_snapshots_update_manager ON public.s_store_material_inventory_snapshots
  FOR UPDATE TO authenticated
  USING (public.can_manage_s_store(store_id))
  WITH CHECK (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_visit_details_select_scoped ON public.s_store_visit_details;
CREATE POLICY s_store_visit_details_select_scoped ON public.s_store_visit_details
  FOR SELECT TO authenticated
  USING (
    public.can_manage_s_store(store_id)
    OR public.can_submit_s_store_report(store_id)
    OR public.is_rep_assigned_to_store(store_id)
  );

DROP POLICY IF EXISTS s_store_visit_details_insert_visit_submitter ON public.s_store_visit_details;
CREATE POLICY s_store_visit_details_insert_visit_submitter ON public.s_store_visit_details
  FOR INSERT TO authenticated
  WITH CHECK (public.can_submit_s_store_visit(store_id));

DROP POLICY IF EXISTS s_store_visit_details_update_manager ON public.s_store_visit_details;
CREATE POLICY s_store_visit_details_update_manager ON public.s_store_visit_details
  FOR UPDATE TO authenticated
  USING (public.can_manage_s_store(store_id))
  WITH CHECK (public.can_manage_s_store(store_id));

DROP POLICY IF EXISTS s_store_replenishment_tasks_select_scoped ON public.s_store_replenishment_tasks;
CREATE POLICY s_store_replenishment_tasks_select_scoped ON public.s_store_replenishment_tasks
  FOR SELECT TO authenticated
  USING (
    public.can_manage_s_store(store_id)
    OR public.can_submit_s_store_report(store_id)
    OR public.can_manage_s_store_replenishment(store_id, assigned_rep_id)
  );

DROP POLICY IF EXISTS s_store_replenishment_tasks_insert_scoped ON public.s_store_replenishment_tasks;
CREATE POLICY s_store_replenishment_tasks_insert_scoped ON public.s_store_replenishment_tasks
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_s_store_replenishment(store_id, assigned_rep_id));

DROP POLICY IF EXISTS s_store_replenishment_tasks_update_scoped ON public.s_store_replenishment_tasks;
CREATE POLICY s_store_replenishment_tasks_update_scoped ON public.s_store_replenishment_tasks
  FOR UPDATE TO authenticated
  USING (public.can_manage_s_store_replenishment(store_id, assigned_rep_id))
  WITH CHECK (public.can_manage_s_store_replenishment(store_id, assigned_rep_id));

GRANT EXECUTE ON FUNCTION public.is_manager_for_store(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_s_store(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_s_store(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_submit_s_store_report(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_submit_s_store_visit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_s_store_replenishment(uuid, uuid) TO authenticated;
