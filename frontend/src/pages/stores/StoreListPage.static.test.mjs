import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./StoreListPage.jsx', import.meta.url), 'utf8');

test('field rep store list uses English labels for rep-visible actions', () => {
  [
    'Latest Rating',
    'Rate Now',
    'View Details',
    'Responsible Rep',
    'Assign Rep',
    'Rate',
    'My Responsible Stores',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.doesNotMatch(source, /我的负责门店|最新评级|去评分|查看详情|负责地推|指定地推|>评分</);
  assert.doesNotMatch(source, /闂|璐|鍘|鏌|绾|鎸|鑱|鐢|杩/);
});
