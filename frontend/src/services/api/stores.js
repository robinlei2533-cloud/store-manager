// Domain: stores
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

// ============ STORES ============

export async function getStores(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('stores');
    if (filters.level) data = data.filter((s) => s.level === filters.level);
    if (filters.chain_id) data = data.filter((s) => s.chain_id === filters.chain_id);
    if (filters.search) data = data.filter((s) => s.name.includes(filters.search));
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  let query = supabase.from('stores').select('*');
  if (filters.level) query = query.eq('level', filters.level);
  if (filters.chain_id) query = query.eq('chain_id', filters.chain_id);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getStoreById(id) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.findById('stores', id);
  const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createStore(store) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('stores', store);
  const { data, error } = await supabase.from('stores').insert(store).select().single();
  if (error) throw error;
  return data;
}

export async function updateStore(id, store) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('stores', id, store);
  const { data, error } = await supabase.from('stores').update(store).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteStore(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('stores', id); return; }
  const { error } = await supabase.from('stores').delete().eq('id', id);
  if (error) throw error;
}
