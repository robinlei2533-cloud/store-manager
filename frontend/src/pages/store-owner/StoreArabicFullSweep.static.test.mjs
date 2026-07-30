import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import { TRANSLATIONS } from '../../utils/translations.js';

const entrySource = readFileSync(new URL('./StoreEntryPage.jsx', import.meta.url), 'utf8');
const ownerSource = readFileSync(new URL('./StoreOwnerPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

const requiredKeys = [
  'store_entry_email_placeholder',
  'store_entry_password_placeholder',
  'store_entry_apply_review_tab',
  'store_entry_store_name_placeholder',
  'store_entry_owner_email_placeholder',
  'store_entry_phone_placeholder_required',
  'store_entry_country_placeholder',
  'store_entry_city_placeholder',
  'store_entry_address_optional',
  'store_entry_login_legal',
  'store_entry_apply_legal',
  'store_owner_tab_home',
  'store_owner_tab_verify',
  'store_owner_tab_activities',
  'store_owner_tab_s_report',
  'store_owner_tab_me',
  'store_owner_today_execution_command',
  'store_owner_level_exposure_pickup_rules',
  'store_owner_store_operations_status',
  'store_owner_campaign_status',
  'store_owner_material_inventory',
  'store_owner_s_report_title',
  'store_owner_sell_through',
  'store_owner_product_inventory',
  'store_owner_reward_pickup',
  'store_owner_scan_or_enter_fan_qr',
  'store_owner_store_profile',
  'store_owner_store_setup_visibility',
  'store_owner_activity_application',
  'store_owner_apply_store_activity',
];

const hardcodedShellCopy = [
  'Apply for review',
  'Store name *',
  'Owner email *',
  'Submit for review',
  'By logging in, you confirm you are of legal age.',
  'Today execution command',
  'New store readiness',
  'Level exposure and pickup rules',
  'Store operations status',
  'Campaign status',
  'Material inventory',
  'Store activity application',
  'S Store terminal report',
  'Sell-through',
  'Product inventory',
  'Reward Pickup',
  'Scan or enter fan member QR',
  'Store profile',
  'Store setup visibility',
  'Apply for store activity',
];

const remainingArabicWorkbenchCopy = [
  'Setup readiness',
  'Active campaigns',
  'Pending claims',
  'Approved photos',
  'Photos in review',
  'Period type',
  'Open-system sold quantity',
  'Disposable sold quantity',
  'Verify actions',
  'Fan participation',
  'Manual fallback',
  'Reward redemption',
  'Scan fan identity QR to verify participation.',
  'Enter Fan ID or email when QR is unavailable.',
  'Check redemption code before handing over reward.',
  'Official campaigns',
  'View details, apply, wait for materials, run activity.',
  'Store-created events',
  'Edit content, time, and result. Send to UWELL review.',
  'S-level responsibilities and incentives',
  'Views',
  'Verified visits',
  'Product placement',
  'Material placement',
  'Activity showcase',
  'Hot UWELL products',
];

const remainingStoreInteractionCopy = [
  'Submit store event for review?',
  'View UWELL campaigns',
  'Activity submission failed',
  'Activity title',
  'Please enter activity title',
  'Activity content',
  'Please enter activity content',
  'Gift or benefit',
  'Please enter gift or benefit',
  'Start date',
  'Start date required',
  'End date',
  'End date required',
  'Optional fan points',
  'Trial rule: 0 for gift-only events, or {min}-{max} points when requesting UWELL point support.',
  'Point support must be 0 or {min}-{max}',
  'S Store sell-through submitted.',
  'S Store sell-through submission failed.',
  'S Store product inventory submitted.',
  'S Store product inventory submission failed.',
  'S Store material inventory submitted.',
  'S Store material inventory submission failed.',
  '{category} accepts up to 3 pending or approved images',
  'Participation verified. System awarded +{points} points.',
  'Participation recorded. System sent it to review, no points awarded yet.',
  'Requested {material}. Pending approval.',
  'Request failed.',
  'Photo tasks',
  'Submit for approval',
];

test('store portal has Arabic translations for high-impact shell copy', () => {
  requiredKeys.forEach((key) => {
    assert.equal(typeof TRANSLATIONS.en[key], 'string', `${key} needs English copy`);
    assert.equal(typeof TRANSLATIONS.ar[key], 'string', `${key} needs Arabic copy`);
    assert.match(TRANSLATIONS.ar[key], /[\u0600-\u06FF]/, `${key} needs Arabic text`);
    assert.notEqual(TRANSLATIONS.ar[key], TRANSLATIONS.en[key], `${key} Arabic should not mirror English`);
  });
});

test('store entry and owner use translation keys for high-impact Arabic shell copy', () => {
  requiredKeys.forEach((key) => {
    const source = key.startsWith('store_entry_') ? entrySource : ownerSource;
    assert.match(source, new RegExp(`t\\(["']${key}["']\\)`), `${key} should be rendered through t()`);
  });
});

test('store owner Arabic sweep covers remaining operational workbench copy', () => {
  remainingArabicWorkbenchCopy.forEach((copy) => {
    assert.match(ownerSource, new RegExp(`"${copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}":\\s*"[^"]*[\\u0600-\\u06FF]`), `${copy} needs Arabic dictionary coverage`);
    assert.match(ownerSource, new RegExp(`st\\("${copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\)`), `${copy} should render through st()`);
  });
});

test('store owner Arabic sweep covers deeper interaction modal and toast copy', () => {
  remainingStoreInteractionCopy.forEach((copy) => {
    assert.match(ownerSource, new RegExp(`"${copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}":\\s*"[^"]*[\\u0600-\\u06FF]`), `${copy} needs Arabic dictionary coverage`);
    assert.match(ownerSource, new RegExp(`st\\("${copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\)`), `${copy} should render through st()`);
  });
});

test('store dashboard progress uses the current Ant Design rail color API', () => {
  assert.match(ownerSource, /railColor="rgba\(82,62,24,0\.12\)"/);
  assert.doesNotMatch(ownerSource, /trailColor=/);
});

test('store settings panel stays inside the mobile viewport in Arabic RTL', () => {
  assert.match(css, /html\[dir="rtl"\] \.store-liquid-shell \.store-settings-panel/);
  assert.match(css, /html\[dir="rtl"\] \.store-liquid-shell \.store-settings-panel\s*\{[^}]*right:\s*auto/s);
  assert.match(css, /html\[dir="rtl"\] \.store-liquid-shell \.store-settings-panel\s*\{[^}]*left:\s*-2px/s);
  assert.match(css, /html\[dir="rtl"\] \.store-liquid-shell \.store-settings-panel\s*\{[^}]*max-width:\s*calc\(100vw - 32px\)/s);
});

test('store English translation entries do not contain Chinese fallback copy', () => {
  Object.entries(TRANSLATIONS.en)
    .filter(([key]) => key.startsWith('store_'))
    .forEach(([key, value]) => {
      assert.doesNotMatch(String(value), /[\u4e00-\u9fff]/, `${key} English copy should not contain Chinese characters`);
    });
});

test('store portal no longer hardcodes high-impact English shell copy in JSX', () => {
  const combined = `${entrySource}\n${ownerSource}`;
  hardcodedShellCopy.forEach((copy) => {
    assert.doesNotMatch(combined, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${copy} should not remain as shell copy`);
  });
});

test('store Arabic mode localizes official campaign titles while compact cards avoid long descriptions', () => {
  assert.match(ownerSource, /STORE_OWNER_AR_CAMPAIGN_COPY/);
  assert.match(ownerSource, /getCampaignDisplayCopy/);
  assert.match(ownerSource, /getCampaignDisplayCopy\(campaign\)\.name/);
  assert.doesNotMatch(ownerSource, /getCampaignDisplayCopy\(camp\)\.description/);
  assert.doesNotMatch(ownerSource, /<strong>\{campaign\.name\}<\/strong>[\s\S]*campaign\.description\?\.substring/);
  assert.doesNotMatch(ownerSource, /<Text strong className="so-text-light so-fs13">\{camp\.name\}<\/Text>[\s\S]*camp\.description\?\.substring/);
});
