import { test } from 'vitest';
import assert from 'node:assert/strict';

import seedData from './seedData.js';

test('trial seed data includes usable demo accounts', () => {
  const accounts = seedData.trial_accounts || [];
  const accountKeys = accounts.map((account) => account.email || account.store_id || account.fan_id);

  assert.ok(accountKeys.includes('admin@uwell.com'));
  assert.ok(accountKeys.includes('manager@uwell.com'));
  assert.ok(accountKeys.includes('rep1@uwell.com'));
  assert.ok(accountKeys.includes('rep2@uwell.com'));
  assert.ok(accountKeys.includes('s-real-001'));
  assert.equal(seedData.auth.find((account) => account.email === 'admin@uwell.com')?.password, 'admin');
});

test('trial stores are normalized for city operations', () => {
  assert.ok(seedData.stores.length >= 10);

  for (const store of seedData.stores) {
    assert.equal(store.country, 'Saudi Arabia');
    assert.ok(store.city, `${store.id} should have city`);
    assert.ok(store.status, `${store.id} should have status`);
    assert.ok(store.owner_name, `${store.id} should have owner name`);
    assert.ok(store.owner_phone, `${store.id} should have owner phone`);
    assert.ok(store.rep_id, `${store.id} should have assigned rep`);
    assert.ok(store.display_status, `${store.id} should have display status`);
    assert.ok(store.rating_status, `${store.id} should have rating status`);
  }
});

test('trial fans and scans are ready for fan center demos', () => {
  assert.ok(seedData.fans.length >= 5);
  assert.ok(seedData.scan_records.length >= 5);

  for (const fan of seedData.fans) {
    assert.ok(fan.email, `${fan.id} should have email`);
    assert.equal(fan.country, 'Saudi Arabia');
    assert.ok(fan.city, `${fan.id} should have city`);
    assert.ok(Number(fan.points) >= 0, `${fan.id} should have points`);
  }

  for (const record of seedData.scan_records) {
    assert.ok(record.scanned_at, `${record.id} should have scanned_at`);
  }
});

test('trial material requests show pending, approved, and rejected states', () => {
  const statuses = new Set((seedData.material_requests || []).map((request) => request.status));

  assert.ok(statuses.has('pending'));
  assert.ok(statuses.has('approved'));
  assert.ok(statuses.has('rejected'));
});
