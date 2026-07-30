import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CampaignTab.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');

test('fan campaign tab uses translation keys for consumer-facing activity labels', () => {
  assert.match(source, /渠道建设: 'fan_real_activities_store_experience'/);
  assert.match(source, /社群运营: 'fan_real_activities_community_type'/);
  assert.match(source, /促销活动: 'fan_real_activities_promotion'/);
  assert.match(source, /t\('fan_real_activities_reward_benefit'\)/);
  assert.match(source, /t\('fan_real_activities_official_benefits'\)/);
  assert.doesNotMatch(source, /Budget:<\/Text>/);
});

test('fan campaign cards use readable campaign-specific surfaces and progress text', () => {
  assert.match(source, /className="fan-campaign-card is-brand-campaign liquid-glass"/);
  assert.match(source, /className="fan-campaign-facts"/);
  assert.match(css, /\.fan-campaign-card/);
  assert.match(css, /\.fan-campaign-facts/);
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
  assert.match(source, /fan_real_activities_task_learn/);
  assert.match(source, /fan_real_activities_task_instagram/);
  assert.doesNotMatch(source, /Read UWELL care guide/);
  assert.doesNotMatch(source, /View guide/);
  assert.doesNotMatch(source, /FAN_CAMPAIGN_STEPS/);
  assert.doesNotMatch(source, /Step \{index \+ 1\}/);
  assert.doesNotMatch(source, /campaign_claims/);
  assert.doesNotMatch(source, /Find a verified store/);
  assert.doesNotMatch(source, /Visit a verified store to complete/);
});

test('fan activity center uses a clear activities structure', () => {
  assert.match(source, /t\('fan_real_activities_brand_title'\)/);
  assert.match(source, /t\('fan_real_activities_label'\)/);
  assert.match(source, /t\('fan_real_activities_earn_points'\)/);
  assert.match(source, /fan_real_activities_task_learn/);
  assert.match(source, /fan_real_activities_task_instagram/);
  assert.match(source, /fan_real_activities_task_social/);
  assert.match(source, /t\('fan_real_activities_official_title'\)/);
  assert.match(source, /t\('fan_real_activities_store_title'\)/);
  assert.match(source, /TIMED_TASK_SECONDS/);
  assert.match(source, /handleCompleteEngagementTask/);
  assert.match(source, /addFanPoints/);
  assert.match(source, /fan_engagement_tasks/);
  assert.doesNotMatch(source, /UWELL Knowledge Hub/);
  assert.doesNotMatch(source, /Knowledge and social tasks/);
});

test('fan engagement tasks open official UWELL destinations before claiming points', () => {
  assert.match(source, /https:\/\/www\.myuwell\.com\/news\/all/);
  assert.match(source, /https:\/\/www\.instagram\.com\/uwell\.tech\//);
  assert.match(source, /fan_real_activities_task_learn/);
  assert.match(source, /fan_real_activities_task_learn_desc/);
  assert.match(source, /fan_real_activities_task_instagram/);
  assert.match(source, /fan_real_activities_task_social/);
  assert.match(source, /openEngagementTaskLink/);
  assert.match(source, /window\.open\(task\.url/);
  assert.match(source, /addFanPoints\(fan\.id, task\.points, 'earn', 'UWELL Engagement'/);
  assert.match(source, /localDb\.insert\('fan_engagement_tasks'/);
  assert.match(source, /fan_real_activities_stay_prefix/);
  assert.match(source, /fan_real_activities_keep_visible/);
  assert.match(source, /fan_real_activities_task_open_article/);
  assert.match(source, /fan_real_activities_task_open_instagram/);
});

test('fan activity center shows official and store activities without reward exchange rules', () => {
  assert.match(source, /fan_real_activities_official_title/);
  assert.match(source, /fan_real_activities_store_title/);
  assert.match(source, /filterFanVisibleStoreActivities/);
  assert.match(source, /fan-store-activity-card/);
  assert.match(source, /fan-campaign-detail-grid/);
  assert.match(source, /fan_real_activities_organizer/);
  assert.match(source, /fan_real_activities_reward_benefit/);
  assert.match(source, /fan_real_activities_no_store_desc/);
  assert.match(source, /fan_real_activities_store_proof/);
  assert.doesNotMatch(source, /Reward exchange rules/);
  assert.doesNotMatch(source, /Normal rewards: A\/S stores/);
  assert.doesNotMatch(source, /Premium rewards: S stores/);
  assert.doesNotMatch(source, /Diamond rewards: backend review/);
  assert.match(css, /\.fan-store-activity-card/);
});

test('fan activities page uses the recovered activity hub layout', () => {
  assert.match(source, /className="fan-activity-page"/);
  assert.match(source, /className="fan-activity-brand-stage fan-activity-hero"/);
  assert.match(source, /className="fan-activity-quick-grid"/);
  assert.match(source, /className="fan-activity-section-head"/);
  assert.match(source, /className="fan-activity-empty-state"/);
  assert.match(source, /className="fan-activity-verify-strip"/);
});

test('store activity flow is clear without making store events instant point claims', () => {
  assert.match(source, /fan_real_activities_flow_join/);
  assert.match(source, /fan_real_activities_flow_visit/);
  assert.match(source, /fan_real_activities_flow_verify/);
  assert.match(source, /fan_real_activities_flow_points/);
  assert.match(source, /fan_real_activities_store_proof/);
  assert.doesNotMatch(source, /addFanPoints\(fan\.id, activity\.fan_points/);
  assert.doesNotMatch(source, /claimStoreActivity/);
});

test('fan activities use unified yellow green challenge styling without default antd color tags', () => {
  assert.match(source, /fan-activity-challenge-hero/);
  assert.match(source, /fan-activity-xp-chip/);
  assert.match(source, /fan-activity-action-button/);
  assert.match(source, /fan-activity-store-chip/);
  assert.match(source, /fan-activity-store-proof/);
  assert.match(source, /fan-activity-time-chip/);
  assert.doesNotMatch(source, /<Tag color="gold">/);
  assert.doesNotMatch(source, /<Tag color="blue">/);
  assert.doesNotMatch(source, /<Tag color="green">/);
  assert.doesNotMatch(source, /<Tag color="volcano">/);
  assert.match(css, /\.fan-activity-challenge-hero/);
  assert.match(css, /\.fan-activity-xp-chip/);
  assert.match(css, /\.fan-activity-action-button/);
  assert.match(css, /\.fan-activity-store-chip/);
  assert.match(css, /--fan-brand-gradient/);
});

test('fan activities Task-101 becomes a premium brand campaign story with hidden rules', () => {
  assert.match(source, /const FAN_ACTIVITY_VISUAL_ASSETS/);
  assert.match(source, /const CAMPAIGN_VISUAL_BY_ID/);
  assert.match(source, /'ca-real-001': FAN_ACTIVITY_VISUAL_ASSETS\.g5Launch/);
  assert.match(source, /'ca-real-002': FAN_ACTIVITY_VISUAL_ASSETS\.g5Koko/);
  assert.match(source, /'ca-real-003': FAN_ACTIVITY_VISUAL_ASSETS\.productLine/);
  assert.match(source, /'ca-real-004': FAN_ACTIVITY_VISUAL_ASSETS\.g5LiteKoko/);
  assert.match(source, /'ca-real-005': FAN_ACTIVITY_VISUAL_ASSETS\.g5Lite/);
  assert.match(source, /CAMPAIGN_VISUAL_BY_ID\[campaign\.id\]/);
  assert.match(source, /fan-activity-brand-stage/);
  assert.match(source, /fan-activity-brand-media/);
  assert.match(source, /fan-activity-brand-poster/);
  assert.match(source, /fan-activity-stage-actions/);
  assert.match(source, /fan-activity-feature-strip/);
  assert.match(source, /fan-activity-feature-card is-live/);
  assert.match(source, /fan-activity-feature-card is-reward/);
  assert.match(source, /fan-activity-feature-card is-store/);
  assert.match(source, /fan-activity-drop-grid/);
  assert.match(source, /fan-campaign-card is-brand-campaign/);
  assert.match(source, /fan-campaign-cover/);
  assert.match(source, /fan-campaign-copy/);
  assert.match(source, /details className="fan-activity-rules-drawer"/);
  assert.match(source, /t\('fan_real_activities_brand_title'\)/);
  assert.match(source, /t\('fan_real_activities_brand_desc'\)/);
  assert.match(source, /t\('fan_real_activities_how_it_works'\)/);
  assert.match(source, /t\('fan_real_activities_view_live'\)/);
  assert.match(source, /t\('fan_real_activities_view_store_events'\)/);

  assert.match(css, /\/\* Task-101 Fan Activities premium campaign story\. \*\//);
  assert.match(css, /\.fan-shell \.fan-activity-brand-stage/);
  assert.match(css, /\.fan-shell \.fan-activity-brand-media/);
  assert.match(css, /\.fan-shell \.fan-activity-feature-strip/);
  assert.match(css, /\.fan-shell \.fan-activity-drop-grid/);
  assert.match(css, /\.fan-shell \.fan-campaign-card\.is-brand-campaign/);
  assert.match(css, /\.fan-shell \.fan-campaign-cover/);
  assert.match(css, /\.fan-shell \.fan-activity-rules-drawer/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fan-shell \.fan-activity-brand-stage[\s\S]*grid-template-columns:\s*1fr/);
});

test('fan activities Task-109 fills the quick-task visual instead of leaving a dark empty block', () => {
  assert.match(source, /className="fan-activity-brand-media is-filled"/);
  assert.match(css, /\/\* Task-109 Fan browser comment correction pass\. \*\//);
  assert.match(css, /\.fan-shell \.fan-activity-brand-media\.is-filled[\s\S]*min-height:\s*clamp\(220px, 28vw, 300px\)/);
  assert.match(css, /\.fan-shell \.fan-activity-brand-media\.is-filled[\s\S]*display:\s*block/);
  assert.match(css, /\.fan-shell \.fan-activity-brand-media\.is-filled \.fan-activity-brand-poster[\s\S]*position:\s*absolute/);
  assert.match(css, /\.fan-shell \.fan-activity-brand-media\.is-filled \.fan-activity-brand-poster[\s\S]*bottom:\s*14px/);
});
