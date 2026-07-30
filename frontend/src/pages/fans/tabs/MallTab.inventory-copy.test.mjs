import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const mallSource = readFileSync(new URL('./MallTab.jsx', import.meta.url), 'utf8');
const campaignSource = readFileSync(new URL('./CampaignTab.jsx', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../../utils/translations.js', import.meta.url), 'utf8');

test('fan rewards hide exact stock counts and use final pickup rules', () => {
  assert.doesNotMatch(mallSource, /\$\{item\.stock\} in stock/);
  assert.match(mallSource, /t\('fan_real_reward_limited'\)/);
  assert.match(mallSource, /t\('fan_real_reward_in_stock'\)/);
  assert.match(translationsSource, /fan_real_reward_limited: 'Limited'/);
  assert.match(translationsSource, /fan_real_reward_in_stock: 'In stock'/);
  assert.doesNotMatch(campaignSource, /Pickup at S-level store/);
  assert.doesNotMatch(campaignSource, /Normal rewards: A\/S stores/);
  assert.doesNotMatch(campaignSource, /Premium rewards: S stores/);
  assert.doesNotMatch(campaignSource, /Diamond rewards: backend review/);
});
