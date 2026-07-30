import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  createPendingRedemption,
  confirmRewardPickup,
  validateRewardPickup,
} from './reward-redemption.js';

const now = new Date('2026-07-06T10:00:00.000Z');
const fan = { id: 'fan-1' };
const normalItem = { id: 'lanyard', name: 'UWELL lanyard', points_cost: 100, type: 'Normal' };
const premiumItem = { id: 'multi-pod', name: 'Multi-pod pack', points_cost: 900, type: 'Premium' };
const diamondItem = { id: 'china-trip', name: 'One-week China trip', points_cost: 15000, type: 'Diamond', reviewRequired: true };
const sStore = { id: 'store-s', level: 'S', name: 'S Store' };
const aStore = { id: 'store-a', level: 'A', name: 'A Store' };
const bStore = { id: 'store-b', level: 'B', name: 'B Store' };
const stock = { id: 'stock-1', item_id: 'lanyard', quantity_on_hand: 2 };

test('creates pending pickup redemption with a 7 day expiry', () => {
  const redemption = createPendingRedemption({ fan, item: normalItem, code: 'UW-ABC12345', now });

  assert.equal(redemption.fan_id, 'fan-1');
  assert.equal(redemption.item_id, 'lanyard');
  assert.equal(redemption.status, 'pending_pickup');
  assert.equal(redemption.redeem_code, 'UW-ABC12345');
  assert.equal(redemption.reward_type, 'Normal');
  assert.equal(redemption.pickup_policy, 'normal_a_s_store');
  assert.equal(redemption.expires_at, '2026-07-13T10:00:00.000Z');
});

test('allows normal rewards at A or S stores when code is pending and stock exists', () => {
  const redemption = createPendingRedemption({ fan, item: normalItem, code: 'UW-ABC12345', now });

  const sResult = validateRewardPickup({ redemption, store: sStore, inventoryItem: stock, now });
  const aResult = validateRewardPickup({ redemption, store: aStore, inventoryItem: stock, now });

  assert.equal(sResult.valid, true);
  assert.equal(aResult.valid, true);
  assert.equal(aResult.message, 'Ready for pickup');
});

test('allows premium rewards only at S stores and rejects B stores for normal rewards', () => {
  const premiumRedemption = createPendingRedemption({ fan, item: premiumItem, code: 'UW-PREMIUM', now });
  const normalRedemption = createPendingRedemption({ fan, item: normalItem, code: 'UW-NORMAL1', now });

  const premiumAtA = validateRewardPickup({ redemption: premiumRedemption, store: aStore, inventoryItem: stock, now });
  const normalAtB = validateRewardPickup({ redemption: normalRedemption, store: bStore, inventoryItem: stock, now });

  assert.equal(premiumAtA.valid, false);
  assert.equal(premiumAtA.message, 'Premium rewards can only be fulfilled by S-level UWELL stores');
  assert.equal(normalAtB.valid, false);
  assert.equal(normalAtB.message, 'Normal rewards can only be fulfilled by A or S stores');
});

test('requires backend approval before Diamond luxury reward pickup', () => {
  const pendingReview = createPendingRedemption({ fan, item: diamondItem, code: 'UW-DIAMOND', now });
  const approved = { ...pendingReview, review_status: 'approved' };

  const blocked = validateRewardPickup({ redemption: pendingReview, store: sStore, inventoryItem: stock, now });
  const allowed = validateRewardPickup({ redemption: approved, store: sStore, inventoryItem: stock, now });

  assert.equal(blocked.valid, false);
  assert.equal(blocked.message, 'Diamond luxury rewards require backend approval before pickup');
  assert.equal(allowed.valid, true);
});

test('rejects used expired and insufficient stock pickup attempts', () => {
  const used = { ...createPendingRedemption({ fan, item: normalItem, code: 'UW-USED123', now }), status: 'picked_up' };
  const expired = createPendingRedemption({
    fan,
    item: normalItem,
    code: 'UW-OLD12345',
    now: new Date('2026-06-01T10:00:00.000Z'),
  });
  const later = new Date('2026-07-06T10:00:00.000Z');

  assert.equal(validateRewardPickup({ redemption: used, store: sStore, inventoryItem: stock, now }).message, 'Code already used');
  assert.equal(validateRewardPickup({ redemption: expired, store: sStore, inventoryItem: stock, now: later }).message, 'Code expired');
  assert.equal(validateRewardPickup({ redemption: createPendingRedemption({ fan, item: normalItem, code: 'UW-NOSTOCK', now }), store: sStore, inventoryItem: { ...stock, quantity_on_hand: 0 }, now }).message, 'Reward stock is not enough. Request replenishment.');
});

test('confirm pickup marks redemption picked up, deducts inventory, and writes audit log', () => {
  const redemption = { id: 'redemption-1', ...createPendingRedemption({ fan, item: normalItem, code: 'UW-ABC12345', now }) };
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
  assert.equal(operations[3].table, 'audit_logs');
  assert.equal(operations[3].record.action_type, 'Reward pickup confirmed');
  assert.equal(operations[3].record.target_id, 'redemption-1');
});
