import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CampaignTab.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');

test('fan campaign tab keeps consumer-facing activity labels in English', () => {
  assert.match(source, /渠道建设: 'Store experience'/);
  assert.match(source, /社群运营: 'Community'/);
  assert.match(source, /促销活动: 'Promotion'/);
  assert.match(source, /Reward:<\/Text> Extra member points/);
  assert.doesNotMatch(source, /Budget:<\/Text>/);
});

test('fan campaign cards use readable campaign-specific surfaces and progress text', () => {
  assert.match(source, /className="fan-campaign-card liquid-glass"/);
  assert.match(source, /className="fan-campaign-progress"/);
  assert.match(css, /\.fan-campaign-card/);
  assert.match(css, /\.fan-campaign-card \.ant-progress-inner/);
  assert.match(css, /\.fan-campaign-progress-value/);
  assert.match(css, /background:\s*#ffffff !important/);
});

test('fan campaign detail modal and status tags stay on light readable surfaces', () => {
  assert.match(source, /className="fan-campaign-detail-modal"/);
  assert.match(source, /fan-campaign-status-tag/);
  assert.match(css, /\.fan-campaign-detail-modal \.ant-modal-content/);
  assert.match(css, /\.fan-campaign-status-tag\.is-completed/);
  assert.match(css, /background:\s*#eee7d8 !important/);
});

test('fan campaign flow no longer requires a store visit task for trial operation', () => {
  assert.match(source, /Read UWELL knowledge/);
  assert.match(source, /Share UWELL social content/);
  assert.match(source, /View guide/);
  assert.doesNotMatch(source, /campaign_claims/);
  assert.doesNotMatch(source, /Find a verified store/);
  assert.doesNotMatch(source, /Visit a verified store to complete/);
});

test('fan activity center is repositioned as UWELL knowledge and social engagement tasks', () => {
  assert.match(source, /UWELL Knowledge Hub/);
  assert.match(source, /Read UWELL care guide/);
  assert.match(source, /View UWELL Instagram/);
  assert.match(source, /Like, comment, or share UWELL post/);
  assert.match(source, /TIMED_TASK_SECONDS/);
  assert.match(source, /handleCompleteEngagementTask/);
  assert.match(source, /addFanPoints/);
  assert.match(source, /fan_engagement_tasks/);
  assert.doesNotMatch(source, /UWELL Brand Activities/);
});

test('fan engagement tasks open official UWELL destinations before claiming points', () => {
  assert.match(source, /https:\/\/www\.myuwell\.com\/news\/all/);
  assert.match(source, /https:\/\/www\.instagram\.com\/uwell\.tech\//);
  assert.match(source, /openEngagementTaskLink/);
  assert.match(source, /window\.open\(task\.url/);
  assert.match(source, /Stay \$/);
  assert.match(source, /Keep this page visible for 10 seconds/);
  assert.match(source, /Open article/);
  assert.match(source, /Open Instagram/);
});

test('fan activity center shows approved store activities and reward exchange rules', () => {
  assert.match(source, /Nearby store activities/);
  assert.match(source, /filterFanVisibleStoreActivities/);
  assert.match(source, /fan-store-activity-card/);
  assert.match(source, /Reward exchange rules/);
  assert.match(source, /buildRewardTierRules/);
  assert.match(source, /Pickup at S-level store/);
  assert.match(css, /\.fan-store-activity-card/);
  assert.match(css, /\.fan-reward-tier-grid/);
});
