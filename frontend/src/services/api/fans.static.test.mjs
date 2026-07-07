import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./fans.js', import.meta.url), 'utf8');

test('remote fan points update keeps fan total points in sync with the point log', () => {
  assert.match(source, /isUuid/);
  assert.match(source, /addFanPointsLocal/);
  assert.match(source, /if \(isLocal\(\) \|\| !isUuid\(fanId\)\)/);
  assert.match(source, /fan_points_log'\)\.insert/);
  assert.match(source, /from\('fans'\)[\s\S]*\.select\('points,\s*total_contribution,\s*level'\)/);
  assert.match(source, /from\('fan_level_rules'\)/);
  assert.match(source, /from\('fans'\)[\s\S]*\.update/);
  assert.match(source, /points:\s*newPoints/);
  assert.match(source, /total_contribution:\s*newContribution/);
});
