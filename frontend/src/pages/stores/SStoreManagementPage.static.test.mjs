import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./SStoreManagementPage.jsx', import.meta.url), 'utf8');

test('S Store Management page is a read-only backend operations surface', () => {
  assert.match(source, /S店管理/);
  assert.match(source, /UWELL品牌店运营/);
  assert.match(source, /getSStores/);
  assert.match(source, /getSStoreSellThroughHistory/);
  assert.match(source, /getSStoreInventoryHistory/);
  assert.match(source, /getSStoreMaterialInventoryHistory/);
  assert.match(source, /getSStoreVisitDetails/);
  assert.match(source, /getReplenishmentTasks/);
  assert.doesNotMatch(source, /downgradeSStoreToA/);
  assert.doesNotMatch(source, /restoreSStore/);
  assert.doesNotMatch(source, /submitSStoreSellThrough/);
});

test('S Store Management page exposes overview metrics and operating filters', () => {
  [
    '正常S店',
    '低库存S店',
    '待补货任务',
    '周开放式动销',
    '周一次性动销',
    '月开放式动销',
    '月一次性动销',
    '品牌店活动核销',
    '奖励领取',
    '门店关联扫码',
    '只看低库存',
    '包含已降级',
    '补货状态',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('S Store Management makes downgraded S Store recovery visibility explicit', () => {
  assert.match(source, /includeDowngraded/);
  assert.match(source, /getSStores\(\{ includeDowngraded: true \}\)/);
  assert.match(source, /recoveryRows/);
  assert.match(source, /可见品牌店/);
  assert.match(source, /已降级S店/);
});

test('S Store Management page lists the first S Store closed-loop columns', () => {
  [
    '门店',
    '城市',
    'S状态',
    '成为S店时间',
    '周动销',
    '月动销',
    '产品库存',
    '物料库存',
    '补货状态',
    '闭环贡献',
    '最近拜访',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('S Store Management exposes the field and replenishment handoff queue', () => {
  [
    's-store-handoff-queue',
    'S店跟进交接',
    '低库存 -> 地推补货',
    '缺少拜访 -> 地推检查',
    '已降级 -> 经理复盘',
    '进入 S 店详情查看证据',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('S Store Management exposes follow-up status in the target work queue', () => {
  [
    'getSStoreFollowUpStatus',
    '跟进状态',
    '补货跟进',
    '地推拜访检查',
    '恢复评估',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('S Store Management reads contribution metrics without creating manual contribution records', () => {
  assert.match(source, /getSStoreContributionMetrics/);
  assert.match(source, /verifiedActivityCount/);
  assert.match(source, /rewardPickupCount/);
  assert.match(source, /storeScanCount/);
  assert.doesNotMatch(source, /s_store_contribution/);
});

test('S Store Management detail action opens the dedicated S Store detail route', () => {
  assert.match(source, /navigate\(`\/app\/stores\/s-stores\/\$\{record\.id\}`\)/);
  assert.doesNotMatch(source, /navigate\(`\/app\/stores\/\$\{record\.id\}`\)/);
});

test('S Store Management participates in the unified backend operator console polish', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  [
    'admin-operator-console-page',
    's-store-command-band',
    's-store-critical-metrics',
    'admin-operator-filter-card',
    'admin-operator-table-card',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.match(css, /\.admin-liquid-shell \.s-store-command-band/);
  assert.match(css, /\.admin-liquid-shell \.s-store-critical-metrics/);
  assert.match(css, /\.admin-liquid-shell \.admin-operator-filter-card/);
  assert.match(css, /\.admin-liquid-shell \.admin-operator-table-card/);
  assert.match(css, /\.admin-liquid-shell \.admin-operator-table-card \.ant-table-wrapper/);
});

test('S Store Management keeps dense operations columns readable on desktop', () => {
  assert.match(source, /dataIndex: 'name'[\s\S]*width:\s*240/);
  assert.match(source, /scroll=\{\{ x:\s*2360 \}\}/);
  assert.match(source, /className="s-store-page-stack"/);
  assert.match(source, /className="s-store-filter-toolbar"/);
  assert.match(source, /className="s-store-table-scroll-region"/);

  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
  assert.match(css, /\.admin-liquid-shell \.s-store-management-page \.admin-operator-table-card \.ant-card-body[\s\S]*min-width:\s*0/);
  assert.match(css, /\.admin-liquid-shell \.s-store-management-page \.s-store-table-scroll-region/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /\.admin-liquid-shell \.s-store-management-page \{\s*min-width:\s*0;\s*max-width:\s*100%;\s*\}/);
  assert.match(css, /\.admin-liquid-shell \.s-store-management-page \.s-store-page-stack[\s\S]*width:\s*100%/);
  assert.match(css, /\.admin-liquid-shell \.s-store-management-page \.admin-operator-table-card \{\s*width:\s*100%;\s*max-width:\s*100%;\s*\}/);
});

test('S Store Management uses a customer-demo readability lane for dense desktop columns', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /scroll=\{\{ x:\s*2360 \}\}/);
  assert.match(source, /tableLayout="fixed"/);
  assert.match(source, /className="s-store-primary-cell"/);
  assert.match(source, /className="s-store-compact-value-cell"/);
  assert.match(css, /Task-148: targeted trial polish fixes/);
  assert.match(css, /\.admin-liquid-shell \.s-store-management-page \.admin-trial-wide-table\s*\{[^}]*padding-bottom:\s*10px/s);
  assert.match(css, /\.admin-liquid-shell \.s-store-management-page \.ant-table-cell\s*\{[^}]*white-space:\s*normal/s);
  assert.match(css, /\.admin-liquid-shell \.s-store-management-page \.s-store-compact-value-cell\s*\{[^}]*min-width:\s*0/s);
});

test('S Store Management uses a compact command band and scan-first status cells', () => {
  [
    's-store-command-band',
    's-store-critical-metrics',
    's-store-metric-tile',
    's-store-followup-strip',
    's-store-status-cell',
    's-store-stock-cell',
    's-store-table-note',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.match(source, /className: 'is-risk'/);
  assert.match(source, /className: 'is-warning'/);
  assert.match(source, /className: 'is-good'/);
  assert.match(source, /className=\{`s-store-status-cell \$\{followUpStatus\.className\}`\}/);
  assert.match(source, /className=\{`s-store-stock-cell \$\{record\.hasLowStock \? 'is-risk' : 'is-good'\}`\}/);

  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
  assert.match(css, /\.admin-liquid-shell \.s-store-command-band/);
  assert.match(css, /\.admin-liquid-shell \.s-store-critical-metrics/);
  assert.match(css, /\.admin-liquid-shell \.s-store-metric-tile/);
  assert.match(css, /\.admin-liquid-shell \.s-store-followup-strip/);
  assert.match(css, /\.admin-liquid-shell \.s-store-status-cell/);
  assert.match(css, /\.admin-liquid-shell \.s-store-status-cell\.is-risk/);
  assert.match(css, /\.admin-liquid-shell \.s-store-stock-cell/);
  assert.match(css, /\.admin-liquid-shell \.s-store-table-note/);
});

test('S Store Management avoids deprecated AntD Space direction prop', () => {
  assert.doesNotMatch(source, /<Space[^>]*direction="vertical"/);
  assert.match(source, /orientation="vertical"/);
});
