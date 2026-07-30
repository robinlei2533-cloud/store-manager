import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./EvalDetailPage.jsx', import.meta.url), 'utf8');

test('evaluation detail copy/export text is readable English', () => {
  assert.match(source, /UWELL Store Rating Result/);
  assert.match(source, /Edit rating/);
  assert.match(source, /Copy rating result/);
  assert.match(source, /Rating result copied/);
  assert.doesNotMatch(source, /[\u4e00-\u9fff]|闂|璇|鎬|鍒|澶|囨|缁|绾|褰|戣|垎/);
});
