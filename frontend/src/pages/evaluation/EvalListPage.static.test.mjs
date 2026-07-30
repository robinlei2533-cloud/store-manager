import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./EvalListPage.jsx', import.meta.url), 'utf8');

test('evaluation list uses concise Chinese admin copy', () => {
  [
    'SABC 100分',
    '新建评级',
    '平均分',
    'A级门店',
    'B/C待提升',
    'S级候选',
    '最新评级',
    '100分评级模型',
    '评级审核',
    '评级记录',
    '搜索门店',
    '暂无评级记录',
    '门店',
    '拜访日期',
    '总分',
    '等级',
    '/100',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));

  [
    'Store Rating MVP',
    'Field visit scoring uses',
    'Average Score',
    'A-level Stores',
    'S-level Candidates',
    'Latest Rating',
    'Rating Review',
    'Rating Records',
    'Search stores',
    'No rating records',
  ].forEach((label) => assert.ok(!source.includes(label), `${label} should not be displayed`));
});

test('evaluation review table keeps all actions mobile-accessible', () => {
  assert.match(source, /className="eval-review-table"/);
  assert.match(source, /scroll=\{\{ x: 760 \}\}/);
  assert.match(source, /className="eval-review-action-grid"/);
  assert.match(source, /通过建议等级/);
  assert.match(source, /要求补充材料/);
  assert.match(source, /调整等级/);
});
