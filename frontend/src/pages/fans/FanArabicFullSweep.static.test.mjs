import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const translationsSource = readFileSync(new URL('../../utils/translations.js', import.meta.url), 'utf8');
const fanCenterSource = readFileSync(new URL('./FanCenterPage.jsx', import.meta.url), 'utf8');
const scanSource = readFileSync(new URL('./tabs/ScanTab.jsx', import.meta.url), 'utf8');
const mallSource = readFileSync(new URL('./tabs/MallTab.jsx', import.meta.url), 'utf8');
const inviteSource = readFileSync(new URL('./tabs/InviteTab.jsx', import.meta.url), 'utf8');
const mapSource = readFileSync(new URL('./tabs/MapTab.jsx', import.meta.url), 'utf8');
const guideSource = readFileSync(new URL('./tabs/HowItWorksTab.jsx', import.meta.url), 'utf8');
const campaignSource = readFileSync(new URL('./tabs/CampaignTab.jsx', import.meta.url), 'utf8');
const communitySource = readFileSync(new URL('./tabs/CommunityTab.jsx', import.meta.url), 'utf8');
const checkInSource = readFileSync(new URL('./tabs/CheckInTab.jsx', import.meta.url), 'utf8');

const requiredKeys = [
  'fan_real_points_unit',
  'fan_real_today_tasks',
  'fan_real_growth_center',
  'fan_real_account_overview',
  'fan_real_recent_activity',
  'fan_real_invite_friends',
  'fan_real_new_user_guide',
  'fan_real_scan_submit_code',
  'fan_real_scan_product_unique',
  'fan_real_scan_empty',
  'fan_real_no_product_points',
  'fan_real_reward_success',
  'fan_real_reward_image',
  'fan_real_reward_redeem',
  'fan_real_reward_understand',
  'fan_real_invite_share_code',
  'fan_real_storefront_photo',
  'fan_real_phone',
  'fan_real_map_empty',
  'fan_real_storefront_pending',
  'fan_real_help_existing_fan_question',
  'fan_real_activities_label',
  'fan_real_activities_title',
  'fan_real_activities_desc',
  'fan_real_activities_quick_tasks',
  'fan_real_activities_official_actions',
  'fan_real_activities_store_verified',
  'fan_real_community_label',
  'fan_real_community_title',
  'fan_real_community_desc',
  'fan_real_community_share_moment',
  'fan_real_community_comment',
  'fan_real_checkin_build_streak',
  'fan_real_checkin_today',
  'fan_real_checkin_this_week',
  'fan_real_checkin_collect_today',
];

test('Arabic full fan sweep adds translations for high-impact remaining UI copy', () => {
  requiredKeys.forEach((key) => {
    assert.match(translationsSource, new RegExp(`${key}: '[^']*[\\u0600-\\u06FF]`), `${key} should have Arabic copy`);
  });
});

test('real fan components consume full-sweep translation keys', () => {
  [
    [fanCenterSource, 'fan_real_today_tasks'],
    [fanCenterSource, 'fan_real_growth_center'],
    [fanCenterSource, 'fan_real_account_overview'],
    [fanCenterSource, 'fan_real_invite_friends'],
    [scanSource, 'fan_real_scan_submit_code'],
    [scanSource, 'fan_real_scan_product_unique'],
    [scanSource, 'fan_real_scan_empty'],
    [mallSource, 'fan_real_reward_success'],
    [mallSource, 'fan_real_reward_image'],
    [mallSource, 'fan_real_reward_understand'],
    [inviteSource, 'fan_real_invite_share_code'],
    [mapSource, 'fan_real_storefront_photo'],
    [mapSource, 'fan_real_phone'],
    [mapSource, 'fan_real_map_empty'],
    [guideSource, 'fan_real_help_existing_fan_question'],
    [campaignSource, 'fan_real_activities_title'],
    [campaignSource, 'fan_real_activities_official_actions'],
    [campaignSource, 'fan_real_activities_store_verified'],
    [communitySource, 'fan_real_community_title'],
    [communitySource, 'fan_real_community_share_moment'],
    [communitySource, 'fan_real_community_comment'],
    [checkInSource, 'fan_real_checkin_build_streak'],
    [checkInSource, 'fan_real_checkin_this_week'],
    [checkInSource, 'fan_real_checkin_collect_today'],
  ].forEach(([source, key]) => {
    assert.ok(source.includes(`t('${key}')`), `${key} should be rendered through t()`);
  });
});

test('high-impact fan UI no longer hardcodes old English-only labels', () => {
  [
    [fanCenterSource, /Today's tasks|Growth center|Account overview|English now\. Arabic support is planned\./],
    [scanSource, /Submit Code|Product unique code|No scans yet\. Buy a UWELL product|No product points/],
    [mallSource, /Redemption Successful!|Reward image|I understand/],
    [inviteSource, /Share this code:/],
    [mapSource, /Storefront photo pending|No nearby UWELL partner stores are available right now\./],
    [guideSource, /Existing fan verification can grant \+100 points/],
    [campaignSource, /Earn from real actions|Official quick actions|No approved store activities are available near you yet/],
    [communitySource, /Show your setup\. Share what you tried\.|Share a UWELL moment|Add a comment\.\.\.|Photo posting is coming soon\./],
    [checkInSource, /Build your UWELL streak|This week|Collect today's points|Ready now/],
  ].forEach(([source, pattern]) => {
    assert.doesNotMatch(source, pattern);
  });
});
