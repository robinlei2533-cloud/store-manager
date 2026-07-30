import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const storesSource = readFileSync(new URL('./stores.js', import.meta.url), 'utf8');
const fansSource = readFileSync(new URL('./fans.js', import.meta.url), 'utf8');
const visitsSource = readFileSync(new URL('./visits.js', import.meta.url), 'utf8');

test('store detail API can reject local records outside the operator scope', () => {
  assert.match(storesSource, /canAccessStore/);
  assert.match(storesSource, /getStoreById\(id, options = \{\}\)/);
  assert.match(storesSource, /options\.scopeProfile/);
  assert.match(storesSource, /return null/);
});

test('fan detail API can reject local records outside the operator scope', () => {
  assert.match(fansSource, /canAccessFan/);
  assert.match(fansSource, /getFanById\(id, options = \{\}\)/);
  assert.match(fansSource, /options\.scopeProfile/);
  assert.match(fansSource, /localDb\.all\('stores'\)/);
});

test('visit detail API can reject local records outside the operator scope', () => {
  assert.match(visitsSource, /canAccessVisit/);
  assert.match(visitsSource, /getVisitById\(id, options = \{\}\)/);
  assert.match(visitsSource, /options\.scopeProfile/);
  assert.match(visitsSource, /localDb\.all\('stores'\)/);
});
