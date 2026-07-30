import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const migrationPath = resolve(
  process.cwd(),
  '..',
  'supabase',
  'migrations',
  '20260718000200_s_store_rls_policies.sql',
);

function readMigration() {
  assert.equal(existsSync(migrationPath), true, 'S Store RLS migration should exist');
  return readFileSync(migrationPath, 'utf8').toLowerCase();
}

const sStoreTables = [
  's_store_status_history',
  's_store_sell_through',
  's_store_product_inventory_snapshots',
  's_store_material_inventory_snapshots',
  's_store_visit_details',
  's_store_replenishment_tasks',
];

test('S Store RLS migration defines scoped helper functions', () => {
  const sql = readMigration();

  [
    'is_manager_for_store',
    'is_active_s_store',
    'can_manage_s_store',
    'can_submit_s_store_report',
    'can_submit_s_store_visit',
    'can_manage_s_store_replenishment',
  ].forEach((helperName) => {
    assert.match(sql, new RegExp(`create or replace function public\\.${helperName}`, 'i'));
    assert.match(sql, new RegExp(`grant execute on function public\\.${helperName}`, 'i'));
  });
});

test('S Store RLS migration keeps manager S Store access region scoped', () => {
  const sql = readMigration();

  assert.match(sql, /public\.current_profile_role\(\) = 'manager'/);
  assert.match(sql, /manager_profile\.city is not null/);
  assert.match(sql, /store_row\.city = manager_profile\.city/);
  assert.doesNotMatch(sql, /public\.is_admin_or_manager\(\)\s+or\s+true/);
});

test('S Store RLS migration covers every S Store table with explicit policies', () => {
  const sql = readMigration();

  sStoreTables.forEach((tableName) => {
    assert.match(sql, new RegExp(`alter table public\\.${tableName} enable row level security`, 'i'));
    assert.match(sql, new RegExp(`create policy ${tableName}_select_scoped on public\\.${tableName}`, 'i'));
    assert.match(sql, new RegExp(`drop policy if exists ${tableName}_select_scoped on public\\.${tableName}`, 'i'));
  });
});

test('S Store RLS migration protects store reports and locked history from store edits', () => {
  const sql = readMigration();

  [
    's_store_sell_through_insert_reporter',
    's_store_product_inventory_snapshots_insert_reporter',
    's_store_material_inventory_snapshots_insert_reporter',
  ].forEach((policyName) => {
    assert.match(sql, new RegExp(`create policy ${policyName}`, 'i'));
  });

  assert.match(sql, /for insert to authenticated/);
  assert.match(sql, /with check \(public\.can_submit_s_store_report\(store_id\)\)/);
  assert.match(sql, /for update to authenticated/);
  assert.match(sql, /using \(public\.can_manage_s_store\(store_id\)\)/);
  assert.doesNotMatch(sql, /is_store_owner\(store_id\).*for update/is);
});

test('S Store RLS migration keeps fans and anonymous users out of operating tables', () => {
  const sql = readMigration();

  assert.doesNotMatch(sql, /to\s+anon/);
  assert.doesNotMatch(sql, /to\s+public/);
  assert.doesNotMatch(sql, /current_profile_role\(\)\s*=\s*'fan'/);
  assert.doesNotMatch(sql, /can_access_fan/);
});

test('S Store RLS migration stays policy-only and does not add RPC or schema tables', () => {
  const sql = readMigration();

  assert.doesNotMatch(sql, /create table/i);
  assert.doesNotMatch(sql, /returns jsonb/i);
  assert.doesNotMatch(sql, /create or replace function public\.submit_/i);
  assert.doesNotMatch(sql, /drop table/i);
});
