// ============================================================
// Domain: helpers - Shared utilities for all API domain files
// Provides runtime Supabase→localStorage fallback
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';

let _useLocal = !(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL);

export function getUseLocal() { return _useLocal; }
export function setLocalMode(v) { _useLocal = v; }

export function ensureLocalInit() {
  if (localDb.needsInit()) localDb.init(seedData);
}

export function enrichVisit(visit) {
  const store = localDb.findById('stores', visit.store_id);
  const rep = localDb.findById('profiles', visit.rep_id);
  return { ...visit, stores: store ? { name: store.name } : null, profiles: rep ? { name: rep.name } : null };
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
  ensureLocalInit();
  if (_useLocal) return await localFn();
  try {
    return await supabaseFn();
  } catch (e) {
    console.warn('[DB] Supabase unavailable, switching to local mode:', e.message);
    _useLocal = true;
    return await localFn();
  }
}
