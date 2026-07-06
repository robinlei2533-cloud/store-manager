-- Supabase RLS role policies for controlled external preview.
-- This migration is additive and keeps existing trial data intact.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'rep', 'fan', 'store_owner'));

ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS owner_profile_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS rep_id UUID REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_stores_owner_profile_id ON public.stores(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_stores_rep_id ON public.stores(rep_id);

CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() IN ('admin', 'manager'), false);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() = 'admin', false);
$$;

CREATE OR REPLACE FUNCTION public.is_rep_assigned_to_store(target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.current_profile_role() = 'rep'
    AND target_store_id IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = target_store_id
          AND s.rep_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.visits v
        WHERE v.store_id = target_store_id
          AND v.rep_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.store_tasks st
        WHERE st.store_id = target_store_id
          AND st.assignee_id = auth.uid()
      )
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_store_owner(target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.current_profile_role() = 'store_owner'
    AND target_store_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.stores s
      WHERE s.id = target_store_id
        AND s.owner_profile_id = auth.uid()
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_fan_owner(target_fan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    target_fan_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.fans f
      WHERE f.id = target_fan_id
        AND f.user_id = auth.uid()
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_store(target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.is_admin_or_manager()
    OR public.is_rep_assigned_to_store(target_store_id)
    OR public.is_store_owner(target_store_id)
    OR EXISTS (
      SELECT 1
      FROM public.fans f
      WHERE f.store_id = target_store_id
        AND f.user_id = auth.uid()
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_fan(target_fan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.is_admin_or_manager()
    OR public.is_fan_owner(target_fan_id)
    OR EXISTS (
      SELECT 1
      FROM public.fans f
      WHERE f.id = target_fan_id
        AND (
          public.is_store_owner(f.store_id)
          OR public.is_rep_assigned_to_store(f.store_id)
        )
    ),
    false
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mall_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_inbound ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_outbound ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_points_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_level_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_scoped ON public.profiles;
CREATE POLICY profiles_select_scoped ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin_or_manager());

DROP POLICY IF EXISTS profiles_insert_self_or_admin ON public.profiles;
CREATE POLICY profiles_insert_self_or_admin ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_admin_or_manager());

DROP POLICY IF EXISTS profiles_update_self_or_admin ON public.profiles;
CREATE POLICY profiles_update_self_or_admin ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin_or_manager())
  WITH CHECK (id = auth.uid() OR public.is_admin_or_manager());

DROP POLICY IF EXISTS profiles_delete_admin ON public.profiles;
CREATE POLICY profiles_delete_admin ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin_role());

DROP POLICY IF EXISTS stores_select_scoped ON public.stores;
CREATE POLICY stores_select_scoped ON public.stores
  FOR SELECT TO authenticated
  USING (public.can_access_store(id));

DROP POLICY IF EXISTS stores_insert_admin_or_owner ON public.stores;
CREATE POLICY stores_insert_admin_or_owner ON public.stores
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_manager()
    OR (public.current_profile_role() = 'store_owner' AND owner_profile_id = auth.uid())
  );

DROP POLICY IF EXISTS stores_update_admin_or_owner ON public.stores;
CREATE POLICY stores_update_admin_or_owner ON public.stores
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR public.is_store_owner(id))
  WITH CHECK (public.is_admin_or_manager() OR owner_profile_id = auth.uid());

DROP POLICY IF EXISTS stores_delete_admin ON public.stores;
CREATE POLICY stores_delete_admin ON public.stores
  FOR DELETE TO authenticated
  USING (public.is_admin_role());

DROP POLICY IF EXISTS visits_select_scoped ON public.visits;
CREATE POLICY visits_select_scoped ON public.visits
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR rep_id = auth.uid() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS visits_write_internal ON public.visits;
CREATE POLICY visits_write_internal ON public.visits
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR rep_id = auth.uid())
  WITH CHECK (public.is_admin_or_manager() OR rep_id = auth.uid());

DROP POLICY IF EXISTS visit_sales_select_by_visit ON public.visit_sales;
CREATE POLICY visit_sales_select_by_visit ON public.visit_sales
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM public.visits v
      WHERE v.id = visit_id
        AND (v.rep_id = auth.uid() OR public.can_access_store(v.store_id))
    )
  );

DROP POLICY IF EXISTS visit_sales_write_internal ON public.visit_sales;
CREATE POLICY visit_sales_write_internal ON public.visit_sales
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS visit_photos_select_by_visit ON public.visit_photos;
CREATE POLICY visit_photos_select_by_visit ON public.visit_photos
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM public.visits v
      WHERE v.id = visit_id
        AND (v.rep_id = auth.uid() OR public.can_access_store(v.store_id))
    )
  );

DROP POLICY IF EXISTS visit_photos_write_internal ON public.visit_photos;
CREATE POLICY visit_photos_write_internal ON public.visit_photos
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS fans_select_scoped ON public.fans;
CREATE POLICY fans_select_scoped ON public.fans
  FOR SELECT TO authenticated
  USING (public.can_access_fan(id));

DROP POLICY IF EXISTS fans_insert_self_or_admin ON public.fans;
CREATE POLICY fans_insert_self_or_admin ON public.fans
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR user_id = auth.uid());

DROP POLICY IF EXISTS fans_update_scoped ON public.fans;
CREATE POLICY fans_update_scoped ON public.fans
  FOR UPDATE TO authenticated
  USING (public.can_access_fan(id))
  WITH CHECK (public.is_admin_or_manager() OR user_id = auth.uid() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS fans_delete_admin ON public.fans;
CREATE POLICY fans_delete_admin ON public.fans
  FOR DELETE TO authenticated
  USING (public.is_admin_role());

DROP POLICY IF EXISTS fan_points_log_select_scoped ON public.fan_points_log;
CREATE POLICY fan_points_log_select_scoped ON public.fan_points_log
  FOR SELECT TO authenticated
  USING (public.can_access_fan(fan_id));

DROP POLICY IF EXISTS fan_points_log_write_internal ON public.fan_points_log;
CREATE POLICY fan_points_log_write_internal ON public.fan_points_log
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager() OR public.is_fan_owner(fan_id));

DROP POLICY IF EXISTS fan_checkins_select_scoped ON public.fan_checkins;
CREATE POLICY fan_checkins_select_scoped ON public.fan_checkins
  FOR SELECT TO authenticated
  USING (public.can_access_fan(fan_id));

DROP POLICY IF EXISTS fan_checkins_write_owner ON public.fan_checkins;
CREATE POLICY fan_checkins_write_owner ON public.fan_checkins
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_fan_owner(fan_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_fan_owner(fan_id));

DROP POLICY IF EXISTS lottery_records_select_scoped ON public.lottery_records;
CREATE POLICY lottery_records_select_scoped ON public.lottery_records
  FOR SELECT TO authenticated
  USING (public.can_access_fan(fan_id));

DROP POLICY IF EXISTS lottery_records_write_owner ON public.lottery_records;
CREATE POLICY lottery_records_write_owner ON public.lottery_records
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_fan_owner(fan_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_fan_owner(fan_id));

DROP POLICY IF EXISTS mall_redemptions_select_scoped ON public.mall_redemptions;
CREATE POLICY mall_redemptions_select_scoped ON public.mall_redemptions
  FOR SELECT TO authenticated
  USING (public.can_access_fan(fan_id));

DROP POLICY IF EXISTS mall_redemptions_write_owner ON public.mall_redemptions;
CREATE POLICY mall_redemptions_write_owner ON public.mall_redemptions
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_fan_owner(fan_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_fan_owner(fan_id));

DROP POLICY IF EXISTS community_posts_select_authenticated ON public.community_posts;
CREATE POLICY community_posts_select_authenticated ON public.community_posts
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS community_posts_write_owner ON public.community_posts;
CREATE POLICY community_posts_write_owner ON public.community_posts
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_fan_owner(fan_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_fan_owner(fan_id));

DROP POLICY IF EXISTS community_comments_select_authenticated ON public.community_comments;
CREATE POLICY community_comments_select_authenticated ON public.community_comments
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS community_comments_write_owner ON public.community_comments;
CREATE POLICY community_comments_write_owner ON public.community_comments
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_fan_owner(fan_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_fan_owner(fan_id));

DROP POLICY IF EXISTS campaigns_select_authenticated ON public.campaigns;
CREATE POLICY campaigns_select_authenticated ON public.campaigns
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS campaigns_write_internal ON public.campaigns;
CREATE POLICY campaigns_write_internal ON public.campaigns
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS campaign_tasks_select_scoped ON public.campaign_tasks;
CREATE POLICY campaign_tasks_select_scoped ON public.campaign_tasks
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR assignee_id = auth.uid());

DROP POLICY IF EXISTS campaign_tasks_write_internal ON public.campaign_tasks;
CREATE POLICY campaign_tasks_write_internal ON public.campaign_tasks
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR assignee_id = auth.uid())
  WITH CHECK (public.is_admin_or_manager() OR assignee_id = auth.uid());

DROP POLICY IF EXISTS campaign_reports_select_scoped ON public.campaign_reports;
CREATE POLICY campaign_reports_select_scoped ON public.campaign_reports
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR rep_id = auth.uid() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS campaign_reports_write_scoped ON public.campaign_reports;
CREATE POLICY campaign_reports_write_scoped ON public.campaign_reports
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR rep_id = auth.uid() OR public.can_access_store(store_id))
  WITH CHECK (public.is_admin_or_manager() OR rep_id = auth.uid() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS campaign_claims_select_scoped ON public.campaign_claims;
CREATE POLICY campaign_claims_select_scoped ON public.campaign_claims
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_manager()
    OR public.can_access_store(store_id)
    OR public.can_access_fan(fan_id)
  );

DROP POLICY IF EXISTS campaign_claims_write_scoped ON public.campaign_claims;
CREATE POLICY campaign_claims_write_scoped ON public.campaign_claims
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_manager()
    OR public.is_store_owner(store_id)
    OR public.is_fan_owner(fan_id)
  )
  WITH CHECK (
    public.is_admin_or_manager()
    OR public.is_store_owner(store_id)
    OR public.is_fan_owner(fan_id)
  );

DROP POLICY IF EXISTS campaign_reviews_select_scoped ON public.campaign_reviews;
CREATE POLICY campaign_reviews_select_scoped ON public.campaign_reviews
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS campaign_reviews_write_scoped ON public.campaign_reviews;
CREATE POLICY campaign_reviews_write_scoped ON public.campaign_reviews
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_store_owner(store_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_store_owner(store_id));

DROP POLICY IF EXISTS qr_codes_select_scoped ON public.qr_codes;
CREATE POLICY qr_codes_select_scoped ON public.qr_codes
  FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS qr_codes_write_internal ON public.qr_codes;
CREATE POLICY qr_codes_write_internal ON public.qr_codes
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_store_owner(store_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_store_owner(store_id));

DROP POLICY IF EXISTS scan_records_select_scoped ON public.scan_records;
CREATE POLICY scan_records_select_scoped ON public.scan_records
  FOR SELECT TO authenticated
  USING (public.can_access_fan(fan_id) OR public.can_access_store(store_id));

DROP POLICY IF EXISTS scan_records_write_owner ON public.scan_records;
CREATE POLICY scan_records_write_owner ON public.scan_records
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_fan_owner(fan_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_fan_owner(fan_id));

DROP POLICY IF EXISTS materials_select_authenticated ON public.materials;
CREATE POLICY materials_select_authenticated ON public.materials
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS materials_write_internal ON public.materials;
CREATE POLICY materials_write_internal ON public.materials
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS material_stocks_select_scoped ON public.material_stocks;
CREATE POLICY material_stocks_select_scoped ON public.material_stocks
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS material_stocks_write_internal ON public.material_stocks;
CREATE POLICY material_stocks_write_internal ON public.material_stocks
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS material_inbound_select_scoped ON public.material_inbound;
CREATE POLICY material_inbound_select_scoped ON public.material_inbound
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS material_inbound_write_scoped ON public.material_inbound;
CREATE POLICY material_inbound_write_scoped ON public.material_inbound
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_store_owner(store_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_store_owner(store_id));

DROP POLICY IF EXISTS material_outbound_select_scoped ON public.material_outbound;
CREATE POLICY material_outbound_select_scoped ON public.material_outbound
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS material_outbound_write_scoped ON public.material_outbound;
CREATE POLICY material_outbound_write_scoped ON public.material_outbound
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR public.is_store_owner(store_id))
  WITH CHECK (public.is_admin_or_manager() OR public.is_store_owner(store_id));

DROP POLICY IF EXISTS store_evaluations_select_scoped ON public.store_evaluations;
CREATE POLICY store_evaluations_select_scoped ON public.store_evaluations
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR rep_id = auth.uid() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS store_evaluations_write_internal ON public.store_evaluations;
CREATE POLICY store_evaluations_write_internal ON public.store_evaluations
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR rep_id = auth.uid())
  WITH CHECK (public.is_admin_or_manager() OR rep_id = auth.uid());

DROP POLICY IF EXISTS store_tasks_select_scoped ON public.store_tasks;
CREATE POLICY store_tasks_select_scoped ON public.store_tasks
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR assignee_id = auth.uid() OR public.can_access_store(store_id));

DROP POLICY IF EXISTS store_tasks_write_scoped ON public.store_tasks;
CREATE POLICY store_tasks_write_scoped ON public.store_tasks
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager() OR assignee_id = auth.uid() OR public.is_store_owner(store_id))
  WITH CHECK (public.is_admin_or_manager() OR assignee_id = auth.uid() OR public.is_store_owner(store_id));

DROP POLICY IF EXISTS photos_select_authenticated ON public.photos;
CREATE POLICY photos_select_authenticated ON public.photos
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS photos_write_authenticated ON public.photos;
CREATE POLICY photos_write_authenticated ON public.photos
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS products_select_authenticated ON public.products;
CREATE POLICY products_select_authenticated ON public.products
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS products_write_internal ON public.products;
CREATE POLICY products_write_internal ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS fan_points_rules_select_authenticated ON public.fan_points_rules;
CREATE POLICY fan_points_rules_select_authenticated ON public.fan_points_rules
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS fan_points_rules_write_internal ON public.fan_points_rules;
CREATE POLICY fan_points_rules_write_internal ON public.fan_points_rules
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS fan_level_rules_select_authenticated ON public.fan_level_rules;
CREATE POLICY fan_level_rules_select_authenticated ON public.fan_level_rules
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS fan_level_rules_write_internal ON public.fan_level_rules;
CREATE POLICY fan_level_rules_write_internal ON public.fan_level_rules
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

GRANT EXECUTE ON FUNCTION public.current_profile_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_rep_assigned_to_store(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_fan_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_store(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_fan(uuid) TO authenticated;
