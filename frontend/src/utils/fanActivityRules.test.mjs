import { test } from 'vitest';
import assert from 'node:assert/strict';

import {
  buildRewardTierRules,
  buildStoreActivityCampaign,
  canClaimTimedTask,
  filterFanVisibleStoreActivities,
} from './fanActivityRules.js';

test('store activity applications start pending and hidden from fans', () => {
  const activity = buildStoreActivityCampaign({
    store: { id: 'store-s', name: 'S Riyadh Store', city: 'Riyadh', country: 'Saudi Arabia' },
    title: 'G5 tasting weekend',
    description: 'Try G5 pods and collect member gifts.',
    gift: 'UWELL cap',
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    points: 10,
  });

  assert.equal(activity.source, 'store_application');
  assert.equal(activity.submitted_by_store_id, 'store-s');
  assert.equal(activity.approval_status, 'pending');
  assert.equal(activity.fan_visible, false);
  assert.equal(activity.status, 'planned');
  assert.deepEqual(activity.target_stores, ['store-s']);
});

test('fan center only shows approved visible store activities for active stores', () => {
  const campaigns = [
    {
      id: 'c-hidden',
      source: 'store_application',
      submitted_by_store_id: 'store-s',
      approval_status: 'pending',
      fan_visible: false,
      status: 'planned',
    },
    {
      id: 'c-approved',
      source: 'store_application',
      submitted_by_store_id: 'store-s',
      approval_status: 'approved',
      fan_visible: true,
      status: 'ongoing',
      city: 'Riyadh',
    },
    {
      id: 'c-other',
      source: 'store_application',
      submitted_by_store_id: 'store-j',
      approval_status: 'approved',
      fan_visible: true,
      status: 'ongoing',
      city: 'Jeddah',
    },
  ];

  const visible = filterFanVisibleStoreActivities(campaigns, { city: 'Riyadh' });

  assert.deepEqual(visible.map((item) => item.id), ['c-approved']);
});

test('timed task can be claimed after 10 visible seconds once per day', () => {
  const now = new Date('2026-07-09T10:00:00.000Z');
  const records = [
    {
      fan_id: 'fan-1',
      task_key: 'read-official-article',
      completed_at: '2026-07-08T10:00:00.000Z',
    },
  ];

  assert.equal(canClaimTimedTask(records, 'fan-1', 'read-official-article', now).canClaim, true);
  assert.equal(canClaimTimedTask(records, 'fan-1', 'read-official-article', now, 9).canClaim, false);
  assert.equal(canClaimTimedTask([
    ...records,
    { fan_id: 'fan-1', task_key: 'read-official-article', completed_at: '2026-07-09T08:00:00.000Z' },
  ], 'fan-1', 'read-official-article', now, 10).reason, 'already_claimed_today');
});

test('reward tiers define trial exchange ranges and S store pickup policy', () => {
  const tiers = buildRewardTierRules();

  assert.deepEqual(tiers.map((tier) => tier.key), ['starter', 'standard', 'value', 'premium']);
  assert.equal(tiers[0].minPoints, 50);
  assert.equal(tiers[3].maxPoints, 1500);
  assert.equal(tiers[3].monthlyLimit, 1);
  assert.equal(tiers.every((tier) => tier.pickupStoreLevel === 'S'), true);
});
