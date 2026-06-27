import React, { useState, useEffect } from "react";
import { Card, Tag, Button, Spin, Empty, Typography, Space, List, Progress } from "antd";
import { GiftOutlined, FireOutlined, EnvironmentOutlined } from "@ant-design/icons";
import localDb from "../../../services/db/localDb";

const { Text, Title } = Typography;

const TYPE_COLORS = {
  "新品上市": "#457bff",
  "节日营销": "#ff6b35",
  "渠道建设": "#6c5ce7",
  "社群运营": "#00b894",
  "促销活动": "#fdcb6e",
};

const STATUS_MAP = {
  ongoing: { label: "进行中", color: "green" },
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
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const seed = localDb.all("campaigns") || [];
    if (seed.length === 0) {
      import("../../../services/db/seedData").then((m) => {
        localDb.init(m.default);
        setCampaigns(localDb.all("campaigns") || []);
        setLoading(false);
      });
    } else {
      setCampaigns(seed);
      setLoading(false);
    }
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
          <FireOutlined /> UWELL Campaigns
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          Join brand activities and earn bonus rewards
        </Text>
      </div>

      {/* Ongoing Campaigns */}
      {ongoing.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ color: "#52c41a", fontSize: 13, display: "block", marginBottom: 8 }}>
            ● Ongoing ({ongoing.length})
          </Text>
          {ongoing.map((c) => renderCampaignCard(c, true))}
        </div>
      )}

      {/* Past Campaigns */}
      {past.length > 0 && (
        <div>
          <Text strong style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, display: "block", marginBottom: 8 }}>
            Past Campaigns ({past.length})
          </Text>
          {past.slice(0, 3).map((c) => renderCampaignCard(c, false))}
        </div>
      )}

      {campaigns.length === 0 && <Empty description="No campaigns yet" />}
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
        hoverable
        style={{
          marginBottom: 10,
          borderRadius: 12,
          background: "linear-gradient(135deg, #1a1a25 0%, #1a1a1f 100%)",
          border: isOngoing ? "1px solid rgba(82,196,26,0.2)" : "1px solid #2a2a35",
          cursor: "pointer",
        }}
        onClick={() => setSelected(selected?.id === c.id ? null : c)}
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
            <Tag color="volcano" style={{ fontSize: 10, fontWeight: 600 }}>
              {days} days left
            </Tag>
          )}
        </div>

        <Text strong style={{ color: "#e5e5e5", fontSize: 14, display: "block", marginBottom: 4 }}>
          <GiftOutlined style={{ marginRight: 6, color: "#FFD700" }} />
          {c.name}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, display: "block", marginBottom: 4 }}>
          {c.description?.substring(0, 100)}
          {c.description?.length > 100 ? "..." : ""}
        </Text>

        {selected?.id === c.id && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Start</div>
                <div style={{ color: "#e5e5e5" }}>{new Date(c.start_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>End</div>
                <div style={{ color: "#e5e5e5" }}>{new Date(c.end_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Budget</div>
                <div style={{ color: "#e5e5e5" }}>SAR {c.budget?.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Stores</div>
                <div style={{ color: "#e5e5e5" }}>{c.target_stores?.length || 0} stores</div>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }
};

export default CampaignTab;
