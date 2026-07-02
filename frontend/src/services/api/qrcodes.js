// Domain: qrcodes
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import { isLocal, ensureLocalInit } from './helpers';
import { addFanPoints } from './fans';

// ============ QRCODES ============

export async function getQrCodes(filters = {}) {
  ensureLocalInit();
  if (isLocal()) {
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
  if (isLocal()) return localDb.insert('qr_codes', { ...qrData, scan_count: 0, is_active: true });
  const { data, error } = await supabase.from('qr_codes').insert(qrData).select().single();
  if (error) throw error;
  return data;
}

export async function updateQrCode(id, qrData) {
  ensureLocalInit();
  if (isLocal()) return localDb.update('qr_codes', id, qrData);
  const { data, error } = await supabase.from('qr_codes').update(qrData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteQrCode(id) {
  ensureLocalInit();
  if (isLocal()) { localDb.remove('qr_codes', id); return; }
  const { error } = await supabase.from('qr_codes').delete().eq('id', id);
  if (error) throw error;
}

export async function scanQrCode(qrCodeId) {
  ensureLocalInit();
  if (isLocal()) {
    const qr = localDb.findById('qr_codes', qrCodeId);
    if (!qr || !qr.is_active) throw new Error('QR code invalid or disabled');

    // Get store fans
    const fan = localDb.find('fans', (f) => f.store_id === qr.store_id)[0];
    if (!fan) throw new Error('No fan account for this store');

    // Update QR scan count.
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
    const result = await addFanPoints(fan.id, qr.points, 'earn', 'scan', `扫码验证产品 ${qr.code}`);

    return { success: true, points: qr.points, fan: result, product: localDb.findById('products', qr.product_id) };
  }
  // Supabase handles scan validation and point creation through RPC.
  const { data, error } = await supabase.rpc('scan_qr_code', { qr_id: qrCodeId });
  if (error) throw error;
  return data;
}

export async function getScanRecords(filters = {}) {
  ensureLocalInit();
  if (isLocal()) {
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

