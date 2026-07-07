import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./FanCenterPage.jsx', import.meta.url), 'utf8');

test('fan center visible copy has no mojibake in core fan paths', () => {
  assert.doesNotMatch(source, /鍙|闂|浠|绉|鑰|鏌|涓|鈥|檚|棣|鎴|娲|姣|鐮|楠|瘉|寰|彁|緝|灏|呰|鍟|煄|惧|埌|簵/);
});

test('fan center uses English consumer-facing task and campaign copy', () => {
  assert.match(source, /ensureEnglishFirst\(\)/);
  assert.match(source, /Your next best action/);
  assert.match(source, /Start here/);
  assert.match(source, /Step 1/);
  assert.match(source, /Find a verified store/);
  assert.match(source, /Step 2/);
  assert.match(source, /Scan your product code/);
  assert.match(source, /Step 3/);
  assert.match(source, /Claim rewards/);
  assert.match(source, /key: 'mall', label: 'Rewards'/);
  assert.match(source, /Recommended because it matches your city or has a stronger UWELL display/);
  assert.match(source, /Today’s tasks|Today's tasks/);
  assert.match(source, /UWELL Store Display Challenge/);
  assert.match(source, /See steps and rewards/);
  assert.match(source, /Trusted stores/);
  assert.match(source, /My verification/);
  assert.match(source, /Visit completed/);
  assert.match(source, /Shelf photo uploaded/);
  assert.match(source, /Sales data submitted/);
});

test('fan task daily check-in card performs check-in instead of only navigating', () => {
  assert.match(source, /addFanPoints/);
  assert.match(source, /hasCheckedInToday/);
  assert.match(source, /handleTaskAction/);
  assert.match(source, /handleTaskCheckIn/);
  assert.match(source, /key: 'checkin'[\s\S]*done: hasCheckedInToday/);
  assert.match(source, /await addFanPoints\(currentFan\.id, 5, 'earn', 'Daily Check-in', 'Daily check-in bonus'\);[\s\S]*localDb\.insert\('fan_checkins'/);
  assert.doesNotMatch(source, /key: 'checkin'[\s\S]{0,160}done: true/);
});

test('fan center prioritizes the saved fan session when selecting the current fan', () => {
  assert.match(source, /const savedFanId = localStorage\.getItem\('store_manager_current_user'\)/);
  assert.match(source, /fans\.find\(\(f\) => f\.id === savedFanId\)/);
  assert.match(source, /localDb\.findById\('fans', savedFanId\)/);
});

test('fan center does not treat local fallback fans as fresh data in Supabase sessions', () => {
  assert.doesNotMatch(source, /initialData:\s*localFallbackFans/);
  assert.match(source, /placeholderData:\s*localFallbackFans/);
});
