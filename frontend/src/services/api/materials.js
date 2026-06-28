// Domain: materials
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';
import { isLocal, ensureLocalInit } from './helpers';

// ============ 鐗╂枡 ============

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
    localDb.insert('material_stocks', { material_id: m.id, warehouse: '榛樿浠撳簱', qty: 0, safety_stock: 10 });
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
  if (isLocal()) {
    const data = localDb.all('material_stocks');
    return data.map(enrichMaterialStock).sort((a, b) => a.qty - b.qty);
  }
  const { data, error } = await supabase.from('material_stocks').select('*, materials(name, sku, unit, unit_cost)').order('qty', { ascending: true });
  if (error) throw error;
  return data;
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
  if (isLocal()) {
    let data = localDb.all('material_inbound');
    if (filters.material_id) data = data.filter((r) => r.material_id === filters.material_id);
    return data.map((r) => ({
      ...r,
      materials: localDb.findById('materials', r.material_id),
      profiles: localDb.findById('profiles', r.operator_id),
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  let query = supabase.from('material_inbound').select('*, materials(name, sku, unit), profiles!material_inbound_operator_id_fkey(name)');
  if (filters.material_id) query = query.eq('material_id', filters.material_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
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
  if (isLocal()) {
    let data = localDb.all('material_outbound');
    if (filters.status) data = data.filter((r) => r.status === filters.status);
    if (filters.store_id) data = data.filter((r) => r.store_id === filters.store_id);
    return data.map((r) => ({
      ...r,
      materials: localDb.findById('materials', r.material_id),
      profiles: localDb.findById('profiles', r.applicant_id),
      stores: localDb.findById('stores', r.store_id),
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  let query = supabase.from('material_outbound').select('*, materials(name, sku, unit), profiles!material_outbound_applicant_id_fkey(name), stores(name)');
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
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


