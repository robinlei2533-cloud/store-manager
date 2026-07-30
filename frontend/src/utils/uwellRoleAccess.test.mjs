import { describe, expect, test } from 'vitest';
import {
  canAccessFan,
  canAccessVisit,
  canApproveMaterialRequest,
  canApproveReview,
  canConfirmRewardPickup,
  canEditLockedHistory,
  canManageGlobalRules,
  canManageRewardOps,
  canSubmitStoreReport,
  canSubmitVisit,
  canUpdateMaterialStock,
  canViewCompanyScope,
  canViewOpsScope,
  filterFansByScope,
  getAssignedStoreIds,
  getScopedStoreRows,
  isAssignedStore,
} from './uwellRoleAccess';

describe('UWELL role access', () => {
  const stores = [
    { id: 's-1', rep_id: 'u-rep1', city: 'Riyadh' },
    { id: 's-2', owner_id: 'u-rep2', city: 'Jeddah' },
    { id: 's-3', city: 'Riyadh' },
    { id: 's-4', city: 'Dammam' },
  ];

  test('admin has company scope while managers keep ops scope by assigned region', () => {
    expect(canViewCompanyScope({ role: 'admin' })).toBe(true);
    expect(canViewCompanyScope({ role: 'manager' })).toBe(false);
    expect(canViewCompanyScope({ role: 'rep' })).toBe(false);
    expect(canViewOpsScope({ role: 'manager' })).toBe(true);
    expect(getAssignedStoreIds({ role: 'manager', region: 'Riyadh' }, stores)).toEqual(['s-1', 's-3']);
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

  test('store owners and fans are scoped by ownership instead of rep assignment fallback', () => {
    const ownedStores = [
      { id: 'owned-store', owner_profile_id: 'owner-1', rep_id: 'rep-1', city: 'Riyadh' },
      { id: 'other-store', owner_profile_id: 'owner-2', rep_id: 'rep-1', city: 'Riyadh' },
    ];

    expect(getAssignedStoreIds({ id: 'owner-1', role: 'store_owner' }, ownedStores)).toEqual(['owned-store']);
    expect(isAssignedStore({ id: 'owner-1', role: 'store_owner' }, ownedStores[1], ownedStores)).toBe(false);
    expect(getAssignedStoreIds({ id: 'fan-user-1', role: 'fan', store_id: 'owned-store' }, ownedStores)).toEqual(['owned-store']);
    expect(getAssignedStoreIds({ id: 'fan-user-1', role: 'fan' }, ownedStores)).toEqual([]);
  });

  test('fan records are visible only to company scope, assigned store scope, or the fan owner', () => {
    const scopedStores = [
      { id: 's-1', owner_profile_id: 'owner-1', rep_id: 'rep-1', city: 'Riyadh' },
      { id: 's-2', owner_profile_id: 'owner-2', rep_id: 'rep-2', city: 'Jeddah' },
    ];
    const fans = [
      { id: 'fan-1', user_id: 'fan-user-1', store_id: 's-1' },
      { id: 'fan-2', user_id: 'fan-user-2', store_id: 's-2' },
    ];

    expect(canAccessFan({ role: 'admin' }, fans[1], scopedStores)).toBe(true);
    expect(canAccessFan({ id: 'manager-1', role: 'manager', region: 'Riyadh' }, fans[0], scopedStores)).toBe(true);
    expect(canAccessFan({ id: 'manager-1', role: 'manager', region: 'Riyadh' }, fans[1], scopedStores)).toBe(false);
    expect(canAccessFan({ id: 'rep-1', role: 'rep' }, fans[0], scopedStores)).toBe(true);
    expect(canAccessFan({ id: 'owner-1', role: 'store_owner' }, fans[0], scopedStores)).toBe(true);
    expect(canAccessFan({ id: 'fan-user-1', role: 'fan' }, fans[0], scopedStores)).toBe(true);
    expect(canAccessFan({ id: 'fan-user-1', role: 'fan' }, fans[1], scopedStores)).toBe(false);
    expect(filterFansByScope({ id: 'owner-1', role: 'store_owner' }, fans, scopedStores)).toEqual([fans[0]]);
  });

  test('visit records are visible only to company scope, assigned store scope, or visit owner rep', () => {
    const scopedStores = [
      { id: 's-1', rep_id: 'rep-1', city: 'Riyadh' },
      { id: 's-2', rep_id: 'rep-2', city: 'Jeddah' },
    ];
    const visit = { id: 'visit-1', store_id: 's-1', rep_id: 'rep-1' };

    expect(canAccessVisit({ role: 'admin' }, visit, scopedStores)).toBe(true);
    expect(canAccessVisit({ id: 'manager-1', role: 'manager', region: 'Riyadh' }, visit, scopedStores)).toBe(true);
    expect(canAccessVisit({ id: 'manager-2', role: 'manager', region: 'Jeddah' }, visit, scopedStores)).toBe(false);
    expect(canAccessVisit({ id: 'rep-1', role: 'rep' }, visit, scopedStores)).toBe(true);
    expect(canAccessVisit({ id: 'rep-2', role: 'rep' }, visit, scopedStores)).toBe(false);
  });

  test('governance action permissions separate approval, submission, stock, and global rule powers', () => {
    const admin = { id: 'admin-1', role: 'admin' };
    const manager = { id: 'manager-1', role: 'manager', region: 'Riyadh' };
    const rep = { id: 'rep-1', role: 'rep' };
    const owner = { id: 'owner-1', role: 'store_owner' };
    const fan = { id: 'fan-1', role: 'fan' };

    expect(canManageGlobalRules(admin)).toBe(true);
    expect(canManageGlobalRules(manager)).toBe(false);
    expect(canManageRewardOps(admin)).toBe(true);
    expect(canManageRewardOps(manager)).toBe(true);
    expect(canApproveReview(manager)).toBe(true);
    expect(canApproveReview(rep)).toBe(false);
    expect(canApproveMaterialRequest(manager)).toBe(true);
    expect(canApproveMaterialRequest(rep)).toBe(false);
    expect(canUpdateMaterialStock(admin)).toBe(true);
    expect(canUpdateMaterialStock(manager)).toBe(false);
    expect(canSubmitVisit(rep)).toBe(true);
    expect(canSubmitVisit(owner)).toBe(false);
    expect(canSubmitStoreReport(owner)).toBe(true);
    expect(canSubmitStoreReport(fan)).toBe(false);
    expect(canConfirmRewardPickup({ ...owner, store_level: 'S' })).toBe(true);
    expect(canConfirmRewardPickup({ ...owner, store_level: 'B' })).toBe(false);
    expect(canEditLockedHistory(admin)).toBe(true);
    expect(canEditLockedHistory(manager)).toBe(false);
  });
});
