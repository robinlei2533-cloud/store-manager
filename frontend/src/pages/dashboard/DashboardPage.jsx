import useLanguageStore from '../../stores/languageStore';
import React, { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
gsap.registerPlugin(useGSAP);
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Empty, Typography, Alert, List, Progress, Badge } from 'antd';
import {
  ShopOutlined, CameraOutlined, ClockCircleOutlined, TeamOutlined, InboxOutlined,
  WarningOutlined, RiseOutlined, ThunderboltOutlined, QrcodeOutlined, StarOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import localDb from "../../services/db/localDb";
import useAuthStore from '../../stores/authStore';
import {
  getDashboardStats, getVisitTrend, getStoreDistribution, getVisits,
  getCampaigns, getScanRecords, getMaterialStocks, IS_LOCAL_MODE,
} from '../../services/api';

const { Title, Text } = Typography;
const COLORS = ['#FFD700', '#FFD700', '#F5A623', '#D4A800', '#8B7500'];
const LEVEL_COLORS = { S: '#FFD700', A: '#FFD700', B: '#B8860B', C: '#8B7500', platinum: '#FFD700', gold: '#FFD700', silver: '#B8860B', bronze: '#8B7500' };

const StatCard = ({ icon, label, value, color = '#FFD700', delay = 0 }) => {
  const cardRef = useRef(null);
  const { t } = useLanguageStore();
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useGSAP(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 30,
      scale: 0.95,
      duration: 0.6,
      delay: delay * 0.1,
      ease: 'power3.out',
      clearProps: 'all',
    });
  }, { scope: cardRef });
  
  useEffect(() => {
    if (!value) return;
    const start = performance.now();
    const duration = 1200;
    const numValue = parseInt(value) || 0;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(numValue * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div ref={cardRef} className="liquid-glass" style={{
      padding: '18px 16px',
      borderRadius: 16,
      textAlign: 'center',
      border: '1px solid rgba(255,215,0,0.08)',
    }}>
      <div style={{ fontSize: 22, color, marginBottom: 6, opacity: 0.8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
        {typeof value === 'number' ? animatedValue.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
};

const DashboardPage = () => {
  const profile = useAuthStore((s) => s.profile);

  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });
  const { data: trendData, isLoading: trendLoading } = useQuery({ queryKey: ['visit-trend'], queryFn: () => getVisitTrend(30) });
  const { data: storeDistribution } = useQuery({ queryKey: ['store-distribution'], queryFn: getStoreDistribution });
  const { data: recentVisits, isLoading: visitsLoading } = useQuery({ queryKey: ['recent-visits'], queryFn: () => getVisits({}) });
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({ queryKey: ['dashboard-campaigns'], queryFn: () => getCampaigns({}) });
  const { data: scanRecords, isLoading: scansLoading } = useQuery({ queryKey: ['dashboard-scans'], queryFn: () => getScanRecords({}) });
  const { data: materialStocks, isLoading: stockLoading } = useQuery({ queryKey: ['dashboard-stocks'], queryFn: getMaterialStocks });
  const [pendingClaims, setPendingClaims] = useState([]);
  useEffect(() => {
    try {
      const all = localDb.all('campaign_claims') || [];
      setPendingClaims(all.filter(cl => cl.status === 'pending'));
    } catch(e) {}
  }, []);

  const levelPieData = storeDistribution?.reduce((acc, store) => {
    const level = store.level || 'Unrated';
    const existing = acc.find((i) => i.name === level);
    if (existing) existing.value += 1;
    else acc.push({ name: level, value: 1 });
    return acc;
  }, []) || [];

  const lowStockItems = materialStocks?.filter((s) => s.qty <= s.safety_stock) || [];

  const recentVisitColumns = [
    { title: 'Store', dataIndex: ['stores', 'name'], key: 'store', ellipsis: true },
    { title: 'Rep', dataIndex: ['profiles', 'name'], key: 'rep' },
    { title: 'Date', dataIndex: 'visit_date', key: 'date', render: (d) => (d ? new Date(d).toLocaleDateString('en-US') : '-'), width: 110 },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 100,
      render: (s) => {
        const map = { draft: { color: 'default', text: 'Draft' }, completed: { color: 'success', text: 'Done' }, cancelled: { color: 'error', text: 'Cancelled' } };
        const item = map[s] || { color: 'default', text: s };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        <RiseOutlined /> Dashboard
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 12 }}>Welcome back, {profile?.name || 'User'}</Text>
      </Title>

      {IS_LOCAL_MODE && (
        <Alert type="info" message="Local Demo Mode" description="Data is stored in your browser. Configure Supabase to enable cloud mode with multi-user collaboration." showIcon style={{ marginBottom: 16 }} />
      )}

            <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<ShopOutlined />} label="Store" value={stats?.storeCount || 0} color="#FFD700" delay={0} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<CameraOutlined />} label="Visits" value={stats?.totalVisits || 0} color="#FFD700" delay={1} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<TeamOutlined />} label="Fans" value={stats?.totalFans || 0} color="#F5A623" delay={2} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<ThunderboltOutlined />} label="Campaigns" value={stats?.activeCampaigns || 0} color="#FFD700" delay={3} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<QrcodeOutlined />} label="Scans" value={stats?.todayScans || 0} color="#FFD700" delay={4} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<WarningOutlined />} label="Low Stock" value={stats?.lowStockCount || 0} color={stats?.lowStockCount > 0 ? '#ff4d4f' : '#52c41a'} delay={5} /></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title={<><CameraOutlined /> 30-Day Visit Trend</>}>
            {trendLoading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div> :
             trendData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="visit_date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1677ff" strokeWidth={2} dot={{ r: 3 }} name="Visits" />
                </LineChart>
              </ResponsiveContainer>
            ) : <Empty description="No visit data" style={{ padding: '60px 0' }} />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><StarOutlined /> Store Level Distribution</>}>
            {levelPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={levelPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {levelPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={LEVEL_COLORS[entry.name] || COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty description="No store data" style={{ padding: '60px 0' }} />}
          </Card>
        </Col>
      </Row>

      {/* Pending Material Dispatch */}
      {pendingClaims.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title={`📦 Material Dispatch Needed (${pendingClaims.length})`} size="small">
              <List size="small" dataSource={pendingClaims} renderItem={(cl) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge status="processing" />}
                    title={<span style={{color:"#e5e5e5"}}>{cl.campaign_name || "Campaign"}</span>}
                    description={`Store: ${cl.store_id || "N/A"} · Claimed: ${new Date(cl.claimed_at).toLocaleDateString()}`}
                  />
                  <Tag color="volcano">Needs Dispatch</Tag>
                </List.Item>
              )} />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><ThunderboltOutlined /> Campaign Overview</>}>
            {campaignsLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> :
             campaigns?.length > 0 ? (
              <List size="small" dataSource={campaigns.slice(0, 5)} renderItem={(c) => (
                <List.Item>
                  <List.Item.Meta title={<span><Tag color={c.status === 'ongoing' ? 'processing' : c.status === 'completed' ? 'default' : 'blue'}>{c.status === 'ongoing' ? 'Ongoing' : c.status === 'completed' ? 'Completed' : c.status === 'planned' ? 'Planned' : 'Cancelled'}</Tag>{c.name}</span>} description={`${c.type} · ${c.start_date} ~ ${c.end_date} · ${c.store_count || (c.target_stores?.length || 0)} stores`} />
                </List.Item>
              )} />
            ) : <Empty description="No campaigns" style={{ padding: '40px 0' }} />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><WarningOutlined /> Low Stock Alerts</>}>
            {stockLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> :
             lowStockItems.length > 0 ? (
              <List size="small" dataSource={lowStockItems} renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={<span><Badge status={item.qty === 0 ? 'error' : 'warning'} />{item.materials?.name}</span>} description={<span>Current: <Text type="danger" strong>{item.qty}</Text> / Safety: {item.safety_stock} {item.materials?.unit}<Progress percent={Math.round((item.qty / (item.safety_stock * 2)) * 100)} size="small" status={item.qty === 0 ? 'exception' : 'active'} style={{ maxWidth: 200, marginTop: 4 }} /></span>} />
                </List.Item>
              )} />
            ) : <Empty description="All stock levels are healthy" style={{ padding: '40px 0' }} />}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={<><CameraOutlined /> Recent Visits</>}>
            <Table columns={recentVisitColumns} dataSource={recentVisits?.slice(0, 8) || []} rowKey="id" loading={visitsLoading} pagination={false} size="small" scroll={{ x: true }} locale={{ emptyText: 'No visit records' }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><QrcodeOutlined /> Recent Scans</>}>
            {scansLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> :
             scanRecords?.length > 0 ? (
              <List size="small" dataSource={scanRecords.slice(0, 8)} renderItem={(r) => (
                <List.Item>
                  <List.Item.Meta avatar={<QrcodeOutlined style={{ fontSize: 20, color: '#722ed1' }} />} title={`${r.products?.name || 'Unknown'} · +${r.points_earned} pts`} description={`${r.stores?.name || ''} · ${new Date(r.created_at).toLocaleString('en-US')}`} />
                </List.Item>
              )} />
            ) : <Empty description="No scan records" style={{ padding: '40px 0' }} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
