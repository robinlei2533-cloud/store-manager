import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./EvalListPage.jsx', import.meta.url), 'utf8');

test('evaluation list is English-first for field reps', () => {
  [
    'Store',
    'Visit Date',
    'Total Score',
    'Rating',
    'New Rating',
    'Average Score',
    'A-level Stores',
    'D-level Alert',
    'Latest Rating',
    'Rating Records',
    'Search stores',
    'No rating records',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  assert.doesNotMatch(source, /门店|拜访|综合|评分|评级|新建|搜索|暂无|乱码|绾|闂|璇|鎼|鏆|鏈/);
});
