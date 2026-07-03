-- Trial operations readiness: region data and store review state.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.fans
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stores_status_check'
      AND conrelid = 'public.stores'::regclass
  ) THEN
    ALTER TABLE public.stores
      ADD CONSTRAINT stores_status_check
      CHECK (status IN ('active', 'pending_review', 'inactive', 'rejected'));
  END IF;
END $$;

UPDATE public.stores
SET
  country = COALESCE(country, 'Saudi Arabia'),
  city = COALESCE(city, 'Riyadh'),
  status = COALESCE(status, 'active')
WHERE country IS NULL
   OR city IS NULL
   OR status IS NULL;
