import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./StoreEntryPage.jsx', import.meta.url), 'utf8');

test('store entry supports real Supabase Auth for owner preview accounts', () => {
  assert.match(source, /useAuthStore/);
  assert.match(source, /signIn\(/);
  assert.match(source, /signIn\(email, loginPassword\)/);
  assert.match(source, /owner_profile_id/);
});

test('store entry presents email password auth and does not require contact person', () => {
  assert.match(source, /placeholder="Email"/);
  assert.match(source, /placeholder="Password"/);
  assert.match(source, /placeholder="Owner email \*"/);
  assert.match(source, /placeholder="Password \*"/);
  assert.doesNotMatch(source, /Please fill in store name, contact and phone/);
  assert.doesNotMatch(source, /!storeName \|\| !contact \|\| !phone/);
});

test('store login accepts registered local owner email password before auth fallback', () => {
  assert.match(source, /localOwnerStore/);
  assert.match(source, /store\.owner_password_preview === loginPassword/);
  assert.match(source, /localStorage\.setItem\("store_owner_store_id", localOwnerStore\.id\)/);
});

test('store local owner shortcut is limited to local preview contexts', () => {
  assert.match(source, /isLocalStoreOwnerShortcutAllowed/);
  assert.match(source, /localhost/);
  assert.match(source, /127\.0\.0\.1/);
  assert.match(source, /isLocalStoreOwnerShortcutAllowed\(\)[\s\S]*localOwnerStore/);
});

test('store login rejects non-email login and keeps preview passwords local only', () => {
  assert.match(source, /Please enter a valid email address/);
  assert.match(source, /owner_password_preview: _localPasswordOnly/);
  assert.match(source, /createStore\(remoteRecord\)/);
  assert.doesNotMatch(source, /store\.phone && store\.phone === phone\.trim\(\)/);
  assert.doesNotMatch(source, /store\.id === ownerEmail\.trim\(\)/);
});
