import { test } from 'vitest';
import assert from 'node:assert/strict';

import {
  buildFanRegistrationRecords,
  buildStoreRegistrationRecord,
  filterStoresForFanCity,
  getCitiesForCountry,
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
