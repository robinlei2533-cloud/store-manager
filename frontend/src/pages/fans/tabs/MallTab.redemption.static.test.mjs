import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./MallTab.jsx', import.meta.url), 'utf8');
const legalSource = readFileSync(new URL('../../../utils/legal-content.js', import.meta.url), 'utf8');

test('mall redemption creates operation-ready pickup records and review states', () => {
  assert.match(source, /createPendingRedemption/);
  assert.match(source, /redeem_code/);
  assert.match(source, /review_status/);
  assert.match(source, /pending_review/);
  assert.match(source, /pending_pickup/);
  assert.match(source, /Diamond luxury rewards require backend approval/);
});

test('mall copy matches fixed redemption logic', () => {
  assert.match(source, /Available points are deducted/);
  assert.match(source, /lifetime growth points are never deducted/i);
  assert.match(source, /Normal rewards: A\/S stores/);
  assert.match(source, /Premium rewards: S stores/);
  assert.match(source, /Store users verify pickup only/);
});

test('legal reward rules match the fixed pickup and expiry logic', () => {
  assert.match(legalSource, /Normal rewards can be collected at approved A or S-level UWELL stores/);
  assert.match(legalSource, /Premium rewards require an approved S-level UWELL store/);
  assert.match(legalSource, /The default validity period is 7 days/);
  assert.doesNotMatch(legalSource, /only by an approved S-level UWELL store/);
  assert.doesNotMatch(legalSource, /default validity period is 30 days/);
});
