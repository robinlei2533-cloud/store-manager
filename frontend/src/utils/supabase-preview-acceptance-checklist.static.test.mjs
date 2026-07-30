import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const projectRoot = resolve(process.cwd(), '..');
const checklistPath = resolve(projectRoot, 'docs', '24_SUPABASE_PREVIEW_ACCEPTANCE_CHECKLIST.md');

function readChecklist() {
  assert.equal(existsSync(checklistPath), true, 'Supabase preview acceptance checklist should exist');
  return readFileSync(checklistPath, 'utf8');
}

test('Supabase preview acceptance checklist defines the exact migration order', () => {
  const source = readChecklist();
  const migrationOrderSection = source.slice(source.indexOf('## Migration Order'));
  const migrations = [
    '20260718000100_s_store_schema.sql',
    '20260718000200_s_store_rls_policies.sql',
    '20260718000300_s_store_controlled_mutations.sql',
    '20260718000400_audit_logs_production_alignment.sql',
    '20260718000500_s_store_correction_flows.sql',
    '20260718000600_fan_safe_store_exposure.sql',
    '20260718000700_internal_store_rpc_scope.sql',
  ];

  migrations.forEach((migration) => assert.match(migrationOrderSection, new RegExp(migration)));
  assert.ok(
    migrations.every((migration, index) => (
      index === 0 || migrationOrderSection.indexOf(migrations[index - 1]) < migrationOrderSection.indexOf(migration)
    )),
    'migrations should appear in execution order',
  );
});

test('Supabase preview acceptance checklist covers every production role boundary', () => {
  const source = readChecklist();

  [
    'Admin',
    'Manager',
    'Rep',
    'Store Owner',
    'Fan',
    'anonymous',
  ].forEach((role) => assert.match(source, new RegExp(role, 'i')));

  [
    'Fan cannot read S Store operating tables',
    'Store Owner can submit own active S Store report',
    'Store Owner cannot edit locked history',
    'Rep can submit assigned S Store visit detail',
    'Rep cannot manage S Store status',
    'Rep cannot correct sell-through or inventory history',
    'Manager can manage assigned-region S Store status',
    'Manager cannot access unrelated-region S Store data',
    'Manager cannot read unrelated-region internal store RPC data',
    'Admin can access all S Store data',
  ].forEach((rule) => assert.match(source, new RegExp(rule, 'i')));
});

test('Supabase preview acceptance checklist covers RPC and audit acceptance', () => {
  const source = readChecklist();

  [
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
    'write_audit_log',
  ].forEach((rpcName) => assert.match(source, new RegExp(rpcName)));

  assert.match(source, /completion requires photos/i);
  assert.match(source, /correction requires a reason/i);
  assert.match(source, /Audit Log/i);
});

test('Supabase preview acceptance checklist keeps this task non-destructive', () => {
  const source = readChecklist();

  assert.match(source, /Do not execute migrations from Codex in this task/i);
  assert.match(source, /Do not modify \.env/i);
  assert.match(source, /VITE_ALLOW_LOCAL_DB_FALLBACK=false/i);
  assert.match(source, /fallback disabled/i);
  assert.match(source, /No production database is changed by this checklist/i);
  assert.match(source, /Do not run `npm install`/i);
  assert.match(source, /Do not run `pip install`/i);
});
