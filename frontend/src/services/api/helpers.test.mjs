import { test } from 'vitest';
import assert from 'node:assert/strict';

import { shouldAllowLocalDbFallback } from './helpers.js';

test('remote preview data fallback is disabled when explicitly set false', () => {
  const allowFallback = shouldAllowLocalDbFallback({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_ALLOW_LOCAL_DB_FALLBACK: 'false',
    DEV: false,
  });

  assert.equal(allowFallback, false);
});

test('local development can still use local db fallback', () => {
  const allowFallback = shouldAllowLocalDbFallback({
    VITE_SUPABASE_URL: '',
    DEV: true,
  });

  assert.equal(allowFallback, true);
});

test('demo preview can opt into local db fallback explicitly', () => {
  const allowFallback = shouldAllowLocalDbFallback({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_ALLOW_LOCAL_DB_FALLBACK: 'true',
    DEV: false,
  });

  assert.equal(allowFallback, true);
});
