import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./StoreEntryPage.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

test('store entry supports real Supabase Auth for owner preview accounts', () => {
  assert.match(source, /useAuthStore/);
  assert.match(source, /signIn\(/);
  assert.match(source, /signIn\(email, loginPassword\)/);
  assert.match(source, /owner_profile_id/);
});

test('store entry presents email password auth and does not require contact person', () => {
  assert.match(source, /placeholder=\{t\("store_entry_email_placeholder"\)\}/);
  assert.match(source, /placeholder=\{t\("store_entry_password_placeholder"\)\}/);
  assert.match(source, /placeholder=\{t\("store_entry_owner_email_placeholder"\)\}/);
  assert.match(source, /placeholder=\{t\("store_entry_password_required_placeholder"\)\}/);
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
  assert.doesNotMatch(source, /vercel\.app/);
  assert.match(source, /isLocalStoreOwnerShortcutAllowed\(\)[\s\S]*localOwnerStore/);
});

test('store login rejects non-email login and keeps preview passwords local only', () => {
  assert.match(source, /isValidBusinessEmail\(email\)/);
  assert.match(source, /t\("store_entry_assigned_email_required"\)/);
  assert.match(source, /t\("store_entry_real_email_required"\)/);
  assert.match(source, /owner_password_preview: _localPasswordOnly/);
  assert.match(source, /createStore\(\{ \.\.\.remoteRecord, owner_profile_id: authUserId \}\)/);
  assert.doesNotMatch(source, /store\.phone && store\.phone === phone\.trim\(\)/);
  assert.doesNotMatch(source, /store\.id === ownerEmail\.trim\(\)/);
});

test('remote store registration creates an auth owner and binds owner_profile_id for later login', () => {
  assert.match(source, /supabase\.auth\.signUp/);
  assert.match(source, /owner_profile_id: authUserId/);
  assert.match(source, /role: "store_owner"/);
  assert.match(source, /data\.user\?\.id/);
});

test('remote store registration keeps a local trial login mirror for email confirmation delays', () => {
  assert.match(source, /localDb\.upsert\("stores"/);
  assert.match(source, /trial_source: "remote_trial_mirror"/);
  assert.match(source, /owner_password_preview/);
  assert.match(source, /created\.id/);
});

test('store registration explains photo expectations before first login', () => {
  assert.match(source, /store-entry-photo-expectation/);
  assert.match(source, /t\("store_entry_storefront_photo_map"\)/);
  assert.match(source, /t\("store_entry_display_photos_review"\)/);
  assert.match(source, /t\("store_entry_first_three_login_reminder"\)/);
  assert.match(source, /t\("store_entry_photos_after_review"\)/);
});

test('store entry login uses the yellow-green portal theme instead of black-gold', () => {
  assert.match(source, /store-entry-green-theme/);
  assert.match(css, /store-entry-green-theme[\s\S]*--login-acid: #ccff00/);
  assert.match(css, /store-entry-green-theme[\s\S]*--login-green: #7ee000/);
  assert.match(css, /store-entry-green-theme[\s\S]*background:[\s\S]*#f8ffe8/);
  assert.doesNotMatch(css, /store-entry-green-theme[\s\S]*#FFD700/);
});

test('task 141 store entry keeps workbench tone while upgrading inputs and primary action feedback', () => {
  assert.match(source, /Task-141 ReactBits-inspired store login polish/);
  assert.match(source, /className="store-entry-card liquid-glass uw-panel-rise uw-reactbits-fade-content"/);
  assert.match(source, /className="store-entry-kicker uw-reactbits-shiny-text"/);
  assert.match(source, /className="store-entry-field uw-reactbits-field"/);
  assert.match(source, /uw-reactbits-specular-button store-entry-main-action/);
  assert.match(css, /\.store-entry-page \.store-entry-language button\s*\{[^}]*min-height:\s*44px !important/s);
  assert.match(css, /\.store-entry-page \.store-entry-legal-copy\s*\{[^}]*font-size:\s*12px !important/s);
});
