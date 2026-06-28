import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Button, Typography, Tag, Space, List, message, Table, Tabs, Modal, Empty, Input, InputNumber, Select, Form, Divider, Progress } from "antd";
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
  const [materialRequests, setMaterialRequests] = useState([]);
  const [storeMaterials, setStoreMaterials] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const { t } = useLanguageStore();

  // GSAP entrance animation

  // Load material requests
  useEffect(() => {
    try {
      const reqs = localDb.all("material_requests") || [];
      if (store) setMaterialRequests(reqs.filter(r => r.store_id === store.id));
    } catch(e) {}
  }, [store]);

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
      <div className="so-spin-center">
        <Card className="so-card-main">
          <Title level={4} className="so-text-gold">{t('no_data')}</Title>
          <Text className="so-text-white50">{t('store_create')}</Text>
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
        extra={<Button type="link" icon={<EditOutlined />} className="so-text-gold" onClick={() => setEditModalOpen(true)}>{t('edit')}</Button>}
      >
        <div className="so-flex-between-mb">
          <div>
            <Title level={4} className="so-text-gold so-m0">{store.name}</Title>
            <Tag color={levelBundle.color} className="so-mt4 so-fw600">{levelBundle.icon} {levelBundle.label}</Tag>
          </div>
        </div>
        <div className="so-grid-2">
          <div><EnvironmentOutlined /> <span className="so-text-light">{store.address?.substring(0, 40) || "N/A"}</span></div>
          <div><PhoneOutlined /> <span className="so-text-light">{store.phone || "N/A"}</span></div>
          <div><ShopOutlined /> ID: <span className="so-text-light">{store.id}</span></div>
          <div><ClockCircleOutlined /> <span className="so-text-light">{store.created_at ? new Date(store.created_at).toLocaleDateString() : "N/A"}</span></div>
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
            <Card size="small" className="so-card-subtle">
              <div className="so-flex">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#" + card.color.slice(1) + "15", display: "flex", alignItems: "center", justifyContent: "center", color: card.color, fontSize: 18 }}>
                  {card.icon}
                </div>
                <div>
                  <div className="so-stat-value">{card.value}</div>
                  <div className="so-stat-label">{card.label}</div>
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
        <div className="so-flex-gap8">
          <span className="so-fs20">{levelBundle.icon}</span>
          <Text strong style={{ color: levelBundle.color, fontSize: 14 }}>{levelBundle.label} - {t('store_materials')}</Text>
        </div>
        <div className="so-flex-wrap">
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

  const handleRequestMaterial = (matName) => {
    if (!store) return;
    const req = { id: "mr-" + Date.now(), store_id: store.id, store_name: store.name, material_name: matName, status: "pending", requested_at: new Date().toISOString() };
    localDb.insert("material_requests", req);
    setMaterialRequests(prev => [...prev, req]);
    message.success("Requested: " + matName);
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
          <span className="so-fs24">{levelBundle.icon}</span>
          <div>
            <Text strong style={{ color: levelBundle.color, fontSize: 15, display: "block" }}>{levelBundle.label}{t('material_pack')}</Text>
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

  // ====== Fans Tab ======
  const FansTab = () => {
    const columns = [
      { title: "ID", dataIndex: "id", key: "id", render: (t) => <Text copyable className="so-table-id">{t}</Text> },
      { title: t('fan_level'), dataIndex: "level", key: "level", render: (l) => <Tag color={l === "S" ? "purple" : l === "A" ? "red" : l === "B" ? "blue" : "default"}>{l || "C"}</Tag> },
      { title: t('fan_total_points'), dataIndex: "points", key: "points", render: (p) => <Text strong className="so-table-points">{p || 0}</Text> },
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
        className="so-bg-transparent"
      />
    );
  };

  // ====== Scans Tab ======
  const ScansTab = () => {
    const columns = [
      { title: t('fan_products'), dataIndex: "product_name", key: "product_name", render: (t) => t || "-" },
      { title: t('fan_id'), dataIndex: "fan_id", key: "fan_id", render: (t) => <Text copyable className="so-fs11">{t}</Text> },
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
    <div className="so-page">
      {/* Header */}
      <div className="so-flex-between-mb">
        <div>
          <Title level={4} className="so-text-gold so-m0">{t('store_title')}</Title>
          <Text className="so-text-white30 so-fs11">{store.name}</Text>
        </div>
        <Tag color={levelBundle.color} className="so-fw600">{levelBundle.icon} {levelBundle.label}</Tag>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        className="so-text-light"
      />

      {/* Edit Store Modal */}
      <Modal
        title={<span className="so-text-gold"><EditOutlined /> {t('store_edit')}</span>}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveStore}
        okText={t('save')}
        cancelText={t('cancel')}
        styles={{ content: { background: "#1a1a2e", border: "1px solid rgba(255,215,0,0.15)" } }}
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
        styles={{ content: { background: "#1a1a2e", border: "1px solid rgba(255,215,0,0.15)" } }}
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

