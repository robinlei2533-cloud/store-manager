// Domain: fans
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

// ============ 粉丝 ============

export async function getFans(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('fans');
    if (filters.level) data = data.filter((f) => f.level === filters.level);
    if (filters.store_id) data = data.filter((f) => f.store_id === filters.store_id);
    return data.map(enrichFan).sort((a, b) => b.points - a.points);
  }
  let query = supabase.from('fans').select('*, stores(name), profiles!fans_user_id_fkey(name)').order('points', { ascending: false });
  if (filters.level) query = query.eq('level', filters.level);
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getFanById(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const fan = localDb.findById('fans', id);
    if (!fan) return null;
    return enrichFan(fan);
  }
  const { data, error } = await supabase.from('fans').select('*, stores(*), profiles!fans_user_id_fkey(name)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getFanPointsLog(fanId) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.find('fan_points_log', (l) => l.fan_id === fanId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const { data, error } = await supabase.from('fan_points_log').select('*').eq('fan_id', fanId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addFanPoints(fanId, points, type, source, description) {
  ensureLocalInit();
  if (USE_LOCAL) {
    localDb.insert('fan_points_log', { fan_id: fanId, points, type, source, description });
    const fan = localDb.findById('fans', fanId);
    if (fan) {
      const newPoints = fan.points + points;
      // 鑷姩鍗囩骇
      const rules = localDb.all('fan_level_rules').sort((a, b) => b.min_points - a.min_points);
      const newLevel = rules.find((r) => newPoints >= r.min_points);
      localDb.update('fans', fanId, {
        points: newPoints,
        total_contribution: fan.total_contribution + (type === 'earn' ? points : 0),
        level: newLevel ? newLevel.level : fan.level,
      });
    }
    return localDb.findById('fans', fanId);
  }
  const { data, error } = await supabase.from('fan_points_log').insert({ fan_id: fanId, points, type, source, description }).select().single();
  if (error) throw error;
  return data;
}
