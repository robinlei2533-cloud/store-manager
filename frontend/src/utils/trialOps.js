export const COUNTRY_CITY_OPTIONS = [
  {
    country: 'Saudi Arabia',
    cities: ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'Khobar', 'Taif', 'Tabuk'],
  },
  {
    country: 'United Arab Emirates',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  },
  {
    country: 'Kuwait',
    cities: ['Kuwait City', 'Hawalli', 'Salmiya'],
  },
  {
    country: 'Qatar',
    cities: ['Doha', 'Al Rayyan'],
  },
  {
    country: 'Bahrain',
    cities: ['Manama', 'Muharraq'],
  },
  {
    country: 'Oman',
    cities: ['Muscat', 'Salalah'],
  },
];

export const countryOptions = COUNTRY_CITY_OPTIONS.map((item) => ({
  value: item.country,
  label: item.country,
}));

export function getCitiesForCountry(country) {
  return COUNTRY_CITY_OPTIONS.find((item) => item.country === country)?.cities || [];
}

export function cityOptionsForCountry(country) {
  return getCitiesForCountry(country).map((city) => ({ value: city, label: city }));
}

export function validateCountryCity({ country, city }) {
  if (!country || !city) {
    return { valid: false, message: 'Please select country and city' };
  }
  if (!getCitiesForCountry(country).includes(city)) {
    return { valid: false, message: 'Please select a valid city for the selected country' };
  }
  return { valid: true, message: '' };
}

export function buildFanRegistrationRecords({ userId, name, phone = '', country, city }) {
  return {
    profile: {
      id: userId,
      role: 'fan',
      name,
      phone,
      avatar: '',
      country,
      city,
    },
    fan: {
      id: userId,
      store_id: null,
      user_id: userId,
      name,
      phone,
      country,
      city,
      level: 'bronze',
      points: 100,
      total_contribution: 0,
    },
  };
}

export function buildStoreRegistrationRecord({ name, contact = '', phone, country, city, address = '', ownerEmail = '', password = '' }) {
  return {
    name,
    contact,
    phone,
    owner_email: ownerEmail,
    owner_password_preview: password,
    country,
    city,
    address,
    level: 'C',
    chain_name: 'UWELL Store',
    chain_id: null,
    chain_store_count: 1,
    status: 'pending_review',
  };
}

export function filterStoresForFanCity(stores = [], fan = {}) {
  const activeStores = stores.filter((store) => store.status !== 'rejected' && store.status !== 'inactive');
  if (!fan?.city) return activeStores;
  const cityStores = activeStores.filter((store) => store.city === fan.city);
  return cityStores.length ? cityStores : activeStores;
}

export const REFERRAL_INVITER_POINTS = 30;
export const REFERRAL_NEW_FAN_POINTS = 30;

export function buildReferralCode(fanId = '') {
  return `UWELL-${String(fanId).slice(-8).toUpperCase()}`;
}

export function normalizeReferralCode(value = '') {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) return '';
  return raw.startsWith('UWELL-') ? raw : `UWELL-${raw}`;
}

export function findFanByReferralCode(fans = [], referralCode = '') {
  const normalized = normalizeReferralCode(referralCode);
  if (!normalized) return null;
  return fans.find((fan) => buildReferralCode(fan.id) === normalized) || null;
}

function addLocalReferralPoints(db, fanId, points, description) {
  db.insert('fan_points_log', {
    fan_id: fanId,
    points,
    type: 'earn',
    source: 'Referral',
    description,
  });
  const fan = db.findById('fans', fanId);
  if (!fan) return null;
  const newPoints = (fan.points || 0) + points;
  const rules = db.all('fan_level_rules').sort((a, b) => b.min_points - a.min_points);
  const newLevel = rules.find((rule) => newPoints >= rule.min_points)?.level || fan.level;
  return db.update('fans', fanId, {
    points: newPoints,
    total_contribution: (fan.total_contribution || 0) + points,
    level: newLevel,
  });
}

export function processLocalReferralSignup({ localDb, referralCode, newFanId }) {
  const normalized = normalizeReferralCode(referralCode);
  if (!localDb || !normalized || !newFanId) return { applied: false, reason: 'missing_referral' };

  return localDb.transaction((db) => {
    const inviter = findFanByReferralCode(db.all('fans'), normalized);
    if (!inviter) return { applied: false, reason: 'inviter_not_found' };
    if (inviter.id === newFanId) return { applied: false, reason: 'self_referral' };

    const existing = db.find('mall_redemptions', (record) => (
      record.source === 'invite'
      && record.fan_id === inviter.id
      && record.referred_fan_id === newFanId
    ));
    if (existing.length) return { applied: false, reason: 'already_applied' };

    db.insert('mall_redemptions', {
      fan_id: inviter.id,
      source: 'invite',
      referred_fan_id: newFanId,
      referral_code: normalized,
      status: 'completed',
      points: REFERRAL_INVITER_POINTS,
    });
    addLocalReferralPoints(db, inviter.id, REFERRAL_INVITER_POINTS, `Friend registered with ${normalized}`);
    addLocalReferralPoints(db, newFanId, REFERRAL_NEW_FAN_POINTS, `Welcome referral bonus from ${normalized}`);
    return { applied: true, inviterId: inviter.id, newFanId };
  });
}
