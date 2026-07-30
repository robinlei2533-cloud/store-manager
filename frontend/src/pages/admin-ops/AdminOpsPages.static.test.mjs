import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const reviewsSource = readFileSync(new URL('./ReviewsPage.jsx', import.meta.url), 'utf8');
const riskSource = readFileSync(new URL('./RiskCenterPage.jsx', import.meta.url), 'utf8');
const scanCodesSource = readFileSync(new URL('./ScanCodesPage.jsx', import.meta.url), 'utf8');
const rewardsOpsSource = readFileSync(new URL('./RewardsOpsPage.jsx', import.meta.url), 'utf8');
const rulesSource = readFileSync(new URL('./OperationalRulesPage.jsx', import.meta.url), 'utf8');
const workflowsSource = readFileSync(new URL('./admin-ops-workflows.js', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('reviews page exposes filters statuses and review actions from the agreed workflow', () => {
  assert.match(reviewsSource, /reviewFilters/);
  assert.match(reviewsSource, /活动/);
  assert.match(reviewsSource, /奖励/);
  assert.match(reviewsSource, /门店等级/);
  assert.match(reviewsSource, /拜访/);
  assert.match(reviewsSource, /扫码风险/);
  assert.match(reviewsSource, /社区/);
  assert.match(reviewsSource, /Need More Info/);
  assert.match(reviewsSource, /升级处理/);
  assert.match(reviewsSource, /要求补充信息/);
  assert.match(reviewsSource, /添加备注/);
  assert.match(reviewsSource, /searchTerm/);
  assert.match(reviewsSource, /normalizedSearch/);
  assert.match(reviewsSource, /setSearchTerm/);
  assert.match(reviewsSource, /buildReviewRows/);
  assert.match(reviewsSource, /applyReviewAction/);
  assert.match(reviewsSource, /getReviewCounters/);
  assert.match(workflowsSource, /localDb\.all\('campaigns'\)/);
  assert.match(workflowsSource, /localDb\.all\('material_requests'\)/);
  assert.match(workflowsSource, /localDb\.all\('store_display_uploads'\)/);
  assert.match(workflowsSource, /localDb\.all\('store_evaluations'\)/);
  assert.match(workflowsSource, /localDb\.all\('visits'\)/);
  assert.match(workflowsSource, /localDb\.all\('fan_complaints'\)/);
  assert.match(workflowsSource, /store_activity_verifications/);
  assert.match(workflowsSource, /category: 'Store Levels'/);
  assert.match(workflowsSource, /category: 'Visits'/);
  assert.match(workflowsSource, /category: 'Scan Risks'/);
  assert.match(workflowsSource, /category: 'Community'/);
  assert.match(workflowsSource, /backend_final_level/);
  assert.match(workflowsSource, /level_review_status/);
  assert.match(workflowsSource, /replied_by: 'trial-admin'/);
  assert.match(workflowsSource, /writeOpsAudit/);
  assert.match(workflowsSource, /review_\$\{action\}/);
});

test('reviews page renders as a cross-portal decision workbench', () => {
  [
    'admin-review-workbench',
    'admin-review-command-strip',
    'admin-review-source-map',
    'admin-review-action-ladder',
    '跨端审核入口',
    '粉丝凭证、门店提交、地推评级、扫码风险和奖励审批统一进入这里。',
    '决策写入审计日志',
    '通过、拒绝、要求补充、升级处理或添加备注',
    '粉丝端',
    '门店端',
    '地推端',
    '风控端',
  ].forEach((label) => assert.ok(reviewsSource.includes(label), `${label} should be present`));
});

test('reviews page uses compact admin queue classes while preserving every review action', () => {
  [
    'admin-review-workbench-compact',
    'admin-review-decision-grid',
    'admin-review-source-map-compact',
    'admin-review-action-ladder-compact',
    'admin-review-handoff-compact',
    'admin-review-counter-grid',
    'admin-review-filter-card',
    'admin-review-filter-grid',
    'admin-review-action-grid',
    'admin-review-queue-table',
  ].forEach((label) => assert.ok(reviewsSource.includes(label), `${label} should be present`));

  [
    "runAction(row, 'approve')",
    "runAction(row, 'reject')",
    "runAction(row, 'need_more_info')",
    "runAction(row, 'escalate')",
    "runAction(row, 'note')",
    'navigate(getReviewDestination(row).route)',
    'reviewFilters.map',
    'Input.Search',
    'scroll={{ x: 980 }}',
  ].forEach((label) => assert.ok(reviewsSource.includes(label), `${label} should remain in Reviews`));

  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-workbench-compact/);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-decision-grid/);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-filter-grid/);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-action-grid/);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-queue-table/);
});

test('reviews queue keeps decision actions near the first visible table columns', () => {
  const columnsStart = reviewsSource.indexOf('const columns = [');
  const categoryIndex = reviewsSource.indexOf("dataIndex: 'category'", columnsStart);
  const typeIndex = reviewsSource.indexOf("dataIndex: 'type'", columnsStart);
  const actionIndex = reviewsSource.indexOf('navigate(getReviewDestination(row).route)', columnsStart);
  const sourceIndex = reviewsSource.indexOf('row.sourceTable', columnsStart);
  const nextStepIndex = reviewsSource.indexOf("dataIndex: 'nextStep'", columnsStart);

  assert.ok(columnsStart >= 0, 'Reviews columns should be declared');
  assert.ok(categoryIndex > columnsStart, 'category should remain in Reviews columns');
  assert.ok(actionIndex > categoryIndex, 'action column should remain after category');
  assert.ok(actionIndex < typeIndex, 'action column should appear before type on narrow screens');
  assert.ok(actionIndex < sourceIndex, 'action column should appear before the wide source column');
  assert.ok(actionIndex < nextStepIndex, 'action column should appear before later operational notes');

  [
    'navigate(getReviewDestination(row).route)',
    "runAction(row, 'approve')",
    "runAction(row, 'reject')",
    "runAction(row, 'need_more_info')",
    "runAction(row, 'escalate')",
    "runAction(row, 'note')",
  ].forEach((label) => assert.ok(reviewsSource.includes(label), `${label} should stay in the action column`));
});

test('reviews queue table headers keep a 12px readable minimum on mobile', () => {
  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-queue-table \.ant-table-thead > tr > th\s*\{[^}]*font-size:\s*12px\s*!important;/s);
});

test('reviews page prioritizes the real queue and avoids deprecated AntD Space direction', () => {
  assert.doesNotMatch(reviewsSource, /<Space[^>]*direction="vertical"/);
  assert.match(reviewsSource, /orientation="vertical"/);

  [
    'admin-review-command-strip',
    'admin-review-source-map-compact',
    'admin-review-action-ladder-compact',
    'admin-review-handoff-compact',
    'admin-review-counter-grid',
    'admin-review-filter-card',
    'admin-review-queue-table',
  ].forEach((label) => assert.ok(reviewsSource.includes(label), `${label} should remain available`));

  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-workbench-compact\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-filter-card\s*\{[^}]*order:\s*1;/s);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-queue-card\s*\{[^}]*order:\s*2;/s);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-counter-grid\s*\{[^}]*order:\s*3;/s);
  assert.match(cssSource, /\.admin-liquid-shell \.admin-review-guidance-card\s*\{[^}]*order:\s*4;/s);
  assert.match(cssSource, /max-height:\s*180px/);
});

test('admin ops derived localDb queues use inline useMemo callbacks for React hook lint', () => {
  assert.doesNotMatch(reviewsSource, /useMemo\(\s*buildReviewRows\s*,/);
  assert.match(reviewsSource, /useMemo\(\(\) => \{\s*void refreshKey;\s*return buildReviewRows\(\);\s*\}, \[refreshKey\]\)/);

  assert.doesNotMatch(scanCodesSource, /useMemo\(\s*getScanCodeRows\s*,/);
  assert.doesNotMatch(scanCodesSource, /useMemo\(\s*getSuspiciousScanRows\s*,/);
  assert.match(scanCodesSource, /useMemo\(\(\) => \{\s*void refreshKey;\s*return getScanCodeRows\(\);\s*\}, \[refreshKey\]\)/);
  assert.match(scanCodesSource, /useMemo\(\(\) => \{\s*void refreshKey;\s*return getSuspiciousScanRows\(\);\s*\}, \[refreshKey\]\)/);

  assert.match(rewardsOpsSource, /useMemo\(\(\) => \{\s*void refreshKey;\s*return buildReviewQueue\(\);\s*\}, \[refreshKey\]\)/);
  assert.match(riskSource, /useMemo\(\(\) => \{\s*void refreshKey;\s*return buildRiskRows\(\);\s*\}, \[refreshKey\]\)/);
});

test('risk center Timeline items avoid deprecated AntD children prop', () => {
  assert.doesNotMatch(riskSource, /Timeline items=\{\[[\s\S]*children:/);
  assert.match(riskSource, /Timeline items=\{\[[\s\S]*content:/);
});

test('reviews risk and rewards pages expose backend handoff queues for daily operations', () => {
  [
    'admin-review-handoff-queue',
    '待处理交接',
    '来源记录',
    '下一动作负责人',
    '回流模块',
  ].forEach((label) => assert.ok(reviewsSource.includes(label), `${label} should be present in Reviews`));

  [
    'admin-risk-handoff-queue',
    '风控转审核交接',
    '升级路径',
    '处理证据',
    '审计结果',
  ].forEach((label) => assert.ok(riskSource.includes(label), `${label} should be present in Risk Center`));

  [
    'admin-reward-handoff-queue',
    '奖励履约交接',
    '审核决策',
    '领取分配',
    '粉丝/门店通知状态',
  ].forEach((label) => assert.ok(sourceIncludesRewards(label), `${label} should be present in Rewards`));
});

test('backend target queues expose source destination and readiness columns for actual handling', () => {
  [
    'getReviewDestination',
    '来源',
    '回流模块',
    '查看来源',
  ].forEach((label) => assert.ok(reviewsSource.includes(label), `${label} should be present in Reviews queue`));

  [
    'riskStatusGuidance',
    '下一动作',
    '核验来源证据',
    '已升级至审核中心',
  ].forEach((label) => assert.ok(riskSource.includes(label), `${label} should be present in Risk queue`));

  [
    'getRewardFulfillmentState',
    '履约状态',
    '等待审核决策',
    '待分配领取门店',
  ].forEach((label) => assert.ok(sourceIncludesRewards(label), `${label} should be present in Rewards queue`));
});

test('risk center exposes categories statuses and send-to-reviews operations', () => {
  assert.match(riskSource, /riskStatuses/);
  assert.match(riskSource, /待处理/);
  assert.match(riskSource, /审核中/);
  assert.match(riskSource, /拒绝相关积分/);
  assert.match(riskSource, /发送至审核中心/);
  assert.match(riskSource, /添加备注/);
  assert.match(riskSource, /buildRiskRows/);
  assert.match(riskSource, /localDb\.all\('scan_records'\)/);
  assert.match(riskSource, /store_activity_verifications/);
  assert.match(riskSource, /community_comments/);
  assert.match(riskSource, /mall_redemptions/);
  assert.match(riskSource, /risk_sent_to_reviews/);
  assert.match(riskSource, /audit_logs/);
});

test('risk center renders risk triage as an operations cockpit', () => {
  [
    'admin-risk-cockpit',
    'admin-risk-command-strip',
    'admin-risk-policy-grid',
    'admin-risk-resolution-ladder',
    '反作弊分诊',
    '识别可疑扫码、重复门店核销、社区滥用和高价值奖励风险。',
    '冻结或拒绝相关积分',
    '发送至审核中心进行人工决策',
    '写入审计备注后才能标记解决',
    '产品扫码作弊',
    '门店核销滥用',
    '奖励兑换风险',
    '社区积分滥用',
  ].forEach((label) => assert.ok(riskSource.includes(label), `${label} should be present`));
});

test('scan codes page supports trial code operations and suspicious scan review', () => {
  assert.match(scanCodesSource, /生成UWELL码批次/);
  assert.match(scanCodesSource, /generateScanCodeBatch/);
  assert.match(scanCodesSource, /setScanCodeStatus/);
  assert.match(scanCodesSource, /reviewScanRecord/);
  assert.match(scanCodesSource, /封禁/);
  assert.match(scanCodesSource, /解封/);
  assert.match(scanCodesSource, /可疑扫码审核/);
  assert.match(scanCodesSource, /生产校验边界/);
  assert.match(scanCodesSource, /getScanValidationContract/);
  assert.match(scanCodesSource, /requiredProductCodeFields/);
  assert.match(scanCodesSource, /decisionStatuses/);
  assert.match(workflowsSource, /scan_code_batch_generated/);
  assert.match(workflowsSource, /code_signature/);
  assert.match(workflowsSource, /batch_no/);
  assert.match(workflowsSource, /validator_source/);
  assert.match(workflowsSource, /Global one-time product claim/);
  assert.match(workflowsSource, /scan_record_/);
});

test('scan codes page renders an anti-fraud code operations cockpit', () => {
  [
    'admin-scan-cockpit',
    'admin-scan-command-strip',
    'admin-scan-code-class-grid',
    'admin-scan-boundary-ladder',
    'UWELL扫码反作弊驾驶舱',
    '唯一产品码只有经过官方校验后才会发放积分。',
    '产品唯一码',
    '门店活动码和官方活动码',
    '粉丝入口、官网、社交和私域码',
    '非 UWELL 码拒绝',
    '本地识别不足以发放产品积分',
    '每日计分产品扫码上限继续生效',
  ].forEach((label) => assert.ok(scanCodesSource.includes(label), `${label} should be present`));
});

test('rewards ops page renders reward governance as a redemption cockpit', () => {
  [
    'admin-reward-cockpit',
    'admin-reward-command-strip',
    'admin-reward-governance-grid',
    'admin-reward-fulfillment-ladder',
    '奖励治理驾驶舱',
    '目录可以运营调整，兑换和成长积分规则保持固定。',
    '目录与素材状态',
    '等级与积分成本规则',
    '领取门店资格',
    '高价值奖励审批',
    '仅扣除可用积分',
    '终身成长积分保持不变',
    '分配合格 A/S 领取门店',
  ].forEach((label) => assert.ok(sourceIncludesRewards(label), `${label} should be present`));
});

function sourceIncludesRewards(label) {
  return readFileSync(new URL('./RewardsOpsPage.jsx', import.meta.url), 'utf8').includes(label);
}

test('operational rules page exposes trial-launch fixed rules and configurable parameters', () => {
  assert.match(rulesSource, /运营规则/);
  assert.match(rulesSource, /固定系统逻辑/);
  assert.match(rulesSource, /管理员可配置参数/);
  assert.match(rulesSource, /需要审核和审计日志/);
  assert.match(rulesSource, /奖励兑换只扣除可用积分/);
  assert.match(rulesSource, /门店账号只负责核销参与或领取/);
  assert.match(rulesSource, /只有 Admin 可以创建 Manager 和 Rep 账号/);
  assert.match(rulesSource, /粉丝等级和积分渠道/);
  assert.match(rulesSource, /门店活动核销闭环/);
  assert.match(rulesSource, /奖励目录治理/);
  assert.match(rulesSource, /门店评级模型/);
  assert.match(rulesSource, /REGIONAL_WAREHOUSES/);
  assert.match(rulesSource, /RISK_RULES/);
  assert.match(rulesSource, /可编辑试运营参数/);
  assert.match(rulesSource, /DEFAULT_OPERATIONAL_RULES/);
  assert.match(rulesSource, /OPERATIONAL_RULE_RECORD_ID/);
  assert.match(rulesSource, /saveOperationalRules/);
  assert.match(rulesSource, /fan_points_rules/);
  assert.match(rulesSource, /audit_logs/);
  assert.match(rulesSource, /rule_setting_changed/);
  assert.match(rulesSource, /保存试运营规则/);
  assert.match(rulesSource, /communityPostDailyLimit/);
  assert.match(rulesSource, /highValueRewardReviewThreshold/);
  assert.match(rulesSource, /materialLowStockThreshold/);
});
