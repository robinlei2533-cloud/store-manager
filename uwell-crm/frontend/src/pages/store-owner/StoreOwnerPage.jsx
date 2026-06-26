import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button, Typography, Tag, Space, List, Avatar, message, Table, Tabs, Modal } from 'antd';
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
  const [store, setStore] = useState(null);
  const [fans, setFans] = useState([]);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({ fanCount: 0, totalPoints: 0, scanCount: 0, campaigns: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (localDb.needsInit()) localDb.init(seedData);

    const stores = localDb.all('stores');
    if (stores.length > 0) {
      setStore(stores[0]);
      const storeFans = localDb.find('fans', (f) => f.store_id === stores[0].id);
      const storeScans = localDb.find('scan_records', (r) => r.store_id === stores[0].id);
      const storeCampaigns = localDb.find('campaigns', (c) => c.store_id === stores[0].id);

      setFans(storeFans);
      setScans(storeScans.slice(0, 20));
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
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f7fa' }}>
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
          <Card size="small" hoverable style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}
            onClick={() => setActiveTab('fans')}>
            <TeamOutlined style={{ fontSize: 24, color: '#667eea' }} />
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{stats.fanCount}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Fans</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable style={{ textAlign: 'center', borderRadius: 12, background: '#f0f5ff' }}
            onClick={() => setActiveTab('scans')}>
            <QrcodeOutlined style={{ fontSize: 24, color: '#1677ff' }} />
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{stats.scanCount}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Scans</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable style={{ textAlign: 'center', borderRadius: 12, background: '#fff7e6' }}>
            <StarOutlined style={{ fontSize: 24, color: '#faad14' }} />
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{stats.totalPoints}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Points</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable style={{ textAlign: 'center', borderRadius: 12, background: '#f6ffed' }}
            onClick={() => navigate('/#/fan-center')}>
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
            onClick={() => navigate('/#/fan-center')}>
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
    { key: 'fans', label: `Fans (${stats.fanCount})`, children: <FansTab /> },
    { key: 'scans', label: `Scans (${stats.scanCount})`, children: <ScansTab /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
        padding: '20px 16px', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Button type="text" icon={<ArrowLeftOutlined style={{ color: '#fff', fontSize: 20 }} />}
            onClick={() => navigate('/')} style={{ marginRight: 8 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}><ShopOutlined /> {store.name}</div>
            <Tag color="blue" style={{ marginTop: 4 }}>Level {store.level || 'N/A'}</Tag>
          </div>
          <Button size="small" style={{ borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
            icon={<CrownOutlined />} onClick={() => navigate('/#/admin')}>Admin</Button>
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>
    </div>
  );
};

export default StoreOwnerPage;
