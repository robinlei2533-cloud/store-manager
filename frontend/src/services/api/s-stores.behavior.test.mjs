import { beforeEach, describe, expect, test } from 'vitest';
import localDb from '../db/localDb';
import {
  completeReplenishmentTask,
  createReplenishmentTask,
  downgradeSStoreToA,
  getSStoreDetail,
  getSStoreContributionMetrics,
  getSStores,
  restoreSStore,
  correctSStoreInventory,
  correctSStoreMaterialInventory,
  correctSStoreSellThrough,
  submitSStoreInventory,
  submitSStoreMaterialInventory,
  submitSStoreSellThrough,
} from './s-stores';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
    clear: () => { store.clear(); },
  };
}

describe('S Store service audit behavior', () => {
  const manager = { id: 'manager-1', role: 'manager', name: 'Riyadh Manager', region: 'Riyadh' };
  const owner = { id: 'owner-1', role: 'store_owner', name: 'S Store Owner' };
  const rep = { id: 'rep-1', role: 'rep', name: 'Field Rep' };

  beforeEach(() => {
    globalThis.localStorage = createMemoryStorage();
    localDb.reset({
      stores: [
        {
          id: 's-1',
          name: 'UWELL Brand Store Riyadh',
          level: 'S',
          city: 'Riyadh',
          is_s_store: true,
          s_store_status: 'active',
          owner_profile_id: 'owner-1',
          rep_id: 'rep-1',
        },
      ],
      s_store_status_history: [],
      s_store_sell_through: [],
      s_store_product_inventory_snapshots: [],
      s_store_material_inventory_snapshots: [],
      s_store_visit_details: [],
      s_store_replenishment_tasks: [],
      campaign_claims: [
        { id: 'claim-1', store_id: 's-1', campaign_id: 'campaign-1', status: 'completed' },
        { id: 'claim-2', store_id: 's-1', campaign_id: 'campaign-2', status: 'verified' },
        { id: 'claim-3', store_id: 's-1', campaign_id: 'campaign-3', status: 'pending' },
      ],
      mall_redemptions: [
        { id: 'redemption-1', store_id: 's-1', status: 'picked_up', points: 100 },
        { id: 'redemption-2', pickup_store_id: 's-1', status: 'completed', points_cost: 200 },
        { id: 'redemption-3', store_id: 's-1', status: 'pending', points: 50 },
      ],
      scan_records: [
        { id: 'scan-1', store_id: 's-1', fan_id: 'fan-1', points_earned: 5 },
        { id: 'scan-2', store_id: 's-1', fan_id: 'fan-2', points_earned: 5 },
        { id: 'scan-other', store_id: 'other-store', fan_id: 'fan-3', points_earned: 5 },
      ],
      fan_engagement_tasks: [
        { id: 'task-1', store_id: 's-1', status: 'completed', points: 50 },
        { id: 'task-2', store_id: 's-1', status: 'verified', points_earned: 30 },
        { id: 'task-3', store_id: 's-1', status: 'pending', points: 10 },
      ],
      audit_logs: [],
    });
  });

  test('store-submitted sell-through and inventory records write audit logs', async () => {
    await submitSStoreSellThrough({
      store_id: 's-1',
      period_type: 'weekly',
      period_start: '2026-07-06',
      period_end: '2026-07-12',
      open_system_sold_qty: 20,
      disposable_sold_qty: 46,
    }, owner);

    await submitSStoreInventory({
      store_id: 's-1',
      open_system_current_stock: 9,
      open_system_target_stock: 30,
      disposable_current_stock: 80,
      disposable_target_stock: 120,
    }, owner);

    await submitSStoreMaterialInventory({
      store_id: 's-1',
      material_type: 'display_stand',
      current_quantity: 2,
      target_quantity: 12,
    }, owner);

    const logs = localDb.all('audit_logs');
    expect(logs.map((log) => log.action_type)).toEqual([
      'S Store sell-through submitted',
      'S Store product inventory submitted',
      'S Store material inventory submitted',
    ]);
    expect(logs[0]).toMatchObject({
      actor: 'S Store Owner',
      role: 'store_owner',
      region: 'Riyadh',
      target: 'UWELL Brand Store Riyadh',
    });
    expect(logs[1].after_value).toContain('"low_stock":true');
    expect(logs[2].after_value).toContain('"low_stock":true');
  });

  test('downgrade, restore, and replenishment completion write audit logs', async () => {
    const task = await createReplenishmentTask({
      store_id: 's-1',
      trigger_source: 'low_stock',
      item_type: 'open_system',
      requested_quantity: 24,
      assigned_rep_id: 'rep-1',
    }, manager);

    await completeReplenishmentTask(task.id, {
      completion_photos: ['photo-1.jpg'],
      note: 'Delivered open-system stock.',
    }, rep);

    await downgradeSStoreToA('s-1', { reason: 'Store unreachable for more than one month.' }, manager);
    await restoreSStore('s-1', { reason: 'Passed one month re-evaluation.' }, manager);

    const logs = localDb.all('audit_logs');
    expect(logs.map((log) => log.action_type)).toEqual([
      'S Store replenishment task created',
      'S Store replenishment completed',
      'S Store downgraded to A',
      'S Store restored',
    ]);
    expect(logs[2]).toMatchObject({
      before_value: 'active',
      after_value: 'downgraded',
      reason: 'Store unreachable for more than one month.',
    });
    expect(logs[3]).toMatchObject({
      before_value: 'downgraded',
      after_value: 'active',
      reason: 'Passed one month re-evaluation.',
    });
  });

  test('downgraded S Stores stay hidden by default but can be recovered by explicit read option', async () => {
    await downgradeSStoreToA('s-1', { reason: 'Store unreachable for more than one month.' }, manager);

    const defaultStores = await getSStores();
    const recoveryStores = await getSStores({ includeDowngraded: true });
    const defaultDetail = await getSStoreDetail('s-1');
    const recoveryDetail = await getSStoreDetail('s-1', { includeDowngraded: true });

    expect(defaultStores.map((store) => store.id)).not.toContain('s-1');
    expect(recoveryStores.map((store) => store.id)).toContain('s-1');
    expect(defaultDetail).toBeNull();
    expect(recoveryDetail).toMatchObject({
      id: 's-1',
      level: 'A',
      is_s_store: false,
      s_store_status: 'downgraded',
    });
  });

  test('contribution metrics aggregate only existing store-linked source records', async () => {
    const metrics = await getSStoreContributionMetrics('s-1');

    expect(metrics).toMatchObject({
      store_id: 's-1',
      verifiedActivityCount: 2,
      rewardPickupCount: 2,
      storeScanCount: 2,
      campaignContributionCount: 4,
      contributedPoints: 390,
    });
    expect(metrics.sources).toEqual({
      campaign_claims: 2,
      mall_redemptions: 2,
      scan_records: 2,
      fan_engagement_tasks: 2,
    });
    expect(localDb.all('s_store_contribution_metrics')).toEqual([]);
  });

  test('admin can correct locked S Store sell-through and inventory records with reason and audit trail', async () => {
    const sellThrough = await submitSStoreSellThrough({
      store_id: 's-1',
      period_type: 'weekly',
      period_start: '2026-07-06',
      period_end: '2026-07-12',
      open_system_sold_qty: 20,
      disposable_sold_qty: 46,
    }, owner);
    const productInventory = await submitSStoreInventory({
      store_id: 's-1',
      open_system_current_stock: 9,
      open_system_target_stock: 30,
      disposable_current_stock: 80,
      disposable_target_stock: 120,
    }, owner);
    const materialInventory = await submitSStoreMaterialInventory({
      store_id: 's-1',
      material_type: 'display_stand',
      current_quantity: 2,
      target_quantity: 12,
    }, owner);

    const admin = { id: 'admin-1', role: 'admin', name: 'Admin' };
    const correctedSellThrough = await correctSStoreSellThrough(sellThrough.id, {
      open_system_sold_qty: 24,
      disposable_sold_qty: 50,
      correction_reason: 'Matched field rep sales evidence.',
      correction_note: 'Corrected monthly closeout typo.',
    }, admin);
    const correctedProduct = await correctSStoreInventory(productInventory.id, {
      open_system_current_stock: 12,
      open_system_target_stock: 30,
      disposable_current_stock: 35,
      disposable_target_stock: 120,
      correction_reason: 'Store submitted stale stock count.',
    }, admin);
    const correctedMaterial = await correctSStoreMaterialInventory(materialInventory.id, {
      current_quantity: 8,
      target_quantity: 12,
      correction_reason: 'Updated after field photo check.',
    }, admin);

    expect(correctedSellThrough).toMatchObject({
      open_system_sold_qty: 24,
      disposable_sold_qty: 50,
      corrected_by: 'admin-1',
      correction_reason: 'Matched field rep sales evidence.',
      correction_note: 'Corrected monthly closeout typo.',
      locked: true,
    });
    expect(correctedProduct).toMatchObject({
      open_system_current_stock: 12,
      disposable_current_stock: 35,
      low_stock: true,
      corrected_by: 'admin-1',
      correction_reason: 'Store submitted stale stock count.',
      locked: true,
    });
    expect(correctedMaterial).toMatchObject({
      current_quantity: 8,
      low_stock: false,
      corrected_by: 'admin-1',
      correction_reason: 'Updated after field photo check.',
      locked: true,
    });

    expect(localDb.all('audit_logs').map((log) => log.action_type)).toEqual([
      'S Store sell-through submitted',
      'S Store product inventory submitted',
      'S Store material inventory submitted',
      'S Store sell-through corrected',
      'S Store product inventory corrected',
      'S Store material inventory corrected',
    ]);
  });

  test('manager can correct assigned-region S Store history but rep and store owner cannot', async () => {
    const sellThrough = await submitSStoreSellThrough({
      store_id: 's-1',
      period_type: 'weekly',
      period_start: '2026-07-06',
      period_end: '2026-07-12',
      open_system_sold_qty: 20,
      disposable_sold_qty: 46,
    }, owner);

    await expect(correctSStoreSellThrough(sellThrough.id, {
      open_system_sold_qty: 25,
      correction_reason: 'Riyadh manager evidence check.',
    }, manager)).resolves.toMatchObject({
      open_system_sold_qty: 25,
      corrected_by: 'manager-1',
    });

    await expect(correctSStoreSellThrough(sellThrough.id, {
      open_system_sold_qty: 26,
      correction_reason: 'Rep tries to correct.',
    }, rep)).rejects.toThrow('S Store locked history correction is not allowed.');

    await expect(correctSStoreSellThrough(sellThrough.id, {
      open_system_sold_qty: 27,
      correction_reason: 'Owner tries to correct.',
    }, owner)).rejects.toThrow('S Store locked history correction is not allowed.');

    await expect(correctSStoreSellThrough(sellThrough.id, {
      open_system_sold_qty: 28,
    }, manager)).rejects.toThrow('S Store correction requires a reason.');
  });
});
