// Domain: evaluations
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import { isLocal, ensureLocalInit } from './helpers';

// ============ EVALUATIONS ============
// ============ EVALUATIONS ============

// ============ EVALUATIONS ============

const USE_TRIAL_LOCAL_EVALUATIONS = true;

export async function getEvaluations(filters = {}) {
  ensureLocalInit();
  const localEvaluations = () => {
    let data = localDb.all('store_evaluations');
    if (filters.store_id) data = data.filter((e) => e.store_id === filters.store_id);
    if (filters.level) data = data.filter((e) => e.recommended_level === filters.level);
    data = filterAssignedStores(data, filters);
    return data.map(enrichEvaluation).sort((a, b) => new Date(b.eval_date || 0) - new Date(a.eval_date || 0));
  };
  if (isLocal() || USE_TRIAL_LOCAL_EVALUATIONS) {
    return localEvaluations();
  }
  let query = supabase.from('store_evaluations').select('*, stores(name, level), profiles!store_evaluations_evaluator_id_fkey(name)');
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  if (filters.level) query = query.eq('recommended_level', filters.level);
  const { data, error } = await query.order('eval_date', { ascending: false });
  if (!error) return data || [];

  let plainQuery = supabase.from('store_evaluations').select('*');
  if (filters.store_id) plainQuery = plainQuery.eq('store_id', filters.store_id);
  if (filters.level) plainQuery = plainQuery.eq('recommended_level', filters.level);
  const plain = await plainQuery.order('eval_date', { ascending: false });
  if (!plain.error) return filterAssignedStores(plain.data || [], filters).map(enrichEvaluation);
  return localEvaluations();
}

export async function getEvaluationById(id) {
  ensureLocalInit();
  if (isLocal() || USE_TRIAL_LOCAL_EVALUATIONS) {
    const evalRecord = localDb.findById('store_evaluations', id);
    if (!evalRecord) return null;
    return {
      ...evalRecord,
      stores: localDb.findById('stores', evalRecord.store_id),
      evaluator: localDb.findById('profiles', evalRecord.evaluator_id),
    };
  }
  const { data, error } = await supabase.from('store_evaluations').select('*, stores(*), profiles!store_evaluations_evaluator_id_fkey(name)').eq('id', id).single();
  if (!error) return data;

  const plain = await supabase.from('store_evaluations').select('*').eq('id', id).single();
  if (!plain.error && plain.data) return enrichEvaluation(plain.data);
  const evalRecord = localDb.findById('store_evaluations', id);
  return evalRecord ? enrichEvaluation(evalRecord) : null;
}

export async function createEvaluation(evalData) {
  ensureLocalInit();
  const record = buildEvaluationRecord(evalData);

  if (isLocal()) {
    const result = localDb.insert('store_evaluations', record);
    localDb.update('stores', evalData.store_id, { level: record.recommended_level });
    return result;
  }
  const { data, error } = await supabase.from('store_evaluations').insert(toSupabaseEvaluationRecord(record)).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvaluation(id, evalData) {
  ensureLocalInit();
  const record = buildEvaluationRecord(evalData);

  if (isLocal()) {
    const result = localDb.update('store_evaluations', id, record);
    localDb.update('stores', evalData.store_id, { level: record.recommended_level });
    return result;
  }
  const { data, error } = await supabase.from('store_evaluations').update(toSupabaseEvaluationRecord(record)).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEvaluation(id) {
  ensureLocalInit();
  if (isLocal()) { localDb.remove('store_evaluations', id); return; }
  const { error } = await supabase.from('store_evaluations').delete().eq('id', id);
  if (error) throw error;
}

function buildEvaluationRecord(evalData) {
  if (evalData.score_model === 'bd_store_rating_v1') {
    const total = Number(evalData.total_score || 0);
    return {
      ...evalData,
      total_score: total,
      recommended_level: get110PointLevel(total),
    };
  }

  const total = Number(evalData.score_sales || 0) + Number(evalData.score_display || 0) + Number(evalData.score_location || 0) +
    Number(evalData.score_cooperation || 0) + Number(evalData.score_expansion || 0) + Number(evalData.score_appearance || 0);
  const avg = total / 6;
  let level = 'C';
  if (avg >= 8) level = 'A';
  else if (avg >= 6) level = 'B';
  return { ...evalData, total_score: total, recommended_level: level };
}

function get110PointLevel(score) {
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  if (score >= 30) return 'C';
  return 'D';
}

function enrichEvaluation(evalRecord) {
  return {
    ...evalRecord,
    stores: localDb.findById('stores', evalRecord.store_id),
    evaluator: localDb.findById('profiles', evalRecord.evaluator_id),
  };
}

function filterAssignedStores(data, filters = {}) {
  if (!filters.assigned_store_ids) return data;
  const assignedStoreIds = new Set(filters.assigned_store_ids);
  return data.filter((e) => assignedStoreIds.has(e.store_id));
}

function toSupabaseEvaluationRecord(record) {
  const {
    store_id,
    eval_date,
    score_sales,
    score_display,
    score_location,
    score_cooperation,
    score_expansion,
    score_appearance,
    total_score,
    recommended_level,
    evaluator_id,
    notes,
  } = record;
  return {
    store_id,
    eval_date,
    score_sales,
    score_display,
    score_location,
    score_cooperation,
    score_expansion,
    score_appearance,
    total_score,
    recommended_level,
    evaluator_id,
    notes,
  };
}

