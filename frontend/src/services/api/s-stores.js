// Domain: S Stores
// S Store V1 service boundaries.

import localDb from '../db/localDb';
import { supabase } from '../supabase';
import { ensureLocalInit, isLocal, withFallback } from './helpers';
import { recordAuditLog } from './audit-logs';
import {
  canDowngradeSStore,
  canRestoreSStore,
  canStoreSubmitSReport,
  isLowStock,
} from '../../utils/s-store-rules';
import { canEditLockedHistory, canViewCompanyScope, isInAssignedRegion } from '../../utils/uwellRoleAccess';

function byNewest(a, b) {
  return new Date(b.submitted_at || b.created_at || b.action_at || 0) - new Date(a.submitted_at || a.created_at || a.action_at || 0);
}

function getStore(storeId) {
  return localDb.findById('stores', storeId);
}

async function getRemoteStore(storeId) {
  const { data, error } = await supabase.rpc('get_internal_store', { p_store_id: storeId });
  if (error) throw error;
  return data;
}

function requireStoreReportAccess(profile, storeId) {
  const store = getStore(storeId);
  if (!canStoreSubmitSReport(profile, store)) {
    throw new Error('S Store report submission is not allowed for this store.');
  }
  return store;
}

function attachStore(record) {
  const store = getStore(record.store_id);
  return { ...record, store };
}

function attachRemoteStore(record) {
  if (!record) return record;
  const { stores, ...rest } = record;
  return { ...rest, store: stores || record.store || null };
}

const completedStatuses = ['completed', 'verified', 'picked_up'];
const hasSupabaseRuntime = typeof window !== 'undefined'
  && Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

function belongsToStore(record, storeId) {
  return [
    record.store_id,
    record.pickup_store_id,
    record.redeemed_store_id,
    record.verification_store_id,
  ].includes(storeId);
}

function sumPoints(rows) {
  return rows.reduce((sum, row) => sum + Number(row.points || row.points_cost || row.points_earned || 0), 0);
}

const optionalRemoteContributionSources = {
  fan_engagement_tasks: { optional: true, enabled: false },
};

async function safeOptionalRemoteRows({ tableName, optional = false, enabled = true }) {
  if (!enabled) return [];
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    if (optional) return [];
    throw error;
  }
  return data || [];
}

function localSStores(filters = {}) {
  ensureLocalInit();
  let stores = localDb.all('stores').filter((store) => (
    store.is_s_store
    || store.level === 'S'
    || (filters.includeDowngraded && store.s_store_status === 'downgraded')
  ));
  if (filters.status) stores = stores.filter((store) => store.s_store_status === filters.status);
  if (filters.city) stores = stores.filter((store) => store.city === filters.city);
  if (filters.search) {
    const search = filters.search.toLowerCase();
    stores = stores.filter((store) => String(store.name || '').toLowerCase().includes(search));
  }
  return stores.sort((a, b) => new Date(b.became_s_at || b.updated_at || 0) - new Date(a.became_s_at || a.updated_at || 0));
}

function localHistory(tableName, storeId) {
  ensureLocalInit();
  return localDb.all(tableName)
    .filter((record) => record.store_id === storeId)
    .sort(byNewest);
}

function localReplenishmentTasks(filters = {}) {
  ensureLocalInit();
  let tasks = localDb.all('s_store_replenishment_tasks');
  if (filters.store_id) tasks = tasks.filter((task) => task.store_id === filters.store_id);
  if (filters.status) tasks = tasks.filter((task) => task.status === filters.status);
  return tasks.map(attachStore).sort(byNewest);
}

function buildContributionMetrics(storeId, {
  campaignClaims = [],
  rewardPickups = [],
  storeScans = [],
  fanEngagementTasks = [],
}) {
  return {
    store_id: storeId,
    verifiedActivityCount: campaignClaims.length,
    rewardPickupCount: rewardPickups.length,
    storeScanCount: storeScans.length,
    campaignContributionCount: campaignClaims.length + fanEngagementTasks.length,
    contributedPoints: sumPoints(rewardPickups) + sumPoints(storeScans) + sumPoints(fanEngagementTasks),
    sources: {
      campaign_claims: campaignClaims.length,
      mall_redemptions: rewardPickups.length,
      scan_records: storeScans.length,
      fan_engagement_tasks: fanEngagementTasks.length,
    },
  };
}

function localContributionMetrics(storeId) {
  ensureLocalInit();
  return buildContributionMetrics(storeId, {
    campaignClaims: localDb.all('campaign_claims')
      .filter((record) => belongsToStore(record, storeId) && completedStatuses.includes(record.status)),
    rewardPickups: localDb.all('mall_redemptions')
      .filter((record) => belongsToStore(record, storeId) && completedStatuses.includes(record.status)),
    storeScans: localDb.all('scan_records')
      .filter((record) => belongsToStore(record, storeId)),
    fanEngagementTasks: localDb.all('fan_engagement_tasks')
      .filter((record) => belongsToStore(record, storeId) && completedStatuses.includes(record.status)),
  });
}

async function remoteHistory(tableName, storeId, orderColumn = 'submitted_at') {
  const { data, error } = await supabase.from(tableName).select('*').eq('store_id', storeId).order(orderColumn, { ascending: false });
  if (error) throw error;
  return (data || []).sort(byNewest);
}

function auditSStoreAction({ profile, store, actionType, beforeValue = '', afterValue = '', reason = '', severity = 'medium' }) {
  recordAuditLog({
    profile,
    store,
    actionType,
    beforeValue,
    afterValue,
    reason,
    sourceModule: 's_store_management',
    category: 's_store',
    severity,
  });
}

function requireCorrectionReason(payload = {}) {
  if (!payload.correction_reason?.trim()) {
    throw new Error('S Store correction requires a reason.');
  }
}

function requireCorrectionAccess(profile, store) {
  if (!canCorrectSStoreHistory(profile, store)) {
    throw new Error('S Store locked history correction is not allowed.');
  }
}

function getRecordStore(record) {
  return getStore(record?.store_id);
}

async function remoteMutation(rpcName, params, localFn) {
  return withFallback(async () => {
    const { data, error } = await supabase.rpc(rpcName, params);
    if (error) throw error;
    return data;
  }, localFn);
}

function shouldUseRemoteMutation() {
  return !isLocal() && hasSupabaseRuntime;
}

export async function getSStores(filters = {}) {
  if (isLocal() || !hasSupabaseRuntime) return localSStores(filters);
  return withFallback(async () => {
    const { data, error } = await supabase.rpc('get_internal_stores', { p_filters: filters });
    if (error) throw error;
    return (data || [])
      .filter((store) => (
        store.is_s_store
        || store.level === 'S'
        || (filters.includeDowngraded && store.s_store_status === 'downgraded')
      ))
      .filter((store) => (!filters.status || store.s_store_status === filters.status))
      .filter((store) => (!filters.city || store.city === filters.city))
      .filter((store) => {
        if (!filters.search) return true;
        return String(store.name || '').toLowerCase().includes(filters.search.toLowerCase());
      })
      .sort((a, b) => new Date(b.became_s_at || b.updated_at || 0) - new Date(a.became_s_at || a.updated_at || 0));
  }, () => localSStores(filters));
}

export async function getSStoreDetail(storeId, options = {}) {
  const buildDetail = async (store) => {
    const isRecoverableDowngraded = options.includeDowngraded && store?.s_store_status === 'downgraded';
    if (!store || (!store.is_s_store && store.level !== 'S' && !isRecoverableDowngraded)) return null;
    const [latestInventory] = await getSStoreInventoryHistory(storeId);
    const [latestMaterialInventory] = await getSStoreMaterialInventoryHistory(storeId);
    const [latestSellThrough] = await getSStoreSellThroughHistory(storeId);
    return { ...store, latestInventory, latestMaterialInventory, latestSellThrough };
  };
  if (isLocal() || !hasSupabaseRuntime) return buildDetail(getStore(storeId));
  return withFallback(async () => buildDetail(await getRemoteStore(storeId)), () => buildDetail(getStore(storeId)));
}

export async function getSStoreStatusHistory(storeId) {
  if (isLocal() || !hasSupabaseRuntime) return localHistory('s_store_status_history', storeId);
  return withFallback(
    () => remoteHistory('s_store_status_history', storeId, 'action_at'),
    () => localHistory('s_store_status_history', storeId),
  );
}

export async function getSStoreSellThroughHistory(storeId) {
  if (isLocal() || !hasSupabaseRuntime) return localHistory('s_store_sell_through', storeId);
  return withFallback(
    () => remoteHistory('s_store_sell_through', storeId),
    () => localHistory('s_store_sell_through', storeId),
  );
}

export async function getSStoreInventoryHistory(storeId) {
  if (isLocal() || !hasSupabaseRuntime) return localHistory('s_store_product_inventory_snapshots', storeId);
  return withFallback(
    () => remoteHistory('s_store_product_inventory_snapshots', storeId),
    () => localHistory('s_store_product_inventory_snapshots', storeId),
  );
}

export async function getSStoreMaterialInventoryHistory(storeId) {
  if (isLocal() || !hasSupabaseRuntime) return localHistory('s_store_material_inventory_snapshots', storeId);
  return withFallback(
    () => remoteHistory('s_store_material_inventory_snapshots', storeId),
    () => localHistory('s_store_material_inventory_snapshots', storeId),
  );
}

export async function getSStoreVisitDetails(storeId) {
  if (isLocal() || !hasSupabaseRuntime) return localHistory('s_store_visit_details', storeId);
  return withFallback(
    () => remoteHistory('s_store_visit_details', storeId),
    () => localHistory('s_store_visit_details', storeId),
  );
}

export async function getReplenishmentTasks(filters = {}) {
  if (isLocal() || !hasSupabaseRuntime) return localReplenishmentTasks(filters);
  return withFallback(async () => {
    let query = supabase.from('s_store_replenishment_tasks').select('*');
    if (filters.store_id) query = query.eq('store_id', filters.store_id);
    if (filters.status) query = query.eq('status', filters.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(attachRemoteStore).sort(byNewest);
  }, () => localReplenishmentTasks(filters));
}

export async function getSStoreContributionMetrics(storeId) {
  if (isLocal() || !hasSupabaseRuntime) return localContributionMetrics(storeId);
  return withFallback(async () => {
    const [
      campaignClaimsResult,
      rewardPickupsResult,
      storeScansResult,
      fanEngagementTasksResult,
    ] = await Promise.all([
      supabase.from('campaign_claims').select('*'),
      supabase.from('mall_redemptions').select('*'),
      supabase.from('scan_records').select('*'),
      safeOptionalRemoteRows({
        tableName: 'fan_engagement_tasks',
        optional: true,
        enabled: optionalRemoteContributionSources.fan_engagement_tasks.enabled,
      }),
    ]);
    [
      campaignClaimsResult,
      rewardPickupsResult,
      storeScansResult,
    ].forEach((result) => {
      if (result.error) throw result.error;
    });
    return buildContributionMetrics(storeId, {
      campaignClaims: (campaignClaimsResult.data || [])
        .filter((record) => belongsToStore(record, storeId) && completedStatuses.includes(record.status)),
      rewardPickups: (rewardPickupsResult.data || [])
        .filter((record) => belongsToStore(record, storeId) && completedStatuses.includes(record.status)),
      storeScans: (storeScansResult.data || [])
        .filter((record) => belongsToStore(record, storeId)),
      fanEngagementTasks: (fanEngagementTasksResult || [])
        .filter((record) => belongsToStore(record, storeId) && completedStatuses.includes(record.status)),
    });
  }, () => localContributionMetrics(storeId));
}

async function localSubmitSStoreSellThrough(payload, profile) {
  ensureLocalInit();
  const store = requireStoreReportAccess(profile, payload.store_id);
  const record = localDb.insert('s_store_sell_through', {
    ...payload,
    submitted_by: profile.id,
    submitted_at: new Date().toISOString(),
    locked: true,
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store sell-through submitted',
    afterValue: {
      period_type: record.period_type,
      period_start: record.period_start,
      period_end: record.period_end,
      open_system_sold_qty: record.open_system_sold_qty,
      disposable_sold_qty: record.disposable_sold_qty,
      locked: record.locked,
    },
  });
  return record;
}

export async function submitSStoreSellThrough(payload, profile) {
  if (!shouldUseRemoteMutation()) return localSubmitSStoreSellThrough(payload, profile);
  return remoteMutation('submit_s_store_sell_through', {
    p_store_id: payload.store_id,
    p_period_type: payload.period_type,
    p_period_start: payload.period_start,
    p_period_end: payload.period_end,
    p_open_system_sold_qty: payload.open_system_sold_qty,
    p_disposable_sold_qty: payload.disposable_sold_qty,
  }, () => localSubmitSStoreSellThrough(payload, profile));
}

async function localSubmitSStoreInventory(payload, profile) {
  ensureLocalInit();
  const store = requireStoreReportAccess(profile, payload.store_id);
  const openLowStock = isLowStock({
    currentStock: payload.open_system_current_stock,
    targetStock: payload.open_system_target_stock,
  });
  const disposableLowStock = isLowStock({
    currentStock: payload.disposable_current_stock,
    targetStock: payload.disposable_target_stock,
  });
  const record = localDb.insert('s_store_product_inventory_snapshots', {
    ...payload,
    low_stock: openLowStock || disposableLowStock,
    open_system_low_stock: openLowStock,
    disposable_low_stock: disposableLowStock,
    submitted_by: profile.id,
    submitted_at: new Date().toISOString(),
    locked: true,
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store product inventory submitted',
    afterValue: {
      open_system_current_stock: record.open_system_current_stock,
      open_system_target_stock: record.open_system_target_stock,
      disposable_current_stock: record.disposable_current_stock,
      disposable_target_stock: record.disposable_target_stock,
      low_stock: record.low_stock,
      locked: record.locked,
    },
    severity: record.low_stock ? 'high' : 'medium',
  });
  return record;
}

export async function submitSStoreInventory(payload, profile) {
  if (!shouldUseRemoteMutation()) return localSubmitSStoreInventory(payload, profile);
  return remoteMutation('submit_s_store_product_inventory', {
    p_store_id: payload.store_id,
    p_open_system_current_stock: payload.open_system_current_stock,
    p_open_system_target_stock: payload.open_system_target_stock,
    p_disposable_current_stock: payload.disposable_current_stock,
    p_disposable_target_stock: payload.disposable_target_stock,
    p_note: payload.note || '',
  }, () => localSubmitSStoreInventory(payload, profile));
}

async function localSubmitSStoreMaterialInventory(payload, profile) {
  ensureLocalInit();
  const store = requireStoreReportAccess(profile, payload.store_id);
  const record = localDb.insert('s_store_material_inventory_snapshots', {
    ...payload,
    low_stock: isLowStock({
      currentStock: payload.current_quantity,
      targetStock: payload.target_quantity,
    }),
    submitted_by: profile.id,
    submitted_at: new Date().toISOString(),
    locked: true,
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store material inventory submitted',
    afterValue: {
      material_type: record.material_type,
      current_quantity: record.current_quantity,
      target_quantity: record.target_quantity,
      low_stock: record.low_stock,
      locked: record.locked,
    },
    severity: record.low_stock ? 'high' : 'medium',
  });
  return record;
}

export async function submitSStoreMaterialInventory(payload, profile) {
  if (!shouldUseRemoteMutation()) return localSubmitSStoreMaterialInventory(payload, profile);
  return remoteMutation('submit_s_store_material_inventory', {
    p_store_id: payload.store_id,
    p_material_type: payload.material_type,
    p_current_quantity: payload.current_quantity,
    p_target_quantity: payload.target_quantity,
    p_note: payload.note || '',
  }, () => localSubmitSStoreMaterialInventory(payload, profile));
}

async function localSubmitSStoreVisitDetail(payload, profile) {
  ensureLocalInit();
  if (!['admin', 'manager', 'rep'].includes(profile?.role)) {
    throw new Error('S Store visit submission is not allowed for this role.');
  }
  const store = getStore(payload.store_id);
  const record = localDb.insert('s_store_visit_details', {
    ...payload,
    field_rep_id: payload.field_rep_id || profile.id,
    submitted_by: profile.id,
    submitted_at: new Date().toISOString(),
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store visit detail submitted',
    afterValue: {
      visit_id: record.visit_id,
      inventory_status: record.inventory_status,
      display_status: record.display_status,
      replenishment_needed: record.replenishment_needed,
    },
    severity: record.replenishment_needed ? 'high' : 'medium',
  });
  return record;
}

export async function submitSStoreVisitDetail(payload, profile) {
  if (!shouldUseRemoteMutation()) return localSubmitSStoreVisitDetail(payload, profile);
  return remoteMutation('submit_s_store_visit_detail', {
    p_visit_id: payload.visit_id,
    p_store_id: payload.store_id,
    p_field_rep_id: payload.field_rep_id || profile?.id || null,
    p_inventory_status: payload.inventory_status || '',
    p_display_status: payload.display_status || '',
    p_sell_through_observation: payload.sell_through_observation || '',
    p_competitor_situation: payload.competitor_situation || '',
    p_hot_brands: payload.hot_brands || '',
    p_hot_flavors: payload.hot_flavors || '',
    p_consumer_feedback: payload.consumer_feedback || '',
    p_market_notes: payload.market_notes || '',
    p_support_needed: payload.support_needed || '',
    p_replenishment_needed: Boolean(payload.replenishment_needed),
    p_visit_photos: payload.visit_photos || [],
  }, () => localSubmitSStoreVisitDetail(payload, profile));
}

async function localCreateReplenishmentTask(payload, profile) {
  ensureLocalInit();
  if (!['admin', 'manager', 'rep'].includes(profile?.role)) {
    throw new Error('S Store replenishment task creation is not allowed for this role.');
  }
  const store = getStore(payload.store_id);
  const record = localDb.insert('s_store_replenishment_tasks', {
    ...payload,
    status: payload.status || 'pending',
    created_by: profile.id,
    created_at: new Date().toISOString(),
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store replenishment task created',
    afterValue: {
      trigger_source: record.trigger_source,
      item_type: record.item_type,
      requested_quantity: record.requested_quantity,
      status: record.status,
    },
    reason: record.note || '',
  });
  return record;
}

export async function createReplenishmentTask(payload, profile) {
  if (!shouldUseRemoteMutation()) return localCreateReplenishmentTask(payload, profile);
  return remoteMutation('create_s_store_replenishment_task', {
    p_store_id: payload.store_id,
    p_trigger_source: payload.trigger_source,
    p_item_type: payload.item_type,
    p_requested_quantity: payload.requested_quantity,
    p_assigned_rep_id: payload.assigned_rep_id || null,
    p_status: payload.status || 'pending',
    p_note: payload.note || '',
  }, () => localCreateReplenishmentTask(payload, profile));
}

async function localCompleteReplenishmentTask(taskId, payload, profile) {
  ensureLocalInit();
  if (!['admin', 'manager', 'rep'].includes(profile?.role)) {
    throw new Error('S Store replenishment completion is not allowed for this role.');
  }
  if (!payload?.completion_photos?.length) {
    throw new Error('S Store replenishment completion requires photos.');
  }
  const beforeTask = localDb.findById('s_store_replenishment_tasks', taskId);
  const store = getStore(beforeTask?.store_id);
  const record = localDb.update('s_store_replenishment_tasks', taskId, {
    ...payload,
    status: 'completed',
    completed_by: profile.id,
    completed_at: new Date().toISOString(),
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store replenishment completed',
    beforeValue: beforeTask?.status || '',
    afterValue: record?.status || 'completed',
    reason: payload.note || '',
  });
  return record;
}

export async function completeReplenishmentTask(taskId, payload, profile) {
  if (!shouldUseRemoteMutation()) return localCompleteReplenishmentTask(taskId, payload, profile);
  return remoteMutation('complete_s_store_replenishment_task', {
    p_task_id: taskId,
    p_completion_photos: payload.completion_photos || [],
    p_note: payload.note || '',
  }, () => localCompleteReplenishmentTask(taskId, payload, profile));
}

async function localDowngradeSStoreToA(storeId, payload, profile) {
  ensureLocalInit();
  const store = getStore(storeId);
  if (!canDowngradeSStore(profile, store)) throw new Error('S Store downgrade is not allowed.');
  if (!payload?.reason) throw new Error('S Store downgrade requires a reason.');
  const beforeStatus = store.s_store_status || 'active';
  localDb.update('stores', storeId, { level: 'A', is_s_store: false, s_store_status: 'downgraded' });
  const history = localDb.insert('s_store_status_history', {
    store_id: storeId,
    action_type: 'downgrade_to_a',
    before_status: beforeStatus,
    after_status: 'downgraded',
    reason: payload.reason,
    note: payload.note || '',
    operator_id: profile.id,
    action_at: new Date().toISOString(),
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store downgraded to A',
    beforeValue: beforeStatus,
    afterValue: 'downgraded',
    reason: payload.reason,
    severity: 'high',
  });
  return history;
}

export async function downgradeSStoreToA(storeId, payload, profile) {
  if (!shouldUseRemoteMutation()) return localDowngradeSStoreToA(storeId, payload, profile);
  return remoteMutation('downgrade_s_store_to_a', {
    p_store_id: storeId,
    p_reason: payload.reason,
    p_note: payload.note || '',
  }, () => localDowngradeSStoreToA(storeId, payload, profile));
}

async function localRestoreSStore(storeId, payload, profile) {
  ensureLocalInit();
  const store = getStore(storeId);
  if (!canRestoreSStore(profile, store)) throw new Error('S Store restore is not allowed.');
  if (!payload?.reason) throw new Error('S Store restore requires a reason.');
  const beforeStatus = store.s_store_status || 'downgraded';
  localDb.update('stores', storeId, { level: 'S', is_s_store: true, s_store_status: 'active' });
  const history = localDb.insert('s_store_status_history', {
    store_id: storeId,
    action_type: 'restore_to_s',
    before_status: beforeStatus,
    after_status: 'active',
    reason: payload.reason,
    note: payload.note || '',
    operator_id: profile.id,
    action_at: new Date().toISOString(),
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store restored',
    beforeValue: beforeStatus,
    afterValue: 'active',
    reason: payload.reason,
  });
  return history;
}

export async function restoreSStore(storeId, payload, profile) {
  if (!shouldUseRemoteMutation()) return localRestoreSStore(storeId, payload, profile);
  return remoteMutation('restore_s_store', {
    p_store_id: storeId,
    p_reason: payload.reason,
    p_note: payload.note || '',
  }, () => localRestoreSStore(storeId, payload, profile));
}

async function localCorrectSStoreSellThrough(recordId, payload, profile) {
  ensureLocalInit();
  requireCorrectionReason(payload);
  const beforeRecord = localDb.findById('s_store_sell_through', recordId);
  if (!beforeRecord) throw new Error('S Store sell-through record was not found.');
  const store = getRecordStore(beforeRecord);
  requireCorrectionAccess(profile, store);
  const record = localDb.update('s_store_sell_through', recordId, {
    period_type: payload.period_type || beforeRecord.period_type,
    period_start: payload.period_start || beforeRecord.period_start,
    period_end: payload.period_end || beforeRecord.period_end,
    open_system_sold_qty: Number(payload.open_system_sold_qty ?? beforeRecord.open_system_sold_qty),
    disposable_sold_qty: Number(payload.disposable_sold_qty ?? beforeRecord.disposable_sold_qty),
    corrected_by: profile.id,
    corrected_at: new Date().toISOString(),
    correction_reason: payload.correction_reason.trim(),
    correction_note: payload.correction_note?.trim() || '',
    locked: true,
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store sell-through corrected',
    beforeValue: beforeRecord,
    afterValue: record,
    reason: payload.correction_reason.trim(),
    severity: 'high',
  });
  return record;
}

export async function correctSStoreSellThrough(recordId, payload, profile) {
  if (!shouldUseRemoteMutation()) return localCorrectSStoreSellThrough(recordId, payload, profile);
  return remoteMutation('correct_s_store_sell_through', {
    p_record_id: recordId,
    p_period_type: payload.period_type || null,
    p_period_start: payload.period_start || null,
    p_period_end: payload.period_end || null,
    p_open_system_sold_qty: payload.open_system_sold_qty ?? null,
    p_disposable_sold_qty: payload.disposable_sold_qty ?? null,
    p_correction_reason: payload.correction_reason,
    p_correction_note: payload.correction_note || '',
  }, () => localCorrectSStoreSellThrough(recordId, payload, profile));
}

async function localCorrectSStoreInventory(recordId, payload, profile) {
  ensureLocalInit();
  requireCorrectionReason(payload);
  const beforeRecord = localDb.findById('s_store_product_inventory_snapshots', recordId);
  if (!beforeRecord) throw new Error('S Store product inventory record was not found.');
  const store = getRecordStore(beforeRecord);
  requireCorrectionAccess(profile, store);
  const openCurrent = Number(payload.open_system_current_stock ?? beforeRecord.open_system_current_stock);
  const openTarget = Number(payload.open_system_target_stock ?? beforeRecord.open_system_target_stock);
  const disposableCurrent = Number(payload.disposable_current_stock ?? beforeRecord.disposable_current_stock);
  const disposableTarget = Number(payload.disposable_target_stock ?? beforeRecord.disposable_target_stock);
  const openLowStock = isLowStock({ currentStock: openCurrent, targetStock: openTarget });
  const disposableLowStock = isLowStock({ currentStock: disposableCurrent, targetStock: disposableTarget });
  const record = localDb.update('s_store_product_inventory_snapshots', recordId, {
    open_system_current_stock: openCurrent,
    open_system_target_stock: openTarget,
    disposable_current_stock: disposableCurrent,
    disposable_target_stock: disposableTarget,
    open_system_low_stock: openLowStock,
    disposable_low_stock: disposableLowStock,
    low_stock: openLowStock || disposableLowStock,
    note: payload.note ?? beforeRecord.note,
    corrected_by: profile.id,
    corrected_at: new Date().toISOString(),
    correction_reason: payload.correction_reason.trim(),
    correction_note: payload.correction_note?.trim() || '',
    locked: true,
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store product inventory corrected',
    beforeValue: beforeRecord,
    afterValue: record,
    reason: payload.correction_reason.trim(),
    severity: record.low_stock ? 'high' : 'medium',
  });
  return record;
}

export async function correctSStoreInventory(recordId, payload, profile) {
  if (!shouldUseRemoteMutation()) return localCorrectSStoreInventory(recordId, payload, profile);
  return remoteMutation('correct_s_store_product_inventory', {
    p_record_id: recordId,
    p_open_system_current_stock: payload.open_system_current_stock ?? null,
    p_open_system_target_stock: payload.open_system_target_stock ?? null,
    p_disposable_current_stock: payload.disposable_current_stock ?? null,
    p_disposable_target_stock: payload.disposable_target_stock ?? null,
    p_note: payload.note || '',
    p_correction_reason: payload.correction_reason,
    p_correction_note: payload.correction_note || '',
  }, () => localCorrectSStoreInventory(recordId, payload, profile));
}

async function localCorrectSStoreMaterialInventory(recordId, payload, profile) {
  ensureLocalInit();
  requireCorrectionReason(payload);
  const beforeRecord = localDb.findById('s_store_material_inventory_snapshots', recordId);
  if (!beforeRecord) throw new Error('S Store material inventory record was not found.');
  const store = getRecordStore(beforeRecord);
  requireCorrectionAccess(profile, store);
  const currentQuantity = Number(payload.current_quantity ?? beforeRecord.current_quantity);
  const targetQuantity = Number(payload.target_quantity ?? beforeRecord.target_quantity);
  const lowStock = isLowStock({ currentStock: currentQuantity, targetStock: targetQuantity });
  const record = localDb.update('s_store_material_inventory_snapshots', recordId, {
    material_type: payload.material_type || beforeRecord.material_type,
    current_quantity: currentQuantity,
    target_quantity: targetQuantity,
    low_stock: lowStock,
    note: payload.note ?? beforeRecord.note,
    corrected_by: profile.id,
    corrected_at: new Date().toISOString(),
    correction_reason: payload.correction_reason.trim(),
    correction_note: payload.correction_note?.trim() || '',
    locked: true,
  });
  auditSStoreAction({
    profile,
    store,
    actionType: 'S Store material inventory corrected',
    beforeValue: beforeRecord,
    afterValue: record,
    reason: payload.correction_reason.trim(),
    severity: record.low_stock ? 'high' : 'medium',
  });
  return record;
}

export async function correctSStoreMaterialInventory(recordId, payload, profile) {
  if (!shouldUseRemoteMutation()) return localCorrectSStoreMaterialInventory(recordId, payload, profile);
  return remoteMutation('correct_s_store_material_inventory', {
    p_record_id: recordId,
    p_material_type: payload.material_type || null,
    p_current_quantity: payload.current_quantity ?? null,
    p_target_quantity: payload.target_quantity ?? null,
    p_note: payload.note || '',
    p_correction_reason: payload.correction_reason,
    p_correction_note: payload.correction_note || '',
  }, () => localCorrectSStoreMaterialInventory(recordId, payload, profile));
}

export function canCorrectSStoreHistory(profile, store = {}) {
  return canEditLockedHistory(profile)
    || (canViewCompanyScope(profile) && Boolean(store?.id))
    || (profile?.role === 'manager' && isInAssignedRegion(profile, store));
}
