import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./FanListPage.jsx', import.meta.url), 'utf8');

test('fan operations list passes current operator profile into fan API scope', () => {
  assert.match(source, /useAuthStore/);
  assert.match(source, /const profile = useAuthStore/);
  assert.match(source, /getFans\(\{ level, scopeProfile: profile \}\)/);
});

test('fan operations list keeps mobile table actions reachable with a scroll affordance', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /className="admin-trial-wide-table admin-fan-list-wide-table"/);
  assert.match(source, /scroll=\{\{ x:\s*680 \}\}/);
  assert.match(css, /\.admin-liquid-shell \.admin-fan-list-wide-table/);
  assert.match(css, /横向滑动/);
});

test('fan operations points rules action is visibly clickable', () => {
  assert.match(source, /className="admin-fan-list-rules-button"/);
  assert.match(source, /type="primary"[^>]*className="admin-fan-list-rules-button"|className="admin-fan-list-rules-button"[^>]*type="primary"/);
});
