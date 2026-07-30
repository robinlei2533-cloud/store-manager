// Domain: stores
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import { isLocal, ensureLocalInit } from './helpers';
import { canAccessStore, isAssignedStore } from '../../utils/uwellRoleAccess';
import { sortStoresForFanExposure } from '../../utils/uwellLaunchRules';

// ============ STORES ============

export async function getStores(filters = {}) {
  ensureLocalInit();
  if (isLocal()) {
    let data = localDb.all('stores');
    if (filters.assigned_to) data = data.filter((s) => isAssignedStore(filters.assigned_to, s, data));
    if (filters.level) data = data.filter((s) => s.level === filters.level);
    if (filters.country) data = data.filter((s) => s.country === filters.country);
    if (filters.city) data = data.filter((s) => s.city === filters.city);
    if (filters.status) data = data.filter((s) => s.status === filters.status);
    if (filters.chain_id) data = data.filter((s) => s.chain_id === filters.chain_id);
    if (filters.search) data = data.filter((s) => s.name.includes(filters.search));
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase.rpc('get_internal_stores', { p_filters: filters });
  if (error) throw error;
  return data;
}

export async function getStoreById(id, options = {}) {
  ensureLocalInit();
  if (isLocal()) {
    const store = localDb.findById('stores', id);
    if (!store) return null;
    if (options.scopeProfile && !canAccessStore(options.scopeProfile, store, localDb.all('stores'))) return null;
    return store;
  }
  const { data, error } = await supabase.rpc('get_internal_store', { p_store_id: id });
  if (error) throw error;
  return data;
}

export async function getFanSafeStores(filters = {}) {
  ensureLocalInit();
  if (isLocal()) {
    let data = sortStoresForFanExposure(localDb.all('stores') || []);
    if (filters.level) data = data.filter((s) => s.level === filters.level);
    if (filters.country) data = data.filter((s) => s.country === filters.country);
    if (filters.city) data = data.filter((s) => s.city === filters.city);
    if (filters.status) data = data.filter((s) => s.status === filters.status);
    if (filters.search) data = data.filter((s) => String(s.name || '').toLowerCase().includes(filters.search.toLowerCase()));
    return data;
  }

  const { data, error } = await supabase.rpc('get_fan_safe_stores', { p_filters: filters });
  if (error) throw error;
  return sortStoresForFanExposure(data || []);
}

export async function createStore(store) {
  ensureLocalInit();
  if (isLocal()) return localDb.insert('stores', store);
  const { data, error } = await supabase.from('stores').insert(store).select().single();
  if (error) throw error;
  return data;
}

export async function updateStore(id, store) {
  ensureLocalInit();
  if (isLocal()) return localDb.update('stores', id, store);
  const { data, error } = await supabase.from('stores').update(store).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteStore(id) {
  ensureLocalInit();
  if (isLocal()) { localDb.remove('stores', id); return; }
  const { error } = await supabase.from('stores').delete().eq('id', id);
  if (error) throw error;
}

