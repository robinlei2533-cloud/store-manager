import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CheckInTab.jsx', import.meta.url), 'utf8');

test('check-in tab records the daily check-in only after points are awarded', () => {
  assert.match(source, /await addFanPoints\(fan\.id, 5, 'earn', 'Daily Check-in', 'Daily check-in bonus'\);[\s\S]*localDb\.insert\('fan_checkins'/);
  assert.doesNotMatch(source, /localDb\.insert\('fan_checkins'[\s\S]{0,180}await addFanPoints/);
});
