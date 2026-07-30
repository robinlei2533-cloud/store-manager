import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./DashboardPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
const repStart = source.indexOf('if (!isOpsScope)');
const repEnd = source.indexOf('      </div>', repStart) + '      </div>'.length;
const repBranch = source.slice(repStart, repEnd);

test('field rep dashboard branch uses translated labels instead of English-first copy', () => {
  assert.ok(repStart >= 0, 'field rep dashboard branch should be gated by ops scope');
  [
    "t('rep_workspace')",
    "t('rep_priorities_today')",
    "t('rep_responsible_stores')",
    "t('rep_visit_records')",
    "t('rep_campaign_execution')",
    "t('rep_open_complaints')",
    "t('rep_store_status')",
    "t('rep_pending_actions')",
    "t('rep_no_pending_actions')",
    "t('dash_recent_visits')",
    "t('rep_my_visit_records')",
  ].forEach((label) => assert.ok(repBranch.includes(label), `${label} should be present`));

  assert.doesNotMatch(repBranch, />Field Rep Workspace</);
  assert.doesNotMatch(repBranch, />My Priorities Today</);
  assert.doesNotMatch(repBranch, /No pending actions/);
});

test('manager keeps operations cockpit while admin remains the only company-wide role', () => {
  assert.ok(source.includes('canViewOpsScope(profile)'), 'dashboard should use ops scope for manager/admin cockpit access');
  assert.ok(source.includes('canViewCompanyScope(profile)'), 'dashboard should distinguish admin company scope from manager regional scope');
  assert.ok(source.includes('getAssignedRegion(profile)'), 'dashboard should derive assigned region for regional warehouse visibility');
  assert.ok(source.includes('scopedMaterialStocks'), 'dashboard material stock data should be scoped before alert rendering');
  assert.ok(source.includes('const lowStockItems = scopedMaterialStocks'), 'dashboard low-stock lists should use scoped warehouse data');
  assert.ok(source.includes('visibleWarehouses'), 'dashboard should filter warehouse alerts by role region');
  assert.ok(source.includes('filterByAssignedStores(profile, effectiveStores'), 'dashboard stores should be scoped by assigned region or stores');
  assert.ok(source.includes('filterByAssignedStores(profile, effectiveVisits'), 'dashboard visits should be scoped by assigned region or stores');
});

test('admin dashboard is segmented by Chinese-first trial-operation workstreams', () => {
  [
    '运营指挥台',
    '今日运营指挥台',
    '运营动作中心',
    '试运营准备度',
    '方案落地覆盖',
    '核心指标总览',
    '粉丝分析',
    '门店分析',
    '地推拜访分析',
    '活动与核销',
    '物料库存预警',
    '统一审核中心',
    '风控规则',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('admin dashboard starts with an executive operations summary strip', () => {
  [
    'adminCommandSummary',
    'admin-command-summary-strip',
    'admin-command-summary-card',
    '地推拜访',
    '新店拜访',
    '复访记录',
    '粉丝池',
    '今日新增',
    '门店池',
    'A/S 曝光门店',
    '粉丝等级结构',
    '门店等级结构',
    '区域仓库存快照',
    'S/A 门店会进入粉丝端首页和地图推荐模块。',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('operations action center routes key backend workstreams', () => {
  [
    'operationActionItems',
    '待审核队列',
    '风控中心',
    '区域物料申请',
    '地推拜访审核',
    '#/app/reviews',
    '#/app/risk-center',
    '#/app/materials/list',
    '#/app/visits/list',
    'pendingMaterialRequests',
    'openRiskCount',
    'admin-action-card',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.ok(source.includes("String(item.region || item.warehouse || '').includes(assignedRegion)"), 'material requests should be scoped by assigned region');
  assert.ok(source.includes("window.location.hash = item.href"), 'action cards should navigate to backend modules');
});

test('dashboard opens with today operations command queues for backend operators', () => {
  [
    'todayOperatingCommandItems',
    '今日运营指挥台',
    '审核决策',
    '风险分诊',
    'S店跟进',
    '活动与奖励',
    '地推与补货',
    '#/app/stores/s-stores',
    '#/app/rewards',
    'admin-today-command-grid',
    'admin-today-command-card',
    'openSStoreFollowUps',
    'activeCampaignRewardWork',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.ok(source.includes("planned: { color: 'processing', text: '计划中' }"), 'planned visit status should render as Chinese copy');
});

test('admin dashboard includes trial launch readiness matrix for cross-portal rollout', () => {
  [
    'trialLaunchReadiness',
    '试运营准备度',
    '粉丝增长闭环',
    '门店服务闭环',
    '地推执行闭环',
    '仓库准备度',
    '规则与风控',
    '扫码、签到、社区、奖励已接入统一试运营规则。',
    '门店只负责核销，系统发放积分，异常进入审核队列。',
    '区域库存按角色和仓库可见。',
    'admin-readiness-grid',
    'admin-readiness-card',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('admin dashboard exposes spec implementation coverage for stakeholder review', () => {
  [
    'specImplementationCoverage',
    '方案落地覆盖',
    '粉丝端方案',
    '门店端方案',
    '后台与地推方案',
    '跨端规则',
    '固定底部导航、精简 Home、活动分组、奖励图片位、门店地图、Me、邀请、老粉验证',
    'Home 工作台、仅核销流程、活动成本提醒、照片提醒、S/A 曝光联动',
    'Dashboard 指挥台、审核、风控、奖励、码库、地推拜访、区域仓库',
    '粉丝/门店英文默认、阿语 RTL、固定兑换逻辑、系统发积分、仅 Admin 建员工',
    'admin-spec-coverage-grid',
    'admin-spec-coverage-card',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('field visit analytics recognizes the implemented visit workflow fields', () => {
  [
    "['new', 'new_store'].includes(item.visit_type)",
    "['repeat', 'repeat_visit'].includes(item.visit_type)",
    'item.new_store_profile?.store_name',
    'item.repeat_visit_summary?.purpose',
    'item.suggested_level_status',
    'item.suggested_level && item.suggested_level !== item.stores?.level',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be included in dashboard visit analytics`));
});

test('admin dashboard participates in the unified backend operator console polish', () => {
  [
    'admin-operator-console-page',
    'admin-operator-hero',
    'admin-operator-section-stack',
    'admin-command-summary-strip',
    'admin-today-command-grid',
    'admin-action-card',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.match(css, /--admin-operator-radius:\s*18px/);
  assert.match(css, /--admin-operator-radius-sm:\s*10px/);
  assert.match(css, /\.admin-liquid-shell \.admin-operator-console-page/);
  assert.match(css, /\.admin-liquid-shell \.admin-operator-section-stack/);
  assert.match(css, /\.admin-liquid-shell \.admin-command-summary-card:active/);
  assert.match(css, /\.admin-liquid-shell \.ant-table-thead > tr > th/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.admin-liquid-shell \.admin-operator-console-page/);
});

test('admin dashboard opens with data, queues, and tables before explanatory program cards', () => {
  [
    'admin-dashboard-command-zone',
    'admin-dashboard-primary-kpis',
    'admin-dashboard-priority-grid',
    'admin-dashboard-queue-table',
    'admin-dashboard-secondary-programs',
    'admin-dashboard-muted-explainer',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  const firstKpiIndex = source.indexOf('admin-dashboard-primary-kpis');
  const firstQueueIndex = source.indexOf('admin-dashboard-queue-table');
  const secondaryProgramIndex = source.indexOf('admin-dashboard-secondary-programs');
  assert.ok(firstKpiIndex >= 0, 'primary KPI zone should exist');
  assert.ok(firstQueueIndex >= 0, 'priority queue table should exist');
  assert.ok(secondaryProgramIndex >= 0, 'secondary program cards should exist');
  assert.ok(firstKpiIndex < secondaryProgramIndex, 'data KPIs should render before explanatory program cards');
  assert.ok(firstQueueIndex < secondaryProgramIndex, 'queue table should render before explanatory program cards');
});

test('admin dashboard queue table uses Chinese display labels without changing raw task tags', () => {
  [
    'adminQueueTagLabels',
    "'Campaign claim': '活动物料'",
    "'Display review': '陈列审核'",
    "'Fan verification': '老粉验证'",
    "'Complaint': '客诉待回'",
    '{adminQueueTagLabels[value] || value}',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  [
    "tag: 'Campaign claim'",
    "tag: 'Display review'",
    "tag: 'Fan verification'",
    "tag: 'Complaint'",
    "['Campaign claim', 'Fan verification'].includes(item.tag)",
  ].forEach((label) => assert.ok(source.includes(label), `${label} raw contract should remain`));
});

test('admin dashboard queue table has a mobile-only horizontal scroll affordance', () => {
  assert.ok(source.includes('admin-dashboard-table-hint'), 'queue table should render a scoped horizontal-scroll hint');
  assert.ok(source.includes('横向滑动查看状态'), 'queue table hint should be concise Chinese copy');
  assert.match(css, /\.admin-liquid-shell \.admin-dashboard-table-hint/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.admin-liquid-shell \.admin-dashboard-table-hint/);
  assert.match(css, /\.admin-liquid-shell \.admin-dashboard-queue-table \.ant-table-wrapper::after/);
});

test('admin dashboard primary KPI labels keep readable size and contrast', () => {
  assert.match(css, /\.admin-liquid-shell \.admin-dashboard-command-zone \.dash-stat-label\s*\{[^}]*font-size:\s*12px\s*!important;[^}]*color:\s*rgba\(36,\s*28,\s*16,\s*0\.82\)\s*!important;/s);
  assert.doesNotMatch(css, /\.admin-liquid-shell \.admin-dashboard-command-zone \.dash-stat-label\s*\{[^}]*font-size:\s*9\./s);
});

test('admin dashboard queue table headers keep a 12px readable minimum', () => {
  assert.match(css, /\.admin-liquid-shell \.admin-dashboard-queue-table \.ant-table-thead > tr > th\s*\{[^}]*font-size:\s*12px\s*!important;/s);
});

test('admin dashboard removes redundant micro explanation copy from visible primary cards', () => {
  [
    '<small>{item.note}</small>',
    '<p>{item.subtitle}</p>',
    '<p>{item.desc}</p>',
    '<p>{item.desc}</p>',
    '<div className="dash-mini-note">可用积分与终身成长积分分开统计，兑换奖励不会降低粉丝等级。</div>',
    '<div className="dash-mini-note">{storesMissingPhotos} 家门店需要补充门头或陈列照片。S/A 门店获得粉丝地图和首页曝光优先级。</div>',
    '<div className="dash-mini-note">经理和地推只看负责区域仓库数据，管理员可看全部区域。</div>',
  ].forEach((label) => assert.ok(!source.includes(label), `${label} should not be rendered as visible explanatory copy`));
});

test('admin dashboard does not keep unused store photo gap calculations', () => {
  assert.doesNotMatch(source, /const storesMissingPhotos =/);
});

test('admin dashboard Chinese mode has no high-impact English shell headings or mojibake', () => {
  [
    'UWELL Operations Cockpit',
    'Open queue',
    'Open module',
    'Core Data Insights',
    'Fan analytics',
    'Store analytics',
    'Field visit analytics',
    'Campaign and verification',
    'Material inventory alerts',
    'Unified Reviews',
    'Risk Center rules',
    'New fans today',
    'Scans today',
    'Visits today',
    'Global todo list',
  ].forEach((label) => assert.doesNotMatch(source, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  assert.doesNotMatch(source, /[鏂搴鐞濆厜鎺ゅ埗闄堟嵁鎵撳紑鍚庡彴璁剧疆]/);
});
test('admin dashboard local demo alert uses AntD title prop instead of deprecated message', () => {
  assert.doesNotMatch(source, /<Alert[^>]*message=\{t\('local_demo'\)\}/);
  assert.match(source, /<Alert[^>]*title=\{t\('local_demo'\)\}/);
});

test('Task 140 admin dashboard tightens scan priority without removing existing data sections', () => {
  assert.match(source, /admin-dashboard-scan-band/);
  assert.match(source, /admin-dashboard-scan-cluster/);
  assert.match(source, /admin-dashboard-secondary-programs/);
  const scanBandIndex = source.indexOf('admin-dashboard-scan-band');
  const secondaryIndex = source.indexOf('admin-dashboard-secondary-programs');
  const legacyOverviewIndex = source.indexOf("dashboard_section_overview");
  assert.ok(scanBandIndex >= 0 && secondaryIndex >= 0, 'scan band and secondary programs should exist');
  assert.ok(scanBandIndex < secondaryIndex, 'scan band should appear before secondary program cards');
  assert.ok(secondaryIndex < legacyOverviewIndex, 'legacy overview should remain after the prioritized command zone');
  [
    'admin-dashboard-command-zone',
    'admin-dashboard-primary-kpis',
    'admin-dashboard-queue-table',
    'operationActionItems',
    'recentVisitColumns',
    'exportToCSV',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should remain`));
});
