import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Typography, Tag, message, Tabs, Modal, Empty, Input, InputNumber, Select, Form, Divider, Upload, Progress } from "antd";
import { EnvironmentOutlined, PhoneOutlined, TagOutlined, ShopOutlined, ClockCircleOutlined, EditOutlined, GiftOutlined, FireOutlined, CheckCircleOutlined, CrownOutlined, StarOutlined, SettingOutlined, LogoutOutlined, GlobalOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import localDb from "../../services/db/localDb";
import useLanguageStore from "../../stores/languageStore";
import { DISPLAY_CATEGORIES, getDisplayCategoryLabel, readImageAsDataUrl } from "../../utils/uwellClosedLoop";

const { Title, Text } = Typography;

const APP_BG_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4";

// Level-based material bundles
const LEVEL_MATERIAL_BUNDLES = {
  S: { label: "钻石门店", labelKey: "store_level_s_pack", Icon: CrownOutlined, materials: ["UWELL Door Panel", "UWELL Lightbox", "UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Staff Vest", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#B9F2FF" },
  A: { label: "黄金门店", labelKey: "store_level_a_pack", Icon: CrownOutlined, materials: ["UWELL Lightbox", "UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#FFD700" },
  B: { label: "白银门店", labelKey: "store_level_b_pack", Icon: StarOutlined, materials: ["UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#C0C0C0" },
  C: { label: "青铜门店", labelKey: "store_level_c_pack", Icon: TagOutlined, materials: ["UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker"], color: "#CD7F32" },
};

const StoreOwnerPage = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({ campaigns: 0, claims: 0 });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [claimedCampaigns, setClaimedCampaigns] = useState([]);
  const [reviewModal, setReviewModal] = useState({ open: false, claim: null });
  const [reviewForm, setReviewForm] = useState({ materials_used: 0, effect: "good", feedback: "" });
  const [storeMaterials, setStoreMaterials] = useState([]);
  const [displayUploads, setDisplayUploads] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editForm] = Form.useForm();
  const { t, lang, setLang } = useLanguageStore();
  const storeLanguageOptions = [
    { code: "zh", label: "中文" },
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ];

  // GSAP entrance animation

  // Load data
  useEffect(() => {
    if (localStorage.getItem("store_owner_logged_in") !== "true") {
      navigate("/store-login", { replace: true });
      return;
    }

    const stores = localDb.all("stores") || [];
    const claims = localDb.all("campaign_claims") || [];
    const allMats = localDb.all("materials") || [];
    const savedStoreId = localStorage.getItem("store_owner_store_id");
    const activeStore = stores.find((item) => item.id === savedStoreId) || stores[0];

    if (activeStore) {
      setStore(activeStore);
      editForm.setFieldsValue({
        name: activeStore.name,
        phone: activeStore.phone,
        address: activeStore.address,
        contact: activeStore.contact
      });
    }

    const storeClaims = activeStore ? claims.filter((c) => c.store_id === activeStore.id) : [];

    setClaimedCampaigns(storeClaims);
    setAllCampaigns(localDb.all("campaigns") || []);
    setStoreMaterials(allMats);
    setDisplayUploads(activeStore ? localDb.find("store_display_uploads", (item) => item.store_id === activeStore.id) : []);

    setStats({
      campaigns: storeClaims.filter((c) => c.status === "completed").length,
      claims: storeClaims.length,
    });
  }, [editForm, navigate]);

  const handleStoreLogout = () => {
    localStorage.removeItem("store_owner_logged_in");
    localStorage.removeItem("store_owner_store_id");
    message.success(t("logout"));
    navigate("/store-login", { replace: true });
  };

  // Save store info
  const handleSaveStore = async () => {
    try {
      const values = await editForm.validateFields();
      const updated = { ...store, ...values, updated_at: new Date().toISOString() };
      localDb.update("stores", store.id, updated);
      setStore(updated);
      setEditModalOpen(false);
      message.success(t('store_update_success'));
    } catch (e) {
      message.error(t('save_failed') + ": " + e.message);
    }
  };

  // Claim campaign
  const handleClaim = (camp) => {
    if (claimedCampaigns.some((cx) => cx.campaign_id === camp.id)) {
      message.warning(t('already_claimed'));
      return;
    }
    const newClaim = {
      id: "cc-" + Date.now(),
      store_id: store.id,
      campaign_id: camp.id,
      campaign_name: camp.name,
      status: "pending",
      materials_used: 0,
      effect: "pending",
      feedback: "",
      claimed_at: new Date().toISOString(),
      reviewed_at: null,
    };
    localDb.insert("campaign_claims", newClaim);
    setClaimedCampaigns((prev) => [...prev, newClaim]);
    message.success(t('claim_success'));
  };

  // Submit review
  const handleSubmitReview = () => {
    if (!reviewModal.claim) return;
    const updated = {
      ...reviewModal.claim,
      ...reviewForm,
      status: "completed",
      reviewed_at: new Date().toISOString(),
    };
    localDb.update("campaign_claims", reviewModal.claim.id, updated);
    setClaimedCampaigns((prev) => prev.map((c) => (c.id === reviewModal.claim.id ? updated : c)));
    setReviewModal({ open: false, claim: null });
    message.success(t('review_submit_success'));
  };

  const refreshDisplayUploads = (storeId = store?.id) => {
    if (!storeId) return;
    setDisplayUploads(localDb.find("store_display_uploads", (item) => item.store_id === storeId));
  };

  const handleDisplayUpload = async (category, file) => {
    if (!store) return false;
    if (!file.type?.startsWith("image/")) {
      message.error("只能上传图片文件");
      return false;
    }

    const activeCount = localDb.find(
      "store_display_uploads",
      (item) => item.store_id === store.id && item.category === category && item.status !== "rejected"
    ).length;
    if (activeCount >= 3) {
      message.warning(`${getDisplayCategoryLabel(category)}最多上传 3 张待审核或已通过图片`);
      return false;
    }

    try {
      const imageUrl = await readImageAsDataUrl(file);
      localDb.insert("store_display_uploads", {
        store_id: store.id,
        store_name: store.name,
        category,
        image_url: imageUrl,
        status: "pending",
        submitted_by: store.id,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        review_note: "",
      });
      refreshDisplayUploads(store.id);
      message.success("已提交后台人工审核");
    } catch {
      message.error("图片读取失败，请换一张较小的图片");
    }
    return false;
  };

  if (!store) {
    return (
      <div className="so-spin-center">
        <Card className="so-card-main">
          <Title level={4} className="so-text-gold">{t('no_data')}</Title>
          <Text className="so-text-white50">{t('store_create')}</Text>
        </Card>
      </div>
    );
  }

  const levelBundle = LEVEL_MATERIAL_BUNDLES[store.level] || LEVEL_MATERIAL_BUNDLES.C;
  const levelBundleLabel = levelBundle.label || t(levelBundle.labelKey);
  const LevelIcon = levelBundle.Icon;
  const storeCampaignsForDashboard = allCampaigns.filter((campaign) => campaign.target_stores?.includes(store.id));
  const activeStoreCampaigns = storeCampaignsForDashboard.filter((campaign) => campaign.status === "ongoing");
  const pendingCampaignClaims = claimedCampaigns.filter((claim) => ["pending", "in_progress"].includes(claim.status));
  const displayApproved = displayUploads.filter((item) => item.status === "approved").length;
  const displayPending = displayUploads.filter((item) => item.status === "pending").length;
  const stockRows = levelBundle.materials.map((name) => {
    const material = storeMaterials.find((item) => item.name === name);
    const stock = material ? localDb.find("material_stocks", (item) => item.material_id === material.id)[0] : null;
    return {
      name,
      qty: stock?.qty ?? 0,
      safety: stock?.safety_stock ?? 0,
      unit: material?.unit || "pcs",
    };
  });
  const lowBundleStock = stockRows.filter((item) => item.safety > 0 && item.qty <= item.safety);

  // ====== Dashboard Tab ======
  const Dashboard = () => (
    <div className="store-dashboard-v2">
      <Card size="small" className="so-card-main store-dashboard-hero" extra={<Button type="link" icon={<EditOutlined />} className="so-text-gold" onClick={() => setEditModalOpen(true)}>{t('edit')}</Button>}>
        <div className="store-dashboard-hero-grid">
          <div>
            <Text className="so-text-white30 so-fs11">门店等级</Text>
            <Title level={4} className="so-text-gold so-m0">{store.name}</Title>
            <Tag color={levelBundle.color} className="so-mt4 so-fw600"><LevelIcon /> {levelBundleLabel}</Tag>
          </div>
          <div className="store-dashboard-level-mark" style={{ "--store-level-color": levelBundle.color }}>
            <LevelIcon />
            <strong>{store.level || "C"}</strong>
          </div>
        </div>
        <div className="so-grid-2 store-dashboard-meta">
          <div><EnvironmentOutlined /> <span>{store.address?.substring(0, 44) || "N/A"}</span></div>
          <div><PhoneOutlined /> <span>{store.phone || "N/A"}</span></div>
          <div><ShopOutlined /> <span>{store.id}</span></div>
          <div><ClockCircleOutlined /> <span>{store.created_at ? new Date(store.created_at).toLocaleDateString() : "N/A"}</span></div>
        </div>
      </Card>

      <Row gutter={[8, 8]}>
        {[
          { icon: <FireOutlined />, label: "进行中活动", value: activeStoreCampaigns.length, color: "#FFD700", tab: "campaigns" },
          { icon: <GiftOutlined />, label: "待处理领取", value: pendingCampaignClaims.length, color: "#F5A623", tab: "campaigns" },
          { icon: <PictureOutlined />, label: "展示已通过", value: displayApproved, color: "#52c41a", tab: "showcase" },
          { icon: <UploadOutlined />, label: "展示待审核", value: displayPending, color: "#1677ff", tab: "showcase" },
        ].map((card) => (
          <Col span={12} key={card.label}>
            <button type="button" className="store-dashboard-stat so-card-subtle" onClick={() => setActiveTab(card.tab)}>
              <span style={{ color: card.color }}>{card.icon}</span>
              <strong>{card.value}</strong>
              <em>{card.label}</em>
            </button>
          </Col>
        ))}
      </Row>

      <Card size="small" className="so-card-subtle store-dashboard-section" title="活动状态" extra={<Button size="small" onClick={() => setActiveTab("campaigns")}>查看活动</Button>}>
        {storeCampaignsForDashboard.slice(0, 3).map((campaign) => {
          const claim = claimedCampaigns.find((item) => item.campaign_id === campaign.id);
          return (
            <div key={campaign.id} className="store-dashboard-row">
              <div>
                <strong>{campaign.name}</strong>
                <p>{campaign.description?.substring(0, 72)}</p>
              </div>
              <Tag color={claim ? "green" : campaign.status === "ongoing" ? "gold" : "default"}>
                {claim ? "已领取" : campaign.status === "ongoing" ? "可领取" : campaign.status}
              </Tag>
            </div>
          );
        })}
        {storeCampaignsForDashboard.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无分配活动" />}
      </Card>

      <Card size="small" className="so-card-subtle store-dashboard-section" title="物料库存" extra={<Button size="small" onClick={() => setActiveTab("materials")}>登记库存</Button>}>
        <div className="store-stock-list">
          {stockRows.slice(0, 5).map((item) => {
            const percent = item.safety > 0 ? Math.min(100, Math.round((item.qty / (item.safety * 2)) * 100)) : 100;
            const danger = item.safety > 0 && item.qty <= item.safety;
            return (
              <div key={item.name} className="store-stock-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.qty} {item.unit} / 安全 {item.safety}</span>
                </div>
                <Progress percent={percent} showInfo={false} status={danger ? "exception" : "normal"} />
              </div>
            );
          })}
        </div>
        {lowBundleStock.length > 0 && <Tag color="volcano">有 {lowBundleStock.length} 项物料低于安全库存</Tag>}
      </Card>
    </div>
  );

  // ====== Campaigns Tab ======
  const CampaignsTab = () => {
    const storeCampaigns = allCampaigns.filter((c) => c.target_stores && c.target_stores.includes(store.id));
    const pendingReview = claimedCampaigns.filter((c) => c.status === "in_progress");

    return (
      <div>
        {/* Active Campaigns for this store */}
        {storeCampaigns.length > 0 && (
          <div className="so-mb16">
            <Text strong className="so-text-gold so-fs14 so-dblock so-mb8">
              <FireOutlined /> {t('nav_campaigns')}
            </Text>
            {storeCampaigns.map((camp) => {
              const claimed = claimedCampaigns.find((c) => c.campaign_id === camp.id);
              const days = Math.ceil((new Date(camp.end_date) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <Card
                  key={camp.id}
                  size="small"
                  style={{
                    marginBottom: 8,
                    borderRadius: 10,
                    background: camp.status === "ongoing" ? "linear-gradient(135deg, #1a1a2e 0%, #2a1a0e 100%)" : "#1a1a25",
                    border: camp.status === "ongoing" ? "1px solid rgba(255,215,0,0.2)" : "1px solid #2a2a35",
                  }}
                >
                  <div className="so-flex-between">
                    <div className="so-flex-1">
                      <div className="so-flex-gap6">
                        <Text strong className="so-text-light so-fs13">{camp.name}</Text>
                        <Tag color={camp.status === "ongoing" ? "gold" : "default"} className="so-fs10">{camp.status === "ongoing" ? t('camp_active') : camp.status}</Tag>
                      </div>
                      <Text className="so-text-white30 so-fs11">{camp.description?.substring(0, 80)}</Text>
                      {claimed && (
                        <div className="so-mt6">
                          <Tag color={claimed.status === "completed" ? "green" : claimed.status === "in_progress" ? "blue" : claimed.status === "pending" ? "gold" : "default"} className="so-fs10">
                            {claimed.status === "completed" ? t('visit_completed') : claimed.status === "in_progress" ? t('camp_active') : claimed.status === "pending" ? t('already_claimed') : claimed.status}
                          </Tag>
                        </div>
                      )}
                    </div>
                    <div className="so-text-right so-minw80">
                      {!claimed && camp.status === "ongoing" && (
                        <Button type="primary" size="small" className="so-btn-gold" onClick={() => handleClaim(camp)}>
                          {t('claim_campaign')}
                        </Button>
                      )}
                      {claimed && claimed.status === "in_progress" && (
                        <Button size="small" className="so-btn-success" onClick={() => handleOpenReview(claimed)}>
                          {t('submit_review')}
                        </Button>
                      )}
                      {claimed && claimed.status === "completed" && (
                        <Button size="small" className="so-btn-warning" onClick={() => handleOpenReview(claimed)}>
                          {t('view_review')}
                        </Button>
                      )}
                      {days > 0 && camp.status === "ongoing" && days <= 7 && (
                        <div className="so-text-danger so-fs10 so-mt4">{t('days_remaining')} {days} {t('days')}</div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pending Reviews */}
        {pendingReview.length > 0 && (
          <div>
            <Text strong className="so-text-green so-fs13 so-dblock so-mb8">
              {t('pending_review')} ({pendingReview.length})
            </Text>
            {pendingReview.map((claim) => (
              <Card key={claim.id} size="small" className="so-card-green">
                <div className="so-flex-between">
                  <Text className="so-text-light so-fs13">{claim.campaign_name}</Text>
                  <Button size="small" className="so-btn-green" onClick={() => handleOpenReview(claim)}>
                    {t('review')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {storeCampaigns.length === 0 && <Empty description={t('no_data')} />}
      </div>
    );
  };

  const handleOpenReview = (claim) => {
    setReviewForm({
      materials_used: claim.materials_used || 0,
      effect: claim.effect || "good",
      feedback: claim.feedback || "",
    });
    setReviewModal({ open: true, claim });
  };

  // ====== Materials Tab ======
  const MaterialsTab = () => (
    <div>
      {/* Current Material Bundle */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 12,
          background: "linear-gradient(135deg, #1a1a2e 0%, #1a1a0e 100%)",
          border: "1px solid " + levelBundle.color + "22",
        }}
      >
        <div className="so-flex-gap8">
          <LevelIcon className="so-fs24" style={{ color: levelBundle.color }} />
          <div>
            <Text strong style={{ color: levelBundle.color, fontSize: 15, display: "block" }}>{levelBundleLabel}{t('material_pack')}</Text>
            <Text className="so-text-white30 so-fs11">{t('material_bundle_desc')}</Text>
          </div>
        </div>
        <Divider style={{ borderColor: levelBundle.color + "22", margin: "8px 0" }} />
        <div className="so-flex-col">
          {levelBundle.materials.map((m, i) => {
            const mat = storeMaterials.find((mt) => mt.name === m);
            return (
              <div key={i} className="so-tag-material">
                <div className="so-material-name">{m}</div>
                <div className="so-material-unit">{mat ? mat.unit_cost + " SAR/" + mat.unit : ""}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* All Materials */}
      <Text strong className="so-text-white50 so-fs12 so-dblock so-mb8">
        {t('store_materials')}
      </Text>
      {storeMaterials.map((m) => (
        <Card key={m.id} size="small" className="so-mb6 so-card-dark-border">
          <div className="so-flex-between">
            <div>
              <Text className="so-text-light so-fs13">{m.name}</Text>
              <Tag className="so-ml8 so-fs10 so-tag-material-sm">{m.category}</Tag>
            </div>
            <Text className="so-text-gold so-fs12">{m.unit_cost} SAR</Text>
          </div>
        </Card>
      ))}
    </div>
  );

  const ShowcaseTab = () => (
    <div>
      <Card size="small" className="so-card-subtle" style={{ marginBottom: 12 }}>
        <div className="so-flex-gap8">
          <PictureOutlined className="so-fs20" style={{ color: "#FFD700" }} />
          <div>
            <Text strong className="so-text-light">UWELL 产品展示</Text>
            <div className="so-text-white30 so-fs11">上传店内真实展示图，后台审核通过后会出现在粉丝门店推荐里。</div>
          </div>
        </div>
      </Card>

      <Row gutter={[8, 8]}>
        {DISPLAY_CATEGORIES.map((category) => {
          const records = displayUploads.filter((item) => item.category === category.key);
          const pending = records.filter((item) => item.status === "pending").length;
          const approved = records.filter((item) => item.status === "approved").length;
          return (
            <Col span={24} key={category.key}>
              <Card size="small" className="so-card-dark-border">
                <div className="so-flex-between so-mb8">
                  <div>
                    <Text strong className="so-text-light">{category.label}</Text>
                    <div className="so-text-white30 so-fs11">已通过 {approved} / 待审核 {pending}</div>
                  </div>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => handleDisplayUpload(category.key, file)}
                  >
                    <Button size="small" icon={<UploadOutlined />}>上传</Button>
                  </Upload>
                </div>
                {records.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {records.slice(0, 3).map((item) => (
                      <div key={item.id} style={{ position: "relative" }}>
                        <img src={item.image_url} alt={category.label} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)" }} />
                        <Tag color={item.status === "approved" ? "green" : item.status === "rejected" ? "red" : "gold"} style={{ position: "absolute", left: 4, top: 4, margin: 0 }}>
                          {item.status === "approved" ? "已通过" : item.status === "rejected" ? "已拒绝" : "待审核"}
                        </Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无图片" />
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );

  const tabItems = [
    { key: "dashboard", label: <span><ShopOutlined /> {t('store_dashboard')}</span>, children: <Dashboard /> },
    { key: "showcase", label: <span><PictureOutlined /> UWELL 展示</span>, children: <ShowcaseTab /> },
    { key: "campaigns", label: <span><FireOutlined /> {t('nav_campaigns')}</span>, children: <CampaignsTab /> },
    { key: "materials", label: <span><GiftOutlined /> {t('store_materials')} ({levelBundle.materials.length})</span>, children: <MaterialsTab /> },
  ];

  return (
    <div className="so-page app-liquid-shell store-liquid-shell bg-radial-center">
      <video className="app-liquid-bg-video" src={APP_BG_VIDEO} muted autoPlay loop playsInline preload="auto" />
      <div className="app-liquid-bg-scrim" />
      {/* Header */}
      <div className="so-flex-between-mb store-liquid-header liquid-glass">
        <div className="store-header-info">
          <div>
            <h4 className="so-text-gold so-m0 store-owner-title">{t('store_title')}</h4>
            <Text className="so-text-white30 so-fs11">{store.name}</Text>
          </div>
          <div className="store-level-medal" style={{ "--store-level-color": levelBundle.color }}>
            <div className="store-level-medal-icon">
              <LevelIcon />
            </div>
            <div className="store-level-medal-copy">
              <span>{levelBundleLabel}</span>
              <strong>{store.level || "C"}</strong>
            </div>
          </div>
        </div>
        <div className="store-header-actions">
          <Tag color={levelBundle.color} className="so-fw600"><LevelIcon /> {levelBundleLabel}</Tag>
          <div className="store-settings-slot">
            <button
              type="button"
              className={`store-settings-trigger${settingsOpen ? " is-open" : ""}`}
              onClick={() => setSettingsOpen((value) => !value)}
              aria-label="Open store settings"
            >
              <SettingOutlined />
            </button>
            {settingsOpen && (
              <div className="store-settings-panel liquid-glass">
                <div className="store-settings-label">{t("settings_language")}</div>
                <div className="store-settings-language-list">
                  {storeLanguageOptions.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className={`store-settings-lang${lang === item.code ? " is-active" : ""}`}
                      onClick={() => setLang(item.code)}
                    >
                      <GlobalOutlined />
                      <span>{item.label}</span>
                      {lang === item.code && <CheckCircleOutlined />}
                    </button>
                  ))}
                </div>
                <div className="fe-settings-divider" />
                <button type="button" className="store-settings-item" onClick={handleStoreLogout}>
                  <LogoutOutlined /> {t("logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        className="so-text-light app-liquid-tabs"
      />

      {/* Edit Store Modal */}
      <Modal
        title={<span className="so-text-gold"><EditOutlined /> {t('store_edit')}</span>}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveStore}
        okText={t('save')}
        cancelText={t('cancel')}
        styles={{ content: { background: "#ffffff", border: "1px solid rgba(82,62,24,0.14)" } }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label={<span className="so-text-light">{t('store_name')}</span>} rules={[{ required: true }]}>
            <Input className="so-input-dark" />
          </Form.Item>
          <Form.Item name="phone" label={<span className="so-text-light">{t('store_phone')}</span>}>
            <Input className="so-input-dark" />
          </Form.Item>
          <Form.Item name="address" label={<span className="so-text-light">{t('store_address')}</span>}>
            <Input.TextArea rows={2} className="so-input-dark" />
          </Form.Item>
          <Form.Item name="contact" label={<span className="so-text-light">{t('contact')}</span>}>
            <Input className="so-input-dark" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal
        title={<span className="so-text-green"><CheckCircleOutlined /> {t('review_title')}</span>}
        open={reviewModal.open}
        onCancel={() => setReviewModal({ open: false, claim: null })}
        onOk={handleSubmitReview}
        okText={reviewModal.claim?.status === "completed" ? t('update_review') : t('submit_review')}
        cancelText={t('cancel')}
        styles={{ content: { background: "#ffffff", border: "1px solid rgba(82,62,24,0.14)" } }}
      >
        {reviewModal.claim && (
          <div>
            <Text className="so-text-light so-dblock so-mb12">
              {t('nav_campaigns')}: <strong className="so-table-points">{reviewModal.claim.campaign_name}</strong>
            </Text>

            <div className="so-mb12">
              <Text className="so-text-white50 so-fs12 so-dblock so-mb4">{t('materials_used')}</Text>
              <InputNumber
                min={0}
                value={reviewForm.materials_used}
                onChange={(v) => setReviewForm((p) => ({ ...p, materials_used: v }))}
                className="so-input-dark" style={{ width: "100%" }}
              />
            </div>

            <div className="so-mb12">
              <Text className="so-text-white50 so-fs12 so-dblock so-mb4">{t('effect')}</Text>
              <Select
                value={reviewForm.effect}
                onChange={(v) => setReviewForm((p) => ({ ...p, effect: v }))}
                className="so-minw80" style={{ width: "100%" }}
                options={[
                  { label: t('effect_great'), value: "great" },
                  { label: t('effect_good'), value: "good" },
                  { label: t('effect_average'), value: "average" },
                  { label: t('effect_poor'), value: "poor" },
                ]}
              />
            </div>

            <div>
              <Text className="so-text-white50 so-fs12 so-dblock so-mb4">{t('feedback')}</Text>
              <Input.TextArea
                rows={3}
                value={reviewForm.feedback}
                onChange={(e) => setReviewForm((p) => ({ ...p, feedback: e.target.value }))}
                className="so-input-dark"
                placeholder={t('feedback_placeholder')}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoreOwnerPage;

