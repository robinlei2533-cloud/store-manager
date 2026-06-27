// Domain: products
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';

// ============ Shared Helpers ============
const USE_LOCAL = true;
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

// ============ 浜у搧 ============

export async function getProducts() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('products').sort((a, b) => a.name.localeCompare(b.name));
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('products', product);
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, product) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('products', id, product);
  const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('products', id); return; }
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
