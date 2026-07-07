import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./authStore.js', import.meta.url), 'utf8');

test('local demo authentication switches business APIs to local mode', () => {
  assert.match(source, /import \{ ensureLocalInit, setLocalMode \} from '\.\.\/services\/api\/helpers'/);
  assert.match(source, /const isLocalPreviewHost = \(\) =>/);
  assert.match(source, /\['localhost', '127\.0\.0\.1', '::1'\]\.includes\(window\.location\.hostname\)/);
  assert.match(source, /isLocalPreviewHost\(\)/);
  assert.match(source, /signInLocal: async[\s\S]*setLocalMode\(true\)/);
  assert.match(source, /localDb\.all\('auth'\)/);
  assert.match(source, /String\(account\.password \|\| ''\) === String\(password \|\| ''\)/);
  assert.match(source, /Invalid trial account or password/);
  assert.match(source, /signInSupabase: async[\s\S]*setLocalMode\(false\)/);
});

test('restored local demo sessions keep detail pages on local data', () => {
  assert.match(source, /savedProfileId[\s\S]*setLocalMode\(true\)[\s\S]*set\(\{ user: \{ id: profile\.id \}, profile, isAuthenticated: true \}\)/);
  assert.match(source, /Fan login from static HTML fan-entry page[\s\S]*setLocalMode\(true\)/);
});
