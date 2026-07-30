import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const rewardsSource = readFileSync(new URL('./RewardsOpsPage.jsx', import.meta.url), 'utf8');
const reviewsSource = readFileSync(new URL('./ReviewsPage.jsx', import.meta.url), 'utf8');
const riskSource = readFileSync(new URL('./RiskCenterPage.jsx', import.meta.url), 'utf8');
const rulesSource = readFileSync(new URL('./OperationalRulesPage.jsx', import.meta.url), 'utf8');

test('admin ops pages route critical actions through shared governance RBAC helpers', () => {
  assert.match(rewardsSource, /canManageRewardOps/);
  assert.match(rewardsSource, /canAssignRewardPickup/);
  assert.match(rewardsSource, /canManageRewardOps\(profile\)/);
  assert.match(rewardsSource, /canAssignRewardPickup\(profile\)/);

  assert.match(reviewsSource, /canApproveReview/);
  assert.match(reviewsSource, /canApproveReview\(profile\)/);

  assert.match(riskSource, /canManageRiskDecision/);
  assert.match(riskSource, /canManageRiskDecision\(profile\)/);

  assert.match(rulesSource, /canManageGlobalRules/);
  assert.match(rulesSource, /canManageGlobalRules\(profile\)/);
});
