import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { describe, test } from 'vitest';

const projectRoot = resolve(process.cwd(), '..');
const migrationDir = resolve(projectRoot, 'supabase', 'migrations');

const migrations = {
  schema: '20260718000100_s_store_schema.sql',
  rls: '20260718000200_s_store_rls_policies.sql',
  rpc: '20260718000300_s_store_controlled_mutations.sql',
  audit: '20260718000400_audit_logs_production_alignment.sql',
  correction: '20260718000500_s_store_correction_flows.sql',
  fanSafeExposure: '20260718000600_fan_safe_store_exposure.sql',
};

const protectedTables = [
  's_store_status_history',
  's_store_sell_through',
  's_store_product_inventory_snapshots',
  's_store_material_inventory_snapshots',
  's_store_visit_details',
  's_store_replenishment_tasks',
];

const rpcNames = [
  'submit_s_store_sell_through',
  'submit_s_store_product_inventory',
  'submit_s_store_material_inventory',
  'submit_s_store_visit_detail',
  'create_s_store_replenishment_task',
  'complete_s_store_replenishment_task',
  'downgrade_s_store_to_a',
  'restore_s_store',
  'correct_s_store_sell_through',
  'correct_s_store_product_inventory',
  'correct_s_store_material_inventory',
];

function readProjectFile(...parts) {
  const filePath = resolve(projectRoot, ...parts);
  assert.equal(existsSync(filePath), true, `${filePath} should exist`);
  return readFileSync(filePath, 'utf8');
}

function readMigration(name) {
  return readProjectFile('supabase', 'migrations', name).toLowerCase();
}

describe('Task-057 S Store production acceptance boundary', () => {
  test('production S Store migrations are ordered as schema, RLS, RPC, audit alignment, correction flows, then fan-safe exposure', () => {
    const names = Object.values(migrations);

    names.forEach((name) => {
      assert.equal(existsSync(resolve(migrationDir, name)), true, `${name} should exist`);
    });

    assert.deepEqual([...names].sort(), names);
  });

  test('fan-safe store exposure closes direct Fan access to internal S Store store columns', () => {
    const fanSafeSql = readMigration(migrations.fanSafeExposure);
    const storeService = readProjectFile('frontend', 'src', 'services', 'api', 'stores.js');
    const mapTab = readProjectFile('frontend', 'src', 'pages', 'fans', 'tabs', 'MapTab.jsx');

    assert.match(fanSafeSql, /revoke select on public\.stores from authenticated/);
    assert.match(fanSafeSql, /create or replace function public\.get_fan_safe_stores/);
    assert.match(fanSafeSql, /create or replace function public\.get_internal_stores/);
    assert.match(fanSafeSql, /internal store access is not allowed for fan users/);
    assert.doesNotMatch(storeService, /supabase\.from\('stores'\)\.select\('\*'\)/);
    assert.match(storeService, /rpc\('get_fan_safe_stores'/);
    assert.match(storeService, /rpc\('get_internal_stores'/);
    assert.match(mapTab, /getFanSafeStores/);
  });

  test('protected S Store operating tables have RLS coverage without fan or anonymous policies', () => {
    const schemaSql = readMigration(migrations.schema);
    const rlsSql = readMigration(migrations.rls);

    protectedTables.forEach((tableName) => {
      assert.match(schemaSql, new RegExp(`create table if not exists public\\.${tableName}`));
      assert.match(schemaSql, new RegExp(`alter table public\\.${tableName} enable row level security`));
      assert.match(rlsSql, new RegExp(`create policy ${tableName}_select_scoped on public\\.${tableName}`));
    });

    assert.doesNotMatch(rlsSql, /to\s+anon/);
    assert.doesNotMatch(rlsSql, /to\s+public/);
    assert.doesNotMatch(rlsSql, /current_profile_role\(\)\s*=\s*'fan'/);
  });

  test('frontend S Store mutations call only the confirmed controlled RPC names', () => {
    const service = readProjectFile('frontend', 'src', 'services', 'api', 's-stores.js');
    const rpcSql = `${readMigration(migrations.rpc)}\n${readMigration(migrations.correction)}`;

    rpcNames.forEach((rpcName) => {
      assert.match(service, new RegExp(`remoteMutation\\('${rpcName}'`));
      assert.match(rpcSql, new RegExp(`create or replace function public\\.${rpcName}`));
      assert.match(rpcSql, new RegExp(`grant execute on function public\\.${rpcName}`));
    });

    assert.doesNotMatch(service, /auto_replenishment|price_analysis|sku_level/i);
  });

  test('audit log writes use the production helper and keep direct inserts blocked by RLS', () => {
    const auditService = readProjectFile('frontend', 'src', 'services', 'api', 'audit-logs.js');
    const auditSql = readMigration(migrations.audit);
    const rpcSql = readMigration(migrations.rpc);

    assert.match(auditService, /supabase\.rpc\('write_audit_log'/);
    assert.match(auditSql, /create or replace function public\.write_audit_log/);
    assert.match(auditSql, /create policy audit_logs_insert_controlled on public\.audit_logs/);
    assert.match(auditSql, /with check \(false\)/);
    assert.match(rpcSql, /perform public\.write_s_store_audit/);
  });

  test('fallback-disabled mode is represented in the API helper and production acceptance docs', () => {
    const helper = readProjectFile('frontend', 'src', 'services', 'api', 'helpers.js');
    const apiDoc = readProjectFile('docs', '06_API.md');
    const alignmentDoc = readProjectFile('docs', '23_S_STORE_SUPABASE_RLS_API_ALIGNMENT.md');

    assert.match(helper, /VITE_ALLOW_LOCAL_DB_FALLBACK/);
    assert.match(helper, /if \(currentEnv\?\.VITE_ALLOW_LOCAL_DB_FALLBACK === 'false'\) return false/);
    assert.match(apiDoc, /Local fallback must not silently hide production errors/i);
    assert.match(alignmentDoc, /fallback-disabled production acceptance/i);
  });
});
