import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const createSource = readFileSync(new URL('./VisitCreatePage.jsx', import.meta.url), 'utf8');
const detailSource = readFileSync(new URL('./VisitDetailPage.jsx', import.meta.url), 'utf8');

test('repeat visit shows S Store Visit Detail only after selecting an active S Store', () => {
  assert.match(createSource, /selectedStoreForVisit/);
  assert.match(createSource, /isSelectedActiveSStore/);
  assert.match(createSource, /S店拜访详情/);
  assert.match(createSource, /visitType === 'repeat_visit' && isSelectedActiveSStore/);
});

test('S Store visit detail captures terminal intelligence fields', () => {
  [
    '库存状态',
    '陈列状态',
    '动销观察',
    '竞品情况',
    '热卖品牌',
    '热卖口味',
    '消费者反馈',
    '市场备注',
    '需要支持',
    '需要补货',
    '拜访照片通过运营证据照片上传',
  ].forEach((label) => assert.ok(createSource.includes(label), `${label} should be part of the S Store visit template`));
});

test('S Store visit detail is grouped as an execution checklist without creating replenishment automatically', () => {
  [
    's-store-visit-checklist',
    '门店现场检查',
    '市场情报',
    '支持与补货跟进',
    '证据提醒',
    '离店前检查库存状态、UWELL 陈列和动销观察。',
    '记录竞品情况、热卖品牌、热卖口味、消费者反馈和市场备注。',
    '标记补货需求并上传证据照片；后台跟进仍保持独立处理。',
  ].forEach((label) => assert.ok(createSource.includes(label), `${label} should clarify the S Store visit template`));
  assert.doesNotMatch(createSource, /createReplenishmentTask/);
});

test('visit submit writes S Store visit detail after the normal visit record exists', () => {
  assert.match(createSource, /submitSStoreVisitDetail/);
  assert.match(createSource, /s_store_visit_detail/);
  assert.match(createSource, /visit_id: visitId/);
  assert.match(createSource, /store_id: values\.store_id/);
  assert.match(createSource, /field_rep_id: profile\?\.id/);
  assert.match(createSource, /提交S店拜访详情/);
  assert.doesNotMatch(createSource, /createReplenishmentTask/);
});

test('visit detail displays S Store visit detail without exposing correction actions', () => {
  assert.match(detailSource, /getSStoreVisitDetails/);
  assert.match(detailSource, /S店拜访详情/);
  assert.match(detailSource, /库存状态/);
  assert.match(detailSource, /竞品情况/);
  assert.match(detailSource, /热卖口味/);
  assert.match(detailSource, /需要补货/);
  assert.doesNotMatch(detailSource, /submitSStoreVisitDetail/);
  assert.doesNotMatch(detailSource, /createReplenishmentTask/);
});

test('visit create page uses Chinese-first backend shell copy', () => {
  [
    'Back to Visits',
    'Create Field Visit',
    'Edit Field Visit',
    'Visit Workflow',
    'Visit type',
    'Visit date',
    'Store Profile',
    'Create store profile, collect evidence, then score store with standard rating form.',
  ].forEach((label) => assert.doesNotMatch(createSource, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  [
    '返回拜访列表',
    '新建地推拜访',
    '编辑地推拜访',
    '拜访流程',
    '拜访类型',
    '拜访日期',
    '门店档案',
    '创建门店档案、收集证据，然后使用标准评级表为门店评分。',
  ].forEach((label) => assert.ok(createSource.includes(label), `${label} should be present`));
});
