import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import useLanguageStore from '../../stores/languageStore';
﻿import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Row, Col, Statistic, Button, Typography, Tag, Space, List, Avatar, message, Table, Tabs, Modal, Empty } from 'antd';
import {
  ShopOutlined, ScanOutlined, StarOutlined, TeamOutlined, CrownOutlined,
  ArrowLeftOutlined, GiftOutlined, ThunderboltOutlined, QrcodeOutlined,
  PhoneOutlined, MailOutlined, EnvironmentOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import localDb from '../../services/db/localDb';
import seedData from '../../services/db/seedData';
import { FAN_LEVELS } from '../../utils/constants';

const { Title, Text } = Typography;

const StoreOwnerPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const [store, setStore] = useState(null);
  const [fans, setFans] = useState([]);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({ fanCount: 0, totalPoints: 0, scanCount: 0, campaigns: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [claimedCampaigns, setClaimedCampaigns] = useState([]);
  const [reviewModal, setReviewModal] = useState({ open: false, claim: null });
  const [reviewForm, setReviewForm] = useState({ materials_used: 0, effect: 'good', feedback: '' });

  useEffect(() => {
    if (localDb.needsInit()) localDb.init(seedData);

    const stores = localDb.all('stores');
    if (stores.length > 0) {
      setStore(stores[0]);
      const storeFans = localDb.find('fans', (f) => f.store_id === stores[0].id);
      const storeScans = localDb.find('scan_records', (r) => r.store_id === stores[0].id);
      const allCampaignsData = localDb.all('campaigns');
      const storeCampaigns = allCampaignsData.filter(c => c.target_stores && c.target_stores.includes(stores[0].id));

      setFans(storeFans);
      setScans(storeScans.slice(0, 20));
      setAllCampaigns(allCampaignsData);
      setStats({
        fanCount: storeFans.length,
        totalPoints: storeFans.reduce((s, f) => s + (f.points || 0), 0),
        scanCount: storeScans.length,
        campaigns: storeCampaigns.length,
      });
    }
  }, []);

  if (!store) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0f' }}>
        <Card><Title level={4}>No store data available</Title></Card>
      </div>
    );
  }

  const levelColors = { S: 'purple', A: 'red', B: 'blue', C: 'default' };
  const getLevelTag = (level) => {
    const colors = { bronze: '#CD7F32', silver: '#8b949e', gold: '#d97706', platinum: '#64748b', diamond: '#0891b2' };
    return <Tag color={colors[level] || 'default'}>{level}</Tag>;
  };

  const Dashboard = () => (
    <>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small" hoverable style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(245,166,35,0.06) 100%)' }}
            onClick={() => setActiveTab('fans')}>
            <TeamOutlined style={{ fontSize: 24, color: '#667eea' }} />
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{stats.fanCount}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Fans</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable style={{ textAlign: 'center', borderRadius: 12, background: '#1a1a25' }}
            onClick={() => setActiveTab('scans')}>
            <QrcodeOutlined style={{ fontSize: 24, color: '#FFD700' }} />
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{stats.scanCount}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Scans</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable style={{ textAlign: 'center', borderRadius: 12, background: '#1a1a25' }}>
            <StarOutlined style={{ fontSize: 24, color: '#faad14' }} />
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{stats.totalPoints}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Points</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable style={{ textAlign: 'center', borderRadius: 12, background: '#1a1a25' }}
            onClick={() => window.location.href='/fan-app.html#/fan-center'}>
            <ThunderboltOutlined style={{ fontSize: 24, color: '#52c41a' }} />
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{stats.campaigns}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Campaigns</Text>
          </Card>
        </Col>
      </Row>

      <Card title="Store Details" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
        <List size="small" dataSource={[
          { icon: <EnvironmentOutlined />, label: 'Address', value: store.address || '-' },
          { icon: <PhoneOutlined />, label: 'Phone', value: store.phone || '-' },
          { icon: <Tag />, label: 'Level', value: <Tag color={levelColors[store.level]}>{store.level || 'N/A'}</Tag> },
          { icon: <ShopOutlined />, label: 'City', value: store.city || '-' },
          { icon: <ClockCircleOutlined />, label: 'Created', value: store.created_at ? new Date(store.created_at).toLocaleDateString() : '-' },
        ]} renderItem={(item) => (
          <List.Item style={{ padding: '8px 0' }}>
            <Space><span style={{ color: '#999' }}>{item.icon}</span><Text type="secondary" style={{ fontSize: 13 }}>{item.label}</Text></Space>
            <Text style={{ fontSize: 13 }}>{item.value}</Text>
          </List.Item>
        )} />
      </Card>

      <Row gutter={12}>
        <Col span={12}>
          <Button block style={{ borderRadius: 12, height: 48 }} icon={<TeamOutlined />}
            onClick={() => setActiveTab('fans')}>
            View All Fans ({stats.fanCount})
          </Button>
        </Col>
        <Col span={12}>
          <Button block style={{ borderRadius: 12, height: 48 }} icon={<QrcodeOutlined />}
            onClick={() => window.location.href='/fan-app.html#/fan-center'}>
            Fan Center
          </Button>
        </Col>
      </Row>
    </>
  );

  const FansTab = () => {
    const columns = [
      { title: 'ID', dataIndex: 'id', key: 'id', render: (t) => <Text copyable style={{ fontSize: 12 }}>{t}</Text> },
      { title: 'Level', dataIndex: 'level', key: 'level', render: (l) => getLevelTag(l) },
      { title: 'Points', dataIndex: 'points', key: 'points', render: (p) => <Text strong>{p}</Text> },
      { title: 'Joined', dataIndex: 'created_at', key: 'created_at', render: (d) => d ? new Date(d).toLocaleDateString() : '-' },
    ];
    return (
      <Card title={<Space><TeamOutlined />Store Fans ({fans.length})</Space>} size="small" style={{ borderRadius: 12 }}>
        <Table dataSource={fans} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 5 }} />
      </Card>
    );
  };

  const CampaignsTab = () => {
    const storeCampaigns = allCampaigns.filter(c => c.target_stores && c.target_stores.includes(store.id));
    const handleClaim = (camp) => {
      if (claimedCampaigns.some(cx => cx.campaign_id === camp.id)) {
        message.warning("Already claimed!");
        return;
      }
      localDb.insert("campaign_claims", {
        id: "cc-" + Date.now(),
        store_id: store.id,
        campaign_id: camp.id,
        campaign_name: camp.name,
        claimed_at: new Date().toISOString(),
        status: "pending",
      });
      setClaimedCampaigns(prev => [...prev, { campaign_id: camp.id, campaign_name: camp.name, status: "pending" }]);
      message.success("Campaign claimed! Materials will be dispatched.");
    };

    const handleOpenReview = (cl) => {
      setReviewForm({ materials_used: 0, effect: "good", feedback: "" });
      setReviewModal({ open: true, claim: cl });
    };

    const handleSubmitReview = () => {
      if (!reviewModal.claim) return;
      localDb.insert("campaign_reviews", {
        id: "cr-" + Date.now(),
        store_id: store.id,
        campaign_id: reviewModal.claim.campaign_id,
        campaign_name: reviewModal.claim.campaign_name,
        materials_used: reviewForm.materials_used,
        effect: reviewForm.effect,
        feedback: reviewForm.feedback,
        submitted_at: new Date().toISOString(),
      });
      setClaimedCampaigns(prev => prev.map(cl => cl.campaign_id === reviewModal.claim.campaign_id ? {...cl, status: "reviewed"} : cl));
      setReviewModal({ open: false, claim: null });
      message.success("Review submitted! Thank you for your feedback.");
    };

    return (
      <>
        <Card title={"Available Campaigns (" + storeCampaigns.length + ")"} size="small" style={{borderRadius:12,marginBottom:16}}>
          {storeCampaigns.length === 0 ? (
            <Empty description="No active campaigns" />
          ) : (
            <List
              dataSource={storeCampaigns}
              renderItem={(camp) => {
                const claimed = claimedCampaigns.some(cx => cx.campaign_id === camp.id);
                return (
                  <List.Item actions={[<Button type={claimed ? "default" : "primary"} size="small" disabled={claimed} onClick={() => handleClaim(camp)} style={{borderRadius:6}}>{claimed ? "Claimed" : "Claim"}</Button>]}>
                    <List.Item.Meta
                      avatar={<GiftOutlined style={{fontSize:24,color:camp.status === "active" ? "#52c41a" : "#faad14"}} />}
                      title={<Text strong>{camp.name}</Text>}
                      description={<Text type="secondary" style={{fontSize:12}}>{(camp.description || "").substring(0,80)}...</Text>}
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
        <Card title={"My Claims (" + claimedCampaigns.length + ")"} size="small" style={{borderRadius:12}}>
          {claimedCampaigns.length === 0 ? (
            <Empty description="Claim campaigns to get materials" />
          ) : (
            <List dataSource={claimedCampaigns} renderItem={(cl) => (
              <List.Item>
                <List.Item.Meta title={<Text strong>{cl.campaign_name || "Campaign"}</Text>} description={<Space><Tag color={cl.status === "completed" ? "green" : cl.status === "reviewed" ? "blue" : "gold"}>{cl.status || "pending"}</Tag></Space>} />
                {cl.status !== "reviewed" && <Button size="small" type="link" onClick={() => handleOpenReview(cl)} style={{color:"#FFD700"}}>Review</Button>}
              </List.Item>
            )} />
          )}
        </Card>

      <Modal title={"Review: " + (reviewModal.claim?.campaign_name || "")} open={reviewModal.open} onCancel={() => setReviewModal({open:false,claim:null})} onOk={handleSubmitReview} okText="Submit Review">
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:6}}>Materials Used (units)</div>
            <InputNumber min={0} value={reviewForm.materials_used} onChange={(v) => setReviewForm(prev => ({...prev, materials_used: v}))} style={{width:"100%"}} />
          </div>
          <div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:6}}>Effect Rating</div>
            <Select value={reviewForm.effect} onChange={(v) => setReviewForm(prev => ({...prev, effect: v}))} style={{width:"100%"}}>
              <Select.Option value="great">🌟 Great</Select.Option>
              <Select.Option value="good">👍 Good</Select.Option>
              <Select.Option value="average">👌 Average</Select.Option>
              <Select.Option value="poor">👎 Poor</Select.Option>
            </Select>
          </div>
          <div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:6}}>Feedback</div>
            <Input.TextArea rows={3} value={reviewForm.feedback} onChange={(e) => setReviewForm(prev => ({...prev, feedback: e.target.value}))} placeholder="How did the campaign perform at your store?" />
          </div>
        </div>
      </Modal>
      </>
    );
  };

  const MaterialsTab = () => {
    const levelMap = { S: 4, A: 3, B: 2, C: 1 };
    const maxItems = levelMap[store.level] || 1;
    const available = storeMaterials.slice(0, maxItems);

    return (
      <Card title={"Materials (Level " + store.level + ")"} size="small" style={{borderRadius:12}}>
        {available.length === 0 ? (
          <Empty description="No materials" />
        ) : (
          <Row gutter={[12,12]}>
            {available.map((m) => (
              <Col span={12} key={m.id}>
                <Card size="small" hoverable style={{borderRadius:10,background:"#1a1a25",border:"1px solid #2a2a35"}}>
                  <GiftOutlined style={{color:"#FFD700",fontSize:20,marginBottom:8}} />
                  <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{m.name}</div>
                  <Tag style={{fontSize:10}}>{m.category}</Tag>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:4}}>{m.unit} / {"$"}{m.unit_cost}</div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        <Text type="secondary" style={{display:"block",marginTop:12,fontSize:11}}>* Higher store levels unlock more materials</Text>
      </Card>
    );
  };

  const ScansTab = () => {
    const columns = [
      { title: 'Product', dataIndex: 'product_name', key: 'product_name', render: (t) => t || '-' },
      { title: 'Fan ID', dataIndex: 'fan_id', key: 'fan_id', render: (t) => <Text copyable style={{ fontSize: 12 }}>{t}</Text> },
      { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: (d) => d ? new Date(d).toLocaleString() : '-' },
      { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'verified' ? 'green' : 'default'}>{s || 'pending'}</Tag> },
    ];
    return (
      <Card title={<Space><QrcodeOutlined />Recent Scans ({scans.length})</Space>} size="small" style={{ borderRadius: 12 }}>
        <Table dataSource={scans} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 5 }} />
      </Card>
    );
  };

  const tabItems = [
    { key: 'dashboard', label: 'Dashboard', children: <Dashboard /> },
    { key: 'campaigns', label: 'Campaigns', children: <CampaignsTab /> },
    { key: 'materials', label: "Materials (" + storeMaterials.length + ")", children: <MaterialsTab /> },
    { key: 'fans', label: `Fans (${stats.fanCount})`, children: <FansTab /> },
    { key: 'scans', label: `Scans (${stats.scanCount})`, children: <ScansTab /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a0f 50%, #2a2a0f 100%)',
        padding: '20px 16px', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Button type="text" icon={<ArrowLeftOutlined style={{ color: '#fff', fontSize: 20 }} />}
            onClick={() => window.location.href='/fan-app.html#/fan-center'} style={{ marginRight: 8 }} />
          <LanguageSwitcher inline />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}><ShopOutlined /> {store.name}</div>
            <Tag color="blue" style={{ marginTop: 4 }}>Level {store.level || 'N/A'}</Tag>
          </div>
          <Button size="small" style={{ borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
            icon={<CrownOutlined />} onClick={() => window.location.href='/fan-app.html#/fan-center'}>粉丝</Button>
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>
    </div>
  );
};

export default StoreOwnerPage;


