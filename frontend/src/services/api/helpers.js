// ============================================================
// Domain: helpers - Shared utilities for all API domain files
// Provides runtime Supabase to localStorage fallback
// ============================================================

import localDb from '../db/localDb';
import seedData from '../db/seedData';

const env = typeof import.meta !== 'undefined' ? import.meta.env : {};

export function shouldAllowLocalDbFallback(currentEnv = env) {
  if (!currentEnv?.VITE_SUPABASE_URL) return true;
  if (currentEnv?.VITE_ALLOW_LOCAL_DB_FALLBACK === 'true') return true;
  if (currentEnv?.VITE_ALLOW_LOCAL_DB_FALLBACK === 'false') return false;
  return Boolean(currentEnv?.DEV);
}

let _useLocal = !env?.VITE_SUPABASE_URL;

export function getUseLocal() { return _useLocal; }
export const USE_LOCAL = _useLocal;
export function setLocalMode(v) { _useLocal = v; }
export function isLocal() { return _useLocal; }

export function ensureLocalInit() {
  if (localDb.needsInit()) localDb.init(seedData);
}

export function enrichVisit(visit) {
  const store = localDb.findById('stores', visit.store_id);
  const rep = localDb.findById('profiles', visit.rep_id);
  return { ...visit, stores: store || null, profiles: rep ? { name: rep.name } : null };
}

export function enrichFan(fan) {
  const store = localDb.findById('stores', fan.store_id);
  const profile = fan.user_id ? localDb.findById('profiles', fan.user_id) : null;
  return { ...fan, stores: store ? { name: store.name } : null, profiles: profile ? { name: profile.name } : null };
}

export function enrichMaterialStock(stock) {
  const material = localDb.findById('materials', stock.material_id);
  return { ...stock, materials: material ? { name: material.name, sku: material.sku, unit: material.unit, unit_cost: material.unit_cost } : null };
}

// Execute supabaseFn, on failure fall back to localFn
export async function withFallback(supabaseFn, localFn) {
  const allowLocalFallback = shouldAllowLocalDbFallback();
  if (_useLocal || allowLocalFallback) ensureLocalInit();
  if (_useLocal) return await localFn();
  try {
    return await supabaseFn();
  } catch (e) {
    if (!allowLocalFallback) throw e;
    console.warn('[DB] Supabase unavailable, switching to local mode:', e.message);
    _useLocal = true;
    return await localFn();
  }
}
