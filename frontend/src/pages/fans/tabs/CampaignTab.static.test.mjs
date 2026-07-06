import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CampaignTab.jsx', import.meta.url), 'utf8');

test('fan campaign tab keeps consumer-facing activity labels in English', () => {
  assert.match(source, /渠道建设: 'Store experience'/);
  assert.match(source, /社群运营: 'Community'/);
  assert.match(source, /促销活动: 'Promotion'/);
  assert.match(source, /Reward:<\/Text> Extra member points/);
  assert.doesNotMatch(source, /Budget:<\/Text>/);
});
