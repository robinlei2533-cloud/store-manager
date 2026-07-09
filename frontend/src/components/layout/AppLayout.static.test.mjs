import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./AppLayout.jsx', import.meta.url), 'utf8');

test('staff workspace keeps Chinese as the default language for every role', () => {
  assert.match(source, /setLang\('zh'\)/);
  assert.doesNotMatch(source, /profile\?\.role === ROLES\.REP \? 'en'/);
});

test('field rep sidebar uses translated labels instead of hard-coded English', () => {
  assert.match(source, /t\('rep_responsible_stores'\)/);
  assert.match(source, /t\('rep_campaign_execution'\)/);
  assert.match(source, /t\('rep_workspace'\)/);
  assert.match(source, /t\('fan_complaints'\)/);
  assert.match(source, /t\('complaint_replies'\)/);
});
