import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const materialStocksSource = readFileSync(new URL('../materials/MaterialStocksPage.jsx', import.meta.url), 'utf8');
const visitListSource = readFileSync(new URL('../visits/VisitListPage.jsx', import.meta.url), 'utf8');
const visitCreateSource = readFileSync(new URL('../visits/VisitCreatePage.jsx', import.meta.url), 'utf8');
const storeListSource = readFileSync(new URL('../stores/StoreListPage.jsx', import.meta.url), 'utf8');
const storeDetailSource = readFileSync(new URL('../stores/StoreDetailPage.jsx', import.meta.url), 'utf8');
const campaignListSource = readFileSync(new URL('../campaigns/CampaignListPage.jsx', import.meta.url), 'utf8');
const userManagementSource = readFileSync(new URL('../settings/UserManagementPage.jsx', import.meta.url), 'utf8');
const auditLogSource = readFileSync(new URL('../settings/AuditLogPage.jsx', import.meta.url), 'utf8');

test('remaining backend trial pages expose Chinese-first operations copy', () => {
  [
    '库存看板',
    '区域仓库指挥台',
    '可见仓库范围',
    '待审核门店申请',
    '库存风险申请',
    '低库存仓库预警',
    '地推拜访工作台',
    '新店拜访',
    '复访跟进',
    '等级审核队列',
    '粉丝曝光联动',
    '门店照片审核',
    '老粉审核',
    '活动运营',
    '员工账号管理',
    '审计日志',
    '访问受限',
    '导出CSV',
  ].forEach((label) => {
    assert.ok(
      `${materialStocksSource}\n${visitListSource}\n${storeListSource}\n${campaignListSource}\n${userManagementSource}\n${auditLogSource}`.includes(label),
      `${label} should be present`,
    );
  });
});

test('remaining backend pages do not keep English-first primary copy', () => {
  [
    'Inventory Dashboard',
    'Regional warehouse command center',
    'Materials by warehouse, request risk, and role scope',
    'No inventory data',
    'New Store Visit',
    'Repeat Visit',
    'Visit Records',
    'New store discovery',
    'Repeat visit follow-up',
    'Fan exposure linkage',
    'Store photo reviews',
    'Existing fan reviews',
    'Ongoing campaigns connect to store tasks',
    'Completed campaigns stay as performance history',
    'Staff account creation',
    'Access Restricted',
    'Only users with admin or manager roles can view audit logs.',
    'No audit logs found',
    'Search target, actor, reason',
    'Export CSV',
  ].forEach((englishCopy) => {
    assert.ok(
      !`${materialStocksSource}\n${visitListSource}\n${visitCreateSource}\n${storeListSource}\n${storeDetailSource}\n${campaignListSource}\n${userManagementSource}\n${auditLogSource}`.includes(englishCopy),
      `${englishCopy} should not remain as primary backend copy`,
    );
  });
});

test('remaining backend page data and permission identifiers stay stable', () => {
  [
    'WAREHOUSE_LABELS',
    'visibleWarehouses',
    'materialLowStockThreshold',
    'newStore',
    'repeat_visit',
    'store_display_uploads',
    'old_fan_verifications',
    'handleCreateStaff',
    'updateMutation',
    'audit_logs',
    'action_type',
    'before_value',
    'after_value',
  ].forEach((identifier) => {
    assert.ok(
      `${materialStocksSource}\n${visitListSource}\n${visitCreateSource}\n${storeListSource}\n${userManagementSource}\n${auditLogSource}`.includes(identifier),
      `${identifier} should stay intact`,
    );
  });
});
