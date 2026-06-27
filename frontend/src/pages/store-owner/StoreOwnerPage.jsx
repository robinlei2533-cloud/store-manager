import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Button, Typography, Tag, Space, List, message, Table, Tabs, Modal, Empty, Input, InputNumber, Select, Form, Divider, Progress } from "antd";
import gsap from 'gsap';
import { EnvironmentOutlined, PhoneOutlined, TagOutlined, ShopOutlined, ClockCircleOutlined, EditOutlined, GiftOutlined, FireOutlined, CheckCircleOutlined, CrownOutlined, SettingOutlined, UserOutlined, BarChartOutlined, HistoryOutlined } from "@ant-design/icons";
import localDb from "../../services/db/localDb";
import useLanguageStore from "../../stores/languageStore";

const { Title, Text } = Typography;

// Level-based material bundles
const LEVEL_MATERIAL_BUNDLES = {
  S: { label: "铂金礼包", icon: "👑", materials: ["UWELL Door Panel", "UWELL Lightbox", "UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Staff Vest", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#B9F2FF" },
  A: { label: "黄金礼包", icon: "🥇", materials: ["UWELL Lightbox", "UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#FFD700" },
  B: { label: "白银礼包", icon: "🥈", materials: ["UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#C0C0C0" },
  C: { label: "青铜礼包", icon: "🥉", materials: ["UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker"], color: "#CD7F32" },
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
      message.success("店铺信息已更新");
    } catch (e) {
      message.error("保存失败: " + e.message);
    }
  };

  // Claim campaign
  const handleClaim = (camp) => {
    if (claimedCampaigns.some((cx) => cx.campaign_id === camp.id)) {
      message.warning("已领取该活动");
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
    message.success("活动已领取！物料将安排配送");
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
    message.success("复盘提交成功");
  };

  if (!store) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0a0a0f" }}>
        <Card className="so-card" style={{ background: "#1a1a2e", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 16 }}>
          <Title level={4} style={{ color: "#FFD700" }}>暂无店铺数据</Title>
          <Text style={{ color: "rgba(255,255,255,0.5)" }}>请先管理后台添加店铺</Text>
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
        extra={<Button type="link" icon={<EditOutlined />} style={{ color: "#FFD700" }} onClick={() => setEditModalOpen(true)}>编辑</Button>}
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
          { icon: <UserOutlined />, label: "粉丝数", value: stats.fanCount, color: "#457bff" },
          { icon: <GiftOutlined />, label: "参与活动", value: stats.claims, color: "#FFD700" },
          { icon: <CheckCircleOutlined />, label: "已完成", value: stats.campaigns, color: "#52c41a" },
          { icon: <BarChartOutlined />, label: "扫码量", value: stats.scanCount, color: "#6c5ce7" },
        ].map((card) => (
          <Col span={12} key={card.label}>
            <Card size="small" style={{ borderRadius: 10, background: "#1a1a25", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${card.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, fontSize: 18 }}>
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
        style={{ marginTop: 12, borderRadius: 12, background: "linear-gradient(135deg, #1a1a2e 0%, #1a1a0e 100%)", border: `1px solid ${levelBundle.color}22` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>{levelBundle.icon}</span>
          <Text strong style={{ color: levelBundle.color, fontSize: 14 }}>{levelBundle.label} - 可领取物料</Text>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {levelBundle.materials.map((m, i) => (
            <Tag key={i} style={{ background: `${levelBundle.color}12`, color: levelBundle.color, border: `1px solid ${levelBundle.color}22`, borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>
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
              <FireOutlined /> 品牌活动
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
                        <Tag color={camp.status === "ongoing" ? "gold" : "default"} style={{ fontSize: 10 }}>{camp.status === "ongoing" ? "进行中" : camp.status}</Tag>
                      </div>
                      <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{camp.description?.substring(0, 80)}</Text>
                      {claimed && (
                        <div style={{ marginTop: 6 }}>
                          <Tag color={claimed.status === "completed" ? "green" : claimed.status === "in_progress" ? "blue" : claimed.status === "pending" ? "gold" : "default"} style={{ fontSize: 10 }}>
                            {claimed.status === "completed" ? "已复盘" : claimed.status === "in_progress" ? "进行中" : claimed.status === "pending" ? "已领取" : claimed.status}
                          </Tag>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", minWidth: 80 }}>
                      {!claimed && camp.status === "ongoing" && (
                        <Button type="primary" size="small" style={{ background: "#FFD700", borderColor: "#FFD700", color: "#000" }} onClick={() => handleClaim(camp)}>
                          领取活动
                        </Button>
                      )}
                      {claimed && claimed.status === "in_progress" && (
                        <Button size="small" style={{ borderColor: "#52c41a", color: "#52c41a" }} onClick={() => handleOpenReview(claimed)}>
                          提交复盘
                        </Button>
                      )}
                      {claimed && claimed.status === "completed" && (
                        <Button size="small" style={{ borderColor: "#FFD700", color: "#FFD700" }} onClick={() => handleOpenReview(claimed)}>
                          查看复盘
                        </Button>
                      )}
                      {days > 0 && camp.status === "ongoing" && days <= 7 && (
                        <div style={{ fontSize: 10, color: "#ff4d4f", marginTop: 4 }}>剩余 {days} 天</div>
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
              待复盘 ({pendingReview.length})
            </Text>
            {pendingReview.map((claim) => (
              <Card key={claim.id} size="small" style={{ marginBottom: 8, borderRadius: 10, background: "#1a1a25", border: "1px solid rgba(82,196,26,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#e5e5e5", fontSize: 13 }}>{claim.campaign_name}</Text>
                  <Button size="small" style={{ borderColor: "#52c41a", color: "#52c41a" }} onClick={() => handleOpenReview(claim)}>
                    复盘
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {storeCampaigns.length === 0 && <Empty description="暂无活动" />}
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
          border: `1px solid ${levelBundle.color}22`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>{levelBundle.icon}</span>
          <div>
            <Text strong style={{ color: levelBundle.color, fontSize: 15, display: "block" }}>{levelBundle.label}物料包</Text>
            <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>您的店铺等级可领取以下物料</Text>
          </div>
        </div>
        <Divider style={{ borderColor: levelBundle.color + "22", margin: "8px 0" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {levelBundle.materials.map((m, i) => {
            const mat = storeMaterials.find((mt) => mt.name === m);
            return (
              <div key={i} style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 6, fontSize: 12 }}>
                <div style={{ color: "#e5e5e5" }}>{m}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{mat ? `${mat.unit_cost} SAR/${mat.unit}` : ""}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* All Materials */}
      <Text strong style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "block", marginBottom: 8 }}>
        UWELL 物料目录
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
      { title: "等级", dataIndex: "level", key: "level", render: (l) => <Tag color={l === "S" ? "purple" : l === "A" ? "red" : l === "B" ? "blue" : "default"}>{l || "C"}</Tag> },
      { title: "积分", dataIndex: "points", key: "points", render: (p) => <Text strong style={{ color: "#FFD700" }}>{p || 0}</Text> },
      { title: "加入时间", dataIndex: "created_at", key: "created_at", render: (d) => d ? new Date(d).toLocaleDateString() : "-" },
    ];
    return (
      <Table
        dataSource={fans}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10, size: "small" }}
        locale={{ emptyText: <Empty description="暂无粉丝" /> }}
        style={{ background: "transparent" }}
      />
    );
  };

  // ====== Scans Tab ======
  const ScansTab = () => {
    const columns = [
      { title: "产品", dataIndex: "product_name", key: "product_name", render: (t) => t || "-" },
      { title: "粉丝ID", dataIndex: "fan_id", key: "fan_id", render: (t) => <Text copyable style={{ fontSize: 11 }}>{t}</Text> },
      { title: "日期", dataIndex: "created_at", key: "created_at", render: (d) => d ? new Date(d).toLocaleString() : "-" },
      { title: "状态", dataIndex: "status", key: "status", render: (s) => <Tag color={s === "verified" ? "green" : "default"}>{s || "pending"}</Tag> },
    ];
    return (
      <Table
        dataSource={scans}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10, size: "small" }}
        locale={{ emptyText: <Empty description="暂无扫码记录" /> }}
      />
    );
  };

  const tabItems = [
    { key: "dashboard", label: <span><ShopOutlined /> 店铺总览</span>, children: <Dashboard /> },
    { key: "campaigns", label: <span><FireOutlined /> 品牌活动</span>, children: <CampaignsTab /> },
    { key: "materials", label: <span><GiftOutlined /> 物料 ({levelBundle.materials.length})</span>, children: <MaterialsTab /> },
    { key: "fans", label: <span><UserOutlined /> 粉丝 ({stats.fanCount})</span>, children: <FansTab /> },
    { key: "scans", label: <span>📫 扫码 ({stats.scanCount})</span>, children: <ScansTab /> },
  ];

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", padding: "12px 16px", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <Title level={4} style={{ color: "#FFD700", margin: 0 }}>UWELL 店主中心</Title>
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
        title={<span style={{ color: "#FFD700" }}><EditOutlined /> 编辑店铺信息</span>}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveStore}
        okText="保存"
        cancelText="取消"
        styles={{ content: { background: "#1a1a2e", border: "1px solid rgba(255,215,0,0.15)" } }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label={<span style={{ color: "#e5e5e5" }}>店铺名称</span>} rules={[{ required: true }]}>
            <Input style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }} />
          </Form.Item>
          <Form.Item name="phone" label={<span style={{ color: "#e5e5e5" }}>电话</span>}>
            <Input style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }} />
          </Form.Item>
          <Form.Item name="address" label={<span style={{ color: "#e5e5e5" }}>地址</span>}>
            <Input.TextArea rows={2} style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }} />
          </Form.Item>
          <Form.Item name="contact" label={<span style={{ color: "#e5e5e5" }}>联系人</span>}>
            <Input style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal
        title={<span style={{ color: "#52c41a" }}><CheckCircleOutlined /> 活动复盘</span>}
        open={reviewModal.open}
        onCancel={() => setReviewModal({ open: false, claim: null })}
        onOk={handleSubmitReview}
        okText={reviewModal.claim?.status === "completed" ? "更新复盘" : "提交复盘"}
        cancelText="取消"
        styles={{ content: { background: "#1a1a2e", border: "1px solid rgba(255,215,0,0.15)" } }}
      >
        {reviewModal.claim && (
          <div>
            <Text style={{ color: "#e5e5e5", display: "block", marginBottom: 12 }}>
              活动: <strong style={{ color: "#FFD700" }}>{reviewModal.claim.campaign_name}</strong>
            </Text>

            <div style={{ marginBottom: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "block", marginBottom: 4 }}>物料使用数量</Text>
              <InputNumber
                min={0}
                value={reviewForm.materials_used}
                onChange={(v) => setReviewForm((p) => ({ ...p, materials_used: v }))}
                style={{ width: "100%", background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "block", marginBottom: 4 }}>活动效果</Text>
              <Select
                value={reviewForm.effect}
                onChange={(v) => setReviewForm((p) => ({ ...p, effect: v }))}
                style={{ width: "100%" }}
                options={[
                  { label: "非常好", value: "great" },
                  { label: "好", value: "good" },
                  { label: "一般", value: "average" },
                  { label: "差", value: "poor" },
                ]}
              />
            </div>

            <div>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "block", marginBottom: 4 }}>反馈</Text>
              <Input.TextArea
                rows={3}
                value={reviewForm.feedback}
                onChange={(e) => setReviewForm((p) => ({ ...p, feedback: e.target.value }))}
                style={{ background: "#2a2a35", border: "1px solid #3a3a45", color: "#e5e5e5" }}
                placeholder="描述活动效果、顾客反应等"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoreOwnerPage;
