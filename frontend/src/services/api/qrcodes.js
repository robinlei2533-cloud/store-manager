// Domain: qrcodes
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';
import { USE_LOCAL, ensureLocalInit } from './helpers';

// ============ QRCODES ============
// ============ QRCODES ============
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

// ============ QRCODES ============

export async function getQrCodes(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('qr_codes');
    if (filters.product_id) data = data.filter((q) => q.product_id === filters.product_id);
    if (filters.store_id) data = data.filter((q) => q.store_id === filters.store_id);
    return data.map((q) => ({
      ...q,
      products: localDb.findById('products', q.product_id),
      stores: localDb.findById('stores', q.store_id),
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  const { data, error } = await supabase.from('qr_codes').select('*, products(name, sku), stores(name)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createQrCode(qrData) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('qr_codes', { ...qrData, scan_count: 0, is_active: true });
  const { data, error } = await supabase.from('qr_codes').insert(qrData).select().single();
  if (error) throw error;
  return data;
}

export async function updateQrCode(id, qrData) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('qr_codes', id, qrData);
  const { data, error } = await supabase.from('qr_codes').update(qrData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteQrCode(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('qr_codes', id); return; }
  const { error } = await supabase.from('qr_codes').delete().eq('id', id);
  if (error) throw error;
}

export async function scanQrCode(qrCodeId) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const qr = localDb.findById('qr_codes', qrCodeId);
    if (!qr || !qr.is_active) throw new Error('QR code invalid or disabled');

    // Get store fans
    const fan = localDb.find('fans', (f) => f.store_id === qr.store_id)[0];
    if (!fan) throw new Error('No fan account for this store');

    // 澧炲姞鎵爜娆℃暟
    localDb.update('qr_codes', qrCodeId, { scan_count: qr.scan_count + 1 });

    // Record scan
    localDb.insert('scan_records', {
      qr_code_id: qrCodeId,
      fan_id: fan.id,
      product_id: qr.product_id,
      store_id: qr.store_id,
      points_earned: qr.points,
    });

    // Add points
    const result = await addFanPoints(fan.id, qr.points, 'earn', '鎵爜绉垎', `娑堣垂鑰呮壂鐮?${qr.code}`);

    return { success: true, points: qr.points, fan: result, product: localDb.findById('products', qr.product_id) };
  }
  // Supabase 閫氳繃 RPC 璋冪敤
  const { data, error } = await supabase.rpc('scan_qr_code', { qr_id: qrCodeId });
  if (error) throw error;
  return data;
}

export async function getScanRecords(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('scan_records');
    if (filters.store_id) data = data.filter((r) => r.store_id === filters.store_id);
    if (filters.fan_id) data = data.filter((r) => r.fan_id === filters.fan_id);
    return data.map((r) => ({
      ...r,
      products: localDb.findById('products', r.product_id),
      stores: localDb.findById('stores', r.store_id),
      fans: localDb.findById('fans', r.fan_id),
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  const { data, error } = await supabase.from('scan_records').select('*, products(name), stores(name), fans(level, points)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
