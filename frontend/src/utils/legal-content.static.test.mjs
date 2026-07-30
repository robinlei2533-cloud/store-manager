import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./legal-content.js', import.meta.url), 'utf8');
const privacyHtml = readFileSync(new URL('../../public/privacy.html', import.meta.url), 'utf8');
const termsHtml = readFileSync(new URL('../../public/terms.html', import.meta.url), 'utf8');

test('legal content covers launch privacy, terms, reward pickup, and S-level store policy', () => {
  assert.match(source, /Reward Redemption Rules/);
  assert.match(source, /S-Level Store Responsibility and Reward Policy/);
  assert.match(source, /7 days/);
  assert.doesNotMatch(source, /default validity period is 30 days/);
  assert.match(source, /one-time use|used once/);
  assert.match(source, /stock/);
  assert.match(source, /Operations note/);
  assert.match(source, /S-level stores/);
});

test('public privacy notice explains data categories, purposes, retention, and user rights', () => {
  assert.match(privacyHtml, /UWELL Privacy Notice/);
  assert.match(privacyHtml, /Account data/);
  assert.match(privacyHtml, /Reward data/);
  assert.match(privacyHtml, /Store operation data/);
  assert.match(privacyHtml, /Why We Use Personal Data/);
  assert.match(privacyHtml, /Retention and Deletion/);
  assert.match(privacyHtml, /Your Rights/);
});

test('public member terms include redemption rules and S-level store responsibility', () => {
  assert.match(termsHtml, /Member Terms and Reward Rules/);
  assert.match(termsHtml, /Reward Redemption Rules/);
  assert.match(termsHtml, /Only approved S-level UWELL stores/);
  assert.match(termsHtml, /S-Level Store Responsibility/);
  assert.match(termsHtml, /S-Level Store Rewards and Consequences/);
  assert.match(termsHtml, /7 days/);
  assert.doesNotMatch(termsHtml, /default validity period is 30 days/);
});
