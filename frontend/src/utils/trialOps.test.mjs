import { test } from 'vitest';
import assert from 'node:assert/strict';

import {
  buildFanRegistrationRecords,
  buildStoreRegistrationRecord,
  filterStoresForFanCity,
  getCitiesForCountry,
  processLocalReferralSignup,
  validateCountryCity,
} from './trialOps.js';

test('country and city must be selected from fixed options', () => {
  assert.deepEqual(validateCountryCity({ country: '', city: '' }), {
    valid: false,
    message: 'Please select country and city',
  });
  assert.deepEqual(validateCountryCity({ country: 'Saudi Arabia', city: 'Riyadh' }), {
    valid: true,
    message: '',
  });
  assert.equal(validateCountryCity({ country: 'Saudi Arabia', city: 'Unknown City' }).valid, false);
  assert.ok(getCitiesForCountry('Saudi Arabia').includes('Riyadh'));
});

test('fan registration records include country and city on profile and fan rows', () => {
  const records = buildFanRegistrationRecords({
    userId: 'u-1',
    name: 'Sara',
    phone: '+966500000000',
    country: 'Saudi Arabia',
    city: 'Jeddah',
  });

  assert.equal(records.profile.country, 'Saudi Arabia');
  assert.equal(records.profile.city, 'Jeddah');
  assert.equal(records.fan.country, 'Saudi Arabia');
  assert.equal(records.fan.city, 'Jeddah');
  assert.equal(records.fan.id, 'u-1');
  assert.equal(records.fan.level, 'bronze');
  assert.equal(records.fan.points, 100);
});

test('store registration record starts in pending review status with country and city', () => {
  const store = buildStoreRegistrationRecord({
    name: 'Uwell Partner Store',
    contact: 'Ali',
    phone: '+966511111111',
    country: 'Saudi Arabia',
    city: 'Dammam',
    address: 'Corniche Road',
  });

  assert.equal(store.country, 'Saudi Arabia');
  assert.equal(store.city, 'Dammam');
  assert.equal(store.status, 'pending_review');
  assert.equal(store.level, 'C');
});

test('fan city filters recommended stores before falling back to all stores', () => {
  const stores = [
    { id: 's-1', city: 'Riyadh', level: 'A' },
    { id: 's-2', city: 'Jeddah', level: 'S' },
    { id: 's-3', city: 'Jeddah', level: 'C' },
  ];

  assert.deepEqual(filterStoresForFanCity(stores, { city: 'Jeddah' }).map((store) => store.id), ['s-2', 's-3']);
  assert.deepEqual(filterStoresForFanCity(stores, { city: 'Makkah' }).map((store) => store.id), ['s-1', 's-2', 's-3']);
});

test('store registration record lets Supabase assign uuid ids', () => {
  const record = buildStoreRegistrationRecord({
    name: 'Riyadh Trial Store',
    contact: 'Aisha',
    phone: '500000000',
    country: 'Saudi Arabia',
    city: 'Riyadh',
  });

  assert.equal(Object.hasOwn(record, 'id'), false);
  assert.equal(record.status, 'pending_review');
  assert.equal(record.country, 'Saudi Arabia');
  assert.equal(record.city, 'Riyadh');
});

test('referral signup awards both inviter and new fan once', () => {
  const operations = [];
  const fans = new Map([
    ['fan-inviter-12345678', { id: 'fan-inviter-12345678', points: 100, total_contribution: 100, level: 'bronze' }],
    ['fan-new', { id: 'fan-new', points: 100, total_contribution: 0, level: 'bronze' }],
  ]);
  const tables = {
    fans,
    fan_points_log: [],
    mall_redemptions: [],
  };
  const fakeDb = {
    all(table) {
      if (table === 'fans') return Array.from(fans.values());
      if (table === 'fan_level_rules') return [{ level: 'bronze', min_points: 0 }];
      return tables[table] || [];
    },
    find(table, predicate) {
      return this.all(table).filter(predicate);
    },
    findById(table, id) {
      return table === 'fans' ? fans.get(id) : undefined;
    },
    insert(table, record) {
      operations.push({ type: 'insert', table, record });
      tables[table].push(record);
      return record;
    },
    update(table, id, patch) {
      operations.push({ type: 'update', table, id, patch });
      const next = { ...fans.get(id), ...patch };
      fans.set(id, next);
      return next;
    },
    transaction(callback) {
      return callback(this);
    },
  };

  const first = processLocalReferralSignup({
    localDb: fakeDb,
    referralCode: 'UWELL-12345678',
    newFanId: 'fan-new',
  });
  const second = processLocalReferralSignup({
    localDb: fakeDb,
    referralCode: 'UWELL-12345678',
    newFanId: 'fan-new',
  });

  assert.equal(first.applied, true);
  assert.equal(second.applied, false);
  assert.equal(fans.get('fan-inviter-12345678').points, 130);
  assert.equal(fans.get('fan-new').points, 130);
  assert.equal(tables.mall_redemptions.length, 1);
  assert.equal(tables.fan_points_log.length, 2);
  assert.equal(tables.fan_points_log[0].fan_id, 'fan-inviter-12345678');
  assert.equal(tables.fan_points_log[1].fan_id, 'fan-new');
});
