// Domain: materials
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import { isLocal, ensureLocalInit, enrichMaterialStock } from './helpers';

// ============ 物料 ============

const USE_TRIAL_LOCAL_MATERIAL_RELATIONS = true;

const sortByCreatedDesc = (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0);

const enrichInbound = (record) => ({
  ...record,
  materials: localDb.findById('materials', record.material_id),
  profiles: localDb.findById('profiles', record.operator_id),
});

const enrichOutbound = (record) => ({
  ...record,
  materials: localDb.findById('materials', record.material_id),
  profiles: localDb.findById('profiles', record.applicant_id),
  stores: localDb.findById('stores', record.store_id),
});

function localMaterialStocks() {
  return localDb.all('material_stocks').map(enrichMaterialStock).sort((a, b) => a.qty - b.qty);
}

function applyInboundFilters(data, filters = {}) {
  let result = data;
  if (filters.material_id) result = result.filter((r) => r.material_id === filters.material_id);
  return result;
}

function applyOutboundFilters(data, filters = {}) {
  let result = data;
  if (filters.status) result = result.filter((r) => r.status === filters.status);
  if (filters.store_id) result = result.filter((r) => r.store_id === filters.store_id);
  if (filters.assigned_store_ids) {
    const assignedStoreIds = new Set(filters.assigned_store_ids);
    result = result.filter((r) => assignedStoreIds.has(r.store_id));
  }
  return result;
}

export async function getMaterials() {
  ensureLocalInit();
  if (isLocal()) return localDb.all('materials').sort((a, b) => a.name.localeCompare(b.name));
  const { data, error } = await supabase.from('materials').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createMaterial(material) {
  ensureLocalInit();
  if (isLocal()) {
    const m = localDb.insert('materials', material);
    localDb.insert('material_stocks', { material_id: m.id, warehouse: '默认仓库', qty: 0, safety_stock: 10 });
    return m;
  }
  const { data, error } = await supabase.from('materials').insert(material).select().single();
  if (error) throw error;
  return data;
}

export async function updateMaterial(id, material) {
  ensureLocalInit();
  if (isLocal()) return localDb.update('materials', id, material);
  const { data, error } = await supabase.from('materials').update(material).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMaterial(id) {
  ensureLocalInit();
  if (isLocal()) { localDb.remove('materials', id); return; }
  const { error } = await supabase.from('materials').delete().eq('id', id);
  if (error) throw error;
}

export async function getMaterialStocks() {
  ensureLocalInit();
  if (isLocal() || USE_TRIAL_LOCAL_MATERIAL_RELATIONS) {
    return localMaterialStocks();
  }
  const joined = await supabase.from('material_stocks').select('*, materials(name, sku, unit, unit_cost)').order('qty', { ascending: true });
  if (!joined.error) return joined.data || [];

  const plain = await supabase.from('material_stocks').select('*').order('qty', { ascending: true });
  if (!plain.error) return (plain.data || []).map(enrichMaterialStock);
  return localMaterialStocks();
}

export async function updateMaterialStock(materialId, qty, safetyStock) {
  ensureLocalInit();
  if (isLocal()) {
    const stocks = localDb.find('material_stocks', (s) => s.material_id === materialId);
    if (stocks.length > 0) {
      return localDb.update('material_stocks', stocks[0].id, { qty, safety_stock: safetyStock });
    } else {
      return localDb.insert('material_stocks', { material_id: materialId, warehouse: 'Default', qty, safety_stock: safetyStock });
    }
  }
  const { data, error } = await supabase
    .from('material_stocks')
    .update({ qty, safety_stock: safetyStock })
    .eq('material_id', materialId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createInbound(record) {
  ensureLocalInit();
  if (isLocal()) {
    return localDb.transaction((txnDb) => {
      const inbound = txnDb.insert('material_inbound', record);
      // 自动增加库存（原子操作）
      const stocks = txnDb.find('material_stocks', (s) => s.material_id === record.material_id);
      if (stocks.length > 0) {
        txnDb.update('material_stocks', stocks[0].id, { qty: stocks[0].qty + record.qty });
      } else {
        txnDb.insert('material_stocks', { material_id: record.material_id, warehouse: '默认仓库', qty: record.qty, safety_stock: 10 });
      }
      return inbound;
    });
  }
  const { data, error } = await supabase.from('material_inbound').insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function getInbounds(filters = {}) {
  ensureLocalInit();
  if (isLocal() || USE_TRIAL_LOCAL_MATERIAL_RELATIONS) {
    return applyInboundFilters(localDb.all('material_inbound'), filters).map(enrichInbound).sort(sortByCreatedDesc);
  }
  let query = supabase.from('material_inbound').select('*, materials(name, sku, unit), profiles!material_inbound_operator_id_fkey(name)');
  if (filters.material_id) query = query.eq('material_id', filters.material_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (!error) return data || [];

  let plainQuery = supabase.from('material_inbound').select('*');
  if (filters.material_id) plainQuery = plainQuery.eq('material_id', filters.material_id);
  const plain = await plainQuery.order('created_at', { ascending: false });
  if (!plain.error) return (plain.data || []).map(enrichInbound);
  return applyInboundFilters(localDb.all('material_inbound'), filters).map(enrichInbound).sort(sortByCreatedDesc);
}

export async function createOutbound(record) {
  ensureLocalInit();
  if (isLocal()) return localDb.insert('material_outbound', record);
  const { data, error } = await supabase.from('material_outbound').insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function getOutbounds(filters = {}) {
  ensureLocalInit();
  if (isLocal() || USE_TRIAL_LOCAL_MATERIAL_RELATIONS) {
    return applyOutboundFilters(localDb.all('material_outbound'), filters).map(enrichOutbound).sort(sortByCreatedDesc);
  }
  let query = supabase.from('material_outbound').select('*, materials(name, sku, unit), profiles!material_outbound_applicant_id_fkey(name), stores(name)');
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (!error) return data || [];

  let plainQuery = supabase.from('material_outbound').select('*');
  if (filters.status) plainQuery = plainQuery.eq('status', filters.status);
  if (filters.store_id) plainQuery = plainQuery.eq('store_id', filters.store_id);
  const plain = await plainQuery.order('created_at', { ascending: false });
  if (!plain.error) return applyOutboundFilters(plain.data || [], filters).map(enrichOutbound);
  return applyOutboundFilters(localDb.all('material_outbound'), filters).map(enrichOutbound).sort(sortByCreatedDesc);
}

export async function updateOutboundStatus(id, status) {
  ensureLocalInit();
  if (isLocal()) {
    return localDb.transaction((txnDb) => {
      const record = txnDb.findById('material_outbound', id);
      // 审批通过时扣减库存（原子操作）
      if (status === 'approved' && record.status === 'pending') {
        const stocks = txnDb.find('material_stocks', (s) => s.material_id === record.material_id);
        if (stocks.length > 0) {
          txnDb.update('material_stocks', stocks[0].id, { qty: Math.max(0, stocks[0].qty - record.qty) });
        }
      }
      return txnDb.update('material_outbound', id, { status });
    });
  }
  const { data, error } = await supabase.from('material_outbound').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}


