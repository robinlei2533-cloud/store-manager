import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const migrationPath = resolve(
  process.cwd(),
  '..',
  'supabase',
  'migrations',
  '20260718000300_s_store_controlled_mutations.sql',
);

function readMigration() {
  assert.equal(existsSync(migrationPath), true, 'S Store controlled mutation migration should exist');
  return readFileSync(migrationPath, 'utf8').toLowerCase();
}

test('S Store controlled mutation migration defines the required RPC boundary', () => {
  const sql = readMigration();

  [
    'submit_s_store_sell_through',
    'submit_s_store_product_inventory',
    'submit_s_store_material_inventory',
    'submit_s_store_visit_detail',
    'create_s_store_replenishment_task',
    'complete_s_store_replenishment_task',
    'downgrade_s_store_to_a',
    'restore_s_store',
  ].forEach((functionName) => {
    assert.match(sql, new RegExp(`create or replace function public\\.${functionName}`));
    assert.match(sql, new RegExp(`grant execute on function public\\.${functionName}`));
  });
});

test('S Store controlled mutation RPCs enforce confirmed permissions and evidence rules', () => {
  const sql = readMigration();

  assert.match(sql, /public\.can_submit_s_store_report\(p_store_id\)/);
  assert.match(sql, /public\.can_submit_s_store_visit\(p_store_id\)/);
  assert.match(sql, /public\.can_manage_s_store\(p_store_id\)/);
  assert.match(sql, /public\.can_manage_s_store_replenishment\(v_task\.store_id, v_task\.assigned_rep_id\)/);
  assert.match(sql, /array_length\(p_completion_photos, 1\) is null/);
  assert.match(sql, /raise exception 's store replenishment completion requires photos.'/);
});

test('S Store controlled mutation RPCs keep low-stock and locked-history rules in SQL', () => {
  const sql = readMigration();

  assert.match(sql, /p_open_system_current_stock <= \(p_open_system_target_stock \/ 3\.0\)/);
  assert.match(sql, /p_disposable_current_stock <= \(p_disposable_target_stock \/ 3\.0\)/);
  assert.match(sql, /p_current_quantity <= \(p_target_quantity \/ 3\.0\)/);
  assert.match(sql, /locked/);
  assert.match(sql, /true/);
  assert.match(sql, /insert into public\.s_store_sell_through/);
  assert.match(sql, /p_period_start/);
  assert.match(sql, /p_period_end/);
});

test('S Store controlled mutation RPCs keep status changes transactional with history and audit', () => {
  const sql = readMigration();

  assert.match(sql, /update public\.stores/);
  assert.match(sql, /insert into public\.s_store_status_history/);
  assert.match(sql, /perform public\.write_s_store_audit/);
  assert.match(sql, /to_jsonb\(p_before_value\)/);
  assert.match(sql, /to_jsonb\(p_after_value\)/);
  assert.match(sql, /'downgrade_to_a'/);
  assert.match(sql, /'restore_to_s'/);
  assert.match(sql, /raise exception 's store downgrade requires a reason.'/);
  assert.match(sql, /raise exception 's store restore requires a reason.'/);
});

test('S Store controlled mutation migration stays additive and avoids unconfirmed business scope', () => {
  const sql = readMigration();

  assert.doesNotMatch(sql, /drop table/);
  assert.doesNotMatch(sql, /create table public\./);
  assert.doesNotMatch(sql, /sku/);
  assert.doesNotMatch(sql, /price_analysis/);
  assert.doesNotMatch(sql, /auto_replenishment/);
  assert.doesNotMatch(sql, /incentive/);
});
