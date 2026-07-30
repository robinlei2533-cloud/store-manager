import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./VisitDetailPage.jsx', import.meta.url), 'utf8');

test('visit detail page passes operator scope and handles restricted visit access', () => {
  assert.match(source, /useAuthStore/);
  assert.match(source, /const profile = useAuthStore/);
  assert.match(source, /getVisitById\(id, \{ scopeProfile: profile \}\)/);
  assert.match(source, /访问受限/);
  assert.match(source, /不在你的可访问范围内/);
});
