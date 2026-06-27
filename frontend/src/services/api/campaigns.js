// Domain: campaigns
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

// ============ 娲诲姩绠＄悊 ============

export async function getCampaigns(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('campaigns');
    if (filters.status) data = data.filter((c) => c.status === filters.status);
    if (filters.type) data = data.filter((c) => c.type === filters.type);
    return data.map((c) => ({
      ...c,
      store_count: c.target_stores?.length || 0,
      tasks: localDb.find('campaign_tasks', (t) => t.campaign_id === c.id),
      report: localDb.find('campaign_reports', (r) => r.campaign_id === c.id)[0] || null,
    })).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  }
  let query = supabase.from('campaigns').select('*');
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.type) query = query.eq('type', filters.type);
  const { data, error } = await query.order('start_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCampaignById(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const campaign = localDb.findById('campaigns', id);
    if (!campaign) return null;
    return {
      ...campaign,
      tasks: localDb.find('campaign_tasks', (t) => t.campaign_id === id),
      report: localDb.find('campaign_reports', (r) => r.campaign_id === id)[0] || null,
      target_store_details: (campaign.target_stores || []).map((sid) => localDb.findById('stores', sid)).filter(Boolean),
    };
  }
  const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createCampaign(campaign) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('campaigns', campaign);
  const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(id, campaign) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('campaigns', id, campaign);
  const { data, error } = await supabase.from('campaigns').update(campaign).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCampaign(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    localDb.remove('campaigns', id);
    localDb.find('campaign_tasks', (t) => t.campaign_id === id).forEach((t) => localDb.remove('campaign_tasks', t.id));
    localDb.find('campaign_reports', (r) => r.campaign_id === id).forEach((r) => localDb.remove('campaign_reports', r.id));
    return;
  }
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) throw error;
}

export async function createCampaignTask(task) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('campaign_tasks', task);
  const { data, error } = await supabase.from('campaign_tasks').insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampaignTask(id, task) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('campaign_tasks', id, task);
  const { data, error } = await supabase.from('campaign_tasks').update(task).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCampaignTask(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('campaign_tasks', id); return; }
  const { error } = await supabase.from('campaign_tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function createCampaignReport(report) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('campaign_reports', report);
  const { data, error } = await supabase.from('campaign_reports').insert(report).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampaignReport(id, report) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('campaign_reports', id, report);
  const { data, error } = await supabase.from('campaign_reports').update(report).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
