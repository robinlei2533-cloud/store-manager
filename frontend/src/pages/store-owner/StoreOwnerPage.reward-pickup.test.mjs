import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./StoreOwnerPage.jsx', import.meta.url), 'utf8');

test('store owner reward pickup copy matches cross-portal redemption rules', () => {
  assert.match(source, /Normal: A\/S stores/);
  assert.match(source, /Premium: S stores/);
  assert.match(source, /Diamond: backend-approved pickup only/);
  assert.doesNotMatch(source, /Store users verify pickup only/);
  assert.doesNotMatch(source, /Diamond rewards: backend approval and assigned pickup/);
  assert.doesNotMatch(source, /Only S-level UWELL stores can fulfill rewards/);
  assert.doesNotMatch(source, /S-level stores are the approved pickup partners for UWELL fan rewards/);
});

test('store owner reward pickup removes duplicated execution queue while preserving operations', () => {
  assert.doesNotMatch(source, /rewardPickupExecutionItems/);
  assert.doesNotMatch(source, /store-pickup-execution-lane/);
  assert.match(source, /handleLookupPickupCode/);
  assert.match(source, /handleConfirmRewardPickup/);
  assert.match(source, /pickupResult/);
  assert.match(source, /setSLevelPolicyOpen\(true\)/);
});

test('store owner reward pickup explains validation result states before confirmation', () => {
  [
    'store-pickup-result-card',
    'Pickup validation result',
    'Eligible for pickup',
    'Blocked before handover',
    'Reward item',
    'Redemption code',
    'Record status',
    'Confirm only when the validation state is eligible',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should clarify reward pickup results`));
});
