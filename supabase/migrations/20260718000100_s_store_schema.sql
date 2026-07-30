-- S Store V1 production schema draft.
-- Additive only: this migration defines S Store current-state fields and
-- dedicated historical/operation tables. RLS policies and RPCs are separate
-- confirmed tasks.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS is_s_store BOOLEAN DEFAULT false;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS s_store_status TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS became_s_at TIMESTAMPTZ;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS s_store_source TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS cooperation_note TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stores_s_store_status_check'
  ) THEN
    ALTER TABLE public.stores
      ADD CONSTRAINT stores_s_store_status_check
      CHECK (
        s_store_status IS NULL
        OR s_store_status IN (
          'active',
          'needs_follow_up',
          'paused',
          'downgraded',
          'under_review'
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stores_s_store_status
  ON public.stores (s_store_status);

CREATE INDEX IF NOT EXISTS idx_stores_is_s_store
  ON public.stores (is_s_store);

CREATE TABLE IF NOT EXISTS public.s_store_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  before_status TEXT,
  after_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  note TEXT,
  operator_id UUID REFERENCES public.profiles(id),
  action_at TIMESTAMPTZ DEFAULT now(),
  related_record_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT s_store_status_history_action_type_check
    CHECK (action_type IN ('promote_to_s', 'downgrade_to_a', 'restore_to_s', 'pause', 'status_correction'))
);

CREATE INDEX IF NOT EXISTS idx_s_store_status_history_store_id
  ON public.s_store_status_history (store_id);

CREATE INDEX IF NOT EXISTS idx_s_store_status_history_action_at
  ON public.s_store_status_history (action_at DESC);

CREATE TABLE IF NOT EXISTS public.s_store_sell_through (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  open_system_sold_qty INT NOT NULL DEFAULT 0,
  disposable_sold_qty INT NOT NULL DEFAULT 0,
  submitted_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  locked BOOLEAN DEFAULT true,
  corrected_by UUID REFERENCES public.profiles(id),
  corrected_at TIMESTAMPTZ,
  correction_reason TEXT,
  correction_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT s_store_sell_through_period_type_check
    CHECK (period_type IN ('weekly', 'monthly')),
  CONSTRAINT s_store_sell_through_non_negative_check
    CHECK (open_system_sold_qty >= 0 AND disposable_sold_qty >= 0),
  UNIQUE (store_id, period_type, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_s_store_sell_through_store_id
  ON public.s_store_sell_through (store_id);

CREATE INDEX IF NOT EXISTS idx_s_store_sell_through_period
  ON public.s_store_sell_through (period_type, period_start, period_end);

CREATE TABLE IF NOT EXISTS public.s_store_product_inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  open_system_current_stock INT NOT NULL DEFAULT 0,
  open_system_target_stock INT NOT NULL DEFAULT 0,
  disposable_current_stock INT NOT NULL DEFAULT 0,
  disposable_target_stock INT NOT NULL DEFAULT 0,
  open_system_low_stock BOOLEAN DEFAULT false,
  disposable_low_stock BOOLEAN DEFAULT false,
  low_stock BOOLEAN DEFAULT false,
  submitted_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  locked BOOLEAN DEFAULT true,
  note TEXT,
  corrected_by UUID REFERENCES public.profiles(id),
  corrected_at TIMESTAMPTZ,
  correction_reason TEXT,
  correction_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT s_store_product_inventory_non_negative_check
    CHECK (
      open_system_current_stock >= 0
      AND open_system_target_stock >= 0
      AND disposable_current_stock >= 0
      AND disposable_target_stock >= 0
    )
);

CREATE INDEX IF NOT EXISTS idx_s_store_product_inventory_store_id
  ON public.s_store_product_inventory_snapshots (store_id);

CREATE INDEX IF NOT EXISTS idx_s_store_product_inventory_submitted_at
  ON public.s_store_product_inventory_snapshots (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_s_store_product_inventory_low_stock
  ON public.s_store_product_inventory_snapshots (low_stock);

CREATE TABLE IF NOT EXISTS public.s_store_material_inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL,
  current_quantity INT NOT NULL DEFAULT 0,
  target_quantity INT NOT NULL DEFAULT 0,
  low_stock BOOLEAN DEFAULT false,
  submitted_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  locked BOOLEAN DEFAULT true,
  note TEXT,
  corrected_by UUID REFERENCES public.profiles(id),
  corrected_at TIMESTAMPTZ,
  correction_reason TEXT,
  correction_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT s_store_material_inventory_non_negative_check
    CHECK (current_quantity >= 0 AND target_quantity >= 0)
);

CREATE INDEX IF NOT EXISTS idx_s_store_material_inventory_store_id
  ON public.s_store_material_inventory_snapshots (store_id);

CREATE INDEX IF NOT EXISTS idx_s_store_material_inventory_submitted_at
  ON public.s_store_material_inventory_snapshots (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_s_store_material_inventory_low_stock
  ON public.s_store_material_inventory_snapshots (low_stock);

CREATE TABLE IF NOT EXISTS public.s_store_visit_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  field_rep_id UUID REFERENCES public.profiles(id),
  inventory_status TEXT,
  display_status TEXT,
  sell_through_observation TEXT,
  competitor_situation TEXT,
  hot_brands TEXT,
  hot_flavors TEXT,
  consumer_feedback TEXT,
  market_notes TEXT,
  support_needed TEXT,
  replenishment_needed BOOLEAN DEFAULT false,
  visit_photos TEXT[],
  submitted_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (visit_id)
);

CREATE INDEX IF NOT EXISTS idx_s_store_visit_details_store_id
  ON public.s_store_visit_details (store_id);

CREATE INDEX IF NOT EXISTS idx_s_store_visit_details_field_rep_id
  ON public.s_store_visit_details (field_rep_id);

CREATE INDEX IF NOT EXISTS idx_s_store_visit_details_submitted_at
  ON public.s_store_visit_details (submitted_at DESC);

CREATE TABLE IF NOT EXISTS public.s_store_replenishment_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  trigger_source TEXT NOT NULL,
  item_type TEXT NOT NULL,
  requested_quantity INT NOT NULL DEFAULT 0,
  assigned_rep_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  completion_photos TEXT[],
  note TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT s_store_replenishment_tasks_trigger_source_check
    CHECK (trigger_source IN ('low_stock', 'field_visit', 'store_request', 'backend')),
  CONSTRAINT s_store_replenishment_tasks_item_type_check
    CHECK (item_type IN ('open_system', 'disposable', 'material', 'mixed')),
  CONSTRAINT s_store_replenishment_tasks_status_check
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT s_store_replenishment_tasks_quantity_check
    CHECK (requested_quantity >= 0)
);

CREATE INDEX IF NOT EXISTS idx_s_store_replenishment_tasks_store_id
  ON public.s_store_replenishment_tasks (store_id);

CREATE INDEX IF NOT EXISTS idx_s_store_replenishment_tasks_assigned_rep_id
  ON public.s_store_replenishment_tasks (assigned_rep_id);

CREATE INDEX IF NOT EXISTS idx_s_store_replenishment_tasks_status
  ON public.s_store_replenishment_tasks (status);

ALTER TABLE public.s_store_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_sell_through ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_product_inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_material_inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_visit_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_store_replenishment_tasks ENABLE ROW LEVEL SECURITY;
