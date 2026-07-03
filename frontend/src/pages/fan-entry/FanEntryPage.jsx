import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import useLanguageStore from '../../stores/languageStore';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import seedData from '../../services/db/seedData';
import { supabase } from '../../services/supabase';
import { isLocal } from '../../services/api/helpers';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import BioDigitalBackground from '../../components/effects/BioDigitalBackground';
import CaliburnHeroCanvas from '../../components/effects/CaliburnHeroCanvas';
import {
  buildFanRegistrationRecords,
  cityOptionsForCountry,
  countryOptions,
  validateCountryCity,
} from '../../utils/trialOps';
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

const memberBenefits = [
  'Join in under one minute',
  'Earn your first 100 points',
  'Scan products, join campaigns, and redeem rewards',
];

// ============ Main Component ============
const FanEntryPage = () => {
  const navigate = useNavigate();
  const { t, setLang } = useLanguageStore();
  const { setProfile, setUser, signIn, signInLocal } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState("login");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCountry, setRegCountry] = useState("");
  const [regCity, setRegCity] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const ensureEnglishFirst = useCallback(() => {
    setLang('en');
  }, [setLang]);

  useEffect(() => {
    ensureEnglishFirst();
  }, [ensureEnglishFirst]);

  const handleLogin = useCallback(async () => {
    const userEmail = email || 'fan@UWELLl.com';
    let authUserId = null;
    try {
      const result = await signIn(userEmail, password || 'fan');
      authUserId = result?.user?.id || null;
    } catch (_e) {
      try {
        const result = await signInLocal(userEmail, 'fan');
        authUserId = result?.user?.id || null;
      } catch {
        message.error('Login failed. Please check your email and password.');
        return;
      }
    }
    if (!isLocal() && authUserId) {
      localStorage.setItem('store_manager_current_user', authUserId);
      localStorage.setItem('fan_logged_in', 'true');
      navigate('/fan-center', { replace: true });
      return;
    }
    if (localDb.needsInit()) { localDb.init(seedData); }
    const fans = localDb.all('fans');
    if (fans.length > 0) {
      localStorage.setItem('store_manager_current_user', fans[0].id);
      localStorage.setItem('fan_logged_in', 'true');
    }
    navigate('/fan-center', { replace: true });
  }, [email, navigate, password, signIn, signInLocal]);

  const handleRegister = useCallback(async () => {
    if (!regName || !regEmail || !regPassword) {
      message.warning("Please enter your name, email, and password.");
      return;
    }
    const cityValidation = validateCountryCity({ country: regCountry, city: regCity });
    if (!cityValidation.valid) {
      message.warning(cityValidation.message);
      return;
    }
    if (!ageConfirmed || !termsAccepted) {
      message.warning("Please confirm your age and accept the privacy notice and member terms.");
      return;
    }
    setLoading(true);
    try {
      const registerLocalFan = async (remoteError = null) => {
        if (localDb.needsInit()) { localDb.init(seedData); }
        const localUserId = localDb.uuid();
        const records = buildFanRegistrationRecords({
          userId: localUserId,
          name: regName,
          phone: regPhone,
          country: regCountry,
          city: regCity,
        });
        localDb.insert("profiles", records.profile);
        localDb.insert("fans", records.fan);
        localDb.insert("auth", { id: localUserId, email: regEmail, password: regPassword, role: "fan" });
        localStorage.setItem("store_manager_current_user", localUserId);
        localStorage.setItem("fan_logged_in", "true");
        setUser({ id: localUserId, email: regEmail });
        setProfile(records.profile);
        if (remoteError) {
          message.info("Your trial member profile has been created. Full data sync will be completed in the admin system.");
        }
      };

      if (isLocal()) {
        await registerLocalFan();
      } else {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: regEmail,
            password: regPassword,
            options: {
              data: { name: regName, phone: regPhone || "", role: "fan", country: regCountry, city: regCity },
            },
          });
          if (error) throw error;
          if (!data.user?.id) throw new Error("Please confirm your email before signing in.");
          const records = buildFanRegistrationRecords({
            userId: data.user.id,
            name: regName,
            phone: regPhone,
            country: regCountry,
            city: regCity,
          });
          const { error: profileError } = await supabase.from("profiles").upsert(records.profile);
          if (profileError) throw profileError;
          const { error: fanError } = await supabase.from("fans").insert(records.fan);
          if (fanError) throw fanError;
          localStorage.setItem("store_manager_current_user", data.user.id);
          localStorage.setItem("fan_logged_in", "true");
          setUser({ id: data.user.id, email: regEmail });
          setProfile(records.profile);
        } catch (remoteError) {
          await registerLocalFan(remoteError);
        }
      }
      setLoading(false);
      message.success('Welcome to UWELL Fans Club. Your first 100 points are ready.');
      navigate("/fan-center", { replace: true });
    } catch (err) {
      setLoading(false);
      message.error(err?.message || "Registration failed. Please try again.");
    }
  }, [ageConfirmed, navigate, regCity, regCountry, regEmail, regName, regPassword, regPhone, setProfile, setUser, t, termsAccepted]);

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
      <div className="fe-member-benefits" aria-label="Member benefits">
        {memberBenefits.map((benefit) => (
          <span key={benefit}>{benefit}</span>
        ))}
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
          <div className="fe-input-group">
            <select
              value={regCountry}
              onChange={e => { setRegCountry(e.target.value); setRegCity(""); }}
              className="fe-input-dark fe-select-dark"
              aria-label="Country"
            >
              <option value="">Country *</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="fe-input-group">
            <select
              value={regCity}
              onChange={e => setRegCity(e.target.value)}
              className="fe-input-dark fe-select-dark"
              aria-label="City"
              disabled={!regCountry}
            >
              <option value="">City *</option>
              {cityOptionsForCountry(regCountry).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <label className="fe-form-label fe-consent-line">
            <input type="checkbox" checked={ageConfirmed} onChange={e => setAgeConfirmed(e.target.checked)} />
            I confirm I am of legal age in my region.
          </label>
          <label className="fe-form-label fe-consent-line">
            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} />
            I agree to the privacy notice and member terms.
          </label>
          <p className="fe-form-helper">You will enter your member center after sign-up.</p>
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
            <div className="fe-luxury-benefit-row">
              <span>100 welcome points</span>
              <span>Verified store map</span>
              <span>Member rewards</span>
            </div>
            <button type="button" className="fe-luxury-cta" onClick={() => setAuthOpen(true)}>
              Join / Sign in <span aria-hidden="true">-&gt;</span>
            </button>
          </div>
        </section>
      </main>

      {authOpen && (
        <div className="fe-auth-modal-backdrop" onClick={() => setAuthOpen(false)}>
          <div className="fe-auth-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="fe-modal-close" onClick={() => setAuthOpen(false)} aria-label="Close">x</button>
            {authForm}
          </div>
        </div>
      )}
    </div>
  );

};

export default FanEntryPage;
