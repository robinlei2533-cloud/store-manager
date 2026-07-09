import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./FanEntryPage.jsx', import.meta.url), 'utf8');

test('fan entry visible copy has no mojibake characters', () => {
  const mojibakePattern = /[\u95c1\u95bc\u940e\u9420\u95bb]/;
  assert.doesNotMatch(source, mojibakePattern);
});

test('fan registration form uses polished English consumer-facing labels', () => {
  assert.match(source, /ensureEnglishFirst\(\)/);
  assert.match(source, /Join in under one minute/);
  assert.match(source, /Earn your first 100 points/);
  assert.match(source, /Scan products, join campaigns, and redeem rewards/);
  assert.match(source, /You will enter your member center after sign-up/);
  assert.match(source, /placeholder="Name \*"/);
  assert.match(source, /placeholder="Email \*"/);
  assert.match(source, /placeholder="Password \*"/);
  assert.match(source, /placeholder="Phone \(optional\)"/);
  assert.match(source, />Country \*</);
  assert.match(source, />City \*</);
  assert.match(source, /I confirm I am of legal age in my region\./);
  assert.match(source, /I agree to the <a[\s\S]*privacy notice[\s\S]*member terms[\s\S]*<\/a>\./);
});

test('fan registration modal stays usable on short screens and has a return path', () => {
  assert.match(source, /className="fe-auth-modal"/);
  assert.match(source, /className="fe-register-back"/);
  assert.match(source, /Back to sign in/);
  assert.match(source, /setMode\('login'\)/);
  assert.match(source, /setAuthOpen\(false\)/);
});

test('fan entry keeps the orb-style product hero instead of flat product placement', () => {
  assert.match(source, /CaliburnHeroCanvas/);
  assert.match(source, /<CaliburnHeroCanvas products=\{PD\} \/>/);
  assert.doesNotMatch(source, /fe-luxury-products/);
  assert.doesNotMatch(source, /fe-luxury-product/);
});

test('fan registration respects Supabase Auth-created profiles before writing fan records', () => {
  assert.doesNotMatch(source, /from\("profiles"\)\.upsert/);
  assert.match(source, /from\("profiles"\)[\s\S]*\.select\("id"\)[\s\S]*\.maybeSingle\(\)/);
  assert.match(source, /from\("fans"\)\.insert\(records\.fan\)/);
});
