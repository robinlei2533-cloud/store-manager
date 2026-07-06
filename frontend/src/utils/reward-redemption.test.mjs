import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  createPendingRedemption,
  confirmRewardPickup,
  validateRewardPickup,
} from './reward-redemption.js';

const now = new Date('2026-07-06T10:00:00.000Z');
const fan = { id: 'fan-1' };
const item = { id: 'mall-001', name: 'UWELL G4 Device', points_cost: 800 };
const sStore = { id: 'store-s', level: 'S', name: 'S Store' };
const aStore = { id: 'store-a', level: 'A', name: 'A Store' };
const stock = { id: 'stock-1', item_id: 'mall-001', quantity_on_hand: 2 };

test('creates pending pickup redemption with a 7 day expiry', () => {
  const redemption = createPendingRedemption({ fan, item, code: 'UW-ABC12345', now });

  assert.equal(redemption.fan_id, 'fan-1');
  assert.equal(redemption.item_id, 'mall-001');
  assert.equal(redemption.status, 'pending_pickup');
  assert.equal(redemption.redeem_code, 'UW-ABC12345');
  assert.equal(redemption.expires_at, '2026-07-13T10:00:00.000Z');
});

test('allows S level store pickup when code is pending and stock exists', () => {
  const redemption = createPendingRedemption({ fan, item, code: 'UW-ABC12345', now });

  const result = validateRewardPickup({ redemption, store: sStore, inventoryItem: stock, now });

  assert.equal(result.valid, true);
  assert.equal(result.message, 'Ready for pickup');
});

test('rejects reward pickup for non S level stores', () => {
  const redemption = createPendingRedemption({ fan, item, code: 'UW-ABC12345', now });

  const result = validateRewardPickup({ redemption, store: aStore, inventoryItem: stock, now });

  assert.equal(result.valid, false);
  assert.equal(result.message, 'Only S-level UWELL stores can fulfill rewards');
});

test('rejects used expired and insufficient stock pickup attempts', () => {
  const used = { ...createPendingRedemption({ fan, item, code: 'UW-USED123', now }), status: 'picked_up' };
  const expired = createPendingRedemption({
    fan,
    item,
    code: 'UW-OLD12345',
    now: new Date('2026-06-01T10:00:00.000Z'),
  });
  const later = new Date('2026-07-06T10:00:00.000Z');

  assert.equal(validateRewardPickup({ redemption: used, store: sStore, inventoryItem: stock, now }).message, 'Code already used');
  assert.equal(validateRewardPickup({ redemption: expired, store: sStore, inventoryItem: stock, now: later }).message, 'Code expired');
  assert.equal(validateRewardPickup({ redemption: createPendingRedemption({ fan, item, code: 'UW-NOSTOCK', now }), store: sStore, inventoryItem: { ...stock, quantity_on_hand: 0 }, now }).message, 'Reward stock is not enough. Request replenishment.');
});

test('confirm pickup marks redemption picked up and deducts store inventory', () => {
  const redemption = { id: 'redemption-1', ...createPendingRedemption({ fan, item, code: 'UW-ABC12345', now }) };
  const operations = [];
  const fakeDb = {
    transaction(callback) {
      return callback(this);
    },
    update(table, id, patch) {
      operations.push({ type: 'update', table, id, patch });
      return { id, ...patch };
    },
    insert(table, record) {
      operations.push({ type: 'insert', table, record });
      return { id: 'movement-1', ...record };
    },
  };

  const result = confirmRewardPickup({
    localDb: fakeDb,
    redemption,
    store: sStore,
    inventoryItem: stock,
    pickedUpBy: 'owner-1',
    now,
  });

  assert.equal(result.status, 'picked_up');
  assert.equal(operations[0].table, 'mall_redemptions');
  assert.equal(operations[0].patch.pickup_store_id, 'store-s');
  assert.equal(operations[1].table, 'material_stocks');
  assert.equal(operations[1].patch.quantity_on_hand, 1);
  assert.equal(operations[2].table, 'material_outbound');
  assert.equal(operations[2].record.movement_type, 'reward_redemption');
  assert.equal(operations[2].record.quantity, -1);
});
