import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const migrationPath = resolve(
  process.cwd(),
  '..',
  'supabase',
  'migrations',
  '20260718000100_s_store_schema.sql',
);

function readMigration() {
  assert.equal(existsSync(migrationPath), true, 'S Store Supabase schema migration should exist');
  return readFileSync(migrationPath, 'utf8');
}

test('S Store Supabase schema migration adds current state fields to stores', () => {
  const sql = readMigration();

  assert.match(sql, /ALTER TABLE public\.stores ADD COLUMN IF NOT EXISTS is_s_store BOOLEAN DEFAULT false/i);
  assert.match(sql, /ALTER TABLE public\.stores ADD COLUMN IF NOT EXISTS s_store_status TEXT/i);
  assert.match(sql, /ALTER TABLE public\.stores ADD COLUMN IF NOT EXISTS became_s_at TIMESTAMPTZ/i);
  assert.match(sql, /ALTER TABLE public\.stores ADD COLUMN IF NOT EXISTS s_store_source TEXT/i);
  assert.match(sql, /ALTER TABLE public\.stores ADD COLUMN IF NOT EXISTS cooperation_note TEXT/i);
  assert.match(sql, /stores_s_store_status_check/i);
  assert.match(sql, /idx_stores_s_store_status/i);
  assert.match(sql, /idx_stores_is_s_store/i);
});

test('S Store Supabase schema migration creates dedicated history and operations tables', () => {
  const sql = readMigration();

  [
    's_store_status_history',
    's_store_sell_through',
    's_store_product_inventory_snapshots',
    's_store_material_inventory_snapshots',
    's_store_visit_details',
    's_store_replenishment_tasks',
  ].forEach((tableName) => {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${tableName}`, 'i'));
    assert.match(sql, new RegExp(`ALTER TABLE public\\.${tableName} ENABLE ROW LEVEL SECURITY`, 'i'));
  });
});

test('S Store Supabase schema migration preserves locked history and correction metadata', () => {
  const sql = readMigration();

  assert.match(sql, /locked BOOLEAN DEFAULT true/i);
  assert.match(sql, /corrected_by UUID REFERENCES public\.profiles\(id\)/i);
  assert.match(sql, /corrected_at TIMESTAMPTZ/i);
  assert.match(sql, /correction_reason TEXT/i);
  assert.match(sql, /UNIQUE \(store_id, period_type, period_start, period_end\)/i);
});

test('S Store Supabase schema migration keeps low-stock and replenishment evidence fields', () => {
  const sql = readMigration();

  assert.match(sql, /open_system_low_stock BOOLEAN DEFAULT false/i);
  assert.match(sql, /disposable_low_stock BOOLEAN DEFAULT false/i);
  assert.match(sql, /low_stock BOOLEAN DEFAULT false/i);
  assert.match(sql, /replenishment_needed BOOLEAN DEFAULT false/i);
  assert.match(sql, /completion_photos TEXT\[\]/i);
  assert.match(sql, /s_store_replenishment_tasks_status_check/i);
});

test('S Store Supabase schema migration does not add manual contribution table or policies', () => {
  const sql = readMigration();

  assert.doesNotMatch(sql, /CREATE TABLE IF NOT EXISTS public\.s_store_contribution/i);
  assert.doesNotMatch(sql, /CREATE POLICY/i);
  assert.doesNotMatch(sql, /DROP TABLE/i);
});
