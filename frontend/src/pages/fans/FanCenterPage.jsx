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
import { FAN_LEVELS, MALL_ITEMS } from '../../utils/constants';
import { FAN_LEVEL_LABELS, readImageAsDataUrl } from '../../utils/uwellClosedLoop';
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
  let currentFan = savedFanId
    ? (localDb.findById('fans', savedFanId) || fans.find((f) => f.id === savedFanId))
    : (fans.find((f) => f.user_id === user?.id) || fans[0] || null);

  useRealtimeSubscription('fan_points_log', { event: 'INSERT' }, (payload) => {
    const newLog = payload.new;
    if (currentFan && newLog.fan_id === currentFan.id && !IS_LOCAL_MODE) {
      const pts = newLog.points > 0 ? `+${newLog.points}` : String(newLog.points);
      message.success(`${t('fan_points_changed')}: ${pts} - ${newLog.reason || ''}`);
      queryClient.invalidateQueries({ queryKey: ['fans'] });
      queryClient.invalidateQueries({ queryKey: ['fan-points-log'] });
    }
  });

  if (!currentFan) {
    if (savedFanId) {
      const savedFan = localDb.findById('fans', savedFanId);
      if (savedFan) currentFan = savedFan;
    }
  }

  if (!currentFan) {
    const allFans = localDb.all('fans');
    if (allFans.length > 0) {
      currentFan = allFans[0];
      localStorage.setItem('store_manager_current_user', currentFan.id);
    }
  }

  const handlePointsChange = () => {
    setRefreshKey((k) => k + 1);
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
      setActiveView('checkin');
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
      setActiveView('checkin');
    }
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
      return filterStoresForFanCity(localDb.all('stores') || [], currentFan)
        .filter((store) => store.lat && store.lng && ['S', 'A', 'B'].includes(store.level))
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
    description: featuredCampaign.description_english || 'Visit a verified UWELL store, check the latest CALIBURN display, and complete the activity steps to earn extra rewards.',
  } : null;

  const fanNavItems = [
    { key: 'home', label: 'Home', icon: <HomeOutlined /> },
    { key: 'tasks', label: 'Tasks', icon: <CalendarOutlined /> },
    { key: 'mall', label: 'Rewards', icon: <GiftOutlined /> },
    { key: 'stores', label: 'Stores', icon: <EnvironmentOutlined /> },
    { key: 'profile', label: 'Me', icon: <UserOutlined /> },
  ];

  const fanFeatureItems = [
    { key: 'tasks', label: 'Today', icon: <CalendarOutlined />, tone: 'gold' },
    { key: 'scan', label: 'Scan', icon: <QrcodeOutlined />, tone: 'blue' },
    { key: 'campaigns', label: 'Rewards', icon: <FireOutlined />, tone: 'red' },
    { key: 'stores', label: 'Stores', icon: <EnvironmentOutlined />, tone: 'teal' },
  ];

  const fanTaskCards = [
    { key: 'checkin', title: 'Daily check-in', desc: 'Open your member center each day to collect base points.', points: '+5', done: hasCheckedInToday, action: hasCheckedInToday ? 'Done today' : 'Check in' },
    { key: 'scan', title: 'Scan for points', desc: 'Scan your UWELL product code after purchase. Points go straight to your account.', points: '+20', done: true, action: 'Scan now' },
    { key: 'campaigns', title: "Join this week's activity", desc: 'See the active brand activity and complete the steps for extra rewards.', points: '+50', done: false, action: 'View activity' },
    { key: 'stores', title: 'Visit a verified store', desc: 'Find reviewed UWELL stores with better displays and member benefits.', points: 'Store perks', done: false, action: 'Find stores' },
  ];

  const campaignSteps = [
    { label: 'Step 1', title: 'Find a verified store', desc: 'Choose a recommended UWELL store near your registered city.' },
    { label: 'Step 2', title: 'Scan your product code', desc: 'Scan after purchase so points are recorded in your member center.' },
    { label: 'Step 3', title: 'Claim rewards', desc: 'Use points for devices, pods, coupons, or campaign gifts.' },
  ];

  const activityCopy = {
    '\u6bcf\u65e5\u7b7e\u5230': 'Daily check-in',
    '\u626b\u7801\u9a8c\u8bc1': 'Product scan',
    '\u79ef\u5206\u5151\u6362': 'Reward redemption',
    '\u9650\u91cfUWELL\u5468\u8fb9\u793c\u5305': 'Limited UWELL gift pack',
    '\u9650\u91cf UWELL \u5468\u8fb9\u793c\u5305': 'Limited UWELL gift pack',
    '\u5b8c\u6210\u62dc\u8bbf': 'Visit completed',
    '\u4e0a\u4f20\u7167\u7247': 'Shelf photo uploaded',
    '\u63d0\u4ea4\u52a8\u9500\u6570\u636e': 'Sales data submitted',
    '\u5b8c\u6210\u95e8\u5e97\u62dc\u8bbf s-001': 'Store visit completed',
    '\u62dc\u8bbf\u4e0a\u4f20\u8d27\u67b6\u7167\u7247': 'Shelf photo uploaded',
    '\u59e3\u5fd4\u68e9\u7edb\u60e7\u57cc': 'Daily check-in',
    '\u93b5\ue0a4\u721c\u6960\u5c83\u7609': 'Product scan',
    '\u7ec9\ue21a\u578e\u934f\u621e\u5d32': 'Reward redemption',
    '\u95c4\u6130\u567aUWELL\u935b\u3128\u7adf\u7ec0\u714e\u5bd8': 'Limited UWELL gift pack',
    '\u95c4\u6130\u567a UWELL \u935b\u3128\u7adf\u7ec0\u714e\u5bd8': 'Limited UWELL gift pack',
    '\u7039\u5c7e\u579a\u93b7\u6ec6\ue196': 'Visit completed',
    '\u6d93\u5a41\u7d36\u9413\u0445\u5896': 'Shelf photo uploaded',
    '\u93bb\u612a\u6c26\u9354\u3129\u6522\u93c1\u7248\u5d41': 'Sales data submitted',
    '\u7039\u5c7e\u579a\u95c2\u3125\u7c35\u93b7\u6ec6\ue196 s-001': 'Store visit completed',
    '\u93b7\u6ec6\ue196\u6d93\u5a41\u7d36\u7490\u0444\u7066\u9413\u0445\u5896': 'Shelf photo uploaded',
  };

  const getFanActivityText = (value, fallback = '-') => {
    if (!value) return fallback;
    const text = String(value);
    if (text.startsWith('\u5b8c\u6210\u95e8\u5e97\u62dc\u8bbf') || text.startsWith('\u7039\u5c7e\u579a\u95c2\u3125\u7c35\u93b7\u6ec6\ue196')) return 'Store visit completed';
    if (text.startsWith('\u63d0\u4ea4\u52a8\u9500\u6570\u636e') || text.startsWith('\u93bb\u612a\u6c26\u9354\u3129\u6522\u93c1\u7248\u5d41')) return 'Sales data submitted';
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
              <button type="button" className="store-settings-item" onClick={() => setActiveView('oldfan')}>
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
        <Button className="fan-outline-pill" onClick={() => setActiveView('mall')}>{t('fan_points_store')}</Button>
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
    <>
      {renderMemberHero()}
      <section className="fan-next-action-panel">
        <span>Your next best action</span>
        <h2>Start here</h2>
        <p>Scan a UWELL product or open the weekly activity. Your points, tasks, and rewards are saved in this member center.</p>
        <div className="fan-next-action-buttons">
          <Button type="primary" onClick={() => setActiveView('scan')}>Scan product</Button>
          <Button onClick={() => setActiveView('campaigns')}>View activity</Button>
        </div>
      </section>
      <section className="fan-feature-grid fan-feature-grid-primary">
        {fanFeatureItems.map((item) => (
          <button key={item.key} type="button" className={`fan-feature-card tone-${item.tone}`} onClick={() => setActiveView(item.key)}>
            <span>{item.icon}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </section>
      <section className="fan-panel fan-today-panel">
        <div className="fan-section-title"><StarOutlined /> Today's tasks <span>{fanTaskCards.filter((task) => task.done).length}/{fanTaskCards.length}</span></div>
        {fanTaskCards.slice(0, 3).map((task) => (
          <div key={task.key} className={`fan-task-row${task.done ? ' is-done' : ''}`}>
            <CheckCircleOutlined />
            <span>{task.title}</span>
            <strong>{task.points}</strong>
          </div>
        ))}
        <Button block type="primary" onClick={() => setActiveView('tasks')}>View all tasks</Button>
      </section>
      {displayCampaign && (
        <section className="fan-campaign-poster">
          <div>
            <span className="fan-mini-label">Featured this week</span>
            <h3>{displayCampaign.name}</h3>
            <p>{displayCampaign.description}</p>
          </div>
          <div className="fan-campaign-step-strip">
            {campaignSteps.map((step) => (
              <div key={step.label}>
                <span>{step.label}</span>
                <strong>{step.title}</strong>
              </div>
            ))}
          </div>
          <Button type="primary" onClick={() => setActiveView('campaigns')}>See steps and rewards</Button>
        </section>
      )}
      <section className="fan-section-block">
        <div className="fan-section-heading">
          <span>Trusted stores</span>
          <button type="button" onClick={() => setActiveView('stores')}>View map</button>
        </div>
        <div className="fan-store-strip">
          {recommendedStores.map((store) => (
            <button type="button" key={store.id} className="fan-store-card" onClick={() => setActiveView('stores')}>
              <strong>{store.name}</strong>
              <span>{store.level || 'C'} level store</span>
              <small>Recommended because it matches your city or has a stronger UWELL display.</small>
              <em>{store.phone || 'Store information pending'}</em>
            </button>
          ))}
        </div>
      </section>
      <section className="fan-section-block">
        <div className="fan-section-heading">
          <span>Popular rewards</span>
          <button type="button" onClick={() => setActiveView('mall')}>Open rewards shop</button>
        </div>
        <div className="fan-reward-grid fan-reward-grid-home">
          {MALL_ITEMS.slice(0, 3).map((item) => (
            <button type="button" key={item.id} className="fan-reward-card" onClick={() => setActiveView('mall')}>
              <GiftOutlined />
              <strong>{item.name}</strong>
              <span>{item.points_cost.toLocaleString()} points</span>
            </button>
          ))}
        </div>
      </section>
      <section className="fan-section-block">
        <div className="fan-section-heading">
          <span>{t('fan_recent_activity')}</span>
          <button type="button" onClick={() => setActiveView('checkin')}>{t('view_all')}</button>
        </div>
        <div className="fan-activity-list">
          {(pointLogs.length ? pointLogs : [
            { id: 'demo-1', source: t('fan_task_checkin'), description: t('fan_activity_checkin'), points: 10, created_at: new Date().toISOString() },
            { id: 'demo-2', source: t('fan_feature_scan'), description: 'CALIBURN AIR', points: 20, created_at: new Date().toISOString() },
            { id: 'demo-3', source: t('fan_feature_redeem'), description: t('fan_reward_sample'), points: -500, created_at: new Date().toISOString() },
          ]).map((item) => (
            <div key={item.id} className="fan-activity-card">
              <span className="fan-activity-icon"><CalendarOutlined /></span>
              <div>
                    <strong>{getFanActivityText(item.source || item.type, t('fan_points_changed'))}</strong>
                    <p>{getFanActivityText(item.description || item.reason)}</p>
                <em>{formatDateTime(item.created_at)}</em>
              </div>
              <b className={item.points >= 0 ? 'is-positive' : 'is-negative'}>{item.points > 0 ? `+${item.points}` : item.points}</b>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderTasks = () => (
    <>
      <section className="fan-panel fan-task-hero">
        <span className="fan-mini-label">Today's tasks</span>
        <h2>Start with the three easiest actions</h2>
        <p>Check in, scan your product, and view current activities. Points and rewards are recorded automatically in your member center.</p>
      </section>
      <section className="fan-campaign-guide">
        {campaignSteps.map((step) => (
          <div key={step.label} className="fan-campaign-guide-step">
            <span>{step.label}</span>
            <strong>{step.title}</strong>
            <p>{step.desc}</p>
          </div>
        ))}
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
        <span className="fan-mini-label">Recommended stores</span>
        <h2>Visit verified UWELL stores first</h2>
        <p>Store recommendations prioritize reviewed locations, stronger displays, and higher store ratings so fans know where to claim campaign benefits.</p>
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

  const renderProfile = () => (
    <>
      <section className="fan-panel fan-profile-panel">
        <Avatar size={72} className="fan-shell-avatar fan-shell-avatar-lg">{(currentFan?.name || 'U').slice(0, 1).toUpperCase()}</Avatar>
        <h2>{currentFan?.name || 'UWELL Fan'}</h2>
        <LevelBadge levelInfo={levelInfo} />
        <p>{currentFan?.phone || currentFan?.id}</p>
      </section>
      <section className="fan-profile-actions">
        <button type="button" onClick={() => setActiveView('invite')}><TeamOutlined /> {t('fan_invite')}</button>
        <button type="button" onClick={() => setActiveView('community')}><MessageOutlined /> {t('fan_community')}</button>
        <button type="button" onClick={() => setActiveView('oldfan')}><UploadOutlined /> My verification</button>
        <button type="button" onClick={() => setActiveView('mall')}><GiftOutlined /> Redeem points</button>
        <button type="button" onClick={() => setActiveView('help')}><QuestionCircleOutlined /> {t('fan_help')}</button>
        <button type="button" className="is-danger" onClick={handleLogout}><LogoutOutlined /> Sign out</button>
      </section>
    </>
  );

  const renderOldFanVerification = () => {
    const latest = oldFanVerifications[0];
    const statusText = latest?.status === 'approved' ? 'Approved' : latest?.status === 'rejected' ? 'Rejected' : latest ? 'Pending review' : 'Not submitted';
    const statusColor = latest?.status === 'approved' ? 'green' : latest?.status === 'rejected' ? 'red' : 'gold';
    return (
      <section className="fan-section-block">
        <div className="fan-section-heading"><span>Fan verification</span></div>
        <Card className="fan-panel">
          <p style={{ color: 'rgba(255,255,255,0.72)', marginTop: 0 }}>
            Upload an image showing at least 4 older UWELL products. After manual review, approved fans receive 100 bonus points.
          </p>
          <Tag color={statusColor} style={{ marginBottom: 12 }}>{statusText}</Tag>
          <Upload accept="image/*" showUploadList={false} beforeUpload={handleOldFanUpload}>
            <Button type="primary" icon={<UploadOutlined />}>Upload proof image</Button>
          </Upload>
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            {oldFanVerifications.length ? oldFanVerifications.map((item) => (
              <div key={item.id} className="fan-activity-card">
                <img src={item.image_url} alt="Fan verification" style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 10 }} />
                <div>
                  <strong>Verification image</strong>
                  <p>{item.status === 'approved' ? 'Approved. Points have been added.' : item.status === 'rejected' ? 'Not approved' : 'Waiting for admin review'}</p>
                  <em>{formatDateTime(item.submitted_at || item.created_at)}</em>
                </div>
                <b className={item.status === 'approved' ? 'is-positive' : ''}>{item.status === 'approved' ? '+100' : ''}</b>
              </div>
            )) : <Empty description="No submissions yet" />}
          </div>
        </Card>
      </section>
    );
  };

  const renderSecondaryView = () => {
    const viewMap = {
      scan: { title: t('fan_scan'), content: <ScanTab fan={currentFan} onPointsChange={handlePointsChange} /> },
      mall: { title: t('fan_redeem'), content: <MallTab fan={currentFan} onPointsChange={handlePointsChange} /> },
      invite: { title: t('fan_invite'), content: <InviteTab fan={currentFan} /> },
      community: { title: t('fan_community'), content: <CommunityTab fan={currentFan} /> },
      campaigns: { title: t('fan_activities'), content: <CampaignTab fan={currentFan} /> },
      oldfan: { title: 'Fan verification', content: renderOldFanVerification() },
      map: { title: 'Store recommendations', content: renderStores() },
      help: { title: t('fan_help'), content: <HowItWorksTab /> },
    };
    const selected = viewMap[activeView];
    if (!selected) return null;
    return (
      <section className="fan-secondary-view">
        <div className="fan-subpage-bar">
          <Button type="text" onClick={() => setActiveView('home')}>{t('back')}</Button>
          <strong>{selected.title}</strong>
          <span />
        </div>
        {selected.content}
      </section>
    );
  };

  const renderContent = () => {
    if (activeView === 'home') return renderHome();
    if (activeView === 'tasks') return renderTasks();
    if (activeView === 'stores') return renderStores();
    if (activeView === 'profile') return renderProfile();
    if (activeView === 'checkin') return <CheckInTab fan={currentFan} onPointsChange={handlePointsChange} />;
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

  const activeNavKey = fanNavItems.some((item) => item.key === activeView) ? activeView : 'home';

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
