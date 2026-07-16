import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Empty,
  Progress,
  Spin,
  Tag,
  Upload,
  message,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  EnvironmentOutlined,
  FireOutlined,
  GiftOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  QrcodeOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  StarOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../stores/authStore';
import useLanguageStore from '../../stores/languageStore';
import localDb from '../../services/db/localDb';
import seedData from '../../services/db/seedData';
import { addFanPoints, getFans } from '../../services/api';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { IS_LOCAL_MODE } from '../../services/api';
import { isLocal } from '../../services/api/helpers';
import { FAN_LEVELS, MALL_ITEMS } from '../../utils/constants';
import { FAN_LEVEL_LABELS, readImageAsDataUrl } from '../../utils/uwellClosedLoop';
import { getStoreExposureScore, sortStoresForFanExposure } from '../../utils/uwellLaunchRules';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { filterStoresForFanCity } from '../../utils/trialOps';

import CheckInTab from './tabs/CheckInTab';
import ScanTab from './tabs/ScanTab';
import MallTab from './tabs/MallTab';
import InviteTab from './tabs/InviteTab';
import CommunityTab from './tabs/CommunityTab';
import HowItWorksTab from './tabs/HowItWorksTab';
import MapTab from './tabs/MapTab';
import CampaignTab from './tabs/CampaignTab';

const FAN_CENTER_BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4';

const getLocalFanFallback = () => {
  if (localDb.needsInit()) localDb.init(seedData);
  const savedFanId = localStorage.getItem('store_manager_current_user');
  const savedFan = savedFanId ? localDb.findById('fans', savedFanId) : null;
  if (savedFan) return [savedFan];
  return localDb.all('fans') || [];
};

const formatDateTime = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '-';
  }
};

const getTodayDateKey = () => new Date().toISOString().split('T')[0];

const getStorefrontPhoto = (storeId) => {
  if (!storeId) return null;
  try {
    return (localDb.find('store_display_uploads', (item) => (
      item.store_id === storeId
      && item.status === 'approved'
      && item.category === 'store_front_photo'
    )) || [])[0] || null;
  } catch {
    return null;
  }
};

const getFanStoreCapabilities = (store = {}) => {
  const exposureControls = store.exposure_controls || {};
  return [
    {
      key: 'activity',
      label: 'Activity store',
      active: Boolean(exposureControls.store_events_visible || exposureControls.eligible_for_store_events_display),
    },
    {
      key: 'pickup',
      label: 'Pickup eligible',
      active: Boolean(exposureControls.reward_pickup_recommended || ['S', 'A'].includes(store.level)),
    },
    {
      key: 'display',
      label: 'Display reviewed',
      active: Boolean(exposureControls.fan_map_highlighted || store.display_status === 'approved'),
    },
  ];
};

const LevelBadge = ({ levelInfo }) => (
  <Tag className="fan-shell-level-tag" color={levelInfo?.color || 'gold'}>
    <CrownOutlined /> {FAN_LEVEL_LABELS[levelInfo?.value] || levelInfo?.label || 'Gold'}
  </Tag>
);

const FanCenterPage = () => {
  const { t, setLang } = useLanguageStore();
  const { user, signOut } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('home');
  const [returnView, setReturnView] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const bgVideoRef = useRef(null);
  const localFallbackFans = useMemo(() => getLocalFanFallback(), []);

  const ensureEnglishFirst = () => {
    setLang('en');
  };

  useEffect(() => {
    ensureEnglishFirst();
  }, []);

  const { data: fans = [], isLoading } = useQuery({
    queryKey: ['fans', refreshKey],
    placeholderData: localFallbackFans,
    queryFn: async () => {
      try {
        const remoteFans = await getFans({});
        return remoteFans?.length ? remoteFans : getLocalFanFallback();
      } catch {
        return getLocalFanFallback();
      }
    },
    staleTime: 30_000,
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
        if (progress < 1) rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    };

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
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

  const savedFanId = localStorage.getItem('store_manager_current_user');
  const hasSavedLocalFan = savedFanId ? Boolean(localDb.findById('fans', savedFanId)) : false;
  const canUseLocalFanFallback = IS_LOCAL_MODE || isLocal() || hasSavedLocalFan || localStorage.getItem('fan_logged_in') === 'true';
  const remoteFanByAuthUser = fans.find((f) => f.user_id === user?.id);
  const remoteFanBySavedAuthUser = savedFanId ? fans.find((f) => f.user_id === savedFanId) : null;
  const savedLocalFan = canUseLocalFanFallback && savedFanId ? localDb.findById('fans', savedFanId) : null;
  const savedLocalFanFromQuery = canUseLocalFanFallback && savedFanId ? fans.find((f) => f.id === savedFanId) : null;
  let currentFan = remoteFanByAuthUser || remoteFanBySavedAuthUser || savedLocalFan || savedLocalFanFromQuery || null;

  useRealtimeSubscription('fan_points_log', { event: 'INSERT' }, (payload) => {
    const newLog = payload.new;
    if (currentFan && newLog.fan_id === currentFan.id && !IS_LOCAL_MODE) {
      const pts = newLog.points > 0 ? `+${newLog.points}` : String(newLog.points);
      message.success(`${t('fan_points_changed')}: ${pts} - ${newLog.reason || ''}`);
      queryClient.invalidateQueries({ queryKey: ['fans'] });
      queryClient.invalidateQueries({ queryKey: ['fan-points-log'] });
    }
  });

  if (!currentFan && canUseLocalFanFallback) {
    if (savedFanId) {
      const savedFan = localDb.findById('fans', savedFanId);
      if (savedFan) currentFan = savedFan;
    }
  }

  if (!currentFan && canUseLocalFanFallback) {
    const allFans = localDb.all('fans');
    if (allFans.length > 0) {
      currentFan = allFans[0];
      localStorage.setItem('store_manager_current_user', currentFan.id);
    }
  }

  const handlePointsChange = () => {
    setRefreshKey((k) => k + 1);
  };

  const openSecondaryView = (view, from = activeView) => {
    setReturnView(from || 'home');
    setActiveView(view);
  };

  const handleSecondaryBack = () => {
    setActiveView(returnView || 'home');
  };

  const hasCheckedInToday = useMemo(() => {
    if (!currentFan?.id) return false;
    try {
      const today = getTodayDateKey();
      return (localDb.find('fan_checkins', (item) => item.fan_id === currentFan.id) || [])
        .some((item) => item.date === today);
    } catch {
      return false;
    }
  }, [currentFan?.id, refreshKey]);

  const handleTaskCheckIn = async () => {
    if (!currentFan || hasCheckedInToday) {
      openSecondaryView('checkin', 'home');
      return;
    }
    try {
      const today = getTodayDateKey();
      await addFanPoints(currentFan.id, 5, 'earn', 'Daily Check-in', 'Daily check-in bonus');
      localDb.insert('fan_checkins', { fan_id: currentFan.id, date: today, points: 5 });
      message.success('Checked in. +5 points added.');
      handlePointsChange();
    } catch {
      message.error('Check-in failed. Please try again.');
      openSecondaryView('checkin', 'home');
    }
  };

  const handleOpenCheckInDetails = () => {
    openSecondaryView('checkin', 'home');
  };

  const handleTaskAction = (taskKey) => {
    if (taskKey === 'checkin') {
      handleTaskCheckIn();
      return;
    }
    setActiveView(taskKey);
  };

  const handleLogout = async () => {
    localStorage.removeItem('store_manager_current_user');
    localStorage.removeItem('fan_logged_in');
    localStorage.removeItem('store_owner_mode');
    await signOut();
    window.location.href = 'fan-app.html#/fan-entry';
  };

  const normalizedFanLevel = currentFan?.level === 'platinum' ? 'diamond' : currentFan?.level;
  const levelInfo = useMemo(
    () => FAN_LEVELS.find((level) => level.value === normalizedFanLevel) || FAN_LEVELS[0],
    [normalizedFanLevel],
  );
  const levelIndex = useMemo(
    () => FAN_LEVELS.findIndex((level) => level.value === levelInfo?.value),
    [levelInfo?.value],
  );
  const nextLevel = useMemo(
    () => (levelIndex >= 0 ? FAN_LEVELS[levelIndex + 1] : null),
    [levelIndex],
  );
  const levelProgress = nextLevel
    ? Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (((currentFan?.points || 0) - levelInfo.min_points) / (nextLevel.min_points - levelInfo.min_points)) * 100,
        ),
      ),
    )
    : 100;

  const pointLogs = (() => {
    try {
      return (localDb.find('fan_points_log', (log) => log.fan_id === currentFan?.id) || [])
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 4);
    } catch {
      return [];
    }
  })();

  const oldFanVerifications = (() => {
    try {
      return (localDb.find('old_fan_verifications', (item) => item.fan_id === currentFan?.id) || [])
        .sort((a, b) => new Date(b.submitted_at || b.created_at || 0) - new Date(a.submitted_at || a.created_at || 0));
    } catch {
      return [];
    }
  })();

  const recommendedStores = (() => {
    try {
      return sortStoresForFanExposure(filterStoresForFanCity(localDb.all('stores') || [], currentFan))
        .slice(0, 3);
    } catch {
      return [];
    }
  })();

  const recentPointRows = pointLogs.slice(0, 3);

  const recentRedemptionRows = (() => {
    try {
      return (localDb.find('mall_redemptions', (item) => item.fan_id === currentFan?.id) || [])
        .sort((a, b) => new Date(b.created_at || b.redeemed_at || 0) - new Date(a.created_at || a.redeemed_at || 0))
        .slice(0, 3);
    } catch {
      return [];
    }
  })();

  const recentScanRows = (() => {
    try {
      return (localDb.find('scan_records', (item) => item.fan_id === currentFan?.id) || [])
        .sort((a, b) => new Date(b.scanned_at || b.created_at || 0) - new Date(a.scanned_at || a.created_at || 0))
        .slice(0, 3);
    } catch {
      return [];
    }
  })();

  const recentActivityRows = (() => {
    try {
      return (localDb.find('fan_engagement_tasks', (item) => item.fan_id === currentFan?.id) || [])
        .sort((a, b) => new Date(b.completed_at || b.created_at || 0) - new Date(a.completed_at || a.created_at || 0))
        .slice(0, 3);
    } catch {
      return [];
    }
  })();

  const featuredCampaign = (() => {
    try {
      return (localDb.all('campaigns') || [])
        .filter((campaign) => campaign.status === 'ongoing')
        .sort((a, b) => new Date(a.end_date || 0) - new Date(b.end_date || 0))[0];
    } catch {
      return null;
    }
  })();

  const displayCampaign = featuredCampaign ? {
    ...featuredCampaign,
    name: featuredCampaign.name_english || 'UWELL Store Display Challenge',
    description: featuredCampaign.description_english || 'Join the weekly UWELL activity, scan your product code, and use member points for rewards.',
  } : null;

  const fanNavItems = [
    { key: 'home', label: 'Home', icon: <HomeOutlined /> },
    { key: 'activities', label: 'Activities', icon: <CalendarOutlined /> },
    { key: 'community', label: 'Community', icon: <MessageOutlined /> },
    { key: 'rewards', label: 'Rewards', icon: <GiftOutlined /> },
    { key: 'stores', label: 'Stores', icon: <EnvironmentOutlined /> },
    { key: 'me', label: 'Me', icon: <UserOutlined /> },
  ];

  const fanFeatureItems = [
    { key: 'checkin', label: 'Check in', icon: <CalendarOutlined />, tone: 'gold' },
    { key: 'scan', label: 'Scan', icon: <QrcodeOutlined />, tone: 'blue' },
    { key: 'activities', label: 'Activities', icon: <FireOutlined />, tone: 'red' },
    { key: 'stores', label: 'Stores', icon: <EnvironmentOutlined />, tone: 'teal' },
  ];

  const fanTaskCards = [
    { key: 'checkin', title: 'Daily check-in', desc: 'Open your member center each day to collect base points.', points: '+5', done: hasCheckedInToday, action: hasCheckedInToday ? 'Done today' : 'Check in' },
    { key: 'scan', title: 'Scan for points', desc: 'Scan your UWELL product code after purchase. Points go straight to your account.', points: '+20', done: true, action: 'Scan now' },
    { key: 'campaigns', title: "Join this week's activity", desc: 'See the active brand activity and complete the steps for extra rewards.', points: '+50', done: false, action: 'View activity' },
  ];

  const campaignSteps = [
    { label: 'Step 1', title: 'Join the activity', desc: 'Open the current UWELL activity and read the reward rules.' },
    { label: 'Step 2', title: 'Scan your product code', desc: 'Scan after purchase so points are recorded in your member center.' },
    { label: 'Step 3', title: 'Claim rewards', desc: 'Use points for devices, pods, coupons, or campaign gifts.' },
  ];

  const activityCopy = {
    '\u6bcf\u65e5\u7b7e\u5230': 'Daily check-in',
    '\u626b\u7801\u9a8c\u8bc1': 'Product scan',
    '\u79ef\u5206\u5151\u6362': 'Reward redemption',
    '\u9650\u91cfUWELL\u5468\u8fb9\u793c\u5305': 'Limited UWELL gift pack',
    '\u9650\u91cf UWELL \u5468\u8fb9\u793c\u5305': 'Limited UWELL gift pack',
    '\u7b7e\u5230\u5956\u52b1': 'Daily check-in',
    '\u63a8\u8350\u65b0\u7c89\u4e1d': 'Referral reward',
    '\u59e3\u5fd4\u68e9\u7edb\u60e7\u57cc': 'Daily check-in',
    '\u93b5\ue0a4\u721c\u6960\u5c83\u7609': 'Product scan',
    '\u7ec9\ue21a\u578e\u934f\u621e\u5d32': 'Reward redemption',
    '\u95c4\u6130\u567aUWELL\u935b\u3128\u7adf\u7ec0\u714e\u5bd8': 'Limited UWELL gift pack',
    '\u95c4\u6130\u567a UWELL \u935b\u3128\u7adf\u7ec0\u714e\u5bd8': 'Limited UWELL gift pack',
  };

  const getFanActivityText = (value, fallback = '-') => {
    if (!value) return fallback;
    const text = String(value);
    return activityCopy[text] || text;
  };

  const handleOldFanUpload = async (file) => {
    if (!currentFan) return false;
    if (!file.type?.startsWith('image/')) {
      message.error('Please upload an image file.');
      return false;
    }
    try {
      const imageUrl = await readImageAsDataUrl(file);
      localDb.insert('old_fan_verifications', {
        fan_id: currentFan.id,
        fan_name: currentFan.name,
        image_url: imageUrl,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        review_note: '',
      });
      message.success('Your verification image has been submitted for review.');
      setRefreshKey((k) => k + 1);
    } catch {
      message.error('The image could not be read. Please try a smaller image.');
    }
    return false;
  };

  const renderShellHeader = () => (
    <header className="fan-shell-header">
      <div className="fan-shell-brand"><strong>UWELL</strong><span>{t('fan_center_label')}</span></div>
      <div className="fan-shell-actions">
        <LanguageSwitcher
          inline
          showCurrent
          sourceOnly
          anchor="end"
          tone="light"
          labelOverride="Language"
          buttonMinWidth={96}
          menuMinWidth={180}
          className="fan-header-language"
        />
        <div className="store-settings-slot">
          <button
            type="button"
            className={`store-settings-trigger${settingsOpen ? ' is-open' : ''}`}
            onClick={() => setSettingsOpen((value) => !value)}
            aria-label="Open fan settings"
          >
            <SettingOutlined /><span className="sr-only">Settings</span>
          </button>
          {settingsOpen && (
            <div className="store-settings-panel liquid-glass">
              <div className="store-settings-label">Fan settings</div>
              <button type="button" className="store-settings-item" onClick={() => openSecondaryView('oldfan', activeView)}>
                <UploadOutlined /> My verification
              </button>
              <button type="button" className="store-settings-item" onClick={handleLogout}>
                <LogoutOutlined /> Sign out
              </button>
            </div>
          )}
        </div>
        <Avatar className="fan-shell-avatar" aria-hidden="true">{(currentFan?.name || 'U').slice(0, 1).toUpperCase()}</Avatar>
      </div>
    </header>
  );

  const renderMemberHero = () => (
    <section className="fan-member-hero">
      <div className="fan-member-topline">
        <div className="fan-profile-row">
          <Avatar size={56} className="fan-shell-avatar fan-shell-avatar-lg">{(currentFan?.name || 'U').slice(0, 1).toUpperCase()}</Avatar>
          <div>
            <div className="fan-profile-name">{currentFan?.name || 'Luna Chen'} <LevelBadge levelInfo={levelInfo} /></div>
            <div className="fan-profile-id">{t('fan_member_id')} {currentFan?.id || 'UW-20250608'}</div>
          </div>
        </div>
        <Button className="fan-outline-pill" onClick={() => setActiveView('rewards')}>{t('fan_points_store')}</Button>
      </div>
      <div className="fan-points-number">
        <span>{(currentFan?.points || 0).toLocaleString()}</span>
        <em>{t('fan_points_unit')}</em>
      </div>
      <div className="fan-progress-label">
        <span>{t('fan_upgrade_progress')}</span>
        <span>{(currentFan?.points || 0).toLocaleString()} / {(nextLevel?.min_points || currentFan?.points || 0).toLocaleString()}</span>
      </div>
      <Progress percent={levelProgress} showInfo={false} strokeColor={{ from: '#ffd60a', to: '#ff9f1a' }} railColor="rgba(255,255,255,0.08)" />
      <div className="fan-level-row">
        <span>{FAN_LEVEL_LABELS[levelInfo?.value] || levelInfo?.label}</span>
        <span>{nextLevel ? `${t('fan_next_level')} ${FAN_LEVEL_LABELS[nextLevel.value] || nextLevel.label}` : t('fan_top_level')}</span>
      </div>
    </section>
  );

  const renderHome = () => (
    <section className="fan-home-shell">
      {renderMemberHero()}
      <section className="fan-home-mission-control">
        <div className="fan-home-mission-copy">
          <span className="fan-mini-label">Today at a glance</span>
          <h3>Today's power moves</h3>
          <p>Grow your UWELL level with the two fastest actions today.</p>
        </div>
        <div className="fan-home-mission-score">
          <strong>{hasCheckedInToday ? '1/2' : '0/2'}</strong>
          <span>complete</span>
        </div>
        <div className="fan-home-action-grid fan-checkin-home-actions">
          <button
            type="button"
            className={`fan-home-action-card${hasCheckedInToday ? ' is-done' : ''}`}
            onClick={() => handleTaskAction('checkin')}
          >
            <CalendarOutlined />
            <span>Daily check-in</span>
            <strong>{hasCheckedInToday ? 'Checked in' : 'Check in'} +5 pts</strong>
          </button>
          <button type="button" className="fan-home-action-card is-scan" onClick={() => openSecondaryView('scan', 'home')}>
            <QrcodeOutlined />
            <span>Product scan</span>
            <strong>Scan product</strong>
          </button>
          <Button className="fan-checkin-detail-link" onClick={handleOpenCheckInDetails}>
            View streak
          </Button>
        </div>
      </section>

      <section className="fan-home-spotlight-grid">
        {displayCampaign && (
          <article className="fan-home-activity-card">
            <span className="fan-mini-label">Recommended activity</span>
            <h3>{displayCampaign.name}</h3>
            <p>Join one active UWELL challenge and earn extra points from Activities.</p>
            <Button type="primary" onClick={() => setActiveView('activities')}>Open activity</Button>
          </article>
        )}

        {MALL_ITEMS.slice(0, 1).map((item) => (
          <button type="button" key={item.id} className="fan-home-reward-card" onClick={() => setActiveView('rewards')}>
            <span className="fan-mini-label">Rewards you can aim for</span>
            <GiftOutlined />
            <strong>{item.name}</strong>
            <small>{item.points_cost.toLocaleString()} points</small>
            <em>Open rewards shop</em>
          </button>
        ))}

        {recommendedStores.slice(0, 1).map((store) => (
          <button type="button" key={store.id} className="fan-home-store-card" onClick={() => setActiveView('stores')}>
            <span className="fan-mini-label">Nearby UWELL stores</span>
            {store.exposure_controls?.fan_home_recommended && <Tag color="lime">Home priority</Tag>}
            <span className="fan-store-card-head">
              <strong>{store.name}</strong>
              <b>{store.level || 'C'}</b>
            </span>
            <small>{store.level === 'S' ? 'Featured by UWELL operations' : store.level === 'A' ? 'Recommended UWELL partner' : 'Listed UWELL partner'}</small>
            <small className="fan-store-trust-note">Exposure score {getStoreExposureScore(store)}</small>
            <em>Open store map</em>
          </button>
        ))}
      </section>

      <section className="fan-home-recent-card">
        <div className="fan-section-heading">
          <span>{t('fan_recent_activity')}</span>
          <button type="button" onClick={handleOpenCheckInDetails}>{t('view_all')}</button>
        </div>
        <div className="fan-home-recent-list">
          {(pointLogs.length ? pointLogs : [
            { id: 'demo-1', source: t('fan_task_checkin'), description: t('fan_activity_checkin'), points: 10, created_at: new Date().toISOString() },
            { id: 'demo-2', source: t('fan_feature_scan'), description: 'CALIBURN AIR', points: 20, created_at: new Date().toISOString() },
            { id: 'demo-3', source: t('fan_feature_redeem'), description: t('fan_reward_sample'), points: -500, created_at: new Date().toISOString() },
          ]).slice(0, 2).map((item) => (
            <div key={item.id} className="fan-home-recent-row">
              <span className="fan-activity-icon"><CalendarOutlined /></span>
              <div>
                <strong>{getFanActivityText(item.source || item.type, t('fan_points_changed'))}</strong>
                <p>{getFanActivityText(item.description || item.reason)}</p>
              </div>
              <b className={item.points >= 0 ? 'is-positive' : 'is-negative'}>{item.points > 0 ? `+${item.points}` : item.points}</b>
            </div>
          ))}
        </div>
      </section>
    </section>
  );

  const renderTasks = () => (
    <>
      <section className="fan-panel fan-task-hero">
        <span className="fan-mini-label">Today's tasks</span>
        <h2>Start with the three easiest actions</h2>
        <p>Check in, scan your product, and view current activities. Points and rewards are recorded automatically in your member center.</p>
      </section>
      <section className="fan-task-card-list">
            {fanTaskCards.map((task) => (
          <button key={task.key} type="button" className={`fan-task-card${task.done ? ' is-done' : ''}`} onClick={() => handleTaskAction(task.key)}>
            <span className="fan-task-status">{task.done ? <CheckCircleOutlined /> : <StarOutlined />}</span>
            <div>
              <strong>{task.title}</strong>
              <p>{task.desc}</p>
            </div>
            <em>{task.points}</em>
            <b>{task.action}</b>
          </button>
        ))}
      </section>
    </>
  );

  const renderStores = () => (
    <>
      <section className="fan-panel fan-store-hero">
        <span className="fan-mini-label">Store map</span>
        <h2>Find nearby UWELL partner stores</h2>
        <p>Featured and Recommended stores are reviewed UWELL partners. Stores with risk or poor service are not recommended to fans.</p>
      </section>
      <section className="fan-section-block">
        <div className="fan-section-heading">
          <span>Featured store picks</span>
          <button type="button" onClick={() => setActiveView('stores')}>Map highlighted</button>
        </div>
        <div className="fan-visible-store-list">
          {recommendedStores.length ? recommendedStores.slice(0, 3).map((store) => {
            const storefrontPhoto = getStorefrontPhoto(store.id);
            const capabilities = getFanStoreCapabilities(store);
            const exposureControls = store.exposure_controls || {};
            return (
              <article key={store.id} className="fan-visible-store-card">
                <div className="fan-visible-store-photo">
                  <div className="fan-visible-store-photo-frame">
                    {storefrontPhoto?.image_url ? (
                      <img className="fan-visible-store-photo-img" src={storefrontPhoto.image_url} alt={`${store.name} storefront`} />
                    ) : (
                      <span>UWELL</span>
                    )}
                  </div>
                </div>
                <div className="fan-visible-store-copy">
                  <strong>{store.name}</strong>
                  <p>{store.level || 'C'} level · {store.phone || 'Phone pending'}</p>
                  <small className="fan-store-trust-note">
                    {storefrontPhoto ? 'Storefront photo helps fans recognize this store' : 'Trust photo pending'}
                  </small>
                  <div className="fan-visible-store-capability-grid">
                    {capabilities.map((capability) => (
                      <Tag key={capability.key} color={capability.active ? 'lime' : 'default'}>
                        {capability.label}
                      </Tag>
                    ))}
                  </div>
                  <div className="fan-visible-store-capability-grid">
                    {exposureControls.fan_map_highlighted && <Tag color="green">Map highlighted</Tag>}
                    {exposureControls.reward_pickup_recommended && <Tag color="gold">Reward pickup</Tag>}
                    {(exposureControls.store_events_visible || exposureControls.eligible_for_store_events_display) && <Tag color="blue">Store Events</Tag>}
                  </div>
                </div>
                <a
                  className="fan-store-navigate-link"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Navigate
                </a>
              </article>
            );
          }) : (
            <Empty description="No nearby UWELL partner stores are available right now." />
          )}
        </div>
      </section>
      <MapTab fan={currentFan} />
    </>
  );

  const renderMember = () => (
    <>
      {renderMemberHero()}
      <section className="fan-section-block">
        <div className="fan-section-heading"><span>{t('fan_level_system')}</span></div>
        <div className="fan-level-list">
          {FAN_LEVELS.map((level) => {
            const active = level.value === currentFan?.level;
            return (
              <div key={level.value} className={`fan-level-card${active ? ' is-active' : ''}`}>
                <span><StarOutlined /></span>
                <div>
                  <strong>{FAN_LEVEL_LABELS[level.value] || level.label}</strong>
                  <p>{level.min_points.toLocaleString()}+ {t('fan_points_unit')}</p>
                  <small>{active ? t('current_level') : t('fan_base_benefits')}</small>
                </div>
                {active && <Tag color="gold">{t('current_level')}</Tag>}
              </div>
            );
          })}
        </div>
      </section>
      <section className="fan-reward-grid">
        {MALL_ITEMS.slice(0, 4).map((item) => (
          <div key={item.id} className="fan-reward-card">
            <GiftOutlined />
            <strong>{item.name}</strong>
            <span>{item.points_cost.toLocaleString()} {t('fan_points_unit')}</span>
          </div>
        ))}
      </section>
    </>
  );

  const renderMeHistoryList = (rows, emptyText, getTitle, getMeta, getValue) => (
    <div className="fan-me-history-list">
      {rows.length ? rows.map((item) => {
        const value = getValue?.(item);
        return (
          <div key={item.id || `${getTitle(item)}-${getMeta(item)}`} className="fan-me-history-row">
            <div>
              <strong>{getTitle(item)}</strong>
              <span>{getMeta(item)}</span>
            </div>
            {value === null || value === undefined ? null : <b className={Number(value) >= 0 ? 'is-positive' : 'is-negative'}>{Number(value) > 0 ? `+${value}` : value}</b>}
          </div>
        );
      }) : <div className="fan-me-empty-row">{emptyText}</div>}
    </div>
  );

  const renderProfile = () => (
    <section className="fan-me-shell">
      <div className="fan-me-hero">
        <Avatar size={68} className="fan-shell-avatar fan-shell-avatar-lg">{(currentFan?.name || 'U').slice(0, 1).toUpperCase()}</Avatar>
        <div>
          <span className="fan-mini-label">Member account</span>
          <h2>{currentFan?.name || 'UWELL Fan'}</h2>
          <p>{currentFan?.phone || currentFan?.id}</p>
          <LevelBadge levelInfo={levelInfo} />
        </div>
      </div>

      <div className="fan-me-points-card">
        <div className="fan-me-stat-card">
          <span>Available points</span>
          <strong>{(currentFan?.points || 0).toLocaleString()}</strong>
        </div>
        <div className="fan-me-stat-card">
          <span>Current level</span>
          <strong>{FAN_LEVEL_LABELS[levelInfo?.value] || levelInfo?.label}</strong>
        </div>
        <div className="fan-me-progress-row">
          <span>{nextLevel ? `Next: ${FAN_LEVEL_LABELS[nextLevel.value] || nextLevel.label}` : 'Top level'}</span>
          <span>{Math.round(levelProgress)}%</span>
        </div>
        <Progress percent={levelProgress} showInfo={false} strokeColor={{ from: '#ccff00', to: '#7ee000' }} railColor="rgba(17,22,10,0.10)" />
      </div>

      <section className="fan-me-overview-strip">
        <div>
          <span>Account overview</span>
          <strong>{recentPointRows.length}</strong>
          <small>point records</small>
        </div>
        <div>
          <span>Rewards</span>
          <strong>{recentRedemptionRows.length}</strong>
          <small>redemptions</small>
        </div>
        <div>
          <span>Scans</span>
          <strong>{recentScanRows.length}</strong>
          <small>product scans</small>
        </div>
        <div>
          <span>Activities</span>
          <strong>{recentActivityRows.length}</strong>
          <small>task records</small>
        </div>
      </section>

      <section className="fan-me-history-panel">
        <div className="fan-section-heading">
          <span>Recent activity</span>
          <button type="button" onClick={() => openSecondaryView('checkin', 'me')}>View points</button>
        </div>
        {renderMeHistoryList(
          recentPointRows,
          'No point records yet',
          (item) => item.source || item.type || 'Point record',
          (item) => item.description || formatDateTime(item.created_at),
          (item) => item.points,
        )}
      </section>

      <div className="fan-me-history-grid">
        <button type="button" onClick={() => openSecondaryView('checkin', 'me')}>
          <StarOutlined />
          <strong>Points history</strong>
          <span>{pointLogs.length ? `${pointLogs.length} recent` : 'No recent records'}</span>
        </button>
        <button type="button" onClick={() => setActiveView('rewards')}>
          <GiftOutlined />
          <strong>Reward history</strong>
          <span>View redemptions</span>
        </button>
        <button type="button" onClick={() => openSecondaryView('scan', 'me')}>
          <QrcodeOutlined />
          <strong>Scan history</strong>
          <span>Product scans</span>
        </button>
        <button type="button" onClick={() => setActiveView('activities')}>
          <CalendarOutlined />
          <strong>Activity history</strong>
          <span>Campaign records</span>
        </button>
      </div>

      <section className="fan-me-history-panel">
        <div className="fan-section-heading">
          <span>Reward history</span>
          <button type="button" onClick={() => setActiveView('rewards')}>Open rewards</button>
        </div>
        {renderMeHistoryList(
          recentRedemptionRows,
          'No redemptions yet',
          (item) => item.item_name || item.item_id || 'Reward redemption',
          (item) => item.status || item.review_status || formatDateTime(item.created_at || item.redeemed_at),
          (item) => item.points_cost ? -Number(item.points_cost) : null,
        )}
      </section>

      <section className="fan-me-history-panel">
        <div className="fan-section-heading">
          <span>Scan history</span>
          <button type="button" onClick={() => openSecondaryView('scan', 'me')}>Open scan</button>
        </div>
        {renderMeHistoryList(
          recentScanRows,
          'No scans yet',
          (item) => item.scan_status || item.qr_code_id || 'Product scan',
          (item) => formatDateTime(item.scanned_at || item.created_at),
          (item) => item.points_earned || item.points,
        )}
      </section>

      <section className="fan-me-history-panel">
        <div className="fan-section-heading">
          <span>Activity history</span>
          <button type="button" onClick={() => setActiveView('activities')}>Open activities</button>
        </div>
        {renderMeHistoryList(
          recentActivityRows,
          'No activity records yet',
          (item) => item.task_type || item.task_key || 'Activity task',
          (item) => item.status || formatDateTime(item.completed_at || item.created_at),
          (item) => item.points_awarded || item.points,
        )}
      </section>

      <div className="fan-me-utility-grid">
        <button type="button" onClick={() => openSecondaryView('invite', 'me')}>
          <TeamOutlined />
          <strong>Invite friends</strong>
          <span>Share your link and earn points.</span>
        </button>
        <button type="button" onClick={() => openSecondaryView('oldfan', 'me')}>
          <UploadOutlined />
          <strong>Existing fan verification</strong>
          <span>{oldFanVerifications[0] ? 'Review your submission.' : 'Submit proof for bonus points.'}</span>
        </button>
        <button type="button" onClick={() => openSecondaryView('help', 'me')}>
          <QuestionCircleOutlined />
          <strong>New user guide</strong>
          <span>Scan, check in, activities, community.</span>
        </button>
        <button type="button" onClick={() => setActiveView('community')}>
          <MessageOutlined />
          <strong>Community</strong>
          <span>Posts, likes, comments.</span>
        </button>
      </div>

      <div className="fan-me-language-card">
        <div>
          <strong>Language</strong>
          <span>English now. Arabic support is planned.</span>
        </div>
        <LanguageSwitcher
          inline
          showCurrent
          sourceOnly
          anchor="end"
          tone="light"
          labelOverride="Language"
          buttonMinWidth={108}
          menuMinWidth={180}
          className="fan-me-language-switcher"
        />
      </div>

      <button type="button" className="fan-me-signout" onClick={handleLogout}>
        <LogoutOutlined /> Sign out
      </button>
    </section>
  );

  const renderOldFanVerification = () => {
    const latest = oldFanVerifications[0];
    const statusText = latest?.status === 'approved' ? 'Approved' : latest?.status === 'rejected' ? 'Rejected' : latest ? 'Pending review' : 'Not submitted';
    const statusColor = latest?.status === 'approved' ? 'green' : latest?.status === 'rejected' ? 'red' : 'gold';
    return (
      <section className="fan-verification-page">
        <div className="fan-verification-hero">
          <UploadOutlined />
          <div>
            <span className="fan-mini-label">Existing fan</span>
            <h2>Verify older UWELL products</h2>
            <p>Upload an image showing at least 4 older UWELL products. Approved fans receive 100 bonus points.</p>
          </div>
        </div>

        <section className="fan-verification-status-card">
          <div>
            <span>Review status</span>
            <strong>{statusText}</strong>
          </div>
          <Tag color={statusColor}>{statusText}</Tag>
        </section>

        <section className="fan-verification-upload-card">
          <div>
            <strong>Submit proof image</strong>
            <span>Clear product photo, one submission at a time.</span>
          </div>
          <Upload accept="image/*" showUploadList={false} beforeUpload={handleOldFanUpload}>
            <Button type="primary" icon={<UploadOutlined />}>Upload proof image</Button>
          </Upload>
        </section>

        <section className="fan-verification-history-list">
          <div className="fan-section-heading">
            <span>Submission history</span>
            <strong>{oldFanVerifications.length} records</strong>
          </div>
          {oldFanVerifications.length ? oldFanVerifications.map((item) => (
            <div key={item.id} className="fan-verification-history-row">
              <img src={item.image_url} alt="Fan verification" />
              <div>
                <strong>Verification image</strong>
                <p>{item.status === 'approved' ? 'Approved. Points have been added.' : item.status === 'rejected' ? 'Not approved' : 'Waiting for admin review'}</p>
                <em>{formatDateTime(item.submitted_at || item.created_at)}</em>
              </div>
              <b className={item.status === 'approved' ? 'is-positive' : ''}>{item.status === 'approved' ? '+100' : ''}</b>
            </div>
          )) : <div className="fan-me-empty-row">No submissions yet</div>}
        </section>
      </section>
    );
  };

  const renderSecondaryView = () => {
    const viewMap = {
      checkin: { title: 'Daily check-in', content: <CheckInTab fan={currentFan} onPointsChange={handlePointsChange} /> },
      scan: { title: t('fan_scan'), content: <ScanTab fan={currentFan} onPointsChange={handlePointsChange} /> },
      mall: { title: t('fan_redeem'), content: <MallTab fan={currentFan} onPointsChange={handlePointsChange} /> },
      invite: { title: t('fan_invite'), content: <InviteTab fan={currentFan} /> },
      campaigns: { title: t('fan_activities'), content: <CampaignTab fan={currentFan} /> },
      profile: { title: 'Me', content: renderProfile() },
      oldfan: { title: 'Fan verification', content: renderOldFanVerification() },
      map: { title: 'Store recommendations', content: renderStores() },
      help: { title: t('fan_help'), content: <HowItWorksTab /> },
    };
    const selected = viewMap[activeView];
    if (!selected) return null;
    return (
      <section className="fan-secondary-view">
        <div className="fan-subpage-bar">
          <Button type="text" onClick={handleSecondaryBack}>{t('back')}</Button>
          <strong>{selected.title}</strong>
          <span />
        </div>
        {selected.content}
      </section>
    );
  };

  const renderContent = () => {
    if (activeView === 'home') return renderHome();
    if (activeView === 'activities') return <CampaignTab fan={currentFan} />;
    if (activeView === 'community') return <CommunityTab fan={currentFan} />;
    if (activeView === 'rewards') return <MallTab fan={currentFan} onPointsChange={handlePointsChange} />;
    if (activeView === 'tasks') return renderTasks();
    if (activeView === 'stores') return renderStores();
    if (activeView === 'me') return renderProfile();
    if (activeView === 'member') return renderMember();
    return renderSecondaryView();
  };

  if (isLoading && !currentFan) {
    return <div className="fan-shell-loading"><Spin size="large" /></div>;
  }

  if (!currentFan) {
    return (
      <div className="fan-shell-loading">
        <Card className="fan-panel">
          <Empty description="No fan profile found. Please contact support." />
          <Button type="primary" onClick={handleLogout} style={{ marginTop: 16 }}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const navKeyAliases = {
    campaigns: 'activities',
    mall: 'rewards',
    profile: 'me',
  };
  const activeNavKey = fanNavItems.some((item) => item.key === activeView)
    ? activeView
    : navKeyAliases[activeView] || 'home';

  return (
    <div className="fan-shell">
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
      {renderShellHeader()}
      <main className="fan-shell-main">
        {renderContent()}
      </main>
      <nav className="fan-bottom-nav" aria-label="Fan center navigation">
          {fanNavItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activeNavKey === item.key ? 'is-active' : ''}
            onClick={() => setActiveView(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default FanCenterPage;
