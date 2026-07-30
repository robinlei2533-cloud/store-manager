import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const migrationPath = resolve(
  process.cwd(),
  '..',
  'supabase',
  'migrations',
  '20260718000400_audit_logs_production_alignment.sql',
);

function readMigration() {
  assert.equal(existsSync(migrationPath), true, 'Production audit log migration should exist');
  return readFileSync(migrationPath, 'utf8').toLowerCase();
}

test('production audit log migration defines additive audit_logs table shape', () => {
  const sql = readMigration();

  assert.match(sql, /create table if not exists public\.audit_logs/);
  [
    'actor',
    'user_id',
    'role',
    'region',
    'action_type',
    'target_type',
    'target_id',
    'target',
    'before_value',
    'after_value',
    'reason',
    'source_module',
    'category',
    'severity',
    'created_at',
  ].forEach((fieldName) => {
    assert.match(sql, new RegExp(`\\b${fieldName}\\b`));
  });

  assert.match(sql, /jsonb/);
  assert.match(sql, /severity.*check/i);
  assert.doesNotMatch(sql, /drop table/);
});

test('production audit log migration scopes reads and blocks anonymous access', () => {
  const sql = readMigration();

  assert.match(sql, /alter table public\.audit_logs enable row level security/);
  assert.match(sql, /audit_logs_select_admin/);
  assert.match(sql, /audit_logs_select_manager_region/);
  assert.match(sql, /public\.is_admin_role\(\)/);
  assert.match(sql, /public\.current_profile_role\(\) = 'manager'/);
  assert.match(sql, /audit_logs\.region = manager_profile\.city/);
  assert.doesNotMatch(sql, /to\s+anon/);
  assert.doesNotMatch(sql, /current_profile_role\(\)\s*=\s*'fan'/);
});

test('production audit log migration exposes controlled write helper only', () => {
  const sql = readMigration();

  assert.match(sql, /create or replace function public\.write_audit_log/);
  assert.match(sql, /security definer/);
  assert.match(sql, /insert into public\.audit_logs/);
  assert.match(sql, /grant execute on function public\.write_audit_log/);
  assert.match(sql, /audit_logs_insert_controlled/);
  assert.doesNotMatch(sql, /create policy audit_logs_insert_public/);
  assert.doesNotMatch(sql, /for update to authenticated/);
});

test('production audit log migration keeps useful indexes for governance filtering', () => {
  const sql = readMigration();

  [
    'idx_audit_logs_created_at',
    'idx_audit_logs_region',
    'idx_audit_logs_role',
    'idx_audit_logs_category',
    'idx_audit_logs_severity',
    'idx_audit_logs_target',
  ].forEach((indexName) => {
    assert.match(sql, new RegExp(indexName));
  });
});
