import React, { useCallback, useEffect, useState } from "react";
import { Button, Input, message } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import localDb from "../../services/db/localDb";
import seedData from "../../services/db/seedData";
import { createStore, getStores } from "../../services/api";
import useLanguageStore from "../../stores/languageStore";
import {
  buildStoreRegistrationRecord,
  cityOptionsForCountry,
  countryOptions,
  validateCountryCity,
} from "../../utils/trialOps";

const StoreEntryPage = () => {
  const navigate = useNavigate();
  const { t, setLang } = useLanguageStore();
  const [mode, setMode] = useState("login");
  const [storeCode, setStoreCode] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [contact, setContact] = useState("");
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
    setLoading(true);
    try {
      if (localDb.needsInit()) localDb.init(seedData);
      let stores = [];
      try {
        stores = await getStores({});
      } catch {
        stores = localDb.all("stores") || [];
      }
      const matchedStore =
        stores.find((store) => store.id === storeCode.trim()) ||
        stores.find((store) => store.phone && store.phone === phone.trim()) ||
        (localDb.all("stores") || []).find((store) => store.id === storeCode.trim()) ||
        (localDb.all("stores") || []).find((store) => store.phone && store.phone === phone.trim()) ||
        null;

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
  }, [navigate, phone, storeCode, t]);

  const handleRegister = useCallback(async () => {
    if (!storeName || !contact || !phone) {
      message.warning("Please fill in store name, contact and phone");
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
        contact,
        phone,
        country,
        city,
        address,
      });
      let created = null;
      try {
        created = await createStore(record);
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
  }, [address, city, contact, country, navigate, phone, storeName]);

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
      <section className="store-entry-card liquid-glass">
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
              value={storeCode}
              onChange={(event) => setStoreCode(event.target.value)}
              placeholder={t("store_entry_id_placeholder")}
              className="so-input-dark"
              size="large"
            />
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t("store_entry_phone_placeholder")}
              className="so-input-dark"
              size="large"
            />
            <Button type="primary" size="large" loading={loading} onClick={handleLogin} block>
              {t("store_entry_button")}
            </Button>
          </div>
        )}
        {mode === "register" && (
          <div className="store-entry-form">
            <Input value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Store name *" className="so-input-dark" size="large" />
            <Input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Contact person *" className="so-input-dark" size="large" />
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
            <Button type="primary" size="large" loading={loading} onClick={handleRegister} block>
              Submit for review
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default StoreEntryPage;
