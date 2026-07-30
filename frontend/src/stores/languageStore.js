import { create } from 'zustand';
import { TRANSLATIONS } from '../utils/translations';

const PORTAL_LANGUAGE_CONFIG = {
  admin: { defaultLang: 'zh', allowed: ['zh', 'en'] },
  fan: { defaultLang: 'en', allowed: ['en', 'ar'] },
  store: { defaultLang: 'en', allowed: ['en', 'ar'] },
};

const getPortalConfig = (portal) => PORTAL_LANGUAGE_CONFIG[portal] || PORTAL_LANGUAGE_CONFIG.fan;

const getPortalStorageKey = (portal) => `uwell_lang_${portal}`;

const getInitialPortal = () => {
  try {
    const path = `${window.location.pathname || ''}${window.location.hash || ''}`;
    if (path.includes('store-app.html') || path.includes('store-login') || path.includes('store-owner')) return 'store';
    if (path.includes('fan-app.html') || path.includes('fan-entry') || path.includes('fan-center')) return 'fan';
  } catch (_e) {
    return 'fan';
  }
  return 'admin';
};

const applyDocumentLanguage = (code) => {
  try {
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    if (document.body) {
      document.body.lang = code;
      document.body.dir = code === 'ar' ? 'rtl' : 'ltr';
      document.body.dataset.language = code;
      document.body.dataset.direction = code === 'ar' ? 'rtl' : 'ltr';
    }
  } catch (_e) {
    return;
  }
};

const getInitialLang = (portal = getInitialPortal()) => {
  const config = getPortalConfig(portal);
  try {
    const saved = localStorage.getItem(getPortalStorageKey(portal));
    if (saved && config.allowed.includes(saved)) return saved;

    const legacySaved = localStorage.getItem('uwell_lang');
    if ((portal === 'fan' || portal === 'store') && legacySaved && config.allowed.includes(legacySaved)) return legacySaved;
  } catch (_e) {
    // Ignore storage access issues and fall back to the portal default language.
  }

  return config.defaultLang;
};

const initialPortal = getInitialPortal();
const initialLang = getInitialLang(initialPortal);
applyDocumentLanguage(initialLang);

const useLanguageStore = create((set, get) => ({
  activePortal: initialPortal,
  lang: initialLang,
  activatePortalLanguage: (portal) => {
    const nextLang = getInitialLang(portal);
    applyDocumentLanguage(nextLang);
    set({ activePortal: portal, lang: nextLang });
  },
  setLang: (code, portal) => {
    const activePortal = portal || get().activePortal;
    const config = getPortalConfig(activePortal);
    if (!config.allowed.includes(code)) return;
    try {
      localStorage.setItem(getPortalStorageKey(activePortal), code);
    } catch (_e) {
      // Language still changes in memory when persistence is unavailable.
    }
    applyDocumentLanguage(code);
    set({ activePortal, lang: code });
  },
  t: (key, fallback) => {
    const { activePortal, lang } = get();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    const fallbackLang = getPortalConfig(activePortal).defaultLang;
    const fallbackDict = TRANSLATIONS[fallbackLang] || TRANSLATIONS.en;
    return dict[key] || fallbackDict[key] || fallback || key;
  },
}));

export default useLanguageStore;
