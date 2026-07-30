import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const migrationPath = resolve(
  process.cwd(),
  '..',
  'supabase',
  'migrations',
  '20260718000500_s_store_correction_flows.sql',
);

function readMigration() {
  assert.equal(existsSync(migrationPath), true, 'S Store correction migration should exist');
  return readFileSync(migrationPath, 'utf8').toLowerCase();
}

test('S Store correction migration defines locked-history correction RPCs', () => {
  const sql = readMigration();

  [
    'correct_s_store_sell_through',
    'correct_s_store_product_inventory',
    'correct_s_store_material_inventory',
  ].forEach((functionName) => {
    assert.match(sql, new RegExp(`create or replace function public\\.${functionName}`));
    assert.match(sql, new RegExp(`grant execute on function public\\.${functionName}`));
  });
});

test('S Store correction RPCs enforce manager/admin permission and required reason', () => {
  const sql = readMigration();

  assert.match(sql, /public\.can_manage_s_store\(v_record\.store_id\)/);
  assert.match(sql, /raise exception 's store locked history correction is not allowed.'/);
  assert.match(sql, /raise exception 's store correction requires a reason.'/);
  assert.match(sql, /p_correction_reason/);
});

test('S Store correction RPCs preserve locked history metadata and audit writes', () => {
  const sql = readMigration();

  [
    'corrected_by = auth.uid()',
    'corrected_at = now()',
    'correction_reason = p_correction_reason',
    'correction_note = p_correction_note',
    'locked = true',
  ].forEach((snippet) => {
    assert.match(sql, new RegExp(snippet.replace(/[()]/g, '\\$&')));
  });

  assert.match(sql, /perform public\.write_s_store_audit/);
  assert.match(sql, /s store sell-through corrected/);
  assert.match(sql, /s store product inventory corrected/);
  assert.match(sql, /s store material inventory corrected/);
});

test('S Store correction migration stays additive and avoids unconfirmed scope', () => {
  const sql = readMigration();

  assert.doesNotMatch(sql, /create table public\./);
  assert.doesNotMatch(sql, /drop table/);
  assert.doesNotMatch(sql, /sku/);
  assert.doesNotMatch(sql, /price_analysis/);
  assert.doesNotMatch(sql, /auto_replenishment/);
  assert.doesNotMatch(sql, /incentive/);
});
