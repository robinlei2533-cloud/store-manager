import { test } from 'vitest';
import assert from 'node:assert/strict';

import { shouldAllowLocalDbFallback } from './helpers.js';
import { readFileSync } from 'node:fs';

const dashboardApiSource = readFileSync(new URL('./dashboard.js', import.meta.url), 'utf8');
const barrelApiSource = readFileSync(new URL('../api.js', import.meta.url), 'utf8');
const authStoreSource = readFileSync(new URL('../../stores/authStore.js', import.meta.url), 'utf8');
const fanCenterSource = readFileSync(new URL('../../pages/fans/FanCenterPage.jsx', import.meta.url), 'utf8');

test('remote preview data fallback is disabled when explicitly set false', () => {
  const allowFallback = shouldAllowLocalDbFallback({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_ALLOW_LOCAL_DB_FALLBACK: 'false',
    DEV: false,
  });

  assert.equal(allowFallback, false);
});

test('local development can still use local db fallback', () => {
  const allowFallback = shouldAllowLocalDbFallback({
    VITE_SUPABASE_URL: '',
    DEV: true,
  });

  assert.equal(allowFallback, true);
});

test('demo preview can opt into local db fallback explicitly', () => {
  const allowFallback = shouldAllowLocalDbFallback({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_ALLOW_LOCAL_DB_FALLBACK: 'true',
    DEV: false,
  });

  assert.equal(allowFallback, true);
});

test('dashboard local mode export stays runtime based instead of a module-load snapshot', () => {
  assert.doesNotMatch(dashboardApiSource, /export const IS_LOCAL_MODE = isLocal\(\)/);
  assert.match(dashboardApiSource, /export function isLocalMode\(\)/);
  assert.match(dashboardApiSource, /return isLocal\(\)/);
  assert.match(barrelApiSource, /isLocalMode/);
});

test('runtime local mode consumers do not import the old static local mode snapshot', () => {
  assert.doesNotMatch(authStoreSource, /IS_LOCAL_MODE/);
  assert.doesNotMatch(fanCenterSource, /IS_LOCAL_MODE/);
  assert.match(authStoreSource, /isLocalMode\(\)/);
  assert.match(fanCenterSource, /isLocalMode\(\)/);
});

test('fan local session recovery avoids unordered first-fan fallback', () => {
  assert.match(authStoreSource, /getFanProfileFromLocalFan/);
  assert.doesNotMatch(authStoreSource, /const fanProfile = \{ id: fans\[0\]\.id/);
  assert.doesNotMatch(authStoreSource, /localStorage\.setItem\('store_manager_current_user', fans\[0\]\.id\)/);
  assert.doesNotMatch(fanCenterSource, /currentFan = allFans\[0\]/);
  assert.match(fanCenterSource, /fan\.preview@uwell\.com/);
});
