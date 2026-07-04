// Domain: dashboard
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import { isLocal, ensureLocalInit } from './helpers';

// ============ Shared Helpers ============

const USE_TRIAL_LOCAL_ANALYTICS = true;

function getLocalDashboardStats() {
  const stores = localDb.all('stores');
  const visits = localDb.all('visits');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter((v) => v.visit_date === todayStr);
  const fans = localDb.all('fans');
  const stocks = localDb.all('material_stocks');
  const lowStock = stocks.filter((s) => s.qty <= s.safety_stock);
  const campaigns = localDb.all('campaigns');
  const ongoingCampaigns = campaigns.filter((c) => c.status === 'ongoing');
  const scans = localDb.all('scan_records');

  return {
    storeCount: stores.length,
    visitCount: visits.length,
    todayVisits: todayVisits.length,
    fanCount: fans.length,
    materialCount: localDb.all('materials').length,
    lowStockCount: lowStock.length,
    campaignCount: campaigns.length,
    ongoingCampaignCount: ongoingCampaigns.length,
    scanCount: scans.length,
  };
}

async function safeHeadCount(query, fallback = 0) {
  try {
    const { count, error } = await query;
    if (error) return fallback;
    return count || 0;
  } catch {
    return fallback;
  }
}

async function getRemoteLowStockCount(fallback) {
  if (USE_TRIAL_LOCAL_ANALYTICS) return fallback;
  try {
    const { data, error } = await supabase.rpc('get_low_stock_count');
    if (!error && typeof data === 'number') return data;
  } catch { /* fall through */ }

  try {
    const { data, error } = await supabase.from('material_stocks').select('qty, safety_stock');
    if (error) return fallback;
    return (data || []).filter((s) => Number(s.qty || 0) <= Number(s.safety_stock || 0)).length;
  } catch {
    return fallback;
  }
}

// ============ Enrich helpers ============

// ============ 鏁版嵁鐪嬬洏 ============

export async function getDashboardStats() {
  ensureLocalInit();
  if (isLocal() || USE_TRIAL_LOCAL_ANALYTICS) {
    return getLocalDashboardStats();
  }

  const fallback = getLocalDashboardStats();
  const today = new Date().toISOString().split('T')[0];
  const [storeCount, visitCount, todayVisits, fanCount, materialCount, lowStockCount, campaignCount, ongoingCampaignCount, scanCount] = await Promise.all([
    safeHeadCount(supabase.from('stores').select('*', { count: 'exact', head: true }), fallback.storeCount),
    safeHeadCount(supabase.from('visits').select('*', { count: 'exact', head: true }), fallback.visitCount),
    safeHeadCount(supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visit_date', today), fallback.todayVisits),
    safeHeadCount(supabase.from('fans').select('*', { count: 'exact', head: true }), fallback.fanCount),
    safeHeadCount(supabase.from('materials').select('*', { count: 'exact', head: true }), fallback.materialCount),
    getRemoteLowStockCount(fallback.lowStockCount),
    safeHeadCount(supabase.from('campaigns').select('*', { count: 'exact', head: true }), fallback.campaignCount),
    safeHeadCount(supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'ongoing'), fallback.ongoingCampaignCount),
    USE_TRIAL_LOCAL_ANALYTICS ? Promise.resolve(fallback.scanCount) : safeHeadCount(supabase.from('scan_records').select('*', { count: 'exact', head: true }), fallback.scanCount),
  ]);
  return {
    storeCount,
    visitCount,
    todayVisits,
    fanCount,
    materialCount,
    lowStockCount,
    campaignCount,
    ongoingCampaignCount,
    scanCount,
  };
}

export async function getVisitTrend(days = 30) {
  ensureLocalInit();
  if (isLocal() || USE_TRIAL_LOCAL_ANALYTICS) {
    const visits = localDb.all('visits');
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = visits.filter((v) => v.visit_date === dateStr).length;
      if (count > 0) result.push({ visit_date: dateStr, count });
    }
    return result;
  }
  const { data, error } = await supabase.rpc('get_visit_trend', { days_count: days });
  if (error) throw error;
  return data;
}

export async function getStoreDistribution() {
  ensureLocalInit();
  if (isLocal()) {
    return localDb.all('stores').map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, level: s.level }));
  }
  const { data, error } = await supabase.from('stores').select('id, name, lat, lng, level');
  if (error) throw error;
  return data;
}

export async function getScanTrend(days = 30) {
  ensureLocalInit();
  if (isLocal() || USE_TRIAL_LOCAL_ANALYTICS) {
    const scans = localDb.all('scan_records');
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = scans.filter((s) => s.created_at.startsWith(dateStr)).length;
      if (count > 0) result.push({ date: dateStr, count });
    }
    return result;
  }
  // Supabase mode: try RPC first, fall back to client-side aggregation
  try {
    const { data, error } = await supabase.rpc('get_scan_trend', { days_count: days });
    if (!error && data) return data;
  } catch (_rpcErr) { /* fall through to client-side */ }

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data: scans } = await supabase.from('scan_records').select('created_at').gte('created_at', since.toISOString());
    if (!scans?.length) return [];
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = scans.filter((s) => s.created_at?.startsWith(dateStr)).length;
      if (count > 0) result.push({ date: dateStr, count });
    }
    return result;
  } catch {
    return [];
  }
}

// 
export const IS_LOCAL_MODE = isLocal();
