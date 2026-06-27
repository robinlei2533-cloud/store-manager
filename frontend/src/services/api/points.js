// Domain: points
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';
import { USE_LOCAL, ensureLocalInit } from './helpers';

// ============ POINTS ============
// ============ POINTS ============
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

// ============ POINTS ============

export async function getPointsRules() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('fan_points_rules').sort((a, b) => b.points - a.points);
  const { data, error } = await supabase.from('fan_points_rules').select('*').order('points', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPointsRule(rule) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('fan_points_rules', rule);
  const { data, error } = await supabase.from('fan_points_rules').insert(rule).select().single();
  if (error) throw error;
  return data;
}

export async function updatePointsRule(id, rule) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('fan_points_rules', id, rule);
  const { data, error } = await supabase.from('fan_points_rules').update(rule).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePointsRule(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('fan_points_rules', id); return; }
  const { error } = await supabase.from('fan_points_rules').delete().eq('id', id);
  if (error) throw error;
}

export async function getLevelRules() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('fan_level_rules').sort((a, b) => a.min_points - b.min_points);
  const { data, error } = await supabase.from('fan_level_rules').select('*').order('min_points', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateLevelRule(id, rule) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('fan_level_rules', id, rule);
  const { data, error } = await supabase.from('fan_level_rules').update(rule).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
