import { create } from 'zustand';
import { TRANSLATIONS, LANGUAGES } from '../utils/translations';

const getInitialLang = () => {
  try {
    const saved = localStorage.getItem('uwell_lang');
    if (saved && LANGUAGES.find(l => l.code === saved)) return saved;
  } catch(e) {}
  return 'zh'; // Default to Chinese
};

const useLanguageStore = create((set, get) => ({
  lang: getInitialLang(),
  setLang: (code) => {
    try { localStorage.setItem('uwell_lang', code); } catch(e) {}
    set({ lang: code });
  },
  t: (key) => {
    const { lang } = get();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.zh;
    return dict[key] || TRANSLATIONS.zh[key] || key;
  },
}));

export default useLanguageStore;
