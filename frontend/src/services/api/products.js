// Domain: products
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';
import { USE_LOCAL, ensureLocalInit } from './helpers';

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
