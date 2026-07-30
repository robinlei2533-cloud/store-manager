import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const layoutSource = readFileSync(new URL('../../components/layout/AppLayout.jsx', import.meta.url), 'utf8');
const loginSource = readFileSync(new URL('../login/LoginPage.jsx', import.meta.url), 'utf8');
const translationsSource = readFileSync(new URL('../../utils/translations.js', import.meta.url), 'utf8');
const dashboardSource = readFileSync(new URL('../dashboard/DashboardPage.jsx', import.meta.url), 'utf8');
const sStoreSource = readFileSync(new URL('../stores/SStoreManagementPage.jsx', import.meta.url), 'utf8');
const rewardsSource = readFileSync(new URL('./RewardsOpsPage.jsx', import.meta.url), 'utf8');
const reviewsSource = readFileSync(new URL('./ReviewsPage.jsx', import.meta.url), 'utf8');
const riskSource = readFileSync(new URL('./RiskCenterPage.jsx', import.meta.url), 'utf8');
const rulesSource = readFileSync(new URL('./OperationalRulesPage.jsx', import.meta.url), 'utf8');
const scanCodesSource = readFileSync(new URL('./ScanCodesPage.jsx', import.meta.url), 'utf8');
const decodeUnicodeEscapes = (value) => value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
const shellAndLoginSearchSource = `${layoutSource}\n${loginSource}\n${decodeUnicodeEscapes(loginSource)}`;

test('backend shell and login expose Chinese-first operations copy', () => {
  [
    'nav_s_store_management',
    'nav_exposure_control',
    'nav_new_store_visit',
    'nav_repeat_visit',
    'nav_display_data',
    'admin_open_settings',
    '员工账号由管理员统一分配',
    '管理员可在 系统设置 > 用户管理 中创建 Manager 或 Rep 账号',
  ].forEach((label) => {
    assert.ok(shellAndLoginSearchSource.includes(label), `${label} should be present`);
  });

  [
    'S店管理',
    '曝光控制',
    '新店拜访',
    '复访记录',
    '陈列数据',
    '打开后台设置',
  ].forEach((label) => {
    assert.ok(translationsSource.includes(label), `${label} should be present in admin translations`);
  });
});

test('backend dashboard has Chinese-first labels without removing workstream identifiers', () => {
  [
    '运营动作中心',
    '核心指标总览',
    '今日运营指挥台',
    '试运营准备度',
    '方案落地覆盖',
    '粉丝增长闭环',
    '门店服务闭环',
    '地推执行闭环',
  ].forEach((label) => assert.ok(dashboardSource.includes(label), `${label} should be present`));

  [
    'adminCommandSummary',
    'todayOperatingCommandItems',
    'trialLaunchReadiness',
    'specImplementationCoverage',
  ].forEach((identifier) => assert.ok(dashboardSource.includes(identifier), `${identifier} should stay intact`));
});

test('S Store Management keeps data keys stable while showing Chinese operations labels', () => {
  [
    'S店管理',
    'UWELL品牌店运营',
    '低库存S店',
    '待补货任务',
    '周开放式动销',
    '月一次性动销',
    '补货状态',
    '只看低库存',
    '包含已降级',
    '查看详情',
  ].forEach((label) => assert.ok(sStoreSource.includes(label), `${label} should be present`));

  [
    's_store_status',
    'latestWeekly',
    'latestMonthly',
    'pendingReplenishmentCount',
    'getSStoreFollowUpStatus',
  ].forEach((identifier) => assert.ok(sStoreSource.includes(identifier), `${identifier} data logic should stay intact`));
});

test('Rewards Reviews and Risk Center expose Chinese-first governance copy', () => {
  [
    '奖励运营',
    '奖励治理驾驶舱',
    '高价值奖励审批',
    '审核中心',
    '跨端审核入口',
    '审核队列',
    '风控中心',
    '反作弊分诊',
    '发送至审核中心',
  ].forEach((label) => assert.ok(`${rewardsSource}\n${reviewsSource}\n${riskSource}`.includes(label), `${label} should be present`));

  [
    'review_status',
    'assigned_pickup_store_id',
    'risk_review_status',
    'audit_logs',
  ].forEach((identifier) => assert.ok(`${rewardsSource}\n${reviewsSource}\n${riskSource}`.includes(identifier), `${identifier} should stay intact`));
});

test('Rules and Scan Codes pages expose Chinese-first backend operations copy', () => {
  [
    '运营规则',
    '固定系统逻辑',
    '管理员可配置参数',
    '需要审核和审计日志',
    '可编辑试运营参数',
    '保存试运营规则',
    '粉丝等级和积分渠道',
    '门店活动核销闭环',
    '奖励目录治理',
    '门店评级模型',
    '初始风控规则',
    '扫码码库',
    'UWELL扫码反作弊驾驶舱',
    '码类型治理',
    '校验边界阶梯',
    '生成UWELL码批次',
    '支持的码类型',
    '生产校验边界',
    '可疑扫码审核',
  ].forEach((label) => assert.ok(`${rulesSource}\n${scanCodesSource}`.includes(label), `${label} should be present`));

  [
    'OPERATIONAL_RULE_RECORD_ID',
    'DEFAULT_OPERATIONAL_RULES',
    'getScanValidationContract',
    'generateScanCodeBatch',
    'reviewScanRecord',
    'setScanCodeStatus',
  ].forEach((identifier) => assert.ok(`${rulesSource}\n${scanCodesSource}`.includes(identifier), `${identifier} data logic should stay intact`));

  [
    'Operational Rules',
    'Scan Codes controls',
    'UWELL scan anti-fraud cockpit',
    'Generate batch',
    'Save trial rules',
  ].forEach((englishCopy) => {
    assert.ok(!`${rulesSource}\n${scanCodesSource}`.includes(englishCopy), `${englishCopy} should not remain as primary backend copy`);
  });
});
