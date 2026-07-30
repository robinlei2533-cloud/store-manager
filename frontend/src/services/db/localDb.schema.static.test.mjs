import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const source = readFileSync(new URL('./localDb.js', import.meta.url), 'utf8');
const seedSource = readFileSync(new URL('./seedData.js', import.meta.url), 'utf8');

test('local preview database declares operational audit and verification tables', () => {
  assert.match(source, /'audit_logs'/);
  assert.match(source, /'store_activity_verifications'/);
  assert.match(source, /'store_exposure_events'/);
  assert.match(source, /'fan_engagement_tasks'/);
  assert.match(source, /'community_point_actions'/);
  assert.match(source, /'reward_reviews'/);
  assert.match(source, /'warehouse_inventory_alerts'/);
});

test('local preview database declares S Store V1 foundation tables', () => {
  assert.match(source, /'s_store_status_history'/);
  assert.match(source, /'s_store_sell_through'/);
  assert.match(source, /'s_store_product_inventory_snapshots'/);
  assert.match(source, /'s_store_material_inventory_snapshots'/);
  assert.match(source, /'s_store_visit_details'/);
  assert.match(source, /'s_store_replenishment_tasks'/);
});

test('local preview seed carries S Store V1 status and operating records', () => {
  assert.match(seedSource, /is_s_store/);
  assert.match(seedSource, /s_store_status/);
  assert.match(seedSource, /became_s_at/);
  assert.match(seedSource, /s_store_source/);
  assert.match(seedSource, /cooperation_note/);
  assert.match(seedSource, /s_store_status_history/);
  assert.match(seedSource, /s_store_sell_through/);
  assert.match(seedSource, /s_store_product_inventory_snapshots/);
  assert.match(seedSource, /s_store_material_inventory_snapshots/);
  assert.match(seedSource, /s_store_visit_details/);
  assert.match(seedSource, /s_store_replenishment_tasks/);
});

test('local preview seed carries shared trial operational rules', () => {
  assert.match(seedSource, /OPERATIONAL_RULE_RECORD_ID/);
  assert.match(seedSource, /DEFAULT_OPERATIONAL_RULES/);
  assert.match(seedSource, /Trial operational rules/);
  assert.match(seedSource, /Shared first-launch rule settings consumed by fan, store, admin, and materials workflows/);
});
