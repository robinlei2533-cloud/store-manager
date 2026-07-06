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
