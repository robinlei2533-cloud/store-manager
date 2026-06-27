// Domain: evaluations
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';
import { USE_LOCAL, ensureLocalInit } from './helpers';

// ============ EVALUATIONS ============
// ============ EVALUATIONS ============
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

// ============ EVALUATIONS ============

export async function getEvaluations(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('store_evaluations');
    if (filters.store_id) data = data.filter((e) => e.store_id === filters.store_id);
    if (filters.level) data = data.filter((e) => e.recommended_level === filters.level);
    return data.map((e) => ({
      ...e,
      stores: localDb.findById('stores', e.store_id),
      evaluator: localDb.findById('profiles', e.evaluator_id),
    })).sort((a, b) => new Date(b.eval_date) - new Date(a.eval_date));
  }
  let query = supabase.from('store_evaluations').select('*, stores(name, level), profiles!store_evaluations_evaluator_id_fkey(name)');
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  const { data, error } = await query.order('eval_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEvaluationById(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const evalRecord = localDb.findById('store_evaluations', id);
    if (!evalRecord) return null;
    return {
      ...evalRecord,
      stores: localDb.findById('stores', evalRecord.store_id),
      evaluator: localDb.findById('profiles', evalRecord.evaluator_id),
    };
  }
  const { data, error } = await supabase.from('store_evaluations').select('*, stores(*), profiles!store_evaluations_evaluator_id_fkey(name)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createEvaluation(evalData) {
  ensureLocalInit();
  // Calculate total score and recommend level
  const total = evalData.score_sales + evalData.score_display + evalData.score_location +
    evalData.score_cooperation + evalData.score_expansion + evalData.score_appearance;
  const avg = total / 6;
  let level = 'C';
  if (avg >= 8) level = 'A';
  else if (avg >= 6) level = 'B';

  const record = { ...evalData, total_score: total, recommended_level: level };

  if (USE_LOCAL) {
    const result = localDb.insert('store_evaluations', record);
    // Sync store level
    localDb.update('stores', evalData.store_id, { level });
    return result;
  }
  const { data, error } = await supabase.from('store_evaluations').insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvaluation(id, evalData) {
  ensureLocalInit();
  const total = evalData.score_sales + evalData.score_display + evalData.score_location +
    evalData.score_cooperation + evalData.score_expansion + evalData.score_appearance;
  const avg = total / 6;
  let level = 'C';
  if (avg >= 8) level = 'A';
  else if (avg >= 6) level = 'B';
  const record = { ...evalData, total_score: total, recommended_level: level };

  if (USE_LOCAL) {
    const result = localDb.update('store_evaluations', id, record);
    localDb.update('stores', evalData.store_id, { level });
    return result;
  }
  const { data, error } = await supabase.from('store_evaluations').update(record).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEvaluation(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('store_evaluations', id); return; }
  const { error } = await supabase.from('store_evaluations').delete().eq('id', id);
  if (error) throw error;
}
