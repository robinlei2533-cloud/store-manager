import useLanguageStore from '../../stores/languageStore';
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { IS_LOCAL_MODE } from '../../services/api';
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

const FAN_CENTER_BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4';

// ============ Main Fan Center Page ============
const FanCenterPage = () => {
  const navigate = useNavigate();
  const { t, setLang } = useLanguageStore();
  const { user, profile, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('checkin');
  const [refreshKey, setRefreshKey] = useState(0);
  const bgVideoRef = useRef(null);

  const { data: fans = [], isLoading } = useQuery({
    queryKey: ['fans', refreshKey],
    queryFn: () => getFans({}),
  });

  useEffect(() => {
    const video = bgVideoRef.current;
    if (isLoading || !video) return undefined;

    let rafId = 0;
    let resetTimer = 0;
    let isFadingOut = false;
    let disposed = false;

    const fadeVideo = (targetOpacity, duration = 500) => {
      cancelAnimationFrame(rafId);
      const startOpacity = Number.parseFloat(video.style.opacity || '0') || 0;
      const startedAt = performance.now();

      const tick = (now) => {
        if (disposed) return;
        const progress = Math.min((now - startedAt) / duration, 1);
        video.style.opacity = String(startOpacity + (targetOpacity - startOpacity) * progress);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };

    const handleCanPlay = () => {
      playVideo();
      fadeVideo(1);
    };

    const handleTimeUpdate = () => {
      if (!video.duration || isFadingOut) return;
      if (video.duration - video.currentTime <= 0.55) {
        isFadingOut = true;
        fadeVideo(0);
      }
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        if (disposed) return;
        video.currentTime = 0;
        isFadingOut = false;
        playVideo();
        fadeVideo(1);
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    if (video.readyState >= 3) handleCanPlay();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.clearTimeout(resetTimer);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isLoading]);

  // Find current fan by user ID or fall back to first fan
  let currentFan = fans.find((f) => f.user_id === user?.id) || fans[0] || null;

  // Realtime subscription: listen for point changes in Supabase mode
  useRealtimeSubscription('fan_points_log', { event: 'INSERT' }, (payload) => {
    const newLog = payload.new;
    if (currentFan && newLog.fan_id === currentFan.id && !IS_LOCAL_MODE) {
      const pts = newLog.points > 0 ? '+'.concat(newLog.points) : String(newLog.points);
      message.success(
        '积分变动: '.concat(pts, ' 分 — ', newLog.reason || ''),
      );
      queryClient.invalidateQueries({ queryKey: ['fans'] });
      queryClient.invalidateQueries({ queryKey: ['fan-points-log'] });
    }
  });

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
    <div className='fan-center-liquid-shell bg-radial-center' style={{ minHeight: '100vh', background: '#000000', paddingBottom: 24, position: 'relative' }}>
      <video
        ref={bgVideoRef}
        className="fan-center-bg-video"
        src={FAN_CENTER_BG_VIDEO}
        muted
        autoPlay
        playsInline
        preload="auto"
      />
      <div className="fan-center-bg-scrim" />
      {/* Decorative glow */}
      <div style={{position:'fixed',top:'-20%',right:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,255,255,0.045) 0%,transparent 70%)',pointerEvents:'none',zIndex:1}} />
      <div style={{position:'fixed',bottom:'-10%',left:'-5%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,215,0,0.05) 0%,transparent 70%)',pointerEvents:'none',zIndex:1}} />
      {/* Top Bar */}
      <div className="fan-center-glass-topbar liquid-glass" style={{
        background: 'rgba(255,255,255,0.01)',
        padding: '16px 20px', color: '#fff', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)', borderBottom: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, margin: '0 auto' }}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Avatar size={36} icon={<UserOutlined />} style={{background:'#FFD700',color:'#14141e',border:'2px solid rgba(255,215,0,0.3)'}} />
            <div>
              <div style={{fontSize:13,fontWeight:600}}>{currentFan.name || 'Fan'}</div>
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
                { key: 'owner', icon: <ShopOutlined />, label: '门店入口' },
                { type: 'divider' },
                { key: 'lang_zh', icon: <span role='img'>🇨🇳</span>, label: '中文' },
                { key: 'lang_en', icon: <span role='img'>🇬🇧</span>, label: 'English' },
                { key: 'lang_ar', icon: <span role='img'>🇸🇦</span>, label: 'العربية' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'owner') window.location.href = 'store-app.html#/store-owner';
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
      <div className="fan-center-content" style={{ maxWidth: 720, margin: '0 auto', padding: '18px 16px 28px' }}>
        <Tabs
          className="fan-center-tabs"
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          size="small"
          items={[
            {
              key: 'checkin',
              label: <span>📅 签到</span>,
              children: <CheckInTab fan={currentFan} onPointsChange={handlePointsChange} />,
            },
            {
              key: 'scan',
              label: <span>📱 扫码</span>,
              children: <ScanTab fan={currentFan} onPointsChange={handlePointsChange} />,
            },
            {
              key: 'mall',
              label: <span>🎁 积分商城</span>,
              children: <MallTab fan={currentFan} onPointsChange={handlePointsChange} />,
            },
            {
              key: 'invite',
              label: <span>📤 邀请好友</span>,
              children: <InviteTab fan={currentFan} />,
            },
            {
              key: 'community',
              label: <span>💬 社区</span>,
              children: <CommunityTab fan={currentFan} />,
            },
            {
              key: 'campaigns',
              label: <span>🔥 Activities</span>,
              children: <CampaignTab fan={currentFan} />,
            },
            {
              key: 'map',
              label: <span>🗺️ Map</span>,
              children: <MapTab fan={currentFan} />,
            },
            {
              key: 'help',
              label: <span>Help</span>,
              children: <HowItWorksTab />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FanCenterPage;


