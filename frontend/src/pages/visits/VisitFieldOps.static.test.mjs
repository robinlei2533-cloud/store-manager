import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./VisitListPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('field visits page exposes new-store and repeat-visit workflows', () => {
  assert.match(source, /fieldVisitTabs/);
  assert.match(source, /新店拜访/);
  assert.match(source, /复访/);
  assert.match(source, /拜访记录/);
  assert.match(source, /陈列数据/);
  assert.match(source, /创建门店档案/);
  assert.match(source, /用标准评级表给门店打分/);
  assert.match(source, /更新门店陈列照片/);
  assert.match(source, /记录问题和下一步动作/);
});

test('field visits page renders a command center for visit operations and exposure linkage', () => {
  [
    'fieldVisitCommandSummary',
    'field-visit-command-strip',
    'field-visit-command-card',
    '地推拜访指挥台',
    '新店发现',
    '复访跟进',
    '等级审核队列',
    '粉丝曝光联动',
    '已确认的 S/A 门店可进入粉丝首页推荐和门店地图高亮。',
    'Rep 提交证据和建议等级',
    'Manager/Admin 确认最终等级',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be visible in field visit operations`));
});

test('field visits page exposes S Store follow-up execution lane', () => {
  [
    'sStoreFieldExecutionItems',
    'field-s-store-execution-lane',
    'S 店跟进执行',
    '库存和陈列检查',
    '竞品和市场情报',
    '补货证据',
    '后台 S 店管理可看到提交的拜访详情',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be visible in field S Store execution`));
});

test('field visits page explains final level is backend reviewed', () => {
  assert.match(source, /系统生成建议等级：S \/ A \/ B \/ C/);
  assert.match(source, /Manager 审核，Admin 确认最终等级/);
});

test('field visits records expose operational filters and review columns', () => {
  [
    'buildVisitRows',
    'normalizeVisitType',
    'normalizeReviewStatus',
    '新店拜访',
    '复访',
    '待审核',
    '建议升级',
    '拜访类型',
    '区域',
    '当前等级',
    '建议等级',
    '最终等级',
    '审核状态',
    '下一步动作',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be visible in the field visit workbench`));
});

test('field visits records expose S Store follow-up and replenishment visibility using existing visit fields', () => {
  [
    'sStoreFollowUp',
    'replenishmentVisibility',
    'S 店跟进',
    '补货可见性',
    'S 店跟进筛选',
    '全部 S 店拜访',
    '需要补货',
    '无补货标记',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should clarify field S Store follow-up records`));
});

test('field visits infer legacy records as new or repeat visits per store', () => {
  assert.match(source, /firstVisitByStore/);
  assert.match(source, /new_store_profile\?\.store_name/);
  assert.match(source, /repeat_visit_summary\?\.purpose/);
  assert.match(source, /needsUpgradeReview/);
});

test('field visits page uses compact admin list density classes without removing filters or columns', () => {
  [
    'admin-visits-page',
    'admin-visits-ops-strip',
    'admin-visits-ops-grid',
    'admin-visits-workbench-card',
    'admin-visits-management-card',
    'admin-visits-summary-grid',
    'admin-visits-filter-grid',
    'admin-visits-table',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  [
    'visitType',
    'region',
    'status',
    'storeLevel',
    'suggestedLevel',
    'finalLevel',
    'reviewStatus',
    'sStoreFollowUp',
    'replenishmentVisibility',
  ].forEach((label) => assert.ok(source.includes(label), `${label} filter should remain`));

  assert.match(source, /scroll=\{\{ x: 1550 \}\}/);
  assert.match(css, /\.admin-liquid-shell \.admin-visits-page/);
  assert.match(css, /\.admin-liquid-shell \.admin-visits-ops-strip/);
  assert.match(css, /\.admin-liquid-shell \.admin-visits-filter-grid/);
  assert.match(css, /\.admin-liquid-shell \.admin-visits-table/);
});

test('field visits list keeps operational data before guidance on the real admin route', () => {
  assert.ok(source.includes('admin-visits-management-card'), 'management card should remain visible');
  assert.ok(source.includes('admin-visits-ops-strip'), 'command guidance should remain available');
  assert.ok(source.includes('admin-visits-workbench-card'), 'visit workflow entry should remain available');
  assert.match(css, /\.admin-liquid-shell \.admin-visits-page\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s);
  assert.match(css, /\.admin-liquid-shell \.admin-visits-management-card\s*\{[^}]*order:\s*1;/s);
  assert.match(css, /\.admin-liquid-shell \.admin-visits-ops-strip\s*\{[^}]*order:\s*2;/s);
  assert.match(css, /\.admin-liquid-shell \.admin-visits-workbench-card\s*\{[^}]*order:\s*3;/s);
  assert.match(css, /max-height:\s*220px/);
});

test('field visits table keeps detail entry visible and headers readable on mobile', () => {
  const columnsSource = source.slice(source.indexOf('const columns = ['), source.indexOf('return ('));
  const actionIndex = columnsSource.indexOf("key: 'action'");
  const storeIndex = columnsSource.indexOf("key: 'store'");
  const dateIndex = columnsSource.indexOf("key: 'date'");

  assert.ok(actionIndex > -1, 'visit detail action column should remain present');
  assert.ok(storeIndex > -1, 'store column should remain present');
  assert.ok(dateIndex > -1, 'date column should remain present');
  assert.ok(actionIndex < storeIndex, 'detail action should be visible before wide store data on mobile');
  assert.ok(actionIndex < dateIndex, 'detail action should not be buried behind date and status columns');
  assert.match(columnsSource, /className="admin-visits-detail-button"/);
  assert.match(columnsSource, /aria-label="View visit detail"/);
  assert.match(columnsSource, /title="View visit detail"/);
  assert.match(columnsSource, /width:\s*76/);
  assert.match(source, /scroll=\{\{ x: 1550 \}\}/);

  assert.match(css, /\.admin-liquid-shell \.admin-visits-table \.ant-table-thead > tr > th[\s\S]*font-size: 12px !important/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-visits-detail-button[\s\S]*width: 32px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-visits-detail-button > span:not\(\.ant-btn-icon\)[\s\S]*display: none/);
});
