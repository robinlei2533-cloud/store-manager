-- Production Audit Log V1 alignment draft.
-- Additive only: defines a durable audit_logs table shape, scoped RLS,
-- and a controlled write helper. This migration is not executed by Codex.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL DEFAULT '-',
  user_id UUID,
  role TEXT NOT NULL DEFAULT '-',
  region TEXT NOT NULL DEFAULT '-',
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  target TEXT NOT NULL DEFAULT '-',
  before_value JSONB,
  after_value JSONB,
  reason TEXT NOT NULL DEFAULT '',
  source_module TEXT NOT NULL DEFAULT 'backend_governance',
  category TEXT NOT NULL DEFAULT 'operation',
  severity TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT audit_logs_severity_check
    CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS actor TEXT NOT NULL DEFAULT '-';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT '-';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT '-';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action_type TEXT NOT NULL DEFAULT 'operation';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS target_type TEXT NOT NULL DEFAULT '';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS target_id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS target TEXT NOT NULL DEFAULT '-';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS before_value JSONB;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS after_value JSONB;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS reason TEXT NOT NULL DEFAULT '';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS source_module TEXT NOT NULL DEFAULT 'backend_governance';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'operation';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'audit_logs_severity_check'
  ) THEN
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_severity_check
      CHECK (severity IN ('low', 'medium', 'high', 'critical'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_region
  ON public.audit_logs (region);

CREATE INDEX IF NOT EXISTS idx_audit_logs_role
  ON public.audit_logs (role);

CREATE INDEX IF NOT EXISTS idx_audit_logs_category
  ON public.audit_logs (category);

CREATE INDEX IF NOT EXISTS idx_audit_logs_severity
  ON public.audit_logs (severity);

CREATE INDEX IF NOT EXISTS idx_audit_logs_target
  ON public.audit_logs (target_type, target_id);

CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_actor text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_region text DEFAULT NULL,
  p_action_type text DEFAULT NULL,
  p_target_type text DEFAULT '',
  p_target_id text DEFAULT '',
  p_target text DEFAULT NULL,
  p_before_value jsonb DEFAULT NULL,
  p_after_value jsonb DEFAULT NULL,
  p_reason text DEFAULT '',
  p_source_module text DEFAULT 'backend_governance',
  p_category text DEFAULT 'operation',
  p_severity text DEFAULT 'medium'
)
RETURNS public.audit_logs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile record;
  v_record public.audit_logs;
  v_severity text := COALESCE(NULLIF(p_severity, ''), 'medium');
BEGIN
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = COALESCE(p_user_id, auth.uid());

  IF p_action_type IS NULL OR btrim(p_action_type) = '' THEN
    RAISE EXCEPTION 'Audit log action type is required.';
  END IF;

  IF v_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    v_severity := 'medium';
  END IF;

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
    COALESCE(p_actor, row_to_json(v_profile)->>'name', row_to_json(v_profile)->>'email', auth.uid()::text, '-'),
    COALESCE(p_user_id, auth.uid()),
    COALESCE(p_role, row_to_json(v_profile)->>'role', '-'),
    COALESCE(p_region, row_to_json(v_profile)->>'region', row_to_json(v_profile)->>'city', '-'),
    p_action_type,
    COALESCE(p_target_type, ''),
    COALESCE(p_target_id, ''),
    COALESCE(p_target, p_target_id, '-'),
    p_before_value,
    p_after_value,
    COALESCE(p_reason, ''),
    COALESCE(p_source_module, 'backend_governance'),
    COALESCE(p_category, 'operation'),
    v_severity,
    now()
  )
  RETURNING * INTO v_record;

  RETURN v_record;
END;
$$;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_select_admin ON public.audit_logs;
CREATE POLICY audit_logs_select_admin ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin_role());

DROP POLICY IF EXISTS audit_logs_select_manager_region ON public.audit_logs;
CREATE POLICY audit_logs_select_manager_region ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    public.current_profile_role() = 'manager'
    AND EXISTS (
      SELECT 1
      FROM public.profiles AS manager_profile
      WHERE manager_profile.id = auth.uid()
        AND manager_profile.city IS NOT NULL
        AND audit_logs.region = manager_profile.city
    )
  );

DROP POLICY IF EXISTS audit_logs_insert_controlled ON public.audit_logs;
CREATE POLICY audit_logs_insert_controlled ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS audit_logs_delete_admin ON public.audit_logs;
CREATE POLICY audit_logs_delete_admin ON public.audit_logs
  FOR DELETE TO authenticated
  USING (public.is_admin_role());

GRANT EXECUTE ON FUNCTION public.write_audit_log(
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  text,
  text,
  text,
  text
) TO authenticated;
