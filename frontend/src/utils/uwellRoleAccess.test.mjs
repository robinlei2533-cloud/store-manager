import { describe, expect, test } from 'vitest';
import {
  canViewCompanyScope,
  getAssignedStoreIds,
  getScopedStoreRows,
  isAssignedStore,
} from './uwellRoleAccess';

describe('UWELL role access', () => {
  const stores = [
    { id: 's-1', rep_id: 'u-rep1' },
    { id: 's-2', owner_id: 'u-rep2' },
    { id: 's-3' },
    { id: 's-4' },
  ];

  test('company roles can view company scope', () => {
    expect(canViewCompanyScope({ role: 'admin' })).toBe(true);
    expect(canViewCompanyScope({ role: 'manager' })).toBe(true);
    expect(canViewCompanyScope({ role: 'rep' })).toBe(false);
  });

  test('rep receives explicit and demo assigned stores only', () => {
    expect(getAssignedStoreIds({ id: 'u-rep1', role: 'rep' }, stores)).toEqual(['s-1', 's-3']);
    expect(isAssignedStore({ id: 'u-rep1', role: 'rep' }, { id: 's-1', rep_id: 'u-rep1' }, stores)).toBe(true);
    expect(isAssignedStore({ id: 'u-rep1', role: 'rep' }, { id: 's-2', owner_id: 'u-rep2' }, stores)).toBe(false);
  });

  test('keeps Supabase assigned stores for reps instead of replacing them with local demo rows', () => {
    const rep = { id: 'rep-remote-1', role: 'rep' };
    const remoteStores = [
      { id: 'store-remote-1', name: 'UWELL Preview Store', rep_id: 'rep-remote-1', level: 'B' },
    ];
    const localStores = [
      { id: 's-local-1', name: 'Local Demo Store', rep_id: 'u-rep1', level: 'B' },
    ];

    const rows = getScopedStoreRows({
      profile: rep,
      stores: remoteStores,
      localStores,
      filters: {},
    });

    expect(rows).toEqual(remoteStores);
  });
});
