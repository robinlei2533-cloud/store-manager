import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CampaignTab.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');

test('fan campaign tab keeps consumer-facing activity labels in English', () => {
  assert.match(source, /渠道建设: 'Store experience'/);
  assert.match(source, /社群运营: 'Community'/);
  assert.match(source, /促销活动: 'Promotion'/);
  assert.match(source, /Reward:<\/Text> Extra member points/);
  assert.doesNotMatch(source, /Budget:<\/Text>/);
});

test('fan campaign cards use readable campaign-specific surfaces and progress text', () => {
  assert.match(source, /className="fan-campaign-card liquid-glass"/);
  assert.match(source, /className="fan-campaign-progress"/);
  assert.match(css, /\.fan-campaign-card/);
  assert.match(css, /\.fan-campaign-card \.ant-progress-inner/);
  assert.match(css, /\.fan-campaign-progress-value/);
  assert.match(css, /background:\s*#ffffff !important/);
});

test('fan campaign detail modal and status tags stay on light readable surfaces', () => {
  assert.match(source, /className="fan-campaign-detail-modal"/);
  assert.match(source, /fan-campaign-status-tag/);
  assert.match(css, /\.fan-campaign-detail-modal \.ant-modal-content/);
  assert.match(css, /\.fan-campaign-status-tag\.is-completed/);
  assert.match(css, /background:\s*#eee7d8 !important/);
});

test('fan campaign flow no longer requires a store visit task for trial operation', () => {
  assert.match(source, /Join the activity/);
  assert.match(source, /scan eligible products/i);
  assert.doesNotMatch(source, /Find a verified store/);
  assert.doesNotMatch(source, /Visit a verified store to complete/);
});
