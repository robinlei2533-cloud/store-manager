-- Re-runnable setup for reward pickup RPC acceptance.
-- After this file, sign in as store.owner@uwell.com / admin and call:
--   supabase.rpc('confirm_reward_pickup', { p_redeem_code: 'UW-RPCHECK1' })

BEGIN;

WITH owner_user AS (
  SELECT id
  FROM auth.users
  WHERE lower(email) = 'store.owner@uwell.com'
),
fan_user AS (
  SELECT id
  FROM auth.users
  WHERE lower(email) = 'fan.preview@uwell.com'
),
target_store AS (
  SELECT stores.id
  FROM public.stores AS stores
  JOIN owner_user ON owner_user.id = stores.owner_profile_id
  ORDER BY stores.updated_at DESC NULLS LAST
  LIMIT 1
),
updated_store AS (
  UPDATE public.stores
  SET level = 'S',
      status = COALESCE(status, 'active'),
      updated_at = now()
  WHERE id = (SELECT id FROM target_store)
  RETURNING id
),
target_fan AS (
  SELECT fans.id
  FROM public.fans AS fans
  JOIN fan_user ON fan_user.id = fans.user_id
  ORDER BY fans.updated_at DESC NULLS LAST
  LIMIT 1
),
existing_material AS (
  SELECT id
  FROM public.materials
  WHERE lower(name) = lower('UWELL G4 Device')
  ORDER BY created_at ASC NULLS LAST
  LIMIT 1
),
inserted_material AS (
  INSERT INTO public.materials (name, sku, unit, unit_cost, category, created_at, updated_at)
  SELECT 'UWELL G4 Device', 'REWARD-G4-DEVICE', 'pcs', 0, 'Reward', now(), now()
  WHERE NOT EXISTS (SELECT 1 FROM existing_material)
  RETURNING id
),
target_material AS (
  SELECT id FROM existing_material
  UNION ALL
  SELECT id FROM inserted_material
  LIMIT 1
),
upserted_stock AS (
  INSERT INTO public.material_stocks (material_id, store_id, quantity, qty, min_quantity, safety_stock, created_at, updated_at)
  SELECT target_material.id, updated_store.id, 3, 3, 1, 1, now(), now()
  FROM target_material, updated_store
  ON CONFLICT (material_id, store_id) DO UPDATE
  SET quantity = 3,
      qty = 3,
      min_quantity = 1,
      safety_stock = 1,
      updated_at = now()
  RETURNING id
),
deleted_old AS (
  DELETE FROM public.mall_redemptions
  WHERE upper(redeem_code) = 'UW-RPCHECK1'
  RETURNING id
)
INSERT INTO public.mall_redemptions (
  fan_id,
  product_name,
  points_spent,
  quantity,
  status,
  item_id,
  item_name,
  points_cost,
  redeem_code,
  expires_at,
  created_at
)
SELECT
  target_fan.id,
  'UWELL G4 Device',
  800,
  1,
  'pending_pickup',
  target_material.id::text,
  'UWELL G4 Device',
  800,
  'UW-RPCHECK1',
  now() + interval '7 days',
  now()
FROM target_fan, target_material;

COMMIT;

SELECT
  'reward pickup rpc setup ready' AS result,
  stores.id AS store_id,
  stores.level AS store_level,
  fans.id AS fan_id,
  materials.id AS material_id,
  material_stocks.qty AS stock_qty,
  mall_redemptions.redeem_code,
  mall_redemptions.status
FROM public.mall_redemptions
JOIN public.fans ON fans.id = mall_redemptions.fan_id
JOIN public.stores ON stores.id = fans.store_id
JOIN public.materials ON materials.id::text = mall_redemptions.item_id
JOIN public.material_stocks
  ON material_stocks.material_id = materials.id
 AND material_stocks.store_id = stores.id
WHERE upper(mall_redemptions.redeem_code) = 'UW-RPCHECK1';
