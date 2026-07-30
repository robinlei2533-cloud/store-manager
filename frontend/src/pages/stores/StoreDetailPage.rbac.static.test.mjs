import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./StoreDetailPage.jsx', import.meta.url), 'utf8');

test('store detail page passes operator scope and handles restricted store access', () => {
  assert.match(source, /useAuthStore/);
  assert.match(source, /const profile = useAuthStore/);
  assert.match(source, /getStoreById\(id, \{ scopeProfile: profile \}\)/);
  assert.match(source, /访问受限/);
  assert.match(source, /不在你的访问范围内/);
});
