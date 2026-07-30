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

test('admin settings index redirects to users instead of loading an empty settings shell', () => {
  assert.match(
    source,
    /\{\s*path:\s*"settings",\s*element:\s*<Navigate\s+to="\/app\/settings\/users"\s+replace\s*\/>\s*\}/,
  );
  assert.doesNotMatch(
    source,
    /\{\s*path:\s*"settings",\s*element:\s*<ProtectedRoute[^>]*><SettingsPage\s*\/><\/ProtectedRoute>\s*\}/,
  );
});

test('trial routes do not expose the old fan preview implementation', () => {
  assert.doesNotMatch(source, /const FanPreviewPage = React\.lazy/);
  assert.doesNotMatch(source, /path:\s*"\/preview\/fan"/);
});
