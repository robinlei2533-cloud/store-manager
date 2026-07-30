const OPS_SCOPE_ROLES = ['admin', 'manager'];
const FIELD_REP_KEYS = ['rep_id', 'owner_id', 'responsible_rep_id', 'manager_id'];
const STORE_OWNER_KEYS = ['owner_profile_id', 'store_owner_id', 'owner_user_id'];
const DEMO_REP_IDS = ['u-rep1', 'u-rep2', 'u-rep3'];
const QUALIFIED_PICKUP_STORE_LEVELS = ['S', 'A'];

export function canViewCompanyScope(profile) {
  return profile?.role === 'admin';
}

export function canViewOpsScope(profile) {
  return OPS_SCOPE_ROLES.includes(profile?.role);
}

export function canManageGlobalRules(profile) {
  return profile?.role === 'admin';
}

export function canManageRewardOps(profile) {
  return canViewOpsScope(profile);
}

export function canAssignRewardPickup(profile) {
  return canViewOpsScope(profile);
}

export function canApproveReview(profile) {
  return canViewOpsScope(profile);
}

export function canManageRiskDecision(profile) {
  return canViewOpsScope(profile);
}

export function canApproveMaterialRequest(profile) {
  return canViewOpsScope(profile);
}

export function canSubmitMaterialRequest(profile) {
  return ['admin', 'manager', 'rep', 'store_owner'].includes(profile?.role);
}

export function canUpdateMaterialStock(profile) {
  return canViewCompanyScope(profile);
}

export function canSubmitVisit(profile) {
  return ['admin', 'manager', 'rep'].includes(profile?.role);
}

export function canSubmitStoreReport(profile) {
  return ['admin', 'manager', 'rep', 'store_owner'].includes(profile?.role);
}

export function canConfirmRewardPickup(profile, store = {}) {
  if (canViewOpsScope(profile)) return true;
  if (profile?.role !== 'store_owner') return false;
  const level = store?.level || profile?.store_level || profile?.level;
  return QUALIFIED_PICKUP_STORE_LEVELS.includes(level);
}

export function canEditLockedHistory(profile) {
  return canViewCompanyScope(profile);
}

export function getAssignedRegion(profile) {
  return profile?.region || profile?.city || profile?.assigned_region || null;
}

export function isInAssignedRegion(profile, item) {
  if (canViewCompanyScope(profile)) return true;
  const assignedRegion = getAssignedRegion(profile);
  if (!assignedRegion) return false;
  const itemRegion = item?.region || item?.city || item?.warehouse_region || item?.warehouse || null;
  return itemRegion === assignedRegion || String(itemRegion || '').includes(assignedRegion);
}

export function getStoreRepId(store, stores = []) {
  const explicitRep = FIELD_REP_KEYS.map((key) => store?.[key]).find(Boolean);
  if (explicitRep) return explicitRep;

  const unassignedStores = stores.filter((item) => !FIELD_REP_KEYS.some((key) => item?.[key]));
  const fallbackIndex = unassignedStores.findIndex((item) => item.id === store?.id);
  if (fallbackIndex < 0) return null;
  return DEMO_REP_IDS[fallbackIndex % DEMO_REP_IDS.length];
}

export function getAssignedStoreIds(profile, stores = []) {
  if (canViewCompanyScope(profile)) return stores.map((store) => store.id);
  if (profile?.role === 'manager') {
    return stores
      .filter((store) => isInAssignedRegion(profile, store))
      .map((store) => store.id);
  }
  if (profile?.role === 'store_owner') {
    return stores
      .filter((store) => STORE_OWNER_KEYS.some((key) => store?.[key] === profile.id))
      .map((store) => store.id);
  }
  if (profile?.role === 'fan') {
    if (!profile.store_id) return [];
    return stores.some((store) => store.id === profile.store_id) ? [profile.store_id] : [];
  }
  if (profile?.role !== 'rep') return [];
  if (!profile?.id) return [];
  return stores
    .filter((store) => getStoreRepId(store, stores) === profile.id)
    .map((store) => store.id);
}

export function isAssignedStore(profile, store, stores = []) {
  if (canViewCompanyScope(profile)) return true;
  return Boolean(store?.id && getAssignedStoreIds(profile, stores).includes(store.id));
}

export function canAccessStore(profile, store, stores = []) {
  if (!profile || !store?.id) return false;
  return isAssignedStore(profile, store, stores);
}

export function canAccessFan(profile, fan, stores = []) {
  if (!profile || !fan?.id) return false;
  if (canViewCompanyScope(profile)) return true;
  if (profile.role === 'fan') {
    return fan.user_id === profile.id || fan.id === profile.fan_id || fan.id === profile.id;
  }
  if (!fan.store_id) return false;
  const fanStore = stores.find((store) => store.id === fan.store_id);
  return Boolean(fanStore && canAccessStore(profile, fanStore, stores));
}

export function canAccessVisit(profile, visit, stores = []) {
  if (!profile || !visit?.id) return false;
  if (canViewCompanyScope(profile)) return true;
  if (profile.role === 'rep' && visit.rep_id === profile.id) return true;
  if (!visit.store_id) return false;
  const visitStore = stores.find((store) => store.id === visit.store_id);
  return Boolean(visitStore && canAccessStore(profile, visitStore, stores));
}

export function filterByAssignedStores(profile, records = [], stores = [], getStoreId = (record) => record.store_id) {
  if (canViewCompanyScope(profile)) return records;
  const assignedStoreIds = new Set(getAssignedStoreIds(profile, stores));
  return records.filter((record) => assignedStoreIds.has(getStoreId(record)));
}

export function filterFansByScope(profile, fans = [], stores = []) {
  if (canViewCompanyScope(profile)) return fans;
  return fans.filter((fan) => canAccessFan(profile, fan, stores));
}

export function getScopedStoreRows({ profile, stores = [], localStores = [], filters = {} }) {
  let data = stores.length ? stores : localStores;
  const storeScope = stores.length ? stores : localStores;

  if (!canViewCompanyScope(profile)) {
    data = filterByAssignedStores(profile, data, storeScope, (store) => store.id);
  }

  if (filters.level) data = data.filter((store) => store.level === filters.level);
  if (filters.country) data = data.filter((store) => store.country === filters.country);
  if (filters.city) data = data.filter((store) => store.city === filters.city);
  if (filters.status) data = data.filter((store) => store.status === filters.status);
  if (filters.search) {
    const search = filters.search.toLowerCase();
    data = data.filter((store) => store.name?.toLowerCase().includes(search));
  }

  return data;
}

export function getAssignableReps(profiles = []) {
  return profiles.filter((profile) => profile.role === 'rep');
}
