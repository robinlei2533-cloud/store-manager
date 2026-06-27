// Domain: profiles
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';

// ============ Shared Helpers ============
const USE_LOCAL = !(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL);
function ensureLocalInit() {
  if (USE_LOCAL && localDb.needsInit()) {
    localDb.init(seedData);
  }
}

// ============ Enrich helpers ============
function enrichVisit(visit) {
  const store = localDb.findById('stores', visit.store_id);
  const rep = localDb.findById('profiles', visit.rep_id);
  return { ...visit, stores: store ? { name: store.name } : null, profiles: rep ? { name: rep.name } : null };
}
function enrichFan(fan) {
  const store = localDb.findById('stores', fan.store_id);
  const profile = fan.user_id ? localDb.findById('profiles', fan.user_id) : null;
  return { ...fan, stores: store ? { name: store.name } : null, profiles: profile ? { name: profile.name } : null };
}
function enrichMaterialStock(stock) {
  const material = localDb.findById('materials', stock.material_id);
  return { ...stock, materials: material ? { name: material.name, sku: material.sku, unit: material.unit, unit_cost: material.unit_cost } : null };
}

// ============ 用户 ============

export async function getProfiles() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('profiles').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateProfile(id, profile) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('profiles', id, profile);
  const { data, error } = await supabase.from('profiles').update(profile).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
