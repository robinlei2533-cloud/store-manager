import React, { useState } from 'react';
import useLanguageStore from '../../stores/languageStore';

const LANGUAGES = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

const LanguageSwitcher = ({ position, top = 16, right = 16, zIndex = 1000, inline = false }) => {
  const { lang, setLang, t } = useLanguageStore();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div style={{ position: inline ? 'relative' : (position || 'fixed'), top: inline ? undefined : top, right: inline ? undefined : right, zIndex, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <button
        onClick={() => setOpen(!open)}
        title={t('settings_language')}
        style={{
          width: 40, height: 40, borderRadius: 10,
          border: open ? '1px solid rgba(255,215,0,0.4)' : '1px solid rgba(255,255,255,0.1)',
          background: open ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
          color: open ? '#FFD700' : 'rgba(255,255,255,0.6)',
          fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .3s', backdropFilter: 'blur(12px)',
        }}
        onMouseEnter={e => { if (!open) e.target.style.background = 'rgba(255,255,255,0.08)'; }}
        onMouseLeave={e => { if (!open) e.target.style.background = 'rgba(255,255,255,0.04)'; }}
      >
        {current.flag}
      </button>
      {open && (
        <div style={{
          marginTop: 8, minWidth: 160,
          background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 6,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {LANGUAGES.map(item => (
            <div
              key={item.code}
              onClick={() => { setLang(item.code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 10,
                color: lang === item.code ? '#FFD700' : 'rgba(255,255,255,0.6)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: lang === item.code ? 'rgba(255,215,0,0.06)' : 'transparent',
                transition: 'all .2s',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => { e.target.style.background = lang === item.code ? 'rgba(255,215,0,0.06)' : 'transparent'; }}
            >
              <span style={{ fontSize: 18 }}>{item.flag}</span>
              <span>{item.label}</span>
              {lang === item.code && <span style={{ marginLeft: 'auto', color: '#FFD700' }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
