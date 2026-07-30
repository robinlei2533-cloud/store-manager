import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CampaignListPage.jsx', import.meta.url), 'utf8');

test('campaign cards expose an explicit Chinese detail action', () => {
  assert.match(source, /EyeOutlined/);
  assert.match(source, /event\.stopPropagation\(\)/);
  assert.match(source, /navigate\(`\/app\/campaigns\/\$\{campaign\.id\}`\)/);
  assert.match(source, />\s*查看\s*<\/Button>/);
  assert.match(source, /活动执行/);
  assert.match(source, /[\u4e00-\u9fff]/);
});

test('campaign list uses compact admin operation classes without hiding core actions', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  [
    'admin-campaigns-page',
    'admin-campaign-toolbar',
    'admin-campaign-filter-row',
    'admin-campaign-handoff-strip',
    'admin-campaign-handoff-grid',
    'admin-campaign-card-grid',
    'admin-campaign-card',
    'admin-campaign-card-action',
    'admin-campaign-meta-row',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.match(source, /navigate\('\/app\/campaigns\/create'\)/);
  assert.match(source, /setStatusFilter/);
  assert.match(source, /setTypeFilter/);
  assert.match(source, /navigate\(`\/app\/campaigns\/\$\{campaign\.id\}`\)/);
  assert.match(source, /campaign\.start_date/);
  assert.match(source, /campaign\.end_date/);
  assert.match(source, /campaign\.budget/);
  assert.match(source, /store_count/);
  assert.match(source, /doneTasks/);

  assert.match(css, /\.admin-liquid-shell \.admin-campaigns-page/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-toolbar/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-handoff-strip/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-card/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-card-action/);
});

test('campaign list exposes campaign freshness and review handoff cues', () => {
  [
    'campaign-handoff-strip',
    '活动运营交接',
    '粉丝端新鲜度',
    '需要审核',
    '门店执行',
    '过期或已完成',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('campaign cards expose freshness state and review readiness for operators', () => {
  [
    'getCampaignFreshnessState',
    '新鲜度状态',
    '当前粉丝可见',
    '粉丝曝光前需审核',
    '仅历史记录',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});
test('campaign handoff area stays compact on mobile so activity data appears sooner', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /admin-campaign-handoff-strip admin-campaign-handoff-compact/);
  assert.match(source, /admin-campaign-handoff-summary/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-handoff-compact \.ant-card-body/);
  assert.match(css, /\.admin-liquid-shell \.admin-campaign-handoff-summary/);
  assert.match(css, /max-width: 520px/);
  assert.match(css, /grid-template-columns: repeat\(4, minmax\(96px, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-campaign-handoff-compact \.ant-card-body[\s\S]*padding: 8px 10px/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.admin-liquid-shell \.admin-campaign-handoff-grid[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});
