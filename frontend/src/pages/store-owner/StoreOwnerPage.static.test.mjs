import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const entrySource = readFileSync(new URL('./StoreEntryPage.jsx', import.meta.url), 'utf8');
const ownerSource = readFileSync(new URL('./StoreOwnerPage.jsx', import.meta.url), 'utf8');

test('store entry forces an English-first public experience', () => {
  assert.match(entrySource, /ensureEnglishFirst\(\)/);
  assert.match(entrySource, /Store name \*/);
  assert.match(entrySource, /Submit for review/);
});

test('store owner dashboard uses English owner-facing copy', () => {
  const forbiddenCopy = [
    '门店等级',
    '进行中活动',
    '待处理领取',
    '展示已通过',
    '展示待审核',
    '活动状态',
    '查看活动',
    '已领取',
    '可领取',
    '暂无分配活动',
    '物料库存',
    '登记库存',
    '安全',
    '低于安全库存',
    'UWELL 产品展示',
    '上传店内真实展示图',
    '待审核',
    '已通过',
    '已拒绝',
    '暂无图片',
    '上传',
    'UWELL 展示',
  ];

  for (const copy of forbiddenCopy) {
    assert.doesNotMatch(ownerSource, new RegExp(copy));
  }

  assert.match(ownerSource, /Store Level/);
  assert.match(ownerSource, /Active campaigns/);
  assert.match(ownerSource, /Pending claims/);
  assert.match(ownerSource, /Campaign status/);
  assert.match(ownerSource, /Material inventory/);
  assert.match(ownerSource, /Register stock/);
  assert.match(ownerSource, /UWELL Display/);
});

test('store owner center supports S-level reward pickup', () => {
  assert.match(ownerSource, /validateRewardPickup/);
  assert.match(ownerSource, /confirmRewardPickup/);
  assert.match(ownerSource, /Reward Pickup/);
  assert.match(ownerSource, /Only S-level UWELL stores can fulfill rewards/);
  assert.match(ownerSource, /pickupCode/);
});
