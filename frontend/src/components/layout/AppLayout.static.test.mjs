import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const layoutSource = readFileSync(new URL('./AppLayout.jsx', import.meta.url), 'utf8');
const loginSource = readFileSync(new URL('../../pages/login/LoginPage.jsx', import.meta.url), 'utf8');

test('internal admin surfaces default back to Chinese-first', () => {
  assert.match(layoutSource, /ensureChineseFirst\(\)/);
  assert.match(loginSource, /ensureChineseFirst\(\)/);
});
