import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./FanEntryPage.jsx', import.meta.url), 'utf8');

test('fan entry visible copy has no mojibake characters', () => {
  assert.doesNotMatch(source, /鈫|脳|宸|浣|璧|枡|悗|鍙/);
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
  assert.match(source, /I agree to the privacy notice and member terms\./);
});
