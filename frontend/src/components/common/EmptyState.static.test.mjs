import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./EmptyState.jsx', import.meta.url), 'utf8');

test('shared empty state defaults to English copy without mojibake', () => {
  assert.match(source, /title = 'No data yet'/);
  assert.doesNotMatch(source, /[\u4e00-\u9fff]|鏆|閫|氱|鎬|绌|姸|嵁|闂|璇/);
});
