import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./EvalListPage.jsx', import.meta.url), 'utf8');

test('evaluation page uses confirmed 100-point SABC rating model', () => {
  assert.match(source, /STORE_RATING_DIMENSIONS/);
  assert.match(source, /月销售额[\s\S]*20/);
  assert.match(source, /位置 \/ 客流[\s\S]*15/);
  assert.match(source, /门头 \/ 招牌形象[\s\S]*10/);
  assert.match(source, /UWELL 陈列质量[\s\S]*15/);
  assert.match(source, /照片 \/ 数据完整度[\s\S]*5/);
  assert.match(source, /90-100[\s\S]*S/);
  assert.match(source, /75-89[\s\S]*A/);
  assert.match(source, /60-74[\s\S]*B/);
  assert.doesNotMatch(source, /D-level|\/110|A\/B\/C\/D/);
});

test('evaluation page exposes rating review actions for manager/admin correction', () => {
  assert.match(source, /评级审核/);
  assert.match(source, /BD建议等级/);
  assert.match(source, /后台最终等级/);
  assert.match(source, /通过建议等级/);
  assert.match(source, /调整等级/);
  assert.match(source, /要求补充材料/);
  assert.match(source, /Approve suggested level/);
  assert.match(source, /Change level/);
  assert.match(source, /Request more evidence/);
  assert.match(source, /audit_logs/);
  assert.match(source, /backend_final_level/);
  assert.match(source, /localDb\.update\('store_evaluations'/);
  assert.match(source, /localDb\.update\('stores'/);
  assert.match(source, /reviewer_id/);
});
