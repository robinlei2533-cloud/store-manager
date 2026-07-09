import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./DashboardPage.jsx', import.meta.url), 'utf8');

test('field rep dashboard headings and cards use translation keys', () => {
  assert.match(source, /t\('rep_workspace'\)/);
  assert.match(source, /t\('rep_priorities_today'\)/);
  assert.match(source, /t\('rep_store_status'\)/);
  assert.match(source, /t\('rep_pending_actions'\)/);
  assert.match(source, /t\('rep_my_visit_records'\)/);
  assert.doesNotMatch(source, />Field Rep Workspace</);
  assert.doesNotMatch(source, />My Priorities Today</);
  assert.doesNotMatch(source, /No pending actions/);
});
