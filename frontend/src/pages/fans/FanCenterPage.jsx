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
import CampaignTab from './tabs/CampaignTab';
// ============ Main Fan Center Page ============
const FanCenterPage = () => {
  const navigate = useNavigate();
  const { t, setLang } = useLanguageStore();
  const { user, profile, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('checkin');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: fans = [], isLoading } = useQuery({
    queryKey: ['fans', refreshKey],
    queryFn: () => getFans({}),
  });

  // Find current fan by user ID or fall back to first fan
  let currentFan = fans.find((f) => f.user_id === (user && user.id)) || fans[0] || null;

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
          <Empty description={t('no_data')} />
          <Button type="primary" onClick={handleLogout} style={{ marginTop: 16 }}>{t('back')}</Button>
        </Card>
      </div>
    );
  }

  const levelInfo = FAN_LEVELS.find((l) => l.value === currentFan.level) || FAN_LEVELS[0];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', paddingBottom: 24, position: 'relative', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Decorative glow */}
      <div style={{position:'fixed',top:'-20%',right:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,168,0,0.06) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}} />
      <div style={{position:'fixed',bottom:'-10%',left:'-5%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,215,0,0.04) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}} />
      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #191400 50%, #2a1f00 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
        padding: '16px 20px', color: '#fff', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,215,0,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Avatar size={36} icon={<UserOutlined />} style={{background:'#FFD700',color:'#0a0a0f',border:'2px solid rgba(255,215,0,0.3)'}} />
            <div>
              <div style={{fontSize:13,fontWeight:600}}>{currentFan.name || t('fan_profile')}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>{currentFan.phone || '---'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#FFD700' }}>{currentFan.points} <span style={{fontSize:11,fontWeight:400,color:"rgba(255,215,0,0.6)"}}>pts</span></div>
              <Tag color={levelInfo.color} style={{ fontSize: 10, margin: 0 }}>{levelInfo.label}</Tag>
            </div>
            <Dropdown menu={{
              items: [
                { key: 'owner', icon: <ShopOutlined />, label: t('settings_store') },
                { key: 'admin', icon: <SettingOutlined />, label: t('settings_admin') },
                { type: 'divider' },
                { key: 'lang_zh', icon: <span role='img'>🇨🇳</span>, label: '中文' },
                { key: 'lang_en', icon: <span role='img'>🇬🇧</span>, label: 'English' },
                { key: 'lang_ar', icon: <span role='img'>🇸🇦</span>, label: 'العربية' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: t('logout'), danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'owner') window.location.href = 'store-app.html#/store-owner';
                else if (key === 'admin') window.location.href = '/index.html#/admin';
                else if (key === 'lang_zh') setLang('zh');
                else if (key === 'lang_en') setLang('en');
                else if (key === 'lang_ar') setLang('ar');
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
              label: <span>{t('fan_check_in')}</span>,
              children: <div className="fc-tab-content"><CheckInTab fan={currentFan} onPointsChange={handlePointsChange} /></div>,
            },
            {
              key: 'scan',
              label: <span>{t('fan_scan')}</span>,
              children: <div className="fc-tab-content"><ScanTab fan={currentFan} onPointsChange={handlePointsChange} /></div>,
            },
            {
              key: 'mall',
              label: <span>{t('fan_products')}</span>,
              children: <div className="fc-tab-content"><MallTab fan={currentFan} onPointsChange={handlePointsChange} /></div>,
            },
            {
              key: 'invite',
              label: <span>{t('fan_invite')}</span>,
              children: <div className="fc-tab-content"><InviteTab fan={currentFan} /></div>,
            },
            {
              key: 'community',
              label: <span>{t('fan_community')}</span>,
              children: <div className="fc-tab-content"><CommunityTab fan={currentFan} /></div>,
            },
            {
              key: 'campaigns',
              label: <span>{t('fan_activities')}</span>,
              children: <div className="fc-tab-content"><CampaignTab fan={currentFan} /></div>,
            },
            {
              key: 'map',
              label: <span>🗺️ Map</span>,
              children: <div className="fc-tab-content"><MapTab fan={currentFan} /></div>,
            },
            {
              key: 'help',
              label: <span>{t('fan_help')}</span>,
              children: <div className="fc-tab-content"><HowItWorksTab /></div>,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FanCenterPage;




