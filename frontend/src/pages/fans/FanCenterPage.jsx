import useLanguageStore from '../../stores/languageStore';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Tabs, Button, Row, Col, Statistic, Tag, Spin, Empty, Space, message, Progress, List, Input, Typography, Divider, Avatar, Dropdown } from 'antd';
import {
  CheckCircleOutlined, QrcodeOutlined, GiftOutlined, TeamOutlined, MessageOutlined,
  QuestionCircleOutlined, CopyOutlined, LikeOutlined, StarOutlined, CrownOutlined,
  ThunderboltOutlined, LogoutOutlined, FireOutlined, UserOutlined,
  SettingOutlined, ShopOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import seedData from '../../services/db/seedData';
import { getFans, addFanPoints, getQrCodes, scanQrCode, getScanRecords } from '../../services/api';
import { FAN_LEVELS, MALL_ITEMS } from '../../utils/constants';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

import CheckInTab from './tabs/CheckInTab';
import ScanTab from './tabs/ScanTab';
import MallTab from './tabs/MallTab';
import InviteTab from './tabs/InviteTab';
import CommunityTab from './tabs/CommunityTab';
import HowItWorksTab from './tabs/HowItWorksTab';
import MapTab from './tabs/MapTab';
// ============ Main Fan Center Page ============
const FanCenterPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const { user, profile, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('checkin');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: fans = [], isLoading } = useQuery({
    queryKey: ['fans', refreshKey],
    queryFn: () => getFans({}),
  });

  // Find current fan 閳?match by user ID or fall back to first fan
  let currentFan = fans.find((f) => f.user_id === user?.id) || fans[0] || null;

  // Ensure DB is initialized
  if (localDb.needsInit()) { localDb.init(seedData); }

  // Auto-find fan from localStorage user session
  if (!currentFan) {
    const savedFanId = localStorage.getItem("store_manager_current_user");
    if (savedFanId) {
      const savedFan = localDb.findById("fans", savedFanId);
      if (savedFan) { currentFan = savedFan; }
    }
  }

  // Final fallback: use first seed fan
  if (!currentFan) {
    const allFans = localDb.all("fans");
    if (allFans.length > 0) {
      currentFan = allFans[0];
      localStorage.setItem("store_manager_current_user", currentFan.id);
    }
  }


  const handlePointsChange = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = async () => {
    localStorage.removeItem('store_manager_current_user');
    localStorage.removeItem('fan_logged_in');
    localStorage.removeItem('store_owner_mode');
    await signOut();
    window.location.href = 'fan-app.html#/fan-entry';
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div>;
  }

  if (!currentFan) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Card style={{ textAlign: 'center', maxWidth: 400, borderRadius: 16 }}>
          <Empty description="No fan profile found. Please contact support." />
          <Button type="primary" onClick={handleLogout} style={{ marginTop: 16 }}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const levelInfo = FAN_LEVELS.find((l) => l.value === currentFan.level) || FAN_LEVELS[0];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: 24 }}>
      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a23 0%, #1a1a4e 50%, #2d1b69 100%)',
        padding: '16px 20px', color: '#fff', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2, background: 'linear-gradient(90deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              UWELL
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>FAN CLUB</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#faad14' }}>{currentFan.points} pts</div>
              <Tag color={levelInfo.color} style={{ fontSize: 10, margin: 0 }}>{levelInfo.label}</Tag>
            </div>
            <Dropdown menu={{
              items: [
                { key: 'owner', icon: <ShopOutlined />, label: 'Store Owner Portal' },
                { key: 'admin', icon: <SettingOutlined />, label: 'Admin Login' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'owner') window.location.href = 'store-app.html#/store-owner';
                else if (key === 'admin') window.location.href = '/#/admin';
                else if (key === 'logout') handleLogout();
              },
            }} placement="bottomRight">
              <Button type="text" size="small" icon={<SettingOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} />
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 12px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          size="small"
          items={[
            {
              key: 'checkin',
              label: <span>棣冩惍 Check-in</span>,
              children: <CheckInTab fan={currentFan} onPointsChange={handlePointsChange} />,
            },
            {
              key: 'scan',
              label: <span>棣冩懌 Scan</span>,
              children: <ScanTab fan={currentFan} onPointsChange={handlePointsChange} />,
            },
            {
              key: 'mall',
              label: <span>棣冨返 Rewards</span>,
              children: <MallTab fan={currentFan} onPointsChange={handlePointsChange} />,
            },
            {
              key: 'invite',
              label: <span>棣冩噧 Invite</span>,
              children: <InviteTab fan={currentFan} />,
            },
            {
              key: 'community',
              label: <span>棣冩尠 Community</span>,
              children: <CommunityTab fan={currentFan} />,
            },
            {
              key: 'help',
              label: <span>閴?Help</span>,
              children: <HowItWorksTab />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FanCenterPage;



