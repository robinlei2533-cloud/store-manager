import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Button, Typography, Tag, Space, List, message, Table, Tabs, Modal, Empty, Input, InputNumber, Select, Form, Divider, Progress } from "antd";
import gsap from 'gsap';
import { EnvironmentOutlined, PhoneOutlined, TagOutlined, ShopOutlined, ClockCircleOutlined, EditOutlined, GiftOutlined, FireOutlined, CheckCircleOutlined, CrownOutlined, SettingOutlined, UserOutlined, BarChartOutlined, HistoryOutlined } from "@ant-design/icons";
import localDb from "../../services/db/localDb";
import useLanguageStore from "../../stores/languageStore";

const { Title, Text } = Typography;

// Level-based material bundles
const LEVEL_MATERIAL_BUNDLES = {
  S: { label: "\u94c2\u91d1\u793c\u5305", icon: "👑", materials: ["UWELL Door Panel", "UWELL Lightbox", "UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Staff Vest", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#B9F2FF" },
  A: { label: "\u9ec4\u91d1\u793c\u5305", icon: "🥇", materials: ["UWELL Lightbox", "UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#FFD700" },
  B: { label: "\u767d\u94f6\u793c\u5305", icon: "🥈", materials: ["UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#C0C0C0" },
  C: { label: "\u9752\u94dc\u793c\u5305", icon: "🥉", materials: ["UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker"], color: "#CD7F32" },
};

const StoreOwnerPage = () => {
  const [store, setStore] = useState(null);
  const [fans, setFans] = useState([]);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({ fanCount: 0, totalPoints: 0, scanCount: 0, campaigns: 0, claims: 0 });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [claimedCampaigns, setClaimedCampaigns] = useState([]);
  const [reviewModal, setReviewModal] = useState({ open: false, claim: null });
  const [reviewForm, setReviewForm] = useState({ materials_used: 0, effect: "good", feedback: "" });
  const [storeMaterials, setStoreMaterials] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const { t } = useLanguageStore();

  // GSAP entrance animation
  useEffect(() => {
    const cards = document.querySelectorAll('.so-card');
    if (cards.length) {
      gsap.from(cards, { opacity: 0, y: 30, stagger: 0.08, duration: 0.6, ease: 'power3.out', clearProps: 'all' });
    }
  }, []);

  // Load data
  useEffect(() => {
    const stores = localDb.all("stores") || [];
    const claims = localDb.all("campaign_claims") || [];
    const allMats = localDb.all("materials") || [];

    if (stores.length > 0) {
      setStore(stores[0]);
      editForm.setFieldsValue({
        name: stores[0].name,
        phone: stores[0].phone,
        address: stores[0].address,
        contact: stores[0].contact
      });
    }

    const storeFans = stores.length > 0 ? (localDb.find("fans", (f) => f.store_id === stores[0].id) || []) : [];
    const storeScans = stores.length > 0 ? (localDb.find("scan_records", (r) => r.store_id === stores[0].id) || []) : [];
    const storeClaims = stores.length > 0 ? claims.filter((c) => c.store_id === stores[0].id) : [];

    setFans(storeFans);
    setScans(storeScans);
    setClaimedCampaigns(storeClaims);
    setAllCampaigns(localDb.all("campaigns") || []);
    setStoreMaterials(allMats);

    setStats({
      fanCount: storeFans.length,
      totalPoints: storeFans.reduce((s, f) => s + (f.points || 0), 0),
      scanCount: storeScans.length,
      campaigns: storeClaims.filter((c) => c.status === "completed").length,
      claims: storeClaims.length,
    });
  }, []);

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

  if (!store) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0a0a0f" }}>
        <Card className="so-card" style={{ background: "#1a1a2e", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 16 }}>
          <Title level={4} style={{ color: "#FFD700" }}>{t('no_data')}</Title>
          <Text style={{ color: "rgba(255,255,255,0.5)" }}>{t('store_create')}</Text>
        </Card>
      </div>
    );
  }

  const levelBundle = LEVEL_MATERIAL_BUNDLES[store.level] || LEVEL_MATERIAL_BUNDLES.C;

  // ====== Dashboard Tab ======
  const Dashboard = () => (
    <div>
      {/* Store Info Card */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 12,
          background: "linear-gradient(135deg, #1a1a2e 0%, #1a1a1f 100%)",
          border: "1px solid rgba(255,215,0,0.1)",
        }}
        extra={<Button type="link" icon={<EditOutlined />} style={{ color: "#FFD700" }} onClick={() => setEditModalOpen(true)}>{t('edit')}</Button>}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <Title level={4} style={{ color: "#FFD700", margin: 0 }}>{store.name}</Title>
            <Tag color={levelBundle.color} style={{ marginTop: 4, fontWeight: 600 }}>{levelBundle.icon} {levelBundle.label}</Tag>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          <div><EnvironmentOutlined /> <span style={{ color: "#e5e5e5" }}>{store.address?.substring(0, 40) || "N/A"}</span></div>
          <div><PhoneOutlined /> <span style={{ color: "#e5e5e5" }}>{store.phone || "N/A"}</span></div>
          <div><ShopOutlined /> ID: <span style={{ color: "#e5e5e5" }}>{store.id}</span></div>
          <div><ClockCircleOutlined /> <span style={{ color: "#e5e5e5" }}>{store.created_at ? new Date(store.created_at).toLocaleDateString() : "N/A"}</span></div>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[8, 8]}>
        {[
          { icon: <UserOutlined />, label: t('dash_total_fans'), value: stats.fanCount, color: "#457bff" },
          { icon: <GiftOutlined />, label: t('camp_title'), value: stats.claims, color: "#FFD700" },
          { icon: <CheckCircleOutlined />, label: t('dash_completed_evals'), value: stats.campaigns, color: "#52c41a" },
          { icon: <BarChartOutlined />, label: t('nav_fan_scan'), value: stats.scanCount, color: "#6c5ce7" },
        ].map((card) => (
          <Col span={12} key={card.label}>
            <Card size="small" style={{ borderRadius: 10, background: "#1a1a25", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#" + card.color.slice(1) + "15", display: "flex", alignItems: "center", justifyContent: "center", color: card.color, fontSize: 18 }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#e5e5e5" }}>{card.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{card.label}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Material Bundle */}
      <Card
        size="small"
        style={{ marginTop: 12, borderRadius: 12, background: "linear-gradient(135deg, #1a1a2e 0%, #1a1a0e 100%)", border: "1px solid " + levelBundle.color + "22" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>{levelBundle.icon}</span>
          <Text strong style={{ color: levelBundle.color, fontSize: 14 }}>{levelBundle.label} - {t('store_materials')}</Text>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {levelBundle.materials.map((m, i) => (
            <Tag key={i} style={{ background: "#" + levelBundle.color.slice(1) + "12", color: levelBundle.color, border: "1px solid " + levelBundle.color + "22", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>
              {m}
            </Tag>
          ))}
        </div>
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
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: "#FFD700", fontSize: 14, display: "block", marginBottom: 8 }}>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Text strong style={{ color: "#e5e5e5", fontSize: 13 }}>{camp.name}</Text>
                        <Tag color={camp.status === "ongoing" ? "gold" : "default"} style={{ fontSize: 10 }}>{camp.status === "ongoing" ? t('camp_active') : camp.status}</Tag>
                      </div>
                      <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{camp.description?.substring(0, 80)}</Text>
                      {claimed && (
                        <div style={{ marginTop: 6 }}>
                          <Tag color={claimed.status === "completed" ? "green" : claimed.status === "in_progress" ? "blue" : claimed.status === "pending" ? "gold" : "default"} style={{ fontSize: 10 }}>
                            {claimed.status === "completed" ? t('visit_completed') : claimed.status === "in_progress" ? t('camp_active') : claimed.status === "pending" ? t('already_claimed') : claimed.status}
                          </Tag>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", minWidth: 80 }}>
                      {!claimed && camp.status === "ongoing" && (
                        <Button type="primary" size="small" style={{ background: "#FFD700", borderColor: "#FFD700", color: "#000" }} onClick={() => handleClaim(camp)}>
                          {t('claim_campaign')}
                        </Button>
                      )}
                      {claimed && claimed.status === "in_progress" && (
                        <Button size="small" style={{ borderColor: "#52c41a", color: "#52c41a" }} onClick={() => handleOpenReview(claimed)}>
                          {t('submit_review')}
                        </Button>
                      )}
                      {claimed && claimed.status === "completed" && (
                        <Button size="small" style={{ borderColor: "#FFD700", color: "#FFD700" }} onClick={() => handleOpenReview(claimed)}>
                          {t('view_review')}
                        </Button>
                      )}
                      {days > 0 && camp.status === "ongoing" && days <= 7 && (
                        <div style={{ fontSize: 10, color: "#ff4d4f", marginTop: 4 }}>{t('days_remaining')} {days} {t('days')}</div>
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
            <Text strong style={{ color: "#52c41a", fontSize: 13, display: "block", marginBottom: 8 }}>
              {t('pending_review')} ({pendingReview.length})
            </Text>
            {pendingReview.map((claim) => (
              <Card key={claim.id} size="small" style={{ marginBottom: 8, borderRadius: 10, background: "#1a1a25", border: "1px solid rgba(82,196,26,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#e5e5e5", fontSize: 13 }}>{claim.campaign_name}</Text>
                  <Button size="small" style={{ borderColor: "#52c41a", color: "#52c41a" }} onClick={() => handleOpenReview(claim)}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>{levelBundle.icon}</span>
          <div>
            <Text strong style={{ color: levelBundle.color, fontSize: 15, display: "block" }}>{levelBundle.label}{t('material_pack')}</Text>
            <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{t('material_bundle_desc')}</Text>
          </div>
        </div>
        <Divider style={{ borderColor: levelBundle.color + "22", margin: "8px 0" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {levelBundle.materials.map((m, i) => {
            const mat = storeMaterials.find((mt) => mt.name === m);
            return (
              <div key={i} style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 6, fontSize: 12 }}>
                <div style={{ color: "#e5e5e5" }}>{m}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{mat ? mat.unit_cost + " SAR/" + mat.unit : ""}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* All Materials */}
      <Text strong style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "block", marginBottom: 8 }}>
        {t('store_materials')}
      </Text>
      {storeMaterials.map((m) => (
        <Card key={m.id} size="small" style={{ marginBottom: 6, borderRadius: 8, background: "#1a1a25", border: "1px solid #2a2a35" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Text style={{ color: "#e5e5e5", fontSize: 13 }}>{m.name}</Text>
              <Tag style={{ marginLeft: 8, fontSize: 10, background: "rgba(255,255,255,0.05)", border: "none" }}>{m.category}</Tag>
            </div>
            <Text style={{ color: "#FFD700", fontSize: 12 }}>{m.unit_cost} SAR</Text>
          </div>
        </Card>
      ))}
    </div>
  );

  // ====== Fans Tab ======
  const FansTab = () => {
    const columns = [
      { title: "ID", dataIndex: "id", key: "id", render: (t) => <Text copyable style={{ fontSize: 11 }}>{t}</Text> },
      { title: t('fan_level'), dataIndex: "level", key: "level", render: (l) => <Tag color={l === "S" ? "purple" : l === "A" ? "red" : l === "B" ? "blue" : "default"}>{l || "C"}</Tag> },
      { title: t('fan_total_points'), dataIndex: "points", key: "points", render: (p) => <Text strong style={{ color: "#FFD700" }}>{p || 0}</Text> },
      { title: t('join_date'), dataIndex: "created_at", key: "created_at", render: (d) => d ? new Date(d).toLocaleDateString() : "-" },
    ];
    return (
      <Table
        dataSource={fans}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10, size: "small" }}
        locale={{ emptyText: <Empty description={t('no_data')} /> }}
        style={{ background: "transparent" }}
      />
    );
  };

  // ====== Scans Tab ======
  const ScansTab = () => {
    const columns = [
      { title: t('fan_products'), dataIndex: "product_name", key: "product_name", render: (t) => t || "-" },
      { title: t('fan_id'), dataIndex: "fan_id", key: "fan_id", render: (t) => <Text copyable style={{ fontSize: 11 }}>{t}</Text> },
      { title: t('date'), dataIndex: "created_at", key: "created_at", render: (d) => d ? new Date(d).toLocaleString() : "-" },
      { title: t('status'), dataIndex: "status", key: "status", render: (s) => <Tag color={s === "verified" ? "green" : "default"}>{s || "pending"}</Tag> },
    ];
    return (
      <Table
        dataSource={scans}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10, size: "small" }}
        locale={{ emptyText: <Empty description={t('no_data')} /> }}
      />
    );
  };

  const tabItems = [
    { key: "dashboard", label: <span><ShopOutlined /> {t('store_dashboard')}</span>, children: <Dashboard /> },
    { key: "campaigns", label: <span><FireOutlined /> {t('nav_campaigns')}</span>, children: <CampaignsTab /> },
    { key: "materials", label: <span><GiftOutlined /> {t('store_materials')} ({levelBundle.materials.length})</span>, children: <MaterialsTab /> },
    { key: "fans", label: <span><UserOutlined /> {t('nav_fans')} ({stats.fanCount})</span>, children: <FansTab /> },
    { key: "scans", label: <span><FireOutlined /> {t('nav_fan_scan')} ({stats.scanCount})</span>, children: <ScansTab /> },
  ];

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", padding: "12px 16px", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <Title level={4} style={{ color: "#FFD700", margin: 0 }}>{t('store_title')}</Title>
          <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{store.name}</Text>
        </div>
        <Tag color={levelBundle.color} style={{ fontWeight: 600 }}>{levelBundle.icon} {levelBundle.label}</Tag>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        style={{ color: "#e5e5e5" }}
      />

      {/* Edit Store Modal */}
      <Modal
        title={<span style={{ color: "#FFD700" }}><EditOutlined /> {t('store_edit')}</span>}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveStore}
        okText={t('save')}
        cancelText={t('cancel')}
        styles={{ content: { background: "#1a1a2e", border: "1px solid rgba(255,215,0,0.15)" } }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label={<span style={{ color: "#e5e5e5" }}>{t('store_name')}</span>} rules={[{ required: true }]}>
            <Input style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }} />
          </Form.Item>
          <Form.Item name="phone" label={<span style={{ color: "#e5e5e5" }}>{t('store_phone')}</span>}>
            <Input style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }} />
          </Form.Item>
          <Form.Item name="address" label={<span style={{ color: "#e5e5e5" }}>{t('store_address')}</span>}>
            <Input.TextArea rows={2} style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }} />
          </Form.Item>
          <Form.Item name="contact" label={<span style={{ color: "#e5e5e5" }}>{t('contact')}</span>}>
            <Input style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal
        title={<span style={{ color: "#52c41a" }}><CheckCircleOutlined /> {t('review_title')}</span>}
        open={reviewModal.open}
        onCancel={() => setReviewModal({ open: false, claim: null })}
        onOk={handleSubmitReview}
        okText={reviewModal.claim?.status === "completed" ? t('update_review') : t('submit_review')}
        cancelText={t('cancel')}
        styles={{ content: { background: "#1a1a2e", border: "1px solid rgba(255,215,0,0.15)" } }}
      >
        {reviewModal.claim && (
          <div>
            <Text style={{ color: "#e5e5e5", display: "block", marginBottom: 12 }}>
              {t('nav_campaigns')}: <strong style={{ color: "#FFD700" }}>{reviewModal.claim.campaign_name}</strong>
            </Text>

            <div style={{ marginBottom: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "block", marginBottom: 4 }}>{t('materials_used')}</Text>
              <InputNumber
                min={0}
                value={reviewForm.materials_used}
                onChange={(v) => setReviewForm((p) => ({ ...p, materials_used: v }))}
                style={{ width: "100%", background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "block", marginBottom: 4 }}>{t('effect')}</Text>
              <Select
                value={reviewForm.effect}
                onChange={(v) => setReviewForm((p) => ({ ...p, effect: v }))}
                style={{ width: "100%" }}
                options={[
                  { label: t('effect_great'), value: "great" },
                  { label: t('effect_good'), value: "good" },
                  { label: t('effect_average'), value: "average" },
                  { label: t('effect_poor'), value: "poor" },
                ]}
              />
            </div>

            <div>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "block", marginBottom: 4 }}>{t('feedback')}</Text>
              <Input.TextArea
                rows={3}
                value={reviewForm.feedback}
                onChange={(e) => setReviewForm((p) => ({ ...p, feedback: e.target.value }))}
                style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }}
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

