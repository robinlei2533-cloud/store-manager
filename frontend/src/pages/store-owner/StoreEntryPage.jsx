import React, { useCallback, useState } from "react";
import { App, Button, Input } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import localDb from "../../services/db/localDb";
import seedData from "../../services/db/seedData";
import { createStore, getStores } from "../../services/api";
import { supabase } from "../../services/supabase";
import useLanguageStore from "../../stores/languageStore";
import useAuthStore from "../../stores/authStore";
import {
  buildStoreRegistrationRecord,
  cityOptionsForCountry,
  countryOptions,
  validateCountryCity,
} from "../../utils/trialOps";
import { isValidBusinessEmail } from "../../utils/uwellLaunchRules";

const isLocalStoreOwnerShortcutAllowed = () => {
  if (!import.meta.env?.VITE_SUPABASE_URL) return true;
  if (import.meta.env?.DEV || import.meta.env?.VITE_ALLOW_LOCAL_AUTH_FALLBACK === "true") return true;
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
};

// Task-141 ReactBits-inspired store login polish: restrained form/CTA motion only.

const StoreEntryPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
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

  const handleLogin = useCallback(async () => {
    const email = ownerEmail.trim().toLowerCase();
    const loginPassword = password.trim();
    if (!email || !loginPassword) {
      message.warning(t("store_entry_login_required"));
      return;
    }
    if (!isValidBusinessEmail(email)) {
      message.warning(t("store_entry_assigned_email_required"));
      return;
    }

    setLoading(true);
    try {
      if (isLocalStoreOwnerShortcutAllowed()) {
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
      message.warning(t("store_entry_register_required"));
      return;
    }
    if (!isValidBusinessEmail(ownerEmail)) {
      message.warning(t("store_entry_real_email_required"));
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
        const { data, error } = await supabase.auth.signUp({
          email: ownerEmail.trim().toLowerCase(),
          password,
          options: {
            data: {
              name: storeName,
              phone,
              role: "store_owner",
              country,
              city,
            },
          },
        });
        if (error) throw error;
        const authUserId = data.user?.id;
        if (!authUserId) throw new Error("Store owner auth account was not created");
        const { owner_password_preview: _localPasswordOnly, ...remoteRecord } = record;
        created = await createStore({ ...remoteRecord, owner_profile_id: authUserId });
        if (localDb.needsInit()) localDb.init(seedData);
        localDb.upsert("stores", {
          ...record,
          id: created.id,
          owner_profile_id: authUserId,
          trial_source: "remote_trial_mirror",
        }, "id");
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
      message.error(err?.message || t("store_entry_registration_failed"));
    } finally {
      setLoading(false);
    }
  }, [address, city, country, message, navigate, ownerEmail, password, phone, storeName, t]);

  return (
    <div className="store-entry-page store-entry-green-theme app-liquid-shell bg-radial-center">
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
      <section className="store-entry-card liquid-glass uw-panel-rise uw-reactbits-fade-content">
        <div className="store-entry-mark">
          <ShopOutlined />
        </div>
        <div className="store-entry-kicker uw-reactbits-shiny-text">{t("store_entry_kicker")}</div>
        <h1>{t("store_entry_title")}</h1>
        <p>{t("store_entry_desc")}</p>
        <div className="store-entry-mode-switch" role="tablist" aria-label="Store entry mode">
          <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")}>{t("store_entry_login_tab")}</button>
          <button type="button" className={mode === "register" ? "is-active" : ""} onClick={() => setMode("register")}>{t("store_entry_apply_review_tab")}</button>
        </div>
        {mode === "login" && (
          <div className="store-entry-form">
            <div className="store-entry-field uw-reactbits-field">
              <Input
                value={ownerEmail}
                onChange={(event) => setOwnerEmail(event.target.value)}
                placeholder={t("store_entry_email_placeholder")}
                className="so-input-dark"
                size="large"
              />
            </div>
            <div className="store-entry-field uw-reactbits-field">
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("store_entry_password_placeholder")}
                className="so-input-dark"
                size="large"
                type="password"
              />
            </div>
            <Button type="primary" size="large" loading={loading} onClick={handleLogin} block className="uw-pressable uw-shine-button uw-reactbits-specular-button store-entry-main-action">
              {t("store_entry_button")}
            </Button>
            <div className="store-entry-legal-copy">
              <span>{t("store_entry_login_legal")}</span>{' '}
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#4f8f00' }}>{t("store_entry_privacy_policy")}</a>
              {' · '}
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: '#4f8f00' }}>{t("store_entry_terms")}</a>
            </div>
          </div>
        )}
        {mode === "register" && (
          <div className="store-entry-form">
            <div className="store-entry-field uw-reactbits-field"><Input value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder={t("store_entry_store_name_placeholder")} className="so-input-dark" size="large" /></div>
            <div className="store-entry-field uw-reactbits-field"><Input value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} placeholder={t("store_entry_owner_email_placeholder")} className="so-input-dark" size="large" /></div>
            <div className="store-entry-field uw-reactbits-field"><Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("store_entry_password_required_placeholder")} className="so-input-dark" size="large" type="password" /></div>
            <div className="store-entry-field uw-reactbits-field"><Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={t("store_entry_phone_placeholder_required")} className="so-input-dark" size="large" /></div>
            <div className="store-entry-field uw-reactbits-field">
              <select className="so-input-dark store-entry-select" value={country} onChange={(event) => { setCountry(event.target.value); setCity(""); }} aria-label={t("store_entry_country_placeholder")}>
                <option value="">{t("store_entry_country_placeholder")}</option>
                {countryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="store-entry-field uw-reactbits-field">
              <select className="so-input-dark store-entry-select" value={city} onChange={(event) => setCity(event.target.value)} disabled={!country} aria-label={t("store_entry_city_placeholder")}>
                <option value="">{t("store_entry_city_placeholder")}</option>
                {cityOptionsForCountry(country).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="store-entry-field uw-reactbits-field"><Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder={t("store_entry_address_optional")} className="so-input-dark" size="large" /></div>
            <div className="store-entry-photo-expectation">
              <strong>{t("store_entry_photos_after_review")}</strong>
              <span>{t("store_entry_storefront_photo_map")}</span>
              <span>{t("store_entry_display_photos_review")}</span>
              <small>{t("store_entry_first_three_login_reminder")}</small>
            </div>
            <Button type="primary" size="large" loading={loading} onClick={handleRegister} block className="uw-pressable uw-shine-button uw-reactbits-specular-button store-entry-main-action">
              {t("store_entry_submit_review")}
            </Button>
            <div className="store-entry-legal-copy">
              <span>{t("store_entry_apply_legal")}</span>{' '}
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#4f8f00' }}>{t("store_entry_privacy_policy")}</a>
              {' · '}
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: '#4f8f00' }}>{t("store_entry_terms_service")}</a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default StoreEntryPage;
