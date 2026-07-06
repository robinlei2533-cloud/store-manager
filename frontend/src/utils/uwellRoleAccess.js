const COMPANY_SCOPE_ROLES = ['admin', 'manager'];
const FIELD_REP_KEYS = ['rep_id', 'owner_id', 'responsible_rep_id', 'manager_id'];
const DEMO_REP_IDS = ['u-rep1', 'u-rep2', 'u-rep3'];

export function canViewCompanyScope(profile) {
  return COMPANY_SCOPE_ROLES.includes(profile?.role);
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
  if (!profile?.id) return [];
  return stores
    .filter((store) => getStoreRepId(store, stores) === profile.id)
    .map((store) => store.id);
}

export function isAssignedStore(profile, store, stores = []) {
  if (canViewCompanyScope(profile)) return true;
  return Boolean(store?.id && getAssignedStoreIds(profile, stores).includes(store.id));
}

export function filterByAssignedStores(profile, records = [], stores = [], getStoreId = (record) => record.store_id) {
  if (canViewCompanyScope(profile)) return records;
  const assignedStoreIds = new Set(getAssignedStoreIds(profile, stores));
  return records.filter((record) => assignedStoreIds.has(getStoreId(record)));
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
