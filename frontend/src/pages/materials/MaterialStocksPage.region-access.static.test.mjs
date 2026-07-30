import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./MaterialStocksPage.jsx', import.meta.url), 'utf8');

test('material stocks only summarizes warehouses visible to the current role and region', () => {
  assert.match(source, /canViewWarehouse/);
  assert.match(source, /visibleWarehouses/);
  assert.match(source, /visibleWarehouseRegions/);
  assert.match(source, /visibleTotalStock/);
  assert.match(source, /低库存仓库/);
  assert.match(source, /visibleLowRegions/);
  assert.match(source, /getVisibleLowRegions/);
  assert.match(source, /hasVisibleLowStock/);
  assert.doesNotMatch(source, /title: 'Total Stock'/);
  assert.doesNotMatch(source, /rowClassName=\{\(r\) => r\.lowRegions\?\.length/);
});

test('material stocks page uses compact admin warehouse classes and readable table labels', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  [
    'material-warehouse-page',
    'material-warehouse-card',
    'material-warehouse-summary-grid',
    'material-warehouse-summary-card',
    'material-warehouse-table-card',
    'material-stock-tag',
    'material-stock-risk-tags',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  ['图片', '物料', '编码', '单位', '可见库存', '低库存仓库', '状态'].forEach((label) => {
    assert.ok(source.includes(label), `${label} should be present`);
  });

  assert.match(source, /WAREHOUSE_LABELS/);
  assert.match(source, /REGIONAL_WAREHOUSES/);
  assert.match(source, /materialLowStockThreshold/);
  assert.match(source, /canViewWarehouse/);
  assert.match(source, /visibleWarehouses/);

  assert.match(css, /\.admin-liquid-shell \.material-warehouse-page/);
  assert.match(css, /\.admin-liquid-shell \.material-warehouse-command-strip/);
  assert.match(css, /\.admin-liquid-shell \.material-warehouse-summary-grid/);
  assert.match(css, /\.admin-liquid-shell \.material-warehouse-table-card/);
});

test('material stocks page renders a regional warehouse operations command center', () => {
  assert.match(source, /materialWarehouseCommand/);
  assert.match(source, /material-warehouse-command-strip/);
  assert.match(source, /区域仓库指挥台/);
  assert.match(source, /可见仓库范围/);
  assert.match(source, /待审核门店申请/);
  assert.match(source, /库存风险申请/);
  assert.match(source, /低库存仓库预警/);
  assert.match(source, /material-warehouse-card-grid/);
  assert.match(source, /申请审核边界/);
  assert.match(source, /Field Rep 仅查看分配区域库存/);
});
