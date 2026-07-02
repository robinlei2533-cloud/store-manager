import test from 'node:test';
import assert from 'node:assert/strict';

import {
  canViewCompanyScope,
  getAssignedStoreIds,
  isAssignedStore,
} from './uwellRoleAccess.js';

const stores = [
  { id: 's-1', rep_id: 'u-rep1' },
  { id: 's-2', owner_id: 'u-rep2' },
  { id: 's-3' },
  { id: 's-4' },
];

test('company roles can view company scope', () => {
  assert.equal(canViewCompanyScope({ role: 'admin' }), true);
  assert.equal(canViewCompanyScope({ role: 'manager' }), true);
  assert.equal(canViewCompanyScope({ role: 'rep' }), false);
});

test('rep receives explicit and demo assigned stores only', () => {
  assert.deepEqual(getAssignedStoreIds({ id: 'u-rep1', role: 'rep' }, stores), ['s-1', 's-3']);
  assert.equal(isAssignedStore({ id: 'u-rep1', role: 'rep' }, { id: 's-1', rep_id: 'u-rep1' }, stores), true);
  assert.equal(isAssignedStore({ id: 'u-rep1', role: 'rep' }, { id: 's-2', owner_id: 'u-rep2' }, stores), false);
});
