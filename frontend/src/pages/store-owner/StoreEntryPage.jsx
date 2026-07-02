import React, { useCallback, useState } from "react";
import { Button, Input, message } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import localDb from "../../services/db/localDb";
import seedData from "../../services/db/seedData";
import useLanguageStore from "../../stores/languageStore";

const StoreEntryPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const [storeCode, setStoreCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(() => {
    setLoading(true);
    try {
      if (localDb.needsInit()) localDb.init(seedData);
      const stores = localDb.all("stores") || [];
      const matchedStore =
        stores.find((store) => store.id === storeCode.trim()) ||
        stores.find((store) => store.phone && store.phone === phone.trim()) ||
        stores[0];

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
      </section>
    </div>
  );
};

export default StoreEntryPage;
