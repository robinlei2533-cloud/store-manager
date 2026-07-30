import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./visits.js', import.meta.url), 'utf8');

test('remote visit reads avoid direct stores embeds after fan-safe store exposure hardening', () => {
  assert.doesNotMatch(source, /stores\(\*\)/);
  assert.match(source, /enrichRemoteVisitsWithStores/);
  assert.match(source, /getInternalStores/);
});

test('remote visit writes send only columns supported by the Supabase visits table', () => {
  assert.match(source, /toRemoteVisitPayload/);
  assert.match(source, /REMOTE_VISIT_COLUMNS/);
  [
    'display_data',
    'field_rating',
    'field_rating_summary',
    'suggested_level',
    'suggested_store_level',
    'repeat_visit_summary',
    'new_store_profile',
    'suggested_level_status',
  ].forEach((field) => {
    assert.match(source, new RegExp(`'${field}'`));
  });
  assert.match(source, /supabase\.from\('visits'\)\.insert\(toRemoteVisitPayload\(visit\)\)/);
  assert.match(source, /supabase\.from\('visits'\)\.update\(toRemoteVisitPayload\(visit\)\)/);
});
