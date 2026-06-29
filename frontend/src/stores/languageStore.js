import { create } from 'zustand';
import { TRANSLATIONS, LANGUAGES } from '../utils/translations';

const applyDocumentLanguage = (code) => {
  try {
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  } catch(e) {}
};

const getInitialLang = () => {
  try {
    const saved = localStorage.getItem('uwell_lang');
    if (saved && LANGUAGES.find((item) => item.code === saved)) return saved;
  } catch(e) {}

  try {
    const browserLang = (navigator.language || '').substring(0, 2);
    if (browserLang === 'zh' || browserLang === 'ar') return browserLang;
  } catch(e) {}

  return 'zh';
};

const initialLang = getInitialLang();
applyDocumentLanguage(initialLang);

const useLanguageStore = create((set, get) => ({
  lang: initialLang,
  setLang: (code) => {
    if (!LANGUAGES.find((item) => item.code === code)) return;
    try { localStorage.setItem('uwell_lang', code); } catch(e) {}
    applyDocumentLanguage(code);
    set({ lang: code });
  },
  t: (key, fallback) => {
    const { lang } = get();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.zh;
    return dict[key] || TRANSLATIONS.en[key] || TRANSLATIONS.zh[key] || fallback || key;
  },
}));

export default useLanguageStore;
