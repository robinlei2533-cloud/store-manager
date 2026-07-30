import { canEditLockedHistory, isInAssignedRegion } from './uwellRoleAccess';

const ACTIVE_S_STORE_STATUS = 'active';

function ownsStore(profile, store = {}) {
  if (!profile?.id) return false;
  return ['owner_profile_id', 'store_owner_id', 'owner_user_id'].some((key) => store[key] === profile.id);
}

export function isLowStock({ currentStock, targetStock }) {
  const current = Number(currentStock);
  const target = Number(targetStock);
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return false;
  return current <= target / 3;
}

export function isActiveSStore(store = {}) {
  return Boolean(store.is_s_store || store.level === 'S') && (store.s_store_status || ACTIVE_S_STORE_STATUS) === ACTIVE_S_STORE_STATUS;
}

export function canStoreSubmitSReport(profile, store = {}) {
  if (profile?.role !== 'store_owner') return false;
  return isActiveSStore(store) && ownsStore(profile, store);
}

export function isSStoreHistoryLocked(record = {}, profile = {}) {
  if (!record.locked) return false;
  return !canEditLockedHistory(profile);
}

export function canDowngradeSStore(profile, store = {}) {
  if (!store?.is_s_store && store?.level !== 'S') return false;
  if (profile?.role === 'admin') return true;
  if (profile?.role !== 'manager') return false;
  return isInAssignedRegion(profile, store);
}

export function canRestoreSStore(profile, store = {}) {
  if ((store?.s_store_status || '').toLowerCase() !== 'downgraded') return false;
  if (profile?.role === 'admin') return true;
  if (profile?.role !== 'manager') return false;
  return isInAssignedRegion(profile, store);
}

export function getSStoreFanLabel(store = {}) {
  if (store.is_s_store || store.level === 'S') return 'UWELL Brand Store';
  if (store.level === 'A') return 'Recommended Store';
  return 'Store';
}
