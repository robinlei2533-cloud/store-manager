-- UWELL CRM trial-ops alignment migration
-- Non-destructive patch for the current trial version. Safe for an existing Supabase project:
-- it only adds missing columns/indexes and creates or replaces RPC helpers used by the frontend.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Location fields required by fan/store registration and city-based recommendations.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.fans ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.fans ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS display_status TEXT DEFAULT 'pending';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS rating_status TEXT DEFAULT 'active';

-- Keep old stock column names and current frontend names both available during trial migration.
ALTER TABLE public.material_stocks ADD COLUMN IF NOT EXISTS qty INT;
ALTER TABLE public.material_stocks ADD COLUMN IF NOT EXISTS safety_stock INT;
UPDATE public.material_stocks
SET qty = COALESCE(qty, quantity, 0),
    safety_stock = COALESCE(safety_stock, min_quantity, 10)
WHERE qty IS NULL OR safety_stock IS NULL;

-- Scan records created by the current QR flow.
ALTER TABLE public.scan_records ADD COLUMN IF NOT EXISTS qr_code_id UUID REFERENCES public.qr_codes(id);
ALTER TABLE public.scan_records ADD COLUMN IF NOT EXISTS points_earned INT DEFAULT 0;
ALTER TABLE public.scan_records ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_country_city ON public.profiles(country, city);
CREATE INDEX IF NOT EXISTS idx_fans_country_city ON public.fans(country, city);
CREATE INDEX IF NOT EXISTS idx_stores_country_city ON public.stores(country, city);
CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores(status);
CREATE INDEX IF NOT EXISTS idx_scan_records_scanned_at ON public.scan_records(scanned_at);

CREATE OR REPLACE FUNCTION public.get_low_stock_count()
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.material_stocks
  WHERE COALESCE(qty, quantity, 0) <= COALESCE(safety_stock, min_quantity, 10);
$$;

CREATE OR REPLACE FUNCTION public.get_visit_trend(days_count integer DEFAULT 30)
RETURNS TABLE(visit_date date, count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT v.visit_date::date, COUNT(*)::bigint
  FROM public.visits v
  WHERE v.visit_date >= CURRENT_DATE - GREATEST(days_count - 1, 0)
  GROUP BY v.visit_date::date
  ORDER BY v.visit_date::date;
$$;

CREATE OR REPLACE FUNCTION public.get_scan_trend(days_count integer DEFAULT 30)
RETURNS TABLE(scan_date date, count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(sr.scanned_at, sr.created_at)::date AS scan_date, COUNT(*)::bigint
  FROM public.scan_records sr
  WHERE COALESCE(sr.scanned_at, sr.created_at)::date >= CURRENT_DATE - GREATEST(days_count - 1, 0)
  GROUP BY COALESCE(sr.scanned_at, sr.created_at)::date
  ORDER BY COALESCE(sr.scanned_at, sr.created_at)::date;
$$;

CREATE OR REPLACE FUNCTION public.scan_qr_code(qr_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  qr_row public.qr_codes%ROWTYPE;
  fan_row public.fans%ROWTYPE;
  new_scan_id uuid;
BEGIN
  SELECT * INTO qr_row
  FROM public.qr_codes
  WHERE id = qr_id AND COALESCE(is_active, true) = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'QR code invalid or disabled';
  END IF;

  SELECT * INTO fan_row
  FROM public.fans
  WHERE store_id = qr_row.store_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No fan account for this store';
  END IF;

  UPDATE public.qr_codes
  SET scan_count = COALESCE(scan_count, 0) + 1,
      updated_at = now()
  WHERE id = qr_row.id;

  INSERT INTO public.scan_records (qr_code_id, fan_id, product_id, store_id, points_earned, scanned_at)
  VALUES (qr_row.id, fan_row.id, qr_row.product_id, qr_row.store_id, COALESCE(qr_row.points, 0), now())
  RETURNING id INTO new_scan_id;

  UPDATE public.fans
  SET points = COALESCE(points, 0) + COALESCE(qr_row.points, 0),
      total_contribution = COALESCE(total_contribution, 0) + COALESCE(qr_row.points, 0),
      updated_at = now()
  WHERE id = fan_row.id
  RETURNING * INTO fan_row;

  INSERT INTO public.fan_points_log (fan_id, points, type, source, description)
  VALUES (fan_row.id, COALESCE(qr_row.points, 0), 'earn', 'scan', 'Product scan');

  RETURN jsonb_build_object(
    'success', true,
    'scan_id', new_scan_id,
    'points', COALESCE(qr_row.points, 0),
    'fan_id', fan_row.id,
    'product_id', qr_row.product_id,
    'store_id', qr_row.store_id
  );
END;
$$;