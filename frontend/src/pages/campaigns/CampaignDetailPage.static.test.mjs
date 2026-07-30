import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CampaignDetailPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('campaign detail keeps descriptions readable on mobile', () => {
  assert.ok(source.includes('admin-campaign-detail-page'));
  assert.ok(source.includes('admin-campaign-detail-card'));
  assert.ok(source.includes('admin-campaign-detail-descriptions'));
  assert.match(source, /<Descriptions className="admin-campaign-detail-descriptions" column=\{\{ xs: 1, sm: 1, md: 2, lg: 3 \}\} bordered>/);
  assert.match(source, /<Descriptions\.Item label="活动说明" span=\{\{ xs: 1, sm: 1, md: 2, lg: 3 \}\}>/);
  assert.doesNotMatch(source, /<Descriptions\.Item label="活动说明" span=\{3\}>/);
  assert.match(source, /<Col xs=\{24\} sm=\{12\} md=\{8\} key=\{s\.id\}>/);
  assert.match(source, /className="campaign-store-tag"/);
  assert.match(css, /\.campaign-store-tag/);
  assert.match(css, /white-space:\s*normal !important/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /\.admin-liquid-shell \.ant-descriptions-item-label/);
  assert.match(css, /color:\s*#6b6256 !important/);
  assert.match(css, /\.admin-liquid-shell \.ant-descriptions-item-content \*/);
  assert.match(css, /color:\s*#2a2115 !important/);
});

test('campaign detail tabs and operation tables stay usable on narrow admin screens', () => {
  assert.match(source, /className="admin-campaign-detail-tabs"/);
  assert.match(source, /className="admin-campaign-detail-table-wrap admin-campaign-detail-task-table"/);
  assert.match(source, /className="admin-campaign-detail-table-wrap admin-campaign-detail-claims-table"/);
  assert.match(source, /scroll=\{\{ x: 620 \}\}/);
  assert.match(source, /scroll=\{\{ x: 840 \}\}/);

  assert.match(css, /\.admin-liquid-shell \.admin-campaign-detail-page/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-detail-descriptions/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-detail-tabs/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-detail-table-wrap/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-campaign-detail-page[\s\S]*padding: 14px 10px 22px/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-campaign-detail-descriptions \.ant-descriptions-item-label[\s\S]*display: block/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-campaign-detail-tabs \.ant-tabs-nav[\s\S]*overflow-x: auto/);
});
