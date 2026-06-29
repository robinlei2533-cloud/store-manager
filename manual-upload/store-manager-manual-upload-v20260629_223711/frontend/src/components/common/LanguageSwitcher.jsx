import React, { useState } from 'react';
import useLanguageStore from '../../stores/languageStore';
import { LANGUAGES } from '../../utils/translations';

const LanguageSwitcher = ({ position, top = 16, right = 16, zIndex = 1000, inline = false, style, showCurrent = false }) => {
  const { lang, setLang, t } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((item) => item.code === lang) || LANGUAGES[0];
  const isRtl = lang === 'ar';

  return (
    <div
      style={{
        ...(style || {}),
        position: inline ? 'relative' : (position || 'fixed'),
        top: inline ? undefined : top,
        right: inline ? undefined : right,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isRtl ? 'flex-start' : 'flex-end',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title={t('settings_language')}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          width: showCurrent ? 'auto' : 40,
          height: 40,
          borderRadius: 10,
          padding: showCurrent ? '0 16px' : 0,
          gap: 6,
          border: open ? '1px solid rgba(255,215,0,0.4)' : '1px solid rgba(255,255,255,0.1)',
          background: open ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
          color: open ? '#FFD700' : 'rgba(255,255,255,0.6)',
          fontSize: 18,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .3s',
          backdropFilter: 'blur(12px)',
        }}
      >
        {current.flag} {showCurrent ? current.label : null}
      </button>
      {open && (
        <div
          role="menu"
          style={{
            marginTop: 8,
            minWidth: 170,
            background: 'rgba(20,20,30,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: 6,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {LANGUAGES.map((item) => {
            const selected = lang === item.code;
            return (
              <div
                key={item.code}
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => { setLang(item.code); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  color: selected ? '#FFD700' : 'rgba(255,255,255,0.6)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selected ? 'rgba(255,215,0,0.06)' : 'transparent',
                  transition: 'all .2s',
                }}
                onMouseEnter={(event) => { event.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(event) => { event.currentTarget.style.background = selected ? 'rgba(255,215,0,0.06)' : 'transparent'; }}
              >
                <span style={{ fontSize: 18 }}>{item.flag}</span>
                <span>{item.label}</span>
                {selected && <span style={{ marginLeft: 'auto', color: '#FFD700' }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
