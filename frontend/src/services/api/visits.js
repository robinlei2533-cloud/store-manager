// Domain: visits
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

// ============ 鎷滆 ============

export async function getVisits(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('visits');
    if (filters.store_id) data = data.filter((v) => v.store_id === filters.store_id);
    if (filters.rep_id) data = data.filter((v) => v.rep_id === filters.rep_id);
    if (filters.status) data = data.filter((v) => v.status === filters.status);
    if (filters.date_from) data = data.filter((v) => v.visit_date >= filters.date_from);
    if (filters.date_to) data = data.filter((v) => v.visit_date <= filters.date_to);
    data = data.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
    return data.map(enrichVisit);
  }

  let query = supabase.from('visits').select('*, stores(name), profiles!visits_rep_id_fkey(name)');
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  if (filters.rep_id) query = query.eq('rep_id', filters.rep_id);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.date_from) query = query.gte('visit_date', filters.date_from);
  if (filters.date_to) query = query.lte('visit_date', filters.date_to);
  const { data, error } = await query.order('visit_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getVisitById(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const visit = localDb.findById('visits', id);
    if (!visit) return null;
    return enrichVisit(visit);
  }
  const { data, error } = await supabase.from('visits').select('*, stores(*), profiles!visits_rep_id_fkey(name)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createVisit(visit) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('visits', visit);
  const { data, error } = await supabase.from('visits').insert(visit).select().single();
  if (error) throw error;
  return data;
}

export async function updateVisit(id, visit) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('visits', id, visit);
  const { data, error } = await supabase.from('visits').update(visit).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============ 鍔ㄩ攢鏁版嵁 ============

export async function getVisitSales(visitId) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const data = localDb.find('visit_sales', (s) => s.visit_id === visitId);
    return data.map((s) => ({
      ...s,
      products: localDb.findById('products', s.product_id),
    }));
  }
  const { data, error } = await supabase.from('visit_sales').select('*, products(name, sku, unit_price)').eq('visit_id', visitId);
  if (error) throw error;
  return data;
}

export async function upsertVisitSales(salesData) {
  ensureLocalInit();
  if (USE_LOCAL) {
    return salesData.map((s) => localDb.upsert('visit_sales', s, 'visit_id_product_id'));
  }
  const { data, error } = await supabase.from('visit_sales').upsert(salesData, { onConflict: 'visit_id,product_id' }).select();
  if (error) throw error;
  return data;
}

// ============ 鎷滆鐓х墖 ============

export async function getVisitPhotos(visitId) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.find('visit_photos', (p) => p.visit_id === visitId);
  const { data, error } = await supabase.from('visit_photos').select('*').eq('visit_id', visitId);
  if (error) throw error;
  return data;
}

export async function uploadVisitPhoto(visitId, file, photoType) {
  ensureLocalInit();

  if (USE_LOCAL) {
    // 鏈湴锛氱敤 FileReader 杞?base64 瀛樺偍鎴栫敤 URL.createObjectURL
    const photoUrl = URL.createObjectURL(file);
    return localDb.insert('visit_photos', {
      visit_id: visitId,
      photo_type: photoType,
      photo_url: photoUrl,
    });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${visitId}/${Date.now()}_${photoType}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from('visit-photos').upload(fileName, file);
  if (uploadError) throw uploadError;
  const { data: publicUrl } = supabase.storage.from('visit-photos').getPublicUrl(fileName);
  const { data, error } = await supabase.from('visit_photos').insert({ visit_id: visitId, photo_type: photoType, photo_url: publicUrl.publicUrl }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteVisitPhoto(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('visit_photos', id); return; }
  const { error } = await supabase.from('visit_photos').delete().eq('id', id);
  if (error) throw error;
}
