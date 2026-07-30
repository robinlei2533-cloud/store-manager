-- S Store V1 controlled mutation RPC draft.
-- Additive only: this migration defines transaction-safe function boundaries
-- for existing S Store V1 tables. It does not create tables, change UI,
-- add reward policies, item-level sell-through, pricing analysis, or auto refill.

CREATE OR REPLACE FUNCTION public.write_s_store_audit(
  p_store_id uuid,
  p_action_type text,
  p_before_value text DEFAULT '',
  p_after_value text DEFAULT '',
  p_reason text DEFAULT '',
  p_severity text DEFAULT 'medium'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store record;
  v_profile record;
BEGIN
  IF to_regclass('public.audit_logs') IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO v_store FROM public.stores WHERE id = p_store_id;
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();

  INSERT INTO public.audit_logs (
    actor,
    user_id,
    role,
    region,
    action_type,
    target_type,
    target_id,
    target,
    before_value,
    after_value,
    reason,
    source_module,
    category,
    severity,
    created_at
  )
  VALUES (
    COALESCE(row_to_json(v_profile)->>'name', row_to_json(v_profile)->>'email', auth.uid()::text, '-'),
    auth.uid(),
    COALESCE(row_to_json(v_profile)->>'role', '-'),
    COALESCE(
      row_to_json(v_profile)->>'region',
      row_to_json(v_profile)->>'city',
      row_to_json(v_store)->>'region',
      row_to_json(v_store)->>'city',
      '-'
    ),
    p_action_type,
    'store',
    p_store_id,
    COALESCE(v_store.name, p_store_id::text),
    to_jsonb(p_before_value),
    to_jsonb(p_after_value),
    p_reason,
    's_store_management',
    's_store',
    p_severity,
    now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_s_store_sell_through(
  p_store_id uuid,
  p_period_type text,
  p_period_start date,
  p_period_end date,
  p_open_system_sold_qty integer,
  p_disposable_sold_qty integer
)
RETURNS public.s_store_sell_through
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record public.s_store_sell_through;
BEGIN
  IF NOT public.can_submit_s_store_report(p_store_id) AND NOT public.can_manage_s_store(p_store_id) THEN
    RAISE EXCEPTION 'S Store report submission is not allowed for this store.';
  END IF;

  INSERT INTO public.s_store_sell_through (
    store_id,
    period_type,
    period_start,
    period_end,
    open_system_sold_qty,
    disposable_sold_qty,
    submitted_by,
    submitted_at,
    locked
  )
  VALUES (
    p_store_id,
    p_period_type,
    p_period_start,
    p_period_end,
    p_open_system_sold_qty,
    p_disposable_sold_qty,
    auth.uid(),
    now(),
    true
  )
  RETURNING * INTO v_record;

  PERFORM public.write_s_store_audit(
    p_store_id,
    'S Store sell-through submitted',
    '',
    row_to_json(v_record)::text,
    '',
    'medium'
  );

  RETURN v_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_s_store_product_inventory(
  p_store_id uuid,
  p_open_system_current_stock integer,
  p_open_system_target_stock integer,
  p_disposable_current_stock integer,
  p_disposable_target_stock integer,
  p_note text DEFAULT ''
)
RETURNS public.s_store_product_inventory_snapshots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_open_low_stock boolean := p_open_system_target_stock > 0 AND p_open_system_current_stock <= (p_open_system_target_stock / 3.0);
  v_disposable_low_stock boolean := p_disposable_target_stock > 0 AND p_disposable_current_stock <= (p_disposable_target_stock / 3.0);
  v_record public.s_store_product_inventory_snapshots;
BEGIN
  IF NOT public.can_submit_s_store_report(p_store_id) AND NOT public.can_manage_s_store(p_store_id) THEN
    RAISE EXCEPTION 'S Store report submission is not allowed for this store.';
  END IF;

  INSERT INTO public.s_store_product_inventory_snapshots (
    store_id,
    open_system_current_stock,
    open_system_target_stock,
    disposable_current_stock,
    disposable_target_stock,
    open_system_low_stock,
    disposable_low_stock,
    low_stock,
    submitted_by,
    submitted_at,
    locked,
    note
  )
  VALUES (
    p_store_id,
    p_open_system_current_stock,
    p_open_system_target_stock,
    p_disposable_current_stock,
    p_disposable_target_stock,
    v_open_low_stock,
    v_disposable_low_stock,
    v_open_low_stock OR v_disposable_low_stock,
    auth.uid(),
    now(),
    true,
    p_note
  )
  RETURNING * INTO v_record;

  PERFORM public.write_s_store_audit(
    p_store_id,
    'S Store product inventory submitted',
    '',
    row_to_json(v_record)::text,
    '',
    CASE WHEN v_record.low_stock THEN 'high' ELSE 'medium' END
  );

  RETURN v_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_s_store_material_inventory(
  p_store_id uuid,
  p_material_type text,
  p_current_quantity integer,
  p_target_quantity integer,
  p_note text DEFAULT ''
)
RETURNS public.s_store_material_inventory_snapshots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_low_stock boolean := p_target_quantity > 0 AND p_current_quantity <= (p_target_quantity / 3.0);
  v_record public.s_store_material_inventory_snapshots;
BEGIN
  IF NOT public.can_submit_s_store_report(p_store_id) AND NOT public.can_manage_s_store(p_store_id) THEN
    RAISE EXCEPTION 'S Store report submission is not allowed for this store.';
  END IF;

  INSERT INTO public.s_store_material_inventory_snapshots (
    store_id,
    material_type,
    current_quantity,
    target_quantity,
    low_stock,
    submitted_by,
    submitted_at,
    locked,
    note
  )
  VALUES (
    p_store_id,
    p_material_type,
    p_current_quantity,
    p_target_quantity,
    v_low_stock,
    auth.uid(),
    now(),
    true,
    p_note
  )
  RETURNING * INTO v_record;

  PERFORM public.write_s_store_audit(
    p_store_id,
    'S Store material inventory submitted',
    '',
    row_to_json(v_record)::text,
    '',
    CASE WHEN v_record.low_stock THEN 'high' ELSE 'medium' END
  );

  RETURN v_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_s_store_visit_detail(
  p_visit_id uuid,
  p_store_id uuid,
  p_field_rep_id uuid DEFAULT NULL,
  p_inventory_status text DEFAULT '',
  p_display_status text DEFAULT '',
  p_sell_through_observation text DEFAULT '',
  p_competitor_situation text DEFAULT '',
  p_hot_brands text DEFAULT '',
  p_hot_flavors text DEFAULT '',
  p_consumer_feedback text DEFAULT '',
  p_market_notes text DEFAULT '',
  p_support_needed text DEFAULT '',
  p_replenishment_needed boolean DEFAULT false,
  p_visit_photos text[] DEFAULT ARRAY[]::text[]
)
RETURNS public.s_store_visit_details
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record public.s_store_visit_details;
BEGIN
  IF NOT public.can_submit_s_store_visit(p_store_id) THEN
    RAISE EXCEPTION 'S Store visit submission is not allowed for this role.';
  END IF;

  INSERT INTO public.s_store_visit_details (
    visit_id,
    store_id,
    field_rep_id,
    inventory_status,
    display_status,
    sell_through_observation,
    competitor_situation,
    hot_brands,
    hot_flavors,
    consumer_feedback,
    market_notes,
    support_needed,
    replenishment_needed,
    visit_photos,
    submitted_by,
    submitted_at
  )
  VALUES (
    p_visit_id,
    p_store_id,
    COALESCE(p_field_rep_id, auth.uid()),
    p_inventory_status,
    p_display_status,
    p_sell_through_observation,
    p_competitor_situation,
    p_hot_brands,
    p_hot_flavors,
    p_consumer_feedback,
    p_market_notes,
    p_support_needed,
    p_replenishment_needed,
    p_visit_photos,
    auth.uid(),
    now()
  )
  RETURNING * INTO v_record;

  PERFORM public.write_s_store_audit(
    p_store_id,
    'S Store visit detail submitted',
    '',
    row_to_json(v_record)::text,
    '',
    CASE WHEN p_replenishment_needed THEN 'high' ELSE 'medium' END
  );

  RETURN v_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_s_store_replenishment_task(
  p_store_id uuid,
  p_trigger_source text,
  p_item_type text,
  p_requested_quantity integer,
  p_assigned_rep_id uuid DEFAULT NULL,
  p_status text DEFAULT 'pending',
  p_note text DEFAULT ''
)
RETURNS public.s_store_replenishment_tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record public.s_store_replenishment_tasks;
BEGIN
  IF NOT public.can_manage_s_store_replenishment(p_store_id, p_assigned_rep_id) THEN
    RAISE EXCEPTION 'S Store replenishment task creation is not allowed for this role.';
  END IF;

  INSERT INTO public.s_store_replenishment_tasks (
    store_id,
    trigger_source,
    item_type,
    requested_quantity,
    assigned_rep_id,
    status,
    created_by,
    created_at,
    note
  )
  VALUES (
    p_store_id,
    p_trigger_source,
    p_item_type,
    p_requested_quantity,
    p_assigned_rep_id,
    COALESCE(p_status, 'pending'),
    auth.uid(),
    now(),
    p_note
  )
  RETURNING * INTO v_record;

  PERFORM public.write_s_store_audit(
    p_store_id,
    'S Store replenishment task created',
    '',
    row_to_json(v_record)::text,
    p_note,
    'medium'
  );

  RETURN v_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_s_store_replenishment_task(
  p_task_id uuid,
  p_completion_photos text[],
  p_note text DEFAULT ''
)
RETURNS public.s_store_replenishment_tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task public.s_store_replenishment_tasks;
  v_record public.s_store_replenishment_tasks;
BEGIN
  IF array_length(p_completion_photos, 1) IS NULL THEN
    RAISE EXCEPTION 'S Store replenishment completion requires photos.';
  END IF;

  SELECT * INTO v_task
  FROM public.s_store_replenishment_tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'S Store replenishment task was not found.';
  END IF;

  IF NOT public.can_manage_s_store_replenishment(v_task.store_id, v_task.assigned_rep_id) THEN
    RAISE EXCEPTION 'S Store replenishment completion is not allowed for this role.';
  END IF;

  UPDATE public.s_store_replenishment_tasks
  SET
    status = 'completed',
    completion_photos = p_completion_photos,
    completed_by = auth.uid(),
    completed_at = now(),
    note = COALESCE(NULLIF(p_note, ''), note),
    updated_at = now()
  WHERE id = p_task_id
  RETURNING * INTO v_record;

  PERFORM public.write_s_store_audit(
    v_record.store_id,
    'S Store replenishment completed',
    v_task.status,
    v_record.status,
    p_note,
    'medium'
  );

  RETURN v_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.downgrade_s_store_to_a(
  p_store_id uuid,
  p_reason text,
  p_note text DEFAULT ''
)
RETURNS public.s_store_status_history
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store public.stores;
  v_before_status text;
  v_history public.s_store_status_history;
BEGIN
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'S Store downgrade requires a reason.';
  END IF;

  IF NOT public.can_manage_s_store(p_store_id) THEN
    RAISE EXCEPTION 'S Store downgrade is not allowed.';
  END IF;

  SELECT * INTO v_store FROM public.stores WHERE id = p_store_id FOR UPDATE;
  v_before_status := COALESCE(v_store.s_store_status, 'active');

  UPDATE public.stores
  SET
    level = 'A',
    is_s_store = false,
    s_store_status = 'downgraded',
    updated_at = now()
  WHERE id = p_store_id;

  INSERT INTO public.s_store_status_history (
    store_id,
    action_type,
    before_status,
    after_status,
    reason,
    note,
    operator_id,
    action_at
  )
  VALUES (
    p_store_id,
    'downgrade_to_a',
    v_before_status,
    'downgraded',
    p_reason,
    p_note,
    auth.uid(),
    now()
  )
  RETURNING * INTO v_history;

  PERFORM public.write_s_store_audit(
    p_store_id,
    'S Store downgraded to A',
    v_before_status,
    'downgraded',
    p_reason,
    'high'
  );

  RETURN v_history;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_s_store(
  p_store_id uuid,
  p_reason text,
  p_note text DEFAULT ''
)
RETURNS public.s_store_status_history
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store public.stores;
  v_before_status text;
  v_history public.s_store_status_history;
BEGIN
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'S Store restore requires a reason.';
  END IF;

  IF NOT public.can_manage_s_store(p_store_id) THEN
    RAISE EXCEPTION 'S Store restore is not allowed.';
  END IF;

  SELECT * INTO v_store FROM public.stores WHERE id = p_store_id FOR UPDATE;
  v_before_status := COALESCE(v_store.s_store_status, 'downgraded');

  UPDATE public.stores
  SET
    level = 'S',
    is_s_store = true,
    s_store_status = 'active',
    updated_at = now()
  WHERE id = p_store_id;

  INSERT INTO public.s_store_status_history (
    store_id,
    action_type,
    before_status,
    after_status,
    reason,
    note,
    operator_id,
    action_at
  )
  VALUES (
    p_store_id,
    'restore_to_s',
    v_before_status,
    'active',
    p_reason,
    p_note,
    auth.uid(),
    now()
  )
  RETURNING * INTO v_history;

  PERFORM public.write_s_store_audit(
    p_store_id,
    'S Store restored',
    v_before_status,
    'active',
    p_reason,
    'medium'
  );

  RETURN v_history;
END;
$$;

GRANT EXECUTE ON FUNCTION public.write_s_store_audit(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_s_store_sell_through(uuid, text, date, date, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_s_store_product_inventory(uuid, integer, integer, integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_s_store_material_inventory(uuid, text, integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_s_store_visit_detail(uuid, uuid, uuid, text, text, text, text, text, text, text, text, text, boolean, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_s_store_replenishment_task(uuid, text, text, integer, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_s_store_replenishment_task(uuid, text[], text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.downgrade_s_store_to_a(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_s_store(uuid, text, text) TO authenticated;
