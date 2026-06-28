-- ============================================================
-- UWELL CRM — Audit Logging System
-- Creates audit_logs table + triggers for all core tables
-- Run this AFTER one_shot_setup.sql
-- ============================================================

-- ============ 1. Audit Logs Table ============
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data JSONB DEFAULT NULL,
  new_data JSONB DEFAULT NULL,
  performed_by TEXT DEFAULT NULL,
  performed_by_role TEXT DEFAULT NULL,
  ip_address TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performer ON public.audit_logs(performed_by);

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS \$\$
DECLARE
  audit_id TEXT;
  user_role TEXT;
BEGIN
  audit_id := 'aud-' || replace(gen_random_uuid()::text, '-', '');
  BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid()::text;
  EXCEPTION WHEN OTHERS THEN user_role := NULL;
  END;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (id, table_name, record_id, action, new_data, performed_by, performed_by_role)
    VALUES (audit_id, TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::jsonb, auth.uid()::text, user_role);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (id, table_name, record_id, action, old_data, new_data, performed_by, performed_by_role)
    VALUES (audit_id, TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid()::text, user_role);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (id, table_name, record_id, action, old_data, performed_by, performed_by_role)
    VALUES (audit_id, TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb, auth.uid()::text, user_role);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;
-- Apply Triggers to All Core Tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_stores AFTER INSERT OR UPDATE OR DELETE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_visits AFTER INSERT OR UPDATE OR DELETE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_visit_sales AFTER INSERT OR UPDATE OR DELETE ON public.visit_sales FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_fans AFTER INSERT OR UPDATE OR DELETE ON public.fans FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_fan_points_log AFTER INSERT OR UPDATE OR DELETE ON public.fan_points_log FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_materials AFTER INSERT OR UPDATE OR DELETE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_material_stocks AFTER INSERT OR UPDATE OR DELETE ON public.material_stocks FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_material_inbound AFTER INSERT OR UPDATE OR DELETE ON public.material_inbound FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_material_outbound AFTER INSERT OR UPDATE OR DELETE ON public.material_outbound FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_store_evaluations AFTER INSERT OR UPDATE OR DELETE ON public.store_evaluations FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_campaigns AFTER INSERT OR UPDATE OR DELETE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_qr_codes AFTER INSERT OR UPDATE OR DELETE ON public.qr_codes FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_community_posts AFTER INSERT OR UPDATE OR DELETE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_community_comments AFTER INSERT OR UPDATE OR DELETE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- RLS for Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_admin_select" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND role IN ('admin', 'manager'))
);
CREATE POLICY "audit_logs_no_insert" ON public.audit_logs FOR INSERT WITH CHECK (false);
CREATE POLICY "audit_logs_no_update" ON public.audit_logs FOR UPDATE USING (false);
CREATE POLICY "audit_logs_no_delete" ON public.audit_logs FOR DELETE USING (false);

-- Helper View
CREATE OR REPLACE VIEW public.v_recent_audit_logs AS
SELECT id, table_name, record_id, action, performed_by, performed_by_role, created_at,
  CASE WHEN action = 'INSERT' THEN new_data WHEN action = 'DELETE' THEN old_data
    ELSE jsonb_build_object('old', old_data, 'new', new_data) END as changes
FROM public.audit_logs ORDER BY created_at DESC LIMIT 100;

-- Cleanup Function
CREATE OR REPLACE FUNCTION public.cleanup_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS \$\$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs WHERE created_at < now() - (retention_days || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
\$\$;
