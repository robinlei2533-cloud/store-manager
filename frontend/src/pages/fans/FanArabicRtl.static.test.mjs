import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const translationsSource = readFileSync(new URL('../../utils/translations.js', import.meta.url), 'utf8');
const fanAppSource = readFileSync(new URL('../../fan/App.jsx', import.meta.url), 'utf8');
const fanCenterSource = readFileSync(new URL('./FanCenterPage.jsx', import.meta.url), 'utf8');
const scanSource = readFileSync(new URL('./tabs/ScanTab.jsx', import.meta.url), 'utf8');
const mallSource = readFileSync(new URL('./tabs/MallTab.jsx', import.meta.url), 'utf8');
const inviteSource = readFileSync(new URL('./tabs/InviteTab.jsx', import.meta.url), 'utf8');
const mapSource = readFileSync(new URL('./tabs/MapTab.jsx', import.meta.url), 'utf8');
const guideSource = readFileSync(new URL('./tabs/HowItWorksTab.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('fan Arabic copy uses natural Gulf-ready membership terms for the core journey', () => {
  [
    "fan_real_home: 'الرئيسية'",
    "fan_real_activities: 'الفعاليات'",
    "fan_real_community: 'المجتمع'",
    "fan_real_rewards: 'المكافآت'",
    "fan_real_stores: 'المتاجر'",
    "fan_real_me: 'حسابي'",
    "fan_real_checkin_title: 'تسجيل الحضور اليومي'",
    "fan_real_scan_title: 'امسح رمز منتج UWELL'",
    "fan_real_invite_title: 'ادعُ أصدقاءك'",
    "fan_real_old_fan_title: 'توثيق عضو قديم'",
    "fan_real_help_title: 'الدليل والمساعدة'",
  ].forEach((label) => assert.ok(translationsSource.includes(label), `${label} should be present`));
});

test('real fan pages consume translation keys instead of staying English-only in core controls', () => {
  [
    "t('fan_real_home')",
    "t('fan_real_activities')",
    "t('fan_real_community')",
    "t('fan_real_rewards')",
    "t('fan_real_stores')",
    "t('fan_real_me')",
    "t('fan_real_language')",
    "t('fan_real_today_story_title')",
    "t('fan_real_old_fan_title')",
  ].forEach((label) => assert.ok(fanCenterSource.includes(label), `${label} should be used in FanCenterPage`));

  [
    [scanSource, "t('fan_real_scan_title')"],
    [mallSource, "t('fan_real_rewards_title')"],
    [inviteSource, "t('fan_real_invite_title')"],
    [mapSource, "t('fan_real_store_map_title')"],
    [guideSource, "t('fan_real_help_title')"],
  ].forEach(([source, label]) => assert.ok(source.includes(label), `${label} should be used`));
});

test('fan portal keeps Arabic RTL active and adds fan-specific RTL layout guards', () => {
  assert.match(fanAppSource, /direction=\{lang === 'ar' \? 'rtl' : 'ltr'\}/);
  [
    'html[dir="rtl"] .fan-shell',
    'html[dir="rtl"] .fan-bottom-nav',
    'html[dir="rtl"] .fan-shell-header',
    'html[dir="rtl"] .fan-scan-modal',
    'html[dir="rtl"] .fan-reward-filter-bar',
    'html[dir="rtl"] .fan-store-card',
    'unicode-bidi: plaintext',
  ].forEach((label) => assert.ok(cssSource.includes(label), `${label} should be present in RTL CSS`));
});
