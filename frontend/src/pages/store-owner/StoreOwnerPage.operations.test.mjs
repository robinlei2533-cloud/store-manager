import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./StoreOwnerPage.jsx', import.meta.url), 'utf8');

test('store app keeps missing photo reminders visible without blocking Home', () => {
  assert.match(source, /missingRequiredStorePhotos\.length > 0 &&/);
  assert.match(source, /store-home-photo-nudge/);
  assert.match(source, /Photo tasks/);
  assert.match(source, /Upload photos/);
  assert.match(source, /setActiveTab\("me"\)/);
  assert.match(source, /storeBottomNavAlerts\.me/);
  assert.doesNotMatch(source, /STORE_PHOTO_REMINDER_LIMIT\s*=\s*3/);
  assert.doesNotMatch(source, /store_photo_reminder_count/);
  assert.doesNotMatch(source, /photoReminderModalOpen/);
  assert.doesNotMatch(source, /First login: strong reminder/);
  assert.doesNotMatch(source, /Third login: final reminder/);
});

test('store-created event submission requires cost responsibility confirmation', () => {
  assert.match(source, /Submit store event for review\?/);
  assert.match(source, /Materials, gifts, or costs may need to be handled by the store/);
  assert.match(source, /View UWELL campaigns/);
  assert.match(source, /store_cost_responsibility_acknowledged/);
  assert.match(source, /review_status:\s*"pending"/);
  assert.match(source, /store_campaign_submitted/);
  assert.match(source, /audit_logs/);
});

test('store activities separate official campaigns from store-created review work without duplicated guidance', () => {
  [
    'store-activity-guidance-strip',
    'store-activity-function-card',
    'Official campaigns',
    'View details, apply, wait for materials, run activity.',
    'Store-created events',
    'Edit content, time, and result. Send to UWELL review.',
    'c.source !== "store_application"',
    'campaign.source === "store_application" && campaign.submitted_by_store_id === store.id',
    'UWELL review decides whether this appears in Fan Activities > Store Events.',
    'handleClaim',
    'handleOpenReview',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should preserve activities separation`));
  [
    'store-activity-execution-board',
    'Official UWELL campaign',
    'Store-created event review',
    'Execution result status',
    'Join official campaigns, then submit results after execution.',
    'Store-created events stay internal until UWELL approval.',
    'Store-created events require approval',
    'Appears in Fan Activities > Store Events after approval',
    'Join ready-made UWELL campaigns when the store wants fast execution.',
    'UWELL reviews rules, fan reward, proof method, and cost risk before publishing.',
    'Pending or rejected events stay internal and never appear to fans.',
  ].forEach((label) => assert.ok(!source.includes(label), `${label} should not duplicate guidance`));
});

test('store verification records participation without letting stores issue points', () => {
  assert.match(source, /handleVerifyFanParticipation/);
  assert.match(source, /activityScannerOpen/);
  assert.match(source, /setActivityScannerOpen\(true\)/);
  assert.match(source, /t\("store_owner_scan_or_enter_fan_qr"\)/);
  assert.match(source, /store_activity_verifications/);
  assert.match(source, /Store users do not give points/);
  assert.match(source, /Store users verify only; system rules award points/);
  assert.match(source, /Scan fan identity QR to verify participation/);
  assert.match(source, /Enter Fan ID or email when QR is unavailable/);
  assert.match(source, /resolveStoreActivityVerification/);
  assert.match(source, /fan_points_log/);
  assert.match(source, /status:\s*decision\.status/);
  assert.match(source, /verification_state:\s*decision\.verificationState/);
  assert.match(source, /system_awarded/);
  assert.match(source, /duplicate_key/);
  assert.match(source, /points_award_status:\s*decision\.pointsAwardStatus/);
  assert.match(source, /store_activity_duplicate_verification/);
  assert.doesNotMatch(source, /addFanPoints\(.*store/i);
});

test('store material requests include regional warehouse fields and audit trail', () => {
  assert.match(source, /REGIONAL_WAREHOUSES/);
  assert.match(source, /normalizeRegion/);
  assert.match(source, /getStoreWarehouse/);
  assert.match(source, /requester_role:\s*'store_owner'/);
  assert.match(source, /region,/);
  assert.match(source, /warehouse,/);
  assert.match(source, /campaign_relation/);
  assert.match(source, /material_request_submitted/);
  assert.match(source, /getStoreWarehouse\(store\)/);
  assert.match(source, /Request materials/);
  assert.doesNotMatch(source, /Register stock/);
});
