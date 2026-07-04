import React, { useState } from 'react';
import useLanguageStore from '../../stores/languageStore';
import { LANGUAGES } from '../../utils/translations';

const LanguageSwitcher = ({
  position,
  top = 16,
  right = 16,
  zIndex = 1000,
  inline = false,
  style,
  className,
  showCurrent = false,
  sourceOnly = false,
  menuMinWidth = 170,
  buttonMinWidth,
  anchor,
  tone = 'dark',
  labelOverride,
  hideFlag = false,
}) => {
  const { lang, setLang, t } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((item) => item.code === lang) || LANGUAGES[0];
  const isRtl = lang === 'ar';
  const isLight = tone === 'light';
  const alignItems = anchor === 'end'
    ? 'flex-end'
    : anchor === 'start'
      ? 'flex-start'
      : (isRtl ? 'flex-start' : 'flex-end');

  const colors = isLight
    ? {
        buttonBorder: 'rgba(82,62,24,0.14)',
        buttonBg: 'rgba(255,255,255,0.82)',
        buttonText: '#181512',
        menuBg: 'rgba(255,255,255,0.96)',
        menuBorder: 'rgba(82,62,24,0.14)',
        menuShadow: '0 18px 48px rgba(60,45,20,0.16)',
        itemText: '#181512',
        itemHover: 'rgba(185,137,22,0.08)',
      }
    : {
        buttonBorder: 'rgba(255,255,255,0.1)',
        buttonBg: 'rgba(255,255,255,0.04)',
        buttonText: 'rgba(255,255,255,0.6)',
        menuBg: 'rgba(20,20,30,0.95)',
        menuBorder: 'rgba(255,255,255,0.08)',
        menuShadow: '0 20px 60px rgba(0,0,0,0.5)',
        itemText: 'rgba(255,255,255,0.6)',
        itemHover: 'rgba(255,255,255,0.06)',
      };

  return (
    <div
      className={className}
      style={{
        ...(style || {}),
        position: inline ? 'relative' : (position || 'fixed'),
        top: inline ? undefined : top,
        right: inline ? undefined : right,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        alignItems,
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
          minWidth: buttonMinWidth,
          height: 40,
          borderRadius: 10,
          padding: showCurrent ? '0 16px' : 0,
          gap: 6,
          border: open ? '1px solid rgba(185,137,22,0.45)' : `1px solid ${colors.buttonBorder}`,
          background: open ? 'rgba(185,137,22,0.12)' : colors.buttonBg,
          color: open ? '#B98916' : colors.buttonText,
          fontSize: 18,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .3s',
          backdropFilter: 'blur(12px)',
        }}
      >
        {!sourceOnly && !hideFlag ? current.flag : null}
        {showCurrent ? (labelOverride || current.label) : null}
      </button>
      {open && (
        <div
          role="menu"
          style={{
            marginTop: 8,
            minWidth: menuMinWidth,
            background: colors.menuBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.menuBorder}`,
            borderRadius: 14,
            padding: 6,
            boxShadow: colors.menuShadow,
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
                  color: selected ? '#B98916' : colors.itemText,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selected ? 'rgba(185,137,22,0.10)' : 'transparent',
                  transition: 'all .2s',
                }}
                onMouseEnter={(event) => { event.currentTarget.style.background = colors.itemHover; }}
                onMouseLeave={(event) => { event.currentTarget.style.background = selected ? 'rgba(185,137,22,0.10)' : 'transparent'; }}
              >
                {!sourceOnly && !hideFlag && <span style={{ fontSize: 18 }}>{item.flag}</span>}
                <span>{item.label}</span>
                {selected && <span style={{ marginLeft: 'auto', color: '#B98916' }}>&#10003;</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
