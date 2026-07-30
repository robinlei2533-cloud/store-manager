-- S Store V1 locked-history correction RPC draft.
-- Additive only: this migration defines controlled correction functions for
-- existing S Store operating history. It does not create tables, change fan
-- behavior, add item-level sell-through, pricing analysis, auto refill, or
-- reward or cooperation policy.

CREATE OR REPLACE FUNCTION public.correct_s_store_sell_through(
  p_record_id uuid,
  p_period_type text DEFAULT NULL,
  p_period_start date DEFAULT NULL,
  p_period_end date DEFAULT NULL,
  p_open_system_sold_qty integer DEFAULT NULL,
  p_disposable_sold_qty integer DEFAULT NULL,
  p_correction_reason text DEFAULT '',
  p_correction_note text DEFAULT ''
)
RETURNS public.s_store_sell_through
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record public.s_store_sell_through;
  v_updated public.s_store_sell_through;
BEGIN
  IF p_correction_reason IS NULL OR btrim(p_correction_reason) = '' THEN
    RAISE EXCEPTION 'S Store correction requires a reason.';
  END IF;

  SELECT * INTO v_record
  FROM public.s_store_sell_through
  WHERE id = p_record_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'S Store sell-through record was not found.';
  END IF;

  IF NOT public.can_manage_s_store(v_record.store_id) THEN
    RAISE EXCEPTION 'S Store locked history correction is not allowed.';
  END IF;

  UPDATE public.s_store_sell_through
  SET
    period_type = COALESCE(p_period_type, period_type),
    period_start = COALESCE(p_period_start, period_start),
    period_end = COALESCE(p_period_end, period_end),
    open_system_sold_qty = COALESCE(p_open_system_sold_qty, open_system_sold_qty),
    disposable_sold_qty = COALESCE(p_disposable_sold_qty, disposable_sold_qty),
    corrected_by = auth.uid(),
    corrected_at = now(),
    correction_reason = p_correction_reason,
    correction_note = p_correction_note,
    locked = true,
    updated_at = now()
  WHERE id = p_record_id
  RETURNING * INTO v_updated;

  PERFORM public.write_s_store_audit(
    v_record.store_id,
    'S Store sell-through corrected',
    row_to_json(v_record)::text,
    row_to_json(v_updated)::text,
    p_correction_reason,
    'high'
  );

  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.correct_s_store_product_inventory(
  p_record_id uuid,
  p_open_system_current_stock integer DEFAULT NULL,
  p_open_system_target_stock integer DEFAULT NULL,
  p_disposable_current_stock integer DEFAULT NULL,
  p_disposable_target_stock integer DEFAULT NULL,
  p_note text DEFAULT '',
  p_correction_reason text DEFAULT '',
  p_correction_note text DEFAULT ''
)
RETURNS public.s_store_product_inventory_snapshots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record public.s_store_product_inventory_snapshots;
  v_updated public.s_store_product_inventory_snapshots;
  v_open_current integer;
  v_open_target integer;
  v_disposable_current integer;
  v_disposable_target integer;
  v_open_low_stock boolean;
  v_disposable_low_stock boolean;
BEGIN
  IF p_correction_reason IS NULL OR btrim(p_correction_reason) = '' THEN
    RAISE EXCEPTION 'S Store correction requires a reason.';
  END IF;

  SELECT * INTO v_record
  FROM public.s_store_product_inventory_snapshots
  WHERE id = p_record_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'S Store product inventory record was not found.';
  END IF;

  IF NOT public.can_manage_s_store(v_record.store_id) THEN
    RAISE EXCEPTION 'S Store locked history correction is not allowed.';
  END IF;

  v_open_current := COALESCE(p_open_system_current_stock, v_record.open_system_current_stock);
  v_open_target := COALESCE(p_open_system_target_stock, v_record.open_system_target_stock);
  v_disposable_current := COALESCE(p_disposable_current_stock, v_record.disposable_current_stock);
  v_disposable_target := COALESCE(p_disposable_target_stock, v_record.disposable_target_stock);
  v_open_low_stock := v_open_target > 0 AND v_open_current <= (v_open_target / 3.0);
  v_disposable_low_stock := v_disposable_target > 0 AND v_disposable_current <= (v_disposable_target / 3.0);

  UPDATE public.s_store_product_inventory_snapshots
  SET
    open_system_current_stock = v_open_current,
    open_system_target_stock = v_open_target,
    disposable_current_stock = v_disposable_current,
    disposable_target_stock = v_disposable_target,
    open_system_low_stock = v_open_low_stock,
    disposable_low_stock = v_disposable_low_stock,
    low_stock = v_open_low_stock OR v_disposable_low_stock,
    note = COALESCE(NULLIF(p_note, ''), note),
    corrected_by = auth.uid(),
    corrected_at = now(),
    correction_reason = p_correction_reason,
    correction_note = p_correction_note,
    locked = true,
    updated_at = now()
  WHERE id = p_record_id
  RETURNING * INTO v_updated;

  PERFORM public.write_s_store_audit(
    v_record.store_id,
    'S Store product inventory corrected',
    row_to_json(v_record)::text,
    row_to_json(v_updated)::text,
    p_correction_reason,
    CASE WHEN v_updated.low_stock THEN 'high' ELSE 'medium' END
  );

  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.correct_s_store_material_inventory(
  p_record_id uuid,
  p_material_type text DEFAULT NULL,
  p_current_quantity integer DEFAULT NULL,
  p_target_quantity integer DEFAULT NULL,
  p_note text DEFAULT '',
  p_correction_reason text DEFAULT '',
  p_correction_note text DEFAULT ''
)
RETURNS public.s_store_material_inventory_snapshots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record public.s_store_material_inventory_snapshots;
  v_updated public.s_store_material_inventory_snapshots;
  v_current_quantity integer;
  v_target_quantity integer;
  v_low_stock boolean;
BEGIN
  IF p_correction_reason IS NULL OR btrim(p_correction_reason) = '' THEN
    RAISE EXCEPTION 'S Store correction requires a reason.';
  END IF;

  SELECT * INTO v_record
  FROM public.s_store_material_inventory_snapshots
  WHERE id = p_record_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'S Store material inventory record was not found.';
  END IF;

  IF NOT public.can_manage_s_store(v_record.store_id) THEN
    RAISE EXCEPTION 'S Store locked history correction is not allowed.';
  END IF;

  v_current_quantity := COALESCE(p_current_quantity, v_record.current_quantity);
  v_target_quantity := COALESCE(p_target_quantity, v_record.target_quantity);
  v_low_stock := v_target_quantity > 0 AND v_current_quantity <= (v_target_quantity / 3.0);

  UPDATE public.s_store_material_inventory_snapshots
  SET
    material_type = COALESCE(p_material_type, material_type),
    current_quantity = v_current_quantity,
    target_quantity = v_target_quantity,
    low_stock = v_low_stock,
    note = COALESCE(NULLIF(p_note, ''), note),
    corrected_by = auth.uid(),
    corrected_at = now(),
    correction_reason = p_correction_reason,
    correction_note = p_correction_note,
    locked = true,
    updated_at = now()
  WHERE id = p_record_id
  RETURNING * INTO v_updated;

  PERFORM public.write_s_store_audit(
    v_record.store_id,
    'S Store material inventory corrected',
    row_to_json(v_record)::text,
    row_to_json(v_updated)::text,
    p_correction_reason,
    CASE WHEN v_updated.low_stock THEN 'high' ELSE 'medium' END
  );

  RETURN v_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.correct_s_store_sell_through(uuid, text, date, date, integer, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.correct_s_store_product_inventory(uuid, integer, integer, integer, integer, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.correct_s_store_material_inventory(uuid, text, integer, integer, text, text, text) TO authenticated;
