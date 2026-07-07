import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./CampaignListPage.jsx', import.meta.url), 'utf8');

test('campaign cards expose an explicit detail action', () => {
  assert.match(source, /EyeOutlined/);
  assert.match(source, /event\.stopPropagation\(\)/);
  assert.match(source, /navigate\(`\/app\/campaigns\/\$\{c\.id\}`\)/);
  assert.match(source, />\s*查看\s*<\/Button>/);
});
