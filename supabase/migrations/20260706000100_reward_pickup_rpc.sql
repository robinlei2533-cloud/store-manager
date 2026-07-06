-- Production reward pickup closure.
-- Store owners must confirm fan reward pickup through this RPC so code
-- validation, S-level eligibility, stock deduction, and redemption status
-- update happen in one database transaction.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.mall_redemptions ADD COLUMN IF NOT EXISTS item_id TEXT;
ALTER TABLE public.mall_redemptions ADD COLUMN IF NOT EXISTS item_name TEXT;
ALTER TABLE public.mall_redemptions ADD COLUMN IF NOT EXISTS points_cost INT;
ALTER TABLE public.mall_redemptions ADD COLUMN IF NOT EXISTS redeem_code TEXT;
ALTER TABLE public.mall_redemptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.mall_redemptions ADD COLUMN IF NOT EXISTS pickup_store_id UUID REFERENCES public.stores(id);
ALTER TABLE public.mall_redemptions ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ;
ALTER TABLE public.mall_redemptions ADD COLUMN IF NOT EXISTS picked_up_by UUID REFERENCES public.profiles(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mall_redemptions_redeem_code
  ON public.mall_redemptions (upper(redeem_code))
  WHERE redeem_code IS NOT NULL;

ALTER TABLE public.mall_redemptions DROP CONSTRAINT IF EXISTS mall_redemptions_status_check;
ALTER TABLE public.mall_redemptions
  ADD CONSTRAINT mall_redemptions_status_check
  CHECK (status IN ('pending', 'completed', 'cancelled', 'pending_pickup', 'picked_up', 'expired'));

CREATE OR REPLACE FUNCTION public.confirm_reward_pickup(p_redeem_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code text := upper(trim(p_redeem_code));
  current_store public.stores%ROWTYPE;
  redemption_row public.mall_redemptions%ROWTYPE;
  stock_row public.material_stocks%ROWTYPE;
  matched_material_id uuid;
  current_qty integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF normalized_code IS NULL OR normalized_code = '' THEN
    RAISE EXCEPTION 'Redemption code is required';
  END IF;

  SELECT * INTO current_store
  FROM public.stores AS stores
  WHERE stores.owner_profile_id = auth.uid()
  ORDER BY stores.updated_at DESC NULLS LAST
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Store owner profile is not bound to a store';
  END IF;

  IF current_store.level <> 'S' THEN
    RAISE EXCEPTION 'Only S-level UWELL stores can fulfill rewards';
  END IF;

  SELECT * INTO redemption_row
  FROM public.mall_redemptions AS mall_redemptions
  WHERE upper(mall_redemptions.redeem_code) = normalized_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code not found';
  END IF;

  IF redemption_row.status = 'picked_up' THEN
    RAISE EXCEPTION 'Code already used';
  END IF;

  IF redemption_row.status <> 'pending_pickup' THEN
    RAISE EXCEPTION 'Code is not available for pickup';
  END IF;

  IF redemption_row.expires_at IS NOT NULL AND redemption_row.expires_at < now() THEN
    UPDATE public.mall_redemptions
    SET status = 'expired'
    WHERE id = redemption_row.id;
    RAISE EXCEPTION 'Code expired';
  END IF;

  SELECT materials.id INTO matched_material_id
  FROM public.materials AS materials
  WHERE materials.id::text = redemption_row.item_id
     OR lower(materials.name) = lower(COALESCE(redemption_row.item_name, redemption_row.product_name))
  ORDER BY
    CASE WHEN materials.id::text = redemption_row.item_id THEN 0 ELSE 1 END,
    materials.created_at ASC NULLS LAST
  LIMIT 1;

  IF matched_material_id IS NULL THEN
    RAISE EXCEPTION 'Reward material is not mapped to inventory';
  END IF;

  SELECT * INTO stock_row
  FROM public.material_stocks AS material_stocks
  WHERE material_stocks.store_id = current_store.id
    AND material_stocks.material_id = matched_material_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward stock is not enough. Request replenishment.';
  END IF;

  current_qty := COALESCE(stock_row.qty, stock_row.quantity, 0);
  IF current_qty <= 0 THEN
    RAISE EXCEPTION 'Reward stock is not enough. Request replenishment.';
  END IF;

  UPDATE public.material_stocks
  SET quantity = GREATEST(COALESCE(quantity, current_qty) - 1, 0),
      qty = GREATEST(COALESCE(qty, current_qty) - 1, 0),
      updated_at = now()
  WHERE id = stock_row.id
  RETURNING * INTO stock_row;

  INSERT INTO public.material_outbound (
    material_id,
    store_id,
    quantity,
    created_by,
    notes,
    status,
    created_at
  )
  VALUES (
    matched_material_id,
    current_store.id,
    1,
    auth.uid(),
    'Reward redemption pickup: ' || normalized_code,
    'completed',
    now()
  );

  UPDATE public.mall_redemptions
  SET status = 'picked_up',
      pickup_store_id = current_store.id,
      picked_up_at = now(),
      picked_up_by = auth.uid()
  WHERE id = redemption_row.id
  RETURNING * INTO redemption_row;

  RETURN jsonb_build_object(
    'success', true,
    'redemption_id', redemption_row.id,
    'redeem_code', redemption_row.redeem_code,
    'status', redemption_row.status,
    'pickup_store_id', current_store.id,
    'material_id', matched_material_id,
    'remaining_quantity', COALESCE(stock_row.qty, stock_row.quantity, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_reward_pickup(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_reward_pickup(text) TO authenticated;
