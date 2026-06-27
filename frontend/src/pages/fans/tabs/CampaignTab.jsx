import React, { useState, useEffect } from "react";
import { Card, Tag, Button, Spin, Empty, Typography, Space, Progress, Modal } from "antd";
import { GiftOutlined, FireOutlined, EnvironmentOutlined } from "@ant-design/icons";
import localDb from "../../../services/db/localDb";

const { Text, Title } = Typography;

const TYPE_COLORS = {
  "新品上市": "#FFD700",
  "节日营销": "#F5A623",
  "渠道建设": "#6c5ce7",
  "社群运营": "#00b894",
  "促销活动": "#fdcb6e",
};

const STATUS_MAP = {
  ongoing: { label: "进行中", color: "gold" },
  completed: { label: "已结束", color: "default" },
  planned: { label: "即将开始", color: "blue" },
};

function daysLeft(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

const CampaignTab = ({ fan }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    const seed = localDb.all("campaigns");
    if (seed.length === 0) {
      try {
        const seedData = require("../../../services/db/seedData");
        localDb.init(seedData.default || seedData);
      } catch(e) { /* ignore */ }
    }
    const data = localDb.all("campaigns") || [];
    data.sort((a, b) => {
      const order = { ongoing: 0, planned: 1, completed: 2 };
      return (order[a.status]||3) - (order[b.status]||3);
    });
    setCampaigns(data);
    setLoading(false);
  }, []);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spin size="large" /></div>;

  const ongoing = campaigns.filter((c) => c.status === "ongoing");
  const upcoming = campaigns.filter((c) => c.status === "planned");
  const past = campaigns.filter((c) => c.status === "completed");

  return (
    <div style={{ padding: "4px 0" }}>
      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #2a1a0e 100%)",
          borderRadius: 16,
          padding: "20px 16px",
          marginBottom: 16,
          border: "1px solid rgba(255,215,0,0.15)",
          textAlign: "center",
        }}
      >
        <Title level={4} style={{ color: "#FFD700", margin: 0 }}>
          <FireOutlined /> UWELL 品牌活动
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          参与品牌活动，赢取额外奖励
        </Text>
      </div>

      {/* Active Campaigns */}
      {ongoing.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Text strong style={{ color: "#FFD700", fontSize: 14, display: "block", marginBottom: 10, letterSpacing: 1 }}>
            <FireOutlined style={{ marginRight: 6 }} />进行中活动 ({ongoing.length})
          </Text>
          {ongoing.map((c) => renderCampaignCard(c, true))}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Text strong style={{ color: "#457bff", fontSize: 13, display: "block", marginBottom: 8 }}>
            即将开始 ({upcoming.length})
          </Text>
          {upcoming.map((c) => renderCampaignCard(c, false))}
        </div>
      )}

      {/* Past Campaigns */}
      {past.length > 0 && (
        <div>
          <Text strong style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, display: "block", marginBottom: 8 }}>
            往期活动 ({past.length})
          </Text>
          {past.slice(0, 5).map((c) => renderCampaignCard(c, false))}
        </div>
      )}

      {campaigns.length === 0 && <Empty description="暂无活动" />}

      {/* Detail Modal */}
      <Modal
        title={<span style={{ color: "#FFD700" }}><GiftOutlined /> {detailModal?.name}</span>}
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(null)}>关闭</Button>
        ]}
        width={480}
        styles={{ content: { background: "#1a1a2e", border: "1px solid rgba(255,215,0,0.15)" } }}
      >
        {detailModal && (
          <div style={{ color: "rgba(255,255,255,0.7)" }}>
            <div style={{ fontSize: 13, marginBottom: 12 }}>{detailModal.description}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
              <div><span style={{ color: "rgba(255,255,255,0.3)" }}>开始:</span> <span style={{ color: "#e5e5e5" }}>{new Date(detailModal.start_date).toLocaleDateString()}</span></div>
              <div><span style={{ color: "rgba(255,255,255,0.3)" }}>结束:</span> <span style={{ color: "#e5e5e5" }}>{new Date(detailModal.end_date).toLocaleDateString()}</span></div>
              <div><span style={{ color: "rgba(255,255,255,0.3)" }}>预算:</span> <span style={{ color: "#FFD700" }}>SAR {detailModal.budget?.toLocaleString()}</span></div>
              <div><span style={{ color: "rgba(255,255,255,0.3)" }}>状态:</span> <Tag color={STATUS_MAP[detailModal.status]?.color}>{STATUS_MAP[detailModal.status]?.label}</Tag></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  function renderCampaignCard(c, isOngoing) {
    const days = daysLeft(c.end_date);
    const typeColor = TYPE_COLORS[c.type] || "#888";
    const statusConfig = STATUS_MAP[c.status] || { label: c.status, color: "default" };

    return (
      <Card
        key={c.id}
        size="small"
        style={{
          marginBottom: 10,
          borderRadius: 12,
          background: isOngoing ? "linear-gradient(135deg, #1a1a2e 0%, #2a1a0e 100%)" : "linear-gradient(135deg, #1a1a25 0%, #1a1a1f 100%)",
          border: isOngoing ? "1px solid rgba(255,215,0,0.25)" : "1px solid #2a2a35",
          cursor: "pointer",
        }}
        onClick={() => setDetailModal(c)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <Tag color={typeColor} style={{ fontSize: 10, borderRadius: 4, marginRight: 6 }}>
              {c.type}
            </Tag>
            <Tag color={statusConfig.color} style={{ fontSize: 10, borderRadius: 4 }}>
              {statusConfig.label}
            </Tag>
          </div>
          {isOngoing && days <= 7 && days > 0 && (
            <Tag color="volcano" style={{ fontSize: 10, fontWeight: 600, animation: days <= 3 ? "pulse 1s infinite" : "none" }}>
              {days <= 1 ? "明天截止！" : `剩余 ${days} 天`}
            </Tag>
          )}
        </div>

        <Text strong style={{ color: "#e5e5e5", fontSize: 14, display: "block", marginBottom: 4 }}>
          <GiftOutlined style={{ marginRight: 6, color: "#FFD700" }} />
          {c.name}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, display: "block", marginBottom: 6 }}>
          {c.description?.substring(0, 100)}
          {c.description?.length > 100 ? "..." : ""}
        </Text>

        {/* Progress bar for ongoing */}
        {isOngoing && (() => {
          const total = new Date(c.end_date) - new Date(c.start_date);
          const elapsed = Date.now() - new Date(c.start_date);
          const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <Progress
                percent={pct}
                size="small"
                strokeColor="#FFD700"
                trailColor="rgba(255,255,255,0.06)"
                style={{ flex: 1, margin: 0 }}
                showInfo={false}
              />
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, whiteSpace: "nowrap" }}>{pct}%</Text>
            </div>
          );
        })()}

        {/* View Detail Button */}
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Button type="link" size="small" style={{ color: "#FFD700", fontSize: 11, padding: 0 }}
            onClick={(e) => { e.stopPropagation(); setDetailModal(c); }}>
           查看详情 →
          </Button>
        </div>
      </Card>
    );
  }
};

export default CampaignTab;
