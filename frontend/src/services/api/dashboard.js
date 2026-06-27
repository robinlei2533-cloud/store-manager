// Domain: dashboard
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';
import { USE_LOCAL, ensureLocalInit } from './helpers';

// ============ Shared Helpers ============

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

// ============ 鏁版嵁鐪嬬洏 ============

export async function getDashboardStats() {
  ensureLocalInit();
  if (USE_LOCAL) {
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

  const [storeCount, visitCount, todayVisits, fanCount, materialCount, lowStockCount] = await Promise.all([
    supabase.from('stores').select('*', { count: 'exact', head: true }),
    supabase.from('visits').select('*', { count: 'exact', head: true }),
    supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visit_date', new Date().toISOString().split('T')[0]),
    supabase.from('fans').select('*', { count: 'exact', head: true }),
    supabase.from('materials').select('*', { count: 'exact', head: true }),
    supabase.rpc('get_low_stock_count'),
  ]);
  return {
    storeCount: storeCount.count || 0,
    visitCount: visitCount.count || 0,
    todayVisits: todayVisits.count || 0,
    fanCount: fanCount.count || 0,
    materialCount: materialCount.count || 0,
    lowStockCount: lowStockCount.data || 0,
  };
}

export async function getVisitTrend(days = 30) {
  ensureLocalInit();
  if (USE_LOCAL) {
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
  if (USE_LOCAL) {
    return localDb.all('stores').map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, level: s.level }));
  }
  const { data, error } = await supabase.from('stores').select('id, name, lat, lng, level');
  if (error) throw error;
  return data;
}

export async function getScanTrend(days = 30) {
  ensureLocalInit();
  if (USE_LOCAL) {
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
  return [];
}

// 
export const IS_LOCAL_MODE = USE_LOCAL;
