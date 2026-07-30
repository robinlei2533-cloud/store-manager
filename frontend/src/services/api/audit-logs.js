// Domain: audit logs

import localDb from '../db/localDb';
import { supabase } from '../supabase';

const hasSupabaseRuntime = typeof window !== 'undefined'
  && Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

function stringifyValue(value) {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function jsonValue(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function normalizeAuditLogPayload({
  profile = {},
  store = {},
  actionType,
  target,
  targetType,
  targetId,
  beforeValue = '',
  afterValue = '',
  reason = '',
  sourceModule = 'backend_governance',
  category = 'operation',
  severity = 'medium',
}) {
  return {
    actor: profile.name || profile.email || profile.id || '-',
    user_id: profile.id || '',
    role: profile.role || '-',
    region: profile.region || profile.city || store.region || store.city || '-',
    action_type: actionType,
    target_type: targetType || (store.id ? 'store' : ''),
    target_id: targetId || store.id || '',
    target: target || store.name || store.id || '-',
    before_value: stringifyValue(beforeValue),
    after_value: stringifyValue(afterValue),
    reason: reason || '',
    source_module: sourceModule,
    category,
    severity,
  };
}

function shouldUseRemoteAuditLog() {
  return hasSupabaseRuntime;
}

export function recordAuditLog(input) {
  const payload = normalizeAuditLogPayload(input);

  if (shouldUseRemoteAuditLog()) {
    void supabase.rpc('write_audit_log', {
      p_actor: payload.actor,
      p_user_id: payload.user_id || null,
      p_role: payload.role,
      p_region: payload.region,
      p_action_type: payload.action_type,
      p_target_type: payload.target_type,
      p_target_id: payload.target_id,
      p_target: payload.target,
      p_before_value: jsonValue(payload.before_value),
      p_after_value: jsonValue(payload.after_value),
      p_reason: payload.reason,
      p_source_module: payload.source_module,
      p_category: payload.category,
      p_severity: payload.severity,
    }).then(({ error }) => {
      if (error) console.warn('[AuditLog] Supabase write failed:', error.message);
    }).catch((error) => {
      console.warn('[AuditLog] Supabase write failed:', error.message);
    });
    return payload;
  }

  return localDb.insert('audit_logs', {
    ...payload,
    before_value: payload.before_value,
    after_value: payload.after_value,
  });
}
