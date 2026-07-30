import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const errorBoundarySource = readFileSync(new URL('./ErrorBoundary.jsx', import.meta.url), 'utf8');
const errorStateSource = readFileSync(new URL('./ErrorState.jsx', import.meta.url), 'utf8');

const chineseOrMojibakePattern = /[\u4e00-\u9fff]|閫|欒|鍔|辫|閲|杩|绋|濂|鎵|€|锛|銆/;

test('error recovery UI is English-first and clear for trial launch', () => {
  assert.match(errorBoundarySource, /This portal needs a quick reload/);
  assert.match(errorBoundarySource, /Reload current portal/);
  assert.match(errorBoundarySource, /Reset demo data/);
  assert.match(errorBoundarySource, /This will clear local demo data and reload the page/);
  assert.doesNotMatch(errorBoundarySource, chineseOrMojibakePattern);

  assert.match(errorStateSource, /Unable to load this section/);
  assert.match(errorStateSource, /Retry/);
  assert.match(errorStateSource, /Back/);
  assert.doesNotMatch(errorStateSource, chineseOrMojibakePattern);
});
