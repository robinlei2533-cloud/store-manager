import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./RewardsOpsPage.jsx', import.meta.url), 'utf8');

test('rewards ops page exposes configurable catalog fields and fixed redemption logic', () => {
  assert.match(source, /奖励积分成本可配置/);
  assert.match(source, /兑换逻辑固定/);
  assert.match(source, /只扣除可用积分/);
  assert.match(source, /终身成长积分永不扣除/);
  assert.match(source, /图片风格/);
  assert.doesNotMatch(source, /占位/);
  assert.match(source, /区域资格/);
  assert.match(source, /领取规则/);
});

test('rewards ops page separates normal pickup, S-store pickup, and review-required luxury rewards', () => {
  assert.match(source, /普通奖励：A\/S门店可履约/);
  assert.match(source, /进阶奖励：仅S店履约/);
  assert.match(source, /钻石高价值奖励需要后台审核/);
  assert.match(source, /高价值奖励审批队列/);
  assert.match(source, /一周中国行/);
  assert.match(source, /高端耳机/);
  assert.match(source, /手机或高价值电子产品/);
});

test('rewards ops page provides trial operation actions without allowing arbitrary point grants', () => {
  assert.match(source, /通过审核/);
  assert.match(source, /拒绝审核/);
  assert.match(source, /分配领取门店/);
  assert.match(source, /门店账号只做领取核销/);
  assert.match(source, /buildReviewQueue/);
  assert.match(source, /localDb\.all\('mall_redemptions'\)/);
  assert.match(source, /reward_reviews/);
  assert.match(source, /audit_logs/);
  assert.match(source, /assigned_pickup_store_id/);
  assert.doesNotMatch(source, /give points manually|manual point grant/i);
});

test('rewards ops page uses a compact admin density pass while preserving review tables', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  [
    'admin-reward-compact-summary',
    'admin-reward-rule-dock',
    'admin-reward-governance-compact',
    'admin-reward-handoff-compact',
    'admin-reward-table-stack',
    'admin-reward-review-actions',
    'admin-reward-pickup-select',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.match(source, /REWARD_CATALOG/);
  assert.match(source, /reviewQueue/);
  assert.match(source, /scroll=\{\{\s*x:\s*920\s*\}\}/);
  assert.match(source, /scroll=\{\{\s*x:\s*1100\s*\}\}/);
  assert.match(source, /updateRedemptionReview/);
  assert.match(source, /assignPickupStore/);
  assert.match(source, /canManageRewardOps/);
  assert.match(source, /canAssignRewardPickup/);

  assert.match(css, /\.admin-liquid-shell \.admin-reward-compact-summary/);
  assert.match(css, /\.admin-liquid-shell \.admin-reward-rule-dock/);
  assert.match(css, /\.admin-liquid-shell \.admin-reward-table-stack/);
  assert.match(css, /\.admin-liquid-shell \.admin-reward-review-actions/);
});
