import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const usersSource = readFileSync(new URL('../settings/UserManagementPage.jsx', import.meta.url), 'utf8');
const stocksSource = readFileSync(new URL('../materials/MaterialStocksPage.jsx', import.meta.url), 'utf8');
const materialsSource = readFileSync(new URL('../materials/MaterialListPage.jsx', import.meta.url), 'utf8');
const workflowsSource = readFileSync(new URL('./admin-ops-workflows.js', import.meta.url), 'utf8');

test('admin-created staff accounts include full trial assignment fields and audit logging', () => {
  assert.match(usersSource, /assignedArea/);
  assert.match(usersSource, /assignedStores/);
  assert.match(usersSource, /状态可设为启用或停用/);
  assert.match(usersSource, /角色仅限 Manager 或 Rep/);
  assert.match(usersSource, /audit_logs/);
  assert.match(usersSource, /员工账号创建/);
  assert.doesNotMatch(usersSource, /label:\s*'Admin',\s*value:\s*'admin'/);
});

test('material stocks page presents multi-warehouse inventory with region visibility copy', () => {
  assert.match(stocksSource, /Riyadh Warehouse/);
  assert.match(stocksSource, /Dammam Warehouse/);
  assert.match(stocksSource, /Jeddah Warehouse/);
  assert.match(stocksSource, /可见仓库低库存阈值/);
  assert.match(stocksSource, /Field Rep 只查看分配区域库存/);
  assert.match(stocksSource, /canViewWarehouse/);
  assert.match(stocksSource, /visibleWarehouses/);
  assert.match(stocksSource, /visibleWarehouseRegions/);
  assert.match(stocksSource, /visibleTotalStock/);
  assert.match(stocksSource, /hasVisibleLowStock/);
  assert.match(stocksSource, /OPERATIONAL_RULE_RECORD_ID/);
  assert.match(stocksSource, /mergeOperationalRules/);
  assert.match(stocksSource, /materialLowStockThreshold/);
  assert.match(stocksSource, /effectiveSafetyStock/);
});

test('material requests close the store request to regional warehouse stock workflow', () => {
  assert.match(materialsSource, /Store Requests/);
  assert.match(materialsSource, /Store material requests/);
  assert.match(materialsSource, /Approve & reserve/);
  assert.match(materialsSource, /Warehouse Stock/);
  assert.match(materialsSource, /Stock risk/);
  assert.match(materialsSource, /approveMaterialRequest/);
  assert.match(materialsSource, /OPERATIONAL_RULE_RECORD_ID/);
  assert.match(materialsSource, /getEffectiveSafetyStock/);
  assert.match(materialsSource, /materialLowStockThreshold/);
  assert.match(workflowsSource, /findWarehouseStock/);
  assert.match(workflowsSource, /material_request_approved_stock_reserved/);
  assert.match(workflowsSource, /material_outbound/);
  assert.match(workflowsSource, /warehouse_inventory_alerts/);
});
