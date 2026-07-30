import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CheckInTab.jsx', import.meta.url), 'utf8');

test('check-in tab records the daily check-in only after points are awarded', () => {
  assert.match(source, /OPERATIONAL_RULE_RECORD_ID/);
  assert.match(source, /mergeOperationalRules/);
  assert.match(source, /operationalRules\.checkInPoints/);
  assert.match(source, /await addFanPoints\(fan\.id, operationalRules\.checkInPoints, 'earn', 'Daily Check-in', 'Daily check-in bonus'\);[\s\S]*localDb\.insert\('fan_checkins'/);
  assert.doesNotMatch(source, /localDb\.insert\('fan_checkins'[\s\S]{0,180}await addFanPoints/);
});

test('check-in tab uses the recovered fan visual shell instead of old dense cards', () => {
  assert.match(source, /fan-checkin-page/);
  assert.match(source, /fan-checkin-hero/);
  assert.match(source, /fan-checkin-priority-action/);
  assert.match(source, /fan-checkin-week-strip/);
  assert.match(source, /fan-checkin-action-card/);
  assert.match(source, /fan-checkin-progress-card/);
  assert.match(source, /fan-checkin-action-card[\s\S]*fan-checkin-week-card/);
  assert.doesNotMatch(source, /className=['"]liquid-glass['"]/);
  assert.doesNotMatch(source, /linear-gradient\(135deg, #667eea20 0%, #764ba220 100%\)/);
});
