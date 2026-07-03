import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import useLanguageStore from '../../stores/languageStore';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import seedData from '../../services/db/seedData';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import BioDigitalBackground from '../../components/effects/BioDigitalBackground';
import CaliburnHeroCanvas from '../../components/effects/CaliburnHeroCanvas';
import caliburnBubble1 from '../../assets/products/caliburn-bubble-1.png';
import caliburnBubble2 from '../../assets/products/caliburn-bubble-2.png';
import caliburnBubble3 from '../../assets/products/caliburn-bubble-3.png';
import caliburnBubble4 from '../../assets/products/caliburn-bubble-4.png';
import caliburnBubble5 from '../../assets/products/caliburn-bubble-5.png';
import caliburnBubble6 from '../../assets/products/caliburn-bubble-6.png';
import { message } from 'antd';
import { GlobalOutlined, LockOutlined, SettingOutlined, ShopOutlined } from '@ant-design/icons';

const PD = [
  { n: 'CALIBURN G4 PRO', c: '#f0c65a', i: caliburnBubble1 },
  { n: 'CALIBURN WHITE', c: '#d8d8d4', i: caliburnBubble2 },
  { n: 'CALIBURN G4 PRO SILVER', c: '#b8b8b8', i: caliburnBubble3 },
  { n: 'CALIBURN AIR ORANGE', c: '#ff7a21', i: caliburnBubble4 },
  { n: 'CALIBURN G5', c: '#b9a1e8', i: caliburnBubble5 },
  { n: 'CALIBURN ART EDITION', c: '#e5b0bb', i: caliburnBubble6 },
];

// ============ Main Component ============
const FanEntryPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const { signInLocal } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState("login");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    const userEmail = email || 'fan@UWELLl.com';
    try {
      await signInLocal(userEmail, 'fan');
    } catch (_e) {
      // Local fan fallback below keeps the demo entry usable.
    }
    if (localDb.needsInit()) { localDb.init(seedData); }
    const fans = localDb.all('fans');
    if (fans.length > 0) {
      localStorage.setItem('store_manager_current_user', fans[0].id);
      localStorage.setItem('fan_logged_in', 'true');
    }
    navigate('/fan-center', { replace: true });
  }, [email, navigate, signInLocal]);

  const handleRegister = useCallback(async () => {
    if (!regName || !regEmail || !regPassword) {
      message.warning("Please fill in name, email and password");
      return;
    }
    setLoading(true);
    try {
      if (localDb.needsInit()) { localDb.init(seedData); }
      const profile = localDb.insert("profiles", { role: "fan", name: regName, phone: regPhone || "", avatar: "" });
      localDb.insert("fans", { store_id: null, user_id: profile.id, level: "bronze", points: 100, total_contribution: 0 });
      localDb.insert("auth", { id: profile.id, email: regEmail, password: regPassword, role: "fan" });
      localStorage.setItem("store_manager_current_user", profile.id);
      localStorage.setItem("fan_logged_in", "true");
      try {
        await signInLocal(regEmail, regPassword);
      } catch (_e) {
        // Registration already wrote local demo records; continue into fan center.
      }
      setLoading(false);
      message.success(t('fan_entry_register_success'));
      navigate("/fan-center", { replace: true });
    } catch (_err) {
      setLoading(false);
      message.error("Registration failed");
    }
  }, [regName, regEmail, regPassword, regPhone, navigate, signInLocal, t]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleLogin();
  }, [handleLogin]);


  const authForm = (
    <div className="fe-login-form fe-form-card">
      <div className="fe-form-accent" />
      <div className="fe-form-title">
        <h2>{mode === 'login' ? t('fan_entry_login_title') : t('fan_entry_register_title')}</h2>
        <p>{mode === 'login' ? t('fan_entry_login_subtitle') : t('fan_entry_fill_fields')}</p>
      </div>
      {mode === 'login' && (
        <>
          <div className="fe-input-group">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={t('fan_entry_placeholder_email')} autoComplete="email"
              className="fe-input-dark"
            />
          </div>
          <div className="fe-input-group">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={t('fan_entry_placeholder_password')} autoComplete="current-password"
              className="fe-input-dark"
            />
          </div>
          <div className="fe-form-row">
            <label className="fe-form-label">
              <input type="checkbox" defaultChecked /> {t('fan_entry_remember')}
            </label>
            <a href="#" className="fe-form-link">{t('fan_entry_forgot')}</a>
          </div>
          <button onClick={handleLogin} className="fe-btn-primary">{t('fan_entry_signin_btn')}</button>
          <div className="fe-form-toggle">
            <button type="button" onClick={() => setMode('register')} className="fe-form-link fe-link-button">
              {t('fan_entry_no_account')} <span className="fe-btn-secondary">{t('fan_entry_register_now')}</span>
            </button>
          </div>
        </>
      )}
      {mode === 'register' && (
        <>
          <div className="fe-input-group">
            <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Name *" autoComplete="name" className="fe-input-dark" />
          </div>
          <div className="fe-input-group">
            <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email *" autoComplete="email" className="fe-input-dark" />
          </div>
          <div className="fe-input-group">
            <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Password *" autoComplete="new-password" className="fe-input-dark" />
          </div>
          <div className="fe-input-group">
            <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Phone (optional)" autoComplete="tel" className="fe-input-dark" />
          </div>
          <button onClick={handleRegister} disabled={loading} className="fe-btn-primary">{loading ? t('fan_entry_registering') : t('fan_entry_register_btn')}</button>
          <div className="fe-form-toggle">
            <button type="button" onClick={() => setMode('login')} className="fe-form-link fe-link-button">
              {t('fan_entry_have_account')} <span className="fe-btn-secondary">{t('fan_entry_sign_in')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="fe-page fe-page-luxury">
      <header className="fe-luxury-header">
        <div className="fe-luxury-brand">
          <span>UWELL</span>
          <small>Fans Club</small>
        </div>
        <div className="fe-header-actions">
          <div className="fe-language-slot">
            <LanguageSwitcher inline={true} zIndex={360} tone="light" showCurrent sourceOnly buttonMinWidth={96} labelOverride="Language" />
          </div>
          <div className="fe-settings-slot">
            <button
              onClick={() => { setSettingsOpen(!settingsOpen); }}
              className={`fe-settings-trigger fe-settings-trigger-light${settingsOpen ? " is-open" : ""}`}
              aria-label="Open settings"
            ><SettingOutlined /></button>
            {settingsOpen && (
              <div className="fe-settings-panel fe-settings-panel-entry fe-settings-panel-light">
                <div onClick={() => window.location.href = '/store-app.html#/store-login'} className="fe-settings-item">
                  <ShopOutlined className="fe-settings-icon" /> {t('settings_store')}
                </div>
                <div className="fe-settings-divider" />
                <div onClick={() => window.location.href='/index.html#/admin'} className="fe-settings-item">
                  <LockOutlined className="fe-settings-icon" /> {t('settings_admin')}
                </div>
                <div className="fe-settings-divider" />
                <a href="https://www.myuwell.com" target="_blank" rel="noopener noreferrer" className="fe-settings-item">
                  <GlobalOutlined className="fe-settings-icon" /> {t('settings_website')}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="fe-luxury-shell">
        <section className="fe-luxury-hero" aria-label="Uwell Fans Club">
          <BioDigitalBackground />
          <CaliburnHeroCanvas products={PD} />
          <div className="fe-luxury-edge-lines" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <div className="fe-luxury-copy">
            <h1>Uwell Fans Club</h1>
            <p>I Wish You Well</p>
          </div>
          <div className="fe-luxury-join">
            <p>Join UWELL fans, check activities, scan for points, and redeem member rewards.</p>
            <button type="button" className="fe-luxury-cta" onClick={() => setAuthOpen(true)}>
              Join / Sign in <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>

      {authOpen && (
        <div className="fe-auth-modal-backdrop" onClick={() => setAuthOpen(false)}>
          <div className="fe-auth-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="fe-modal-close" onClick={() => setAuthOpen(false)} aria-label="Close">×</button>
            {authForm}
          </div>
        </div>
      )}
    </div>
  );

};

export default FanEntryPage;
