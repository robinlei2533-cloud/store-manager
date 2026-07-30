import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const campaignCreateSource = readFileSync(new URL('../campaigns/CampaignCreatePage.jsx', import.meta.url), 'utf8');
const campaignDetailSource = readFileSync(new URL('../campaigns/CampaignDetailPage.jsx', import.meta.url), 'utf8');
const materialInboundSource = readFileSync(new URL('../materials/MaterialInboundPage.jsx', import.meta.url), 'utf8');
const materialOutboundSource = readFileSync(new URL('../materials/MaterialOutboundPage.jsx', import.meta.url), 'utf8');
const fanGrowthSource = readFileSync(new URL('../fans/FanGrowthPage.jsx', import.meta.url), 'utf8');
const fanRulesSource = readFileSync(new URL('../fans/FanRulesPage.jsx', import.meta.url), 'utf8');
const complaintReplySource = readFileSync(new URL('../fans/ComplaintReplyPage.jsx', import.meta.url), 'utf8');
const scanCenterSource = readFileSync(new URL('../fans/ScanCenterPage.jsx', import.meta.url), 'utf8');
const visitDetailSource = readFileSync(new URL('../visits/VisitDetailPage.jsx', import.meta.url), 'utf8');
const dataManagementSource = readFileSync(new URL('../settings/DataManagement.jsx', import.meta.url), 'utf8');

test('deep backend campaign and material pages use Chinese-first operational copy', () => {
  [
    '活动已更新',
    '活动已创建',
    '编辑活动',
    '新建活动',
    '活动名称',
    '目标门店',
    '分配物料发货',
    '活动复盘报告',
    '入库管理',
    '入库历史',
    '出库 / 申领',
    '新建申领',
    '出库记录',
  ].forEach((label) => {
    assert.ok(
      `${campaignCreateSource}\n${campaignDetailSource}\n${materialInboundSource}\n${materialOutboundSource}`.includes(label),
      `${label} should be present`,
    );
  });
});

test('deep backend fan operations pages use Chinese-first management copy', () => {
  [
    '粉丝增长中心',
    '规则设置边界',
    '固定系统逻辑',
    '可配置运营参数',
    '需要审核和审计日志',
    '粉丝投诉回复',
    '请输入回复内容',
    '二维码管理',
    '扫码记录',
    '生成二维码',
    '模拟扫码',
    '拜访详情',
    '销售数据',
    'S店拜访详情',
    '云端模式启用说明',
    '创建 Supabase 免费账号',
  ].forEach((label) => {
    assert.ok(
      `${fanGrowthSource}\n${fanRulesSource}\n${complaintReplySource}\n${scanCenterSource}\n${visitDetailSource}\n${dataManagementSource}`.includes(label),
      `${label} should be present`,
    );
  });
});

test('deep backend pages do not keep English-first shell labels', () => {
  [
    'Campaign updated',
    'Campaign created',
    'Edit Campaign',
    'New Campaign',
    'Campaign Name',
    'Target Stores',
    'Back to Campaigns',
    'Review Report',
    'Assign Materials',
    'Inbound Management',
    'Inbound History',
    'Submit Inbound',
    'Outbound / Requisition',
    'New Requisition',
    'Outbound Records',
    'Rule Settings Boundary',
    'Fixed system logic',
    'Configurable operational parameters',
    'Requires review and audit log',
    'Fan complaint replies',
    'Enter reply to fan',
    'QR Code Management',
    'Scan Records',
    'Generate QR Code',
    'Simulate Scan',
    'Back to Visits',
    'Visit Detail',
    'Sales Data',
    'S Store Visit Detail',
    'No S Store visit detail',
    'To enable multi-user access',
    'Create a free account',
    'Create a new project',
  ].forEach((englishCopy) => {
    assert.ok(
      !`${campaignCreateSource}\n${campaignDetailSource}\n${materialInboundSource}\n${materialOutboundSource}\n${fanGrowthSource}\n${fanRulesSource}\n${complaintReplySource}\n${scanCenterSource}\n${visitDetailSource}\n${dataManagementSource}`.includes(englishCopy),
      `${englishCopy} should not remain as primary backend copy`,
    );
  });
});

test('deep backend data and API identifiers stay stable', () => {
  [
    'createCampaign',
    'updateCampaignTask',
    'createInbound',
    'createOutbound',
    'updateOutboundStatus',
    'getPointsRules',
    'fan_complaints',
    'getQrCodes',
    'scanQrCode',
    'getVisitById',
    'isLocalMode',
  ].forEach((identifier) => {
    assert.ok(
      `${campaignCreateSource}\n${campaignDetailSource}\n${materialInboundSource}\n${materialOutboundSource}\n${fanGrowthSource}\n${fanRulesSource}\n${complaintReplySource}\n${scanCenterSource}\n${visitDetailSource}\n${dataManagementSource}`.includes(identifier),
      `${identifier} should stay intact`,
    );
  });
});
