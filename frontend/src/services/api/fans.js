// Domain: fans
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import { isLocal, ensureLocalInit, enrichFan } from './helpers';

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

function addFanPointsLocal(fanId, points, type, source, description) {
  localDb.insert('fan_points_log', { fan_id: fanId, points, type, source, description });
  const fan = localDb.findById('fans', fanId);
  if (fan) {
    const newPoints = fan.points + points;
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

// ============ 粉丝 ============

export async function getFans(filters = {}) {
  ensureLocalInit();
  if (isLocal()) {
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
  if (isLocal()) {
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
  if (isLocal()) return localDb.find('fan_points_log', (l) => l.fan_id === fanId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const { data, error } = await supabase.from('fan_points_log').select('*').eq('fan_id', fanId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addFanPoints(fanId, points, type, source, description) {
  ensureLocalInit();
  if (isLocal() || !isUuid(fanId)) return addFanPointsLocal(fanId, points, type, source, description);
  try {
    const { data, error } = await supabase.from('fan_points_log').insert({ fan_id: fanId, points, type, source, description }).select().single();
    if (error) throw error;

    const { data: fan, error: fanError } = await supabase
      .from('fans')
      .select('points, total_contribution, level')
      .eq('id', fanId)
      .single();
    if (fanError) throw fanError;

    const newPoints = (fan?.points || 0) + points;
    const newContribution = (fan?.total_contribution || 0) + (type === 'earn' ? points : 0);
    const { data: levelRules, error: rulesError } = await supabase
      .from('fan_level_rules')
      .select('level, min_points')
      .order('min_points', { ascending: false });
    if (rulesError) throw rulesError;

    const newLevel = (levelRules || []).find((rule) => newPoints >= rule.min_points)?.level || fan?.level;
    const { data: updatedFan, error: updateError } = await supabase
      .from('fans')
      .update({
        points: newPoints,
        total_contribution: newContribution,
        level: newLevel,
      })
      .eq('id', fanId)
      .select()
      .single();
    if (updateError) throw updateError;

    return updatedFan || data;
  } catch (err) {
    console.warn('[Fans] Supabase points unavailable, using local points log:', err?.message);
    return addFanPointsLocal(fanId, points, type, source, description);
  }
}

