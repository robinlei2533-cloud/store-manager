import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./EvalCreatePage.jsx', import.meta.url), 'utf8');

test('evaluation create form uses the confirmed 100-point SABC model', () => {
  assert.match(source, /STORE_RATING_DIMENSIONS/);
  assert.match(source, /Monthly sales[\s\S]*20/);
  assert.match(source, /Location \/ traffic[\s\S]*15/);
  assert.match(source, /Store front \/ signboard image[\s\S]*10/);
  assert.match(source, /UWELL display quality[\s\S]*15/);
  assert.match(source, /Product coverage[\s\S]*15/);
  assert.match(source, /Staff cooperation[\s\S]*10/);
  assert.match(source, /Campaign readiness[\s\S]*10/);
  assert.match(source, /Photo \/ data completeness[\s\S]*5/);
  assert.match(source, /90-100[\s\S]*S/);
  assert.match(source, /75-89[\s\S]*A/);
  assert.match(source, /60-74[\s\S]*B/);
  assert.doesNotMatch(source, /\/110|A\/B\/C\/D|return 'D'/);
});

test('evaluation create form captures the temporary monthly sales ranges', () => {
  assert.match(source, /0 units/);
  assert.match(source, /1-2 units/);
  assert.match(source, /2-3 units/);
  assert.match(source, /3-4 units/);
  assert.match(source, /4-6\+ units/);
  assert.match(source, /Manager\/Admin final review required/);
});

test('evaluation create page uses Chinese-first backend shell copy', () => {
  [
    'Back to Evaluations',
    'Field Store Rating',
    'UWELL S/A/B/C Store Rating Form',
    'Store and Visit Basics',
    'Visit date',
    'Total score',
    'Suggested level',
  ].forEach((label) => assert.doesNotMatch(source, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  [
    '返回评级列表',
    '地推门店评级',
    'UWELL S/A/B/C 门店评级表',
    '门店与拜访基础信息',
    '拜访日期',
    '总分',
    '建议等级',
  ].forEach((label) => assert.ok(source.includes(label), `${label} should be present`));
});

test('evaluation create form has no garbled Chinese visible copy', () => {
  assert.doesNotMatch(source, /鎬|璇|绾|鍒|涓|搴|闂|鈫|圫|褰|瑙|淇|濯|骞|惧/);
});
