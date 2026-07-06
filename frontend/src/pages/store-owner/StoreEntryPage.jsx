import React, { useCallback, useEffect, useState } from "react";
import { App, Button, Input } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import localDb from "../../services/db/localDb";
import seedData from "../../services/db/seedData";
import { createStore, getStores } from "../../services/api";
import useLanguageStore from "../../stores/languageStore";
import useAuthStore from "../../stores/authStore";
import {
  buildStoreRegistrationRecord,
  cityOptionsForCountry,
  countryOptions,
  validateCountryCity,
} from "../../utils/trialOps";

const StoreEntryPage = () => {
  const navigate = useNavigate();
  const { t, setLang } = useLanguageStore();
  const { signIn } = useAuthStore();
  const { message } = App.useApp();
  const [mode, setMode] = useState("login");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const ensureEnglishFirst = useCallback(() => {
    setLang("en");
  }, [setLang]);

  useEffect(() => {
    ensureEnglishFirst();
  }, [ensureEnglishFirst]);

  const handleLogin = useCallback(async () => {
    const email = ownerEmail.trim().toLowerCase();
    const loginPassword = password.trim();
    if (!email || !loginPassword) {
      message.warning("Please enter email and password");
      return;
    }
    if (!email.includes("@")) {
      message.warning("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      if (localDb.needsInit()) localDb.init(seedData);
      const localOwnerStore = (localDb.all("stores") || []).find((store) => (
        String(store.owner_email || "").toLowerCase() === email &&
        store.owner_password_preview === loginPassword
      ));
      if (localOwnerStore) {
        localStorage.setItem("store_owner_logged_in", "true");
        localStorage.setItem("store_owner_store_id", localOwnerStore.id);
        message.success(t("store_entry_login_success"));
        navigate("/store-owner", { replace: true });
        return;
      }

      const result = await signIn(email, loginPassword);
      const ownerId = result?.user?.id;
      const stores = await getStores({});
      const matchedStore = stores.find((store) => store.owner_profile_id === ownerId) || null;

      if (!matchedStore) {
        message.error(t("store_entry_no_data"));
        return;
      }

      localStorage.setItem("store_owner_logged_in", "true");
      localStorage.setItem("store_owner_store_id", matchedStore.id);
      message.success(t("store_entry_login_success"));
      navigate("/store-owner", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [message, navigate, ownerEmail, password, signIn, t]);

  const handleRegister = useCallback(async () => {
    if (!storeName || !ownerEmail || !password || !phone) {
      message.warning("Please fill in store name, owner email, password and phone");
      return;
    }
    const cityValidation = validateCountryCity({ country, city });
    if (!cityValidation.valid) {
      message.warning(cityValidation.message);
      return;
    }

    setLoading(true);
    try {
      const record = buildStoreRegistrationRecord({
        name: storeName,
        contact: "",
        phone,
        ownerEmail,
        password,
        country,
        city,
        address,
      });
      let created = null;
      try {
        const { owner_password_preview: _localPasswordOnly, ...remoteRecord } = record;
        created = await createStore(remoteRecord);
      } catch (err) {
        if (localDb.needsInit()) localDb.init(seedData);
        created = localDb.insert("stores", {
          ...record,
          trial_source: "local_fallback",
          review_note: err?.message || "Remote store registration unavailable",
        });
        message.info(t("store_entry_trial_saved"));
      }
      localStorage.setItem("store_owner_logged_in", "true");
      localStorage.setItem("store_owner_store_id", created.id);
      message.success(t("store_entry_review_submitted"));
      navigate("/store-owner", { replace: true });
    } catch (err) {
      message.error(err?.message || "Store registration failed");
    } finally {
      setLoading(false);
    }
  }, [address, city, country, navigate, ownerEmail, password, phone, storeName]);

  return (
    <div className="store-entry-page app-liquid-shell bg-radial-center">
      <video
        className="app-liquid-bg-video"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
      />
      <div className="app-liquid-bg-scrim" />
      <div className="store-entry-language">
        <LanguageSwitcher
          inline
          zIndex={360}
          showCurrent
          sourceOnly
          anchor="end"
          tone="light"
          buttonMinWidth={112}
          menuMinWidth={220}
        />
      </div>
      <section className="store-entry-card liquid-glass uw-panel-rise">
        <div className="store-entry-mark">
          <ShopOutlined />
        </div>
        <div className="store-entry-kicker">{t("store_entry_kicker")}</div>
        <h1>{t("store_entry_title")}</h1>
        <p>{t("store_entry_desc")}</p>
        <div className="store-entry-mode-switch" role="tablist" aria-label="Store entry mode">
          <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")}>{t("store_entry_login_tab")}</button>
          <button type="button" className={mode === "register" ? "is-active" : ""} onClick={() => setMode("register")}>{t("store_entry_register_tab")}</button>
        </div>
        {mode === "login" && (
          <div className="store-entry-form">
            <Input
              value={ownerEmail}
              onChange={(event) => setOwnerEmail(event.target.value)}
              placeholder="Email"
              className="so-input-dark"
              size="large"
            />
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="so-input-dark"
              size="large"
              type="password"
            />
            <Button type="primary" size="large" loading={loading} onClick={handleLogin} block className="uw-pressable uw-shine-button store-entry-main-action">
              {t("store_entry_button")}
            </Button>
            <div style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 8 }}>
              By logging in, you confirm you are of legal age. See our{' '}
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>Privacy Policy</a>
              {' '}and{' '}
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>Terms</a>.
            </div>
          </div>
        )}
        {mode === "register" && (
          <div className="store-entry-form">
            <Input value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Store name *" className="so-input-dark" size="large" />
            <Input value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} placeholder="Owner email *" className="so-input-dark" size="large" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password *" className="so-input-dark" size="large" type="password" />
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone *" className="so-input-dark" size="large" />
            <select className="so-input-dark store-entry-select" value={country} onChange={(event) => { setCountry(event.target.value); setCity(""); }} aria-label="Country">
              <option value="">Country *</option>
              {countryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select className="so-input-dark store-entry-select" value={city} onChange={(event) => setCity(event.target.value)} disabled={!country} aria-label="City">
              <option value="">City *</option>
              {cityOptionsForCountry(country).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Address (optional)" className="so-input-dark" size="large" />
            <Button type="primary" size="large" loading={loading} onClick={handleRegister} block className="uw-pressable uw-shine-button store-entry-main-action">
              Submit for review
            </Button>
            <div style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 8 }}>
              By registering, you confirm you are of legal age and agree to our{' '}
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>Privacy Policy</a>
              {' '}and{' '}
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>Terms of Service</a>.
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default StoreEntryPage;
