import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');

test('router uses a custom route error fallback for stale dynamic chunks', () => {
  assert.match(source, /useRouteError/);
  assert.match(source, /RouteErrorFallback/);
  assert.match(source, /Failed to fetch dynamically imported module/);
  assert.match(source, /dynamically imported module/);
  assert.match(source, /errorElement: routeErrorElement/);
  assert.match(source, /uwell_chunk_reload_attempted/);
});
