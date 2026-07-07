import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./seedData.js', import.meta.url), 'utf8');

test('trial accounts use assigned prelaunch passwords instead of admin defaults', () => {
  assert.match(source, /export const trialPasswords = \{/);
  assert.doesNotMatch(source, /password: 'admin'/);
  assert.match(source, /admin: 'UwellAdmin@2026'/);
  assert.match(source, /manager: 'UwellManager@2026'/);
  assert.match(source, /rep: 'UwellRep@2026'/);
  assert.match(source, /store: 'UwellStore@2026'/);
  assert.match(source, /fan: 'UwellFan@2026'/);
});

test('trial store owner account is bound to an S-level redemption store', () => {
  assert.match(source, /store_id: 's-real-012'/);
  assert.match(source, /email: 'store\.owner@uwell\.com'/);
  assert.match(source, /owner_email:[\s\S]*trialStoreOwnerAccount\.email/);
  assert.match(source, /owner_password_preview:[\s\S]*trialStoreOwnerAccount\.password/);
});

test('trial fan account can be used for the fan preview path', () => {
  assert.match(source, /fan_id: 'f-001'/);
  assert.match(source, /email: 'fan\.preview@uwell\.com'/);
  assert.match(source, /role: 'fan'/);
});
