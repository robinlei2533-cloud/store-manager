import { describe, expect, test } from 'vitest';
import {
  canDowngradeSStore,
  canRestoreSStore,
  canStoreSubmitSReport,
  getSStoreFanLabel,
  isLowStock,
  isSStoreHistoryLocked,
} from './s-store-rules';

describe('S Store V1 rules', () => {
  test('detects low stock at one third of target stock', () => {
    expect(isLowStock({ currentStock: 10, targetStock: 30 })).toBe(true);
    expect(isLowStock({ currentStock: 11, targetStock: 30 })).toBe(false);
    expect(isLowStock({ currentStock: 0, targetStock: 0 })).toBe(false);
  });

  test('allows only own active S Store to submit new reports', () => {
    const store = { id: 's-1', is_s_store: true, s_store_status: 'active', owner_profile_id: 'owner-1' };

    expect(canStoreSubmitSReport({ id: 'owner-1', role: 'store_owner' }, store)).toBe(true);
    expect(canStoreSubmitSReport({ id: 'owner-2', role: 'store_owner' }, store)).toBe(false);
    expect(canStoreSubmitSReport({ id: 'owner-1', role: 'store_owner' }, { ...store, s_store_status: 'downgraded' })).toBe(false);
    expect(canStoreSubmitSReport({ id: 'manager-1', role: 'manager' }, store)).toBe(false);
  });

  test('locks submitted history for stores while admin can correct locked records', () => {
    const lockedRecord = { locked: true };

    expect(isSStoreHistoryLocked(lockedRecord, { role: 'store_owner' })).toBe(true);
    expect(isSStoreHistoryLocked(lockedRecord, { role: 'manager' })).toBe(true);
    expect(isSStoreHistoryLocked(lockedRecord, { role: 'admin' })).toBe(false);
    expect(isSStoreHistoryLocked({ locked: false }, { role: 'store_owner' })).toBe(false);
  });

  test('limits S Store status management to admin and assigned-region managers', () => {
    const store = { id: 's-1', is_s_store: true, s_store_status: 'active', city: 'Riyadh' };

    expect(canDowngradeSStore({ role: 'admin' }, store)).toBe(true);
    expect(canDowngradeSStore({ role: 'manager', region: 'Riyadh' }, store)).toBe(true);
    expect(canDowngradeSStore({ role: 'manager', region: 'Jeddah' }, store)).toBe(false);
    expect(canDowngradeSStore({ role: 'rep', region: 'Riyadh' }, store)).toBe(false);
    expect(canRestoreSStore({ role: 'manager', region: 'Riyadh' }, { ...store, s_store_status: 'downgraded' })).toBe(true);
  });

  test('keeps fan-facing labels simple and avoids exposing internal S/A/B/C complexity', () => {
    expect(getSStoreFanLabel({ level: 'S', is_s_store: true })).toBe('UWELL Brand Store');
    expect(getSStoreFanLabel({ level: 'A' })).toBe('Recommended Store');
    expect(getSStoreFanLabel({ level: 'B' })).toBe('Store');
  });
});
