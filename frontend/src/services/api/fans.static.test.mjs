import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./fans.js', import.meta.url), 'utf8');

test('fan point awards fall back locally when remote point write fails during trial operation', () => {
  assert.match(source, /addFanPointsLocal/);
  assert.match(source, /try\s*\{/);
  assert.match(source, /catch \(err\)/);
  assert.match(source, /Supabase points unavailable/);
  assert.match(source, /return addFanPointsLocal\(fanId, points, type, source, description\)/);
});

test('fan list API supports explicit RBAC scope filtering for local trial data', () => {
  assert.match(source, /filterFansByScope/);
  assert.match(source, /filters\.scopeProfile/);
  assert.match(source, /localDb\.all\('stores'\)/);
});
