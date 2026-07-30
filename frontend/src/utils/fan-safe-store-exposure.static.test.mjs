import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const projectRoot = resolve(process.cwd(), '..');
const migrationPath = resolve(projectRoot, 'supabase', 'migrations', '20260718000600_fan_safe_store_exposure.sql');
const internalScopeMigrationPath = resolve(projectRoot, 'supabase', 'migrations', '20260718000700_internal_store_rpc_scope.sql');
const storesServicePath = resolve(projectRoot, 'frontend', 'src', 'services', 'api', 'stores.js');
const sStoresServicePath = resolve(projectRoot, 'frontend', 'src', 'services', 'api', 's-stores.js');

function read(path) {
  assert.equal(existsSync(path), true, `${path} should exist`);
  return readFileSync(path, 'utf8');
}

test('fan-safe store exposure migration removes broad direct stores reads', () => {
  const sql = read(migrationPath).toLowerCase();

  assert.match(sql, /revoke select on public\.stores from authenticated/);
  assert.match(sql, /grant select \(/);
  assert.match(sql, /id,\s*name,\s*address/s);
  assert.doesNotMatch(sql, /grant select on public\.stores to authenticated/);
});

test('fan-safe RPC returns only presentation-safe store fields', () => {
  const sql = read(migrationPath).toLowerCase();

  assert.match(sql, /create or replace function public\.get_fan_safe_stores/);
  assert.match(sql, /returns table/);
  assert.match(sql, /fan_label/);
  assert.match(sql, /trust_copy/);
  assert.match(sql, /pickup_label/);
  assert.doesNotMatch(sql, /get_fan_safe_stores[\s\S]*s_store_status/);
  assert.doesNotMatch(sql, /get_fan_safe_stores[\s\S]*s_store_source/);
  assert.doesNotMatch(sql, /get_fan_safe_stores[\s\S]*cooperation_note/);
});

test('internal store RPC keeps backend and S Store reads behind role-aware boundary', () => {
  const sql = read(migrationPath).toLowerCase();

  assert.match(sql, /create or replace function public\.get_internal_stores/);
  assert.match(sql, /create or replace function public\.get_internal_store/);
  assert.match(sql, /public\.current_profile_role\(\)/);
  assert.match(sql, /= 'fan' then/);
  assert.match(sql, /internal store access is not allowed for fan users/);
  assert.match(sql, /public\.can_access_store\(store_row\.id\)/);
  assert.match(sql, /returns setof public\.stores/);
  assert.match(sql, /returns public\.stores/);
});

test('internal store RPC scope migration gives Manager only assigned-region internal store reads', () => {
  const sql = read(internalScopeMigrationPath).toLowerCase();

  assert.match(sql, /create or replace function public\.can_read_internal_store/);
  assert.match(sql, /public\.is_admin_role\(\)/);
  assert.match(sql, /public\.is_manager_for_store\(target_store_id\)/);
  assert.match(sql, /public\.is_rep_assigned_to_store\(target_store_id\)/);
  assert.match(sql, /public\.is_store_owner\(target_store_id\)/);
  assert.match(sql, /current_profile_role\(\)[\s\S]*=\s*'fan'[\s\S]*false/);
  assert.match(sql, /get_internal_stores[\s\S]*public\.can_read_internal_store\(store_row\.id\)/);
  assert.match(sql, /get_internal_store[\s\S]*public\.can_read_internal_store\(store_row\.id\)/);
  assert.doesNotMatch(sql, /get_internal_stores[\s\S]*public\.can_access_store\(store_row\.id\)/);
  assert.doesNotMatch(sql, /get_internal_store[\s\S]*public\.can_access_store\(store_row\.id\)/);
});

test('frontend store services use fan-safe and internal RPCs instead of broad stores select', () => {
  const storesService = read(storesServicePath);
  const sStoresService = read(sStoresServicePath);

  assert.match(storesService, /export async function getFanSafeStores/);
  assert.match(storesService, /rpc\('get_fan_safe_stores'/);
  assert.match(storesService, /rpc\('get_internal_stores'/);
  assert.match(storesService, /rpc\('get_internal_store'/);
  assert.doesNotMatch(storesService, /supabase\.from\('stores'\)\.select\('\*'\)/);
  assert.doesNotMatch(sStoresService, /supabase\.from\('stores'\)\.select\('\*'\)/);
  assert.match(sStoresService, /rpc\('get_internal_stores'/);
  assert.match(sStoresService, /rpc\('get_internal_store'/);
});

test('fan map reads stores through the fan-safe API boundary', () => {
  const mapSource = read(resolve(projectRoot, 'frontend', 'src', 'pages', 'fans', 'tabs', 'MapTab.jsx'));

  assert.match(mapSource, /getFanSafeStores/);
  assert.doesNotMatch(mapSource, /localDb\.all\('stores'\)/);
});
