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
import { isLocalMode } from '../../services/api';
import { isLocal } from '../../services/api/helpers';
import { FAN_LEVELS, MALL_ITEMS } from '../../utils/constants';
import { FAN_LEVEL_LABELS, readImageAsDataUrl } from '../../utils/uwellClosedLoop';
import { getFanFacingStorePresentation, sortStoresForFanExposure } from '../../utils/uwellLaunchRules';
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
const FAN_HOME_OFFICIAL_MEDIA = 'https://files.myuwell.com/uwell/product/caliburn-g5/pc/pic1.webp';
const FAN_HOME_OFFICIAL_VIDEO = 'https://files.myuwell.com/uwell/product/caliburn-g4/theme.mp4';
const FAN_HOME_VISUAL_ASSETS = {
  growth: '/uwell-assets/fan-lifestyle.jpg',
  tasks: 'https://files.myuwell.com/uwell/product/caliburn-g5-lite/pc/spe3-lite.webp',
  campaign: 'https://files.myuwell.com/uwell/product/caliburn-g4-pro-koko/pc/p1.webp',
  reward: 'https://files.myuwell.com/uwell/product/caliburn-g4/pc/1.webp',
  store: '/uwell-assets/g5-ugc-display.jpg',
};
const FAN_PROFILE_VISUALS = {
  hero: '/uwell-assets/fan-refresh-v2/me-hero.jpg',
  overview: '/uwell-assets/fan-refresh-v2/me-detail-a.jpg',
  activity: '/uwell-assets/fan-refresh-v2/me-detail-b.jpg',
};
const FAN_OLD_VERIFICATION_VISUAL = '/uwell-assets/fan-refresh-v2/contact-sheet-v2.jpg';
const FAN_OLD_VERIFICATION_FALLBACK = '/uwell-assets/fan-refresh-v2/official-g5-detail.webp';
const STORE_PREVIEW_VISUALS = [
  '/uwell-assets/fan-refresh-v2/store-s.jpg',
  '/uwell-assets/fan-refresh-v2/store-a.jpg',
  '/uwell-assets/fan-refresh-v2/store-b.jpg',
  '/uwell-assets/fan-refresh-v2/store-gallery.jpg',
];
const STORE_PREVIEW_HERO_VISUAL = '/uwell-assets/fan-refresh-v2/store-hero.jpg';
const STORE_FALLBACK_VISUALS = {
  S: STORE_PREVIEW_VISUALS[0],
  A: STORE_PREVIEW_VISUALS[1],
  B: STORE_PREVIEW_VISUALS[2],
  C: STORE_PREVIEW_VISUALS[3],
};

// Task-141 ReactBits-inspired fan center effects: high-value brand/action surfaces only.

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

const getStorePreviewVisual = (store, index, fallbackByLevel = STORE_FALLBACK_VISUALS) => {
  const storefrontPhoto = getStorefrontPhoto(store?.id);
  if (storefrontPhoto?.image_url) return storefrontPhoto.image_url;
  const level = store?.level || 'C';
  return fallbackByLevel[level] || STORE_PREVIEW_VISUALS[Math.min(index, STORE_PREVIEW_VISUALS.length - 1)];
};

const getFanStoreCapabilities = (store = {}, t) => {
  const exposureControls = store.exposure_controls || {};
  return [
    {
      key: 'activity',
      label: t('fan_real_activity_store'),
      active: Boolean(exposureControls.store_events_visible || exposureControls.eligible_for_store_events_display),
    },
    {
      key: 'pickup',
      label: t('fan_real_pickup_eligible'),
      active: Boolean(exposureControls.reward_pickup_recommended || ['S', 'A'].includes(store.level)),
    },
    {
      key: 'display',
      label: t('fan_real_display_reviewed'),
      active: Boolean(exposureControls.fan_map_highlighted || store.display_status === 'approved'),
    },
  ];
};

const LevelBadge = ({ levelInfo, compact = false }) => {
  const levelValue = levelInfo?.value || 'gold';
  const levelLabel = FAN_LEVEL_LABELS[levelValue] || levelInfo?.label || 'Gold';
  return (
    <span className={`fan-level-badge is-${levelValue}${compact ? ' is-compact' : ''}`} aria-label={`${levelLabel} level`}>
      <CrownOutlined />
      <b>{levelLabel}</b>
    </span>
  );
};

const FanCenterPage = () => {
  const { lang, t } = useLanguageStore();
  const { user, signOut } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('home');
  const [returnView, setReturnView] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [navVisibility, setNavVisibility] = useState('visible');
  const bgVideoRef = useRef(null);
  const settingsRef = useRef(null);
  const navLastScrollYRef = useRef(0);
  const navIdleTimerRef = useRef(0);
  const localFallbackFans = useMemo(() => getLocalFanFallback(), []);
  const navStableViews = new Set(['scan', 'checkin', 'invite', 'oldfan', 'help']);
  const shouldStabilizeBottomNav = navStableViews.has(activeView);

  const revealBottomNav = () => {
    window.clearTimeout(navIdleTimerRef.current);
    setNavVisibility('visible');
  };

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
    revealBottomNav();
  }, [activeView]);

  useEffect(() => {
    if (shouldStabilizeBottomNav) {
      revealBottomNav();
      return undefined;
    }

    navLastScrollYRef.current = window.scrollY || 0;

    const handleFanNavScroll = () => {
      const nextScrollY = Math.max(0, window.scrollY || 0);
      const delta = nextScrollY - navLastScrollYRef.current;
      navLastScrollYRef.current = nextScrollY;

      window.clearTimeout(navIdleTimerRef.current);

      if (delta > 8 && nextScrollY > 140) {
        setNavVisibility('hidden');
      } else if (delta < -6) {
        setNavVisibility('visible');
      }

      navIdleTimerRef.current = window.setTimeout(() => {
        if (!shouldStabilizeBottomNav) setNavVisibility('soft');
      }, 700);
    };

    window.addEventListener('scroll', handleFanNavScroll, { passive: true });

    return () => {
      window.clearTimeout(navIdleTimerRef.current);
      window.removeEventListener('scroll', handleFanNavScroll);
    };
  }, [shouldStabilizeBottomNav]);

  useEffect(() => {
    if (!settingsOpen) return undefined;

    const handleSettingsPointerDown = (event) => {
      if (settingsRef.current?.contains(event.target)) return;
      setSettingsOpen(false);
    };

    const handleSettingsKeyDown = (event) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };

    document.addEventListener('pointerdown', handleSettingsPointerDown);
    document.addEventListener('keydown', handleSettingsKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleSettingsPointerDown);
      document.removeEventListener('keydown', handleSettingsKeyDown);
    };
  }, [settingsOpen]);

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

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let resetTimer = 0;
    let isFadingOut = false;
    let disposed = false;

    const fadeVideo = (targetOpacity, duration = 500) => {
      cancelAnimationFrame(rafId);
      if (prefersReducedMotion) {
        video.style.opacity = String(targetOpacity);
        return;
      }

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
      if (prefersReducedMotion) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
    };

    const handleCanPlay = () => {
      if (prefersReducedMotion) {
        video.pause();
        video.style.opacity = '1';
        return;
      }

      playVideo();
      fadeVideo(1);
    };

    const handleTimeUpdate = () => {
      if (prefersReducedMotion || !video.duration || isFadingOut) return;
      if (video.duration - video.currentTime <= 0.55) {
        isFadingOut = true;
        fadeVideo(0);
      }
    };

    const handleEnded = () => {
      if (prefersReducedMotion) return;
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
  const canUseLocalFanFallback = isLocalMode() || isLocal() || hasSavedLocalFan || localStorage.getItem('fan_logged_in') === 'true';
  const remoteFanByAuthUser = fans.find((f) => f.user_id === user?.id);
  const remoteFanBySavedAuthUser = savedFanId ? fans.find((f) => f.user_id === savedFanId) : null;
  const savedLocalFan = canUseLocalFanFallback && savedFanId ? localDb.findById('fans', savedFanId) : null;
  const savedLocalFanFromQuery = canUseLocalFanFallback && savedFanId ? fans.find((f) => f.id === savedFanId) : null;
  let currentFan = remoteFanByAuthUser || remoteFanBySavedAuthUser || savedLocalFan || savedLocalFanFromQuery || null;

  useRealtimeSubscription('fan_points_log', { event: 'INSERT' }, (payload) => {
    const newLog = payload.new;
    if (currentFan && newLog.fan_id === currentFan.id && !isLocalMode()) {
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
    const demoFanAccount = (localDb.all('auth') || []).find((account) => account.email === 'fan.preview@uwell.com');
    const demoFan = demoFanAccount?.fan_id ? localDb.findById('fans', demoFanAccount.fan_id) : null;
    if (demoFan) {
      currentFan = demoFan;
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

  const hasCheckedInToday = (() => {
    if (!currentFan?.id) return false;
    try {
      const today = getTodayDateKey();
      return (localDb.find('fan_checkins', (item) => item.fan_id === currentFan.id) || [])
        .some((item) => item.date === today);
    } catch {
      return false;
    }
  })();

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

  const invitePointRows = (() => {
    try {
      return (localDb.find('fan_points_log', (log) => (
        log.fan_id === currentFan?.id
        && String(log.source || log.description || '').toLowerCase().includes('invite')
      )) || []);
    } catch {
      return [];
    }
  })();
  const invitePointsEarned = invitePointRows.reduce((sum, log) => sum + Math.max(0, Number(log.points || 0)), 0);

  const featuredCampaign = (() => {
    try {
      return (localDb.all('campaigns') || [])
        .filter((campaign) => campaign.status === 'ongoing')
        .sort((a, b) => new Date(a.end_date || 0) - new Date(b.end_date || 0))[0];
    } catch {
      return null;
    }
  })();

  const campaignCopyKeys = {
    'ca-real-001': {
      name: 'fan_real_activities_campaign_g5_launch',
      description: 'fan_real_activities_campaign_g5_launch_desc',
    },
    'ca-real-002': {
      name: 'fan_real_activities_campaign_ramadan',
      description: 'fan_real_activities_campaign_ramadan_desc',
    },
    'ca-real-003': {
      name: 'fan_real_activities_campaign_display',
      description: 'fan_real_activities_campaign_display_desc',
    },
    'ca-real-004': {
      name: 'fan_real_activities_campaign_whatsapp',
      description: 'fan_real_activities_campaign_whatsapp_desc',
    },
    'ca-real-005': {
      name: 'fan_real_activities_campaign_summer',
      description: 'fan_real_activities_campaign_summer_desc',
    },
  };
  const featuredCampaignKeys = lang === 'ar' ? campaignCopyKeys[featuredCampaign?.id] : null;
  const displayCampaign = featuredCampaign ? {
    ...featuredCampaign,
    name: featuredCampaignKeys ? t(featuredCampaignKeys.name) : (featuredCampaign.name_english || t('fan_real_activities_campaign_display')),
    description: featuredCampaignKeys ? t(featuredCampaignKeys.description) : (featuredCampaign.description_english || t('fan_real_activities_campaign_display_desc')),
  } : null;

  const fanNavItems = [
    { key: 'home', label: t('fan_real_home'), icon: <HomeOutlined /> },
    { key: 'activities', label: t('fan_real_activities'), icon: <CalendarOutlined /> },
    { key: 'community', label: t('fan_real_community'), icon: <MessageOutlined /> },
    { key: 'rewards', label: t('fan_real_rewards'), icon: <GiftOutlined /> },
    { key: 'stores', label: t('fan_real_stores'), icon: <EnvironmentOutlined /> },
    { key: 'me', label: t('fan_real_me'), icon: <UserOutlined /> },
  ];

  const fanTaskCards = [
    { key: 'checkin', title: 'Daily check-in', desc: 'Open your member center each day to collect base points.', points: '+5', done: hasCheckedInToday, action: hasCheckedInToday ? 'Done today' : 'Check in' },
    { key: 'scan', title: 'Scan for points', desc: 'Scan your UWELL product code after purchase. Points go straight to your account.', points: '+20', done: true, action: 'Scan now' },
    { key: 'campaigns', title: "Join this week's activity", desc: 'See the active brand activity and complete the steps for extra rewards.', points: '+50', done: false, action: 'View activity' },
  ];

  const activityCopyKeys = {
    '\u6bcf\u65e5\u7b7e\u5230': 'fan_real_activity_source_checkin',
    '\u626b\u7801\u9a8c\u8bc1': 'fan_real_activity_source_scan',
    '\u79ef\u5206\u5151\u6362': 'fan_real_activity_source_redeem',
    '\u9650\u91cfUWELL\u5468\u8fb9\u793c\u5305': 'fan_reward_sample',
    '\u9650\u91cf UWELL \u5468\u8fb9\u793c\u5305': 'fan_reward_sample',
    '\u7b7e\u5230\u5956\u52b1': 'fan_real_activity_desc_checkin',
    '\u63a8\u8350\u65b0\u7c89\u4e1d': 'fan_real_activity_source_referral',
    '\u59e3\u5fd4\u68e9\u7edb\u60e7\u57cc': 'fan_real_activity_source_checkin',
    '\u93b5\ue0a4\u721c\u6960\u5c83\u7609': 'fan_real_activity_source_scan',
    '\u7ec9\ue21a\u578e\u934f\u621e\u5d32': 'fan_real_activity_source_redeem',
    '\u95c4\u6130\u567aUWELL\u935b\u3128\u7adf\u7ec0\u714e\u5bd8': 'fan_reward_sample',
    '\u95c4\u6130\u567a UWELL \u935b\u3128\u7adf\u7ec0\u714e\u5bd8': 'fan_reward_sample',
    'Daily Check-in': 'fan_real_activity_source_checkin',
    'Daily check-in': 'fan_real_activity_source_checkin',
    'Daily check-in reward': 'fan_real_activity_desc_checkin',
    'Daily check-in bonus': 'fan_real_activity_desc_checkin',
    'Product scan': 'fan_real_activity_source_scan',
    'Verified G4 Pod unique code scan': 'fan_real_activity_desc_scan_g4',
    'Reward redemption': 'fan_real_activity_source_redeem',
    'Redeemed UWELL KOKO device reward': 'fan_real_activity_desc_redeem_koko',
  };

  const getFanActivityText = (value, fallback = '-') => {
    if (!value) return fallback;
    const text = String(value).trim();
    if (text.startsWith('Daily check-in reward')) {
      return text.replace('Daily check-in reward', t('fan_real_activity_desc_checkin'));
    }
    return activityCopyKeys[text] ? t(activityCopyKeys[text]) : text;
  };

  const getLocalizedStorePresentation = (presentation) => {
    const storeCopyKeys = {
      'UWELL Brand Store': 'fan_real_store_brand_store',
      'Official UWELL brand experience and premium reward pickup readiness.': 'fan_real_store_brand_experience',
      'Premium pickup ready': 'fan_real_store_premium_pickup_ready',
      'Recommended UWELL partner': 'fan_real_store_recommended_partner',
      'Reviewed UWELL partner with reward pickup readiness.': 'fan_real_store_reviewed_pickup',
      'Pickup eligible': 'fan_real_pickup_eligible',
      'UWELL partner store': 'fan_real_store_partner_store',
      'Visible UWELL partner for store visits and product support.': 'fan_real_store_visible_partner',
      'Partner store': 'fan_real_store_partner_pickup',
    };
    return {
      ...presentation,
      fanLabel: t(storeCopyKeys[presentation.fanLabel], presentation.fanLabel),
      trustCopy: t(storeCopyKeys[presentation.trustCopy], presentation.trustCopy),
      pickupLabel: t(storeCopyKeys[presentation.pickupLabel], presentation.pickupLabel),
    };
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
      <div className="fan-shell-brand"><strong>UWELL Club</strong><span>{t('fan_real_member_growth')}</span></div>
      <div className="fan-shell-actions">
        <LanguageSwitcher
          inline
          showCurrent
          sourceOnly
          anchor="end"
          tone="light"
          labelOverride={t('fan_real_language')}
          buttonMinWidth={96}
          menuMinWidth={180}
          className="fan-header-language"
        />
        <div className="store-settings-slot" ref={settingsRef}>
          <button
            type="button"
            className={`store-settings-trigger${settingsOpen ? ' is-open' : ''}`}
            onClick={() => setSettingsOpen((value) => !value)}
            aria-label={t('fan_real_settings')}
            aria-haspopup="menu"
            aria-expanded={settingsOpen}
          >
            <SettingOutlined /><span className="sr-only">{t('fan_real_settings')}</span>
          </button>
          {settingsOpen && (
            <div className="store-settings-panel liquid-glass">
              <div className="store-settings-label">{t('fan_real_fan_settings')}</div>
              <button type="button" className="store-settings-item" onClick={() => openSecondaryView('oldfan', activeView)}>
                <UploadOutlined /> {t('fan_real_my_verification')}
              </button>
              <button type="button" className="store-settings-item" onClick={handleLogout}>
                <LogoutOutlined /> Sign out
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          className="fan-shell-avatar-button uw-reactbits-specular-button"
          aria-label={t('fan_real_open_me')}
          onClick={() => setActiveView('me')}
        >
          <Avatar className="fan-shell-avatar" aria-hidden="true">{(currentFan?.name || 'U').slice(0, 1).toUpperCase()}</Avatar>
        </button>
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
        <LevelBadge levelInfo={levelInfo} compact />
        <span>{nextLevel ? `${t('fan_next_level')} ${FAN_LEVEL_LABELS[nextLevel.value] || nextLevel.label}` : t('fan_top_level')}</span>
      </div>
      <div className="fan-brand-culture-strip" aria-label="UWELL premium member culture">
        <span>{t('fan_real_uwell_clubhouse')}</span>
        <span>{t('fan_real_official_drops')}</span>
        <span>{t('fan_real_brand_store_access')}</span>
        <span>{t('fan_real_member_only_growth')}</span>
      </div>
    </section>
  );

  const renderHomeBrandClubHero = () => {
    const primaryActionLabel = hasCheckedInToday ? t('fan_real_scan_now') : t('fan_real_claim_today');
    const handlePrimaryAction = () => {
      if (hasCheckedInToday) {
        openSecondaryView('scan', 'home');
        return;
      }
      handleTaskAction('checkin');
    };

    return (
      <section className="fan-home-brand-club-hero fan-home-cinematic-hero">
        <div className="fan-home-brand-media" aria-label="UWELL brand product and member culture media space">
          <div className="fan-home-real-media-frame" aria-label="UWELL official video preview">
            <video
              className="fan-home-hero-video"
              src={FAN_HOME_OFFICIAL_VIDEO}
              poster={FAN_HOME_OFFICIAL_MEDIA}
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
            />
          </div>
          <div className="fan-home-media-storyline">
            <span>{t('fan_real_official_drops', 'Official drops')}</span>
            <strong>CALIBURN G5</strong>
            <em>{t('fan_real_member_only_growth', 'Member growth')}</em>
          </div>
          <div className="fan-home-hero-status-pill">
            <span>{t('fan_real_official_drops', 'Official drops')}</span>
            <LevelBadge levelInfo={levelInfo} compact />
          </div>
        </div>
        <div className="fan-home-brand-copy">
          <span className="fan-home-brand-kicker fan-home-hero-kicker uw-reactbits-shiny-text">{t('fan_real_uwell_clubhouse', 'UWELL Club')}</span>
          <h1 className="fan-home-hero-title uw-reactbits-split-text">UWELL Club</h1>
          <p className="fan-home-hero-line">Earn points. Unlock rewards. Visit Brand Stores.</p>
          <div className="fan-home-hero-quickline">
            <LevelBadge levelInfo={levelInfo} compact />
            <b className="fan-reactbits-counter">{(currentFan?.points || 0).toLocaleString()} {t('fan_points_unit')}</b>
          </div>
          <div className="fan-home-member-snapshot is-layout-locked">
            <Avatar size={36} className="fan-shell-avatar">{(currentFan?.name || 'U').slice(0, 1).toUpperCase()}</Avatar>
            <div>
              <strong>{currentFan?.name || 'UWELL Member'}</strong>
              <span>{nextLevel ? `${t('fan_real_next_prefix')} ${FAN_LEVEL_LABELS[nextLevel.value] || nextLevel.label}` : t('fan_top_level')}</span>
            </div>
          </div>
          <button type="button" className="fan-home-primary-action fan-reactbits-primary-action uw-reactbits-specular-button uw-reactbits-click-spark" onClick={handlePrimaryAction}>
            {primaryActionLabel}
          </button>
        </div>
      </section>
    );
  };

  const renderHomeClubPath = () => (
    <section className="fan-home-club-path fan-home-story-path" aria-label="UWELL Club member journey">
      <button type="button" onClick={() => openSecondaryView('help', 'home')}>
        <span className="fan-home-path-index">01</span>
        <span>{t('fan_real_club_path_join')}</span>
        <strong>UWELL Club</strong>
      </button>
      <button type="button" onClick={() => openSecondaryView('scan', 'home')}>
        <span className="fan-home-path-index">02</span>
        <span>{t('fan_real_club_path_earn')}</span>
        <strong>{t('fan_real_scan_now')}</strong>
      </button>
      <button type="button" onClick={() => setActiveView('rewards')}>
        <span className="fan-home-path-index">03</span>
        <span>{t('fan_real_club_path_redeem')}</span>
        <strong>{t('fan_real_rewards')}</strong>
      </button>
      <button type="button" onClick={() => setActiveView('stores')}>
        <span className="fan-home-path-index">04</span>
        <span>{t('fan_real_club_path_visit')}</span>
        <strong>{t('fan_real_stores')}</strong>
      </button>
    </section>
  );

  const renderHome = () => (
    <section className="fan-home-shell fan-home-brand-editor-lock fan-home-first-screen-lock">
      {renderHomeBrandClubHero()}
      {renderHomeClubPath()}

      <section className="fan-home-journey-section is-actions is-today">
        <span className="fan-home-section-backdrop" aria-hidden="true" />
        <div className="fan-home-section-copy">
          <span className="fan-mini-label">{t('fan_real_mission_label')}</span>
          <h2>{t('fan_real_today_story_title')}</h2>
          <p>{t('fan_real_mission_desc')}</p>
        </div>
        <div className="fan-home-action-showcase fan-home-today-strip fan-home-daily-actions-lock">
          <div className="fan-home-visual-panel is-tasks fan-home-task-atmosphere">
            <img src={FAN_HOME_VISUAL_ASSETS.tasks} alt="UWELL product daily mission visual" loading="lazy" />
          </div>
          <button
            type="button"
            className={`fan-home-action-card fan-reactbits-spotlight-card is-checkin${hasCheckedInToday ? ' is-done' : ''}`}
            onClick={() => handleTaskAction('checkin')}
          >
            <CalendarOutlined />
            <span className="fan-home-action-meta">{t('fan_real_daily_checkin')}</span>
            <strong>{hasCheckedInToday ? t('fan_real_checked_in') : t('fan_real_claim_today')} +5 {t('fan_real_pts_unit')}</strong>
          </button>
          <button type="button" className="fan-home-action-card fan-reactbits-spotlight-card is-scan" onClick={() => openSecondaryView('scan', 'home')}>
            <QrcodeOutlined />
            <span className="fan-home-action-meta">{t('fan_real_product_scan')}</span>
            <strong>{t('fan_real_scan_now')}</strong>
          </button>
          <Button className="fan-checkin-detail-link" onClick={handleOpenCheckInDetails}>
            {t('fan_real_view_streak')}
          </Button>
        </div>
      </section>

      <div className="fan-home-transition-band fan-home-premium-transition" aria-hidden="true" />

      <section className="fan-home-journey-section is-activity">
        <span className="fan-home-section-backdrop" aria-hidden="true" />
        <div className="fan-home-section-copy">
          <span className="fan-mini-label">{t('fan_real_recommended_activity')}</span>
          <h2>{t('fan_real_activity_story_title')}</h2>
          <p>{t('fan_real_activity_teaser')}</p>
        </div>
        {displayCampaign && (
          <article className="fan-home-activity-card fan-home-feature-showcase fan-home-drop-poster">
            <div className="fan-home-activity-media fan-home-visual-panel is-campaign fan-home-clean-media">
              <img src={FAN_HOME_VISUAL_ASSETS.campaign} alt="UWELL campaign product visual" loading="lazy" />
            </div>
            <div className="fan-home-card-copy">
              <span className="fan-mini-label">{t('fan_real_recommended_activity')}</span>
              <h3>{displayCampaign.name}</h3>
              <p>{t('fan_real_activity_teaser')}</p>
              <Button type="primary" className="fan-home-subtle-cta" onClick={() => setActiveView('activities')}>{t('fan_real_join_challenge')}</Button>
            </div>
          </article>
        )}
      </section>

      <div className="fan-home-transition-band fan-home-premium-transition is-soft" aria-hidden="true" />

      <section className="fan-home-journey-section is-rewards">
        <span className="fan-home-section-backdrop" aria-hidden="true" />
        <div className="fan-home-section-copy">
          <span className="fan-mini-label">{t('fan_real_reward_goal')}</span>
          <h2>{t('fan_real_rewards')}</h2>
          <p>{t('fan_real_shop_reward')}</p>
        </div>
        {MALL_ITEMS.slice(0, 1).map((item) => (
          <button type="button" key={item.id} className="fan-home-reward-card fan-reactbits-spotlight-card fan-home-reward-showcase fan-home-reward-shelf" onClick={() => setActiveView('rewards')}>
            <span className="fan-home-card-visual fan-home-visual-panel is-reward fan-home-clean-media">
              <img src={FAN_HOME_VISUAL_ASSETS.reward} alt="UWELL reward product visual" loading="lazy" />
              <GiftOutlined />
              <span>DROP</span>
            </span>
            <span className="fan-mini-label">{t('fan_real_reward_goal')}</span>
            <strong>{item.name}</strong>
            <small className="fan-home-reward-points fan-reactbits-counter">{item.points_cost.toLocaleString()} {t('fan_real_points_unit')}</small>
            <em>{t('fan_real_shop_reward')}</em>
          </button>
        ))}
      </section>

      <section className="fan-home-journey-section is-stores">
        <span className="fan-home-section-backdrop" aria-hidden="true" />
        <div className="fan-home-section-copy">
          <span className="fan-mini-label">{t('fan_real_nearby_stores')}</span>
          <h2>{t('fan_real_brand_store_picks')}</h2>
        </div>
        {recommendedStores.slice(0, 1).map((store) => (
          (() => {
            const presentation = getLocalizedStorePresentation(getFanFacingStorePresentation(store));
            return (
              <button type="button" key={store.id} className="fan-home-store-card fan-reactbits-spotlight-card fan-home-store-showcase fan-home-store-atmosphere" onClick={() => setActiveView('stores')}>
                <span className="fan-home-card-visual fan-home-visual-panel is-store fan-home-clean-media">
                  <img src={FAN_HOME_VISUAL_ASSETS.store} alt="UWELL store display product visual" loading="eager" />
                  <EnvironmentOutlined />
                  <span>NEAR</span>
                </span>
                <span className="fan-mini-label">{t('fan_real_nearby_stores')}</span>
                {store.exposure_controls?.fan_home_recommended && <Tag color="lime">{t('fan_real_home_priority')}</Tag>}
                <span className="fan-store-card-head">
                  <strong>{store.name}</strong>
                  <b className="fan-home-store-mark">{store.level || 'C'}</b>
                </span>
                <small>{presentation.fanLabel}</small>
                <small className="fan-store-trust-note">{presentation.trustCopy}</small>
                <em>{t('fan_real_open_map')}</em>
              </button>
            );
          })()
        ))}
      </section>

      <section className="fan-home-journey-section is-progress fan-home-brand-progress-immersive">
        <span className="fan-home-section-backdrop" aria-hidden="true" />
        <div className="fan-home-section-copy fan-home-section-media-copy">
          <span className="fan-mini-label">{t('fan_real_growth_center')}</span>
          <h2>{t('fan_real_growth_story_title')}</h2>
          <p>{t('fan_real_mission_desc')}</p>
        </div>
          <div className="fan-home-progress-showcase fan-home-growth-status">
          <div className="fan-home-visual-panel is-growth">
            <img src={FAN_HOME_VISUAL_ASSETS.growth} alt="UWELL member growth product campaign visual" loading="eager" />
          </div>
          <div className="fan-profile-row">
            <Avatar size={52} className="fan-shell-avatar fan-shell-avatar-lg">{(currentFan?.name || 'U').slice(0, 1).toUpperCase()}</Avatar>
            <div>
              <strong>{currentFan?.name || 'UWELL Member'}</strong>
              <LevelBadge levelInfo={levelInfo} compact />
            </div>
          </div>
          <div className="fan-points-number">
            <span className="fan-reactbits-counter">{(currentFan?.points || 0).toLocaleString()}</span>
            <em>{t('fan_points_unit')}</em>
          </div>
          <div className="fan-progress-label">
            <span>{t('fan_upgrade_progress')}</span>
            <span>{(currentFan?.points || 0).toLocaleString()} / {(nextLevel?.min_points || currentFan?.points || 0).toLocaleString()}</span>
          </div>
          <Progress percent={levelProgress} showInfo={false} strokeColor={{ from: '#ccff00', to: '#7ee000' }} railColor="rgba(17,22,10,0.10)" />
          <div className="fan-level-row">
            <LevelBadge levelInfo={levelInfo} compact />
            <span>{nextLevel ? `${t('fan_next_level')} ${FAN_LEVEL_LABELS[nextLevel.value] || nextLevel.label}` : t('fan_top_level')}</span>
          </div>
          <Button className="fan-checkin-detail-link" onClick={handleOpenCheckInDetails}>
            {t('fan_real_view_points')}
          </Button>
        </div>
      </section>

    </section>
  );

  const renderTasks = () => (
    <>
      <section className="fan-panel fan-task-hero">
        <span className="fan-mini-label">{t('fan_real_today_tasks')}</span>
        <h2>{t('fan_real_tasks_start')}</h2>
        <p>{t('fan_real_tasks_desc')}</p>
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
      <section className="fan-panel fan-store-hero fan-store-hero-compact">
        <div className="fan-store-hero-copy">
          <span className="fan-mini-label">{t('fan_real_store_map_preview_title')}</span>
          <h2>{t('fan_real_store_map_preview_heading')}</h2>
        </div>
        <div className="fan-store-hero-visual">
          <img src={STORE_PREVIEW_HERO_VISUAL} alt="UWELL store discovery visual" loading="lazy" />
          <div className="fan-store-hero-tags">
            <span>{t('fan_real_store_brand_store')}</span>
            <span>{t('fan_real_map_highlighted')}</span>
            <span>{t('fan_real_store_events')}</span>
          </div>
        </div>
      </section>
      <section className="fan-section-block fan-stores-preview">
        <div className="fan-section-heading">
          <span>{t('fan_real_brand_store_picks')}</span>
          <button type="button" onClick={() => setActiveView('stores')}>{t('fan_real_map_highlighted')}</button>
        </div>
        <div className="fan-visible-store-list">
          {recommendedStores.length ? recommendedStores.slice(0, 2).map((store, index) => {
            const storefrontPhoto = getStorefrontPhoto(store.id);
            const capabilities = getFanStoreCapabilities(store, t);
            const exposureControls = store.exposure_controls || {};
            const presentation = getLocalizedStorePresentation(getFanFacingStorePresentation(store));
            const previewImage = getStorePreviewVisual(store, index);
            const visibleCapabilities = capabilities.filter((capability) => capability.active).slice(0, 2);
            return (
              <article key={store.id} className="fan-visible-store-card is-compact">
                <div className="fan-visible-store-photo">
                  <div className="fan-visible-store-photo-frame">
                    <img className="fan-visible-store-photo-img" src={previewImage} alt={`${store.name} storefront`} />
                  </div>
                </div>
                <div className="fan-visible-store-copy">
                  <strong>{store.name}</strong>
                  <p>{presentation.fanLabel} · {store.phone || t('fan_real_phone_pending')}</p>
                  <small className="fan-store-trust-note">
                    {storefrontPhoto ? t('fan_real_storefront_trust') : t('fan_real_trust_photo_pending')}
                  </small>
                  <div className="fan-visible-store-capability-grid">
                    {visibleCapabilities.map((capability) => (
                      <span key={capability.key} className={`fan-visible-store-chip ${capability.active ? 'is-active' : 'is-muted'}`}>
                        {capability.label}
                      </span>
                    ))}
                  </div>
                  <div className="fan-visible-store-capability-grid">
                    {exposureControls.fan_map_highlighted && <span className="fan-visible-store-chip is-active">{t('fan_real_map_highlighted')}</span>}
                    {exposureControls.reward_pickup_recommended && <span className="fan-visible-store-chip is-active">{presentation.pickupLabel}</span>}
                  </div>
                </div>
                <a
                  className="fan-store-navigate-link"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('fan_real_navigate')}
                </a>
              </article>
            );
          }) : (
            <Empty description={t('fan_real_map_empty')} />
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
                {active && <LevelBadge levelInfo={level} compact />}
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
      <div className="fan-me-hero fan-me-growth-hero fan-me-hero-reduced">
        <span className="fan-me-avatar-ring">
          <Avatar size={68} className="fan-shell-avatar fan-shell-avatar-lg">{(currentFan?.name || 'U').slice(0, 1).toUpperCase()}</Avatar>
        </span>
        <div className="fan-me-hero-copy">
          <span className="fan-mini-label">{t('fan_real_growth_center')}</span>
          <h2>{currentFan?.name || 'UWELL Fan'}</h2>
          <p>{currentFan?.phone || currentFan?.id}</p>
          <LevelBadge levelInfo={levelInfo} />
          <div className="fan-me-hero-actions">
            <button type="button" onClick={() => setActiveView('rewards')}>
              <GiftOutlined /> {t('fan_real_open_rewards')}
            </button>
            <button type="button" onClick={() => openSecondaryView('oldfan', 'me')}>
              <UploadOutlined /> {t('fan_real_verify_fan_status')}
            </button>
          </div>
        </div>
        <div className="fan-me-hero-visual is-compact">
          <img src={FAN_PROFILE_VISUALS.hero} alt="UWELL fan profile visual" loading="lazy" />
          <div className="fan-me-hero-mini-grid" aria-hidden="true">
            <img src={FAN_PROFILE_VISUALS.overview} alt="" loading="lazy" />
            <img src={FAN_PROFILE_VISUALS.activity} alt="" loading="lazy" />
          </div>
          <div className="fan-me-hero-visual-chips">
            <span>{t('fan_real_account_overview')}</span>
            <span>{t('fan_real_rewards')}</span>
            <span>{t('fan_real_scan_history')}</span>
          </div>
        </div>
      </div>

      <div className="fan-me-points-card">
        <div className="fan-me-stat-card is-points">
          <span>{t('fan_real_available_points')}</span>
          <strong>{(currentFan?.points || 0).toLocaleString()}</strong>
        </div>
        <div className="fan-me-stat-card is-level">
          <span>{t('fan_real_current_level')}</span>
          <strong>{FAN_LEVEL_LABELS[levelInfo?.value] || levelInfo?.label}</strong>
          <LevelBadge levelInfo={levelInfo} compact />
        </div>
        <div className="fan-me-stat-card is-summary">
          <span>{t('fan_real_account_overview')}</span>
          <strong>{recentPointRows.length + recentRedemptionRows.length + recentScanRows.length}</strong>
        </div>
        <div className="fan-me-progress-row">
          <span>{nextLevel ? `${t('fan_real_next_prefix')} ${FAN_LEVEL_LABELS[nextLevel.value] || nextLevel.label}` : t('fan_top_level')}</span>
          <span>{Math.round(levelProgress)}%</span>
        </div>
        <Progress percent={levelProgress} showInfo={false} strokeColor={{ from: '#ccff00', to: '#7ee000' }} railColor="rgba(17,22,10,0.10)" />
      </div>

      <section className="fan-me-overview-strip">
        <div>
          <span>{t('fan_real_account_overview')}</span>
          <strong>{recentPointRows.length}</strong>
          <small>{t('fan_real_point_records')}</small>
        </div>
        <div>
          <span>{t('fan_real_rewards')}</span>
          <strong>{recentRedemptionRows.length}</strong>
          <small>{t('fan_real_redemptions')}</small>
        </div>
        <div>
          <span>{t('fan_real_scan_history')}</span>
          <strong>{recentScanRows.length}</strong>
          <small>{t('fan_real_product_scans')}</small>
        </div>
      </section>

      <section className="fan-me-history-panel is-featured">
        <div className="fan-section-heading">
          <span>{t('fan_real_recent_activity')}</span>
          <button type="button" onClick={() => openSecondaryView('checkin', 'me')}>{t('fan_real_view_points')}</button>
        </div>
        {renderMeHistoryList(
          recentPointRows,
          t('fan_real_no_point_records'),
          (item) => getFanActivityText(item.source || item.type, t('fan_real_point_record')),
          (item) => getFanActivityText(item.description, formatDateTime(item.created_at)),
          (item) => item.points,
        )}
      </section>

      <div className="fan-me-history-grid is-compact">
        <button type="button" className="fan-me-quick-card" onClick={() => openSecondaryView('checkin', 'me')}>
          <StarOutlined />
          <strong>{t('fan_real_points_history')}</strong>
          <span>{pointLogs.length ? `${pointLogs.length} ${t('fan_real_recent_unit')}` : t('fan_real_no_recent_records')}</span>
        </button>
        <button type="button" className="fan-me-quick-card" onClick={() => setActiveView('rewards')}>
          <GiftOutlined />
          <strong>{t('fan_real_reward_history')}</strong>
          <span>{t('fan_real_view_redemptions')}</span>
        </button>
        <button type="button" className="fan-me-quick-card" onClick={() => openSecondaryView('scan', 'me')}>
          <QrcodeOutlined />
          <strong>{t('fan_real_scan_history')}</strong>
          <span>{t('fan_real_product_scans')}</span>
        </button>
      </div>

      <div className="fan-me-utility-grid">
        <button type="button" className="fan-me-tool-card fan-me-invite-card" onClick={() => openSecondaryView('invite', 'me')}>
          <TeamOutlined />
          <strong>{t('fan_real_invite_friends')}</strong>
          <span>{invitePointRows.length} {t('fan_real_friends_invited')} · {invitePointsEarned} {t('fan_real_points_earned')}</span>
        </button>
        <button type="button" className="fan-me-tool-card" onClick={() => openSecondaryView('oldfan', 'me')}>
          <UploadOutlined />
          <strong>{t('fan_real_old_fan_title')}</strong>
          <span>{oldFanVerifications[0] ? t('fan_real_review_submission') : t('fan_real_submit_bonus_proof')}</span>
        </button>
        <button type="button" className="fan-me-tool-card" onClick={() => openSecondaryView('help', 'me')}>
          <QuestionCircleOutlined />
          <strong>{t('fan_real_new_user_guide')}</strong>
          <span>{t('fan_real_guide_short_desc')}</span>
        </button>
        <button type="button" className="fan-me-tool-card" onClick={() => setActiveView('community')}>
          <MessageOutlined />
          <strong>{t('fan_real_community')}</strong>
          <span>{t('fan_real_community_tool_desc')}</span>
        </button>
      </div>

      <button type="button" className="fan-me-signout" onClick={handleLogout}>
        <LogoutOutlined /> {t('fan_real_sign_out')}
      </button>
    </section>
  );

  const renderOldFanVerification = () => {
    const latest = oldFanVerifications[0];
    const statusText = latest?.status === 'approved' ? t('fan_real_status_approved') : latest?.status === 'rejected' ? t('fan_real_status_rejected') : latest ? t('fan_real_status_pending') : t('fan_real_status_not_submitted');
    const statusColor = latest?.status === 'approved' ? 'green' : latest?.status === 'rejected' ? 'red' : 'gold';
    return (
      <section className="fan-verification-page">
        <div className="fan-verification-hero">
          <UploadOutlined />
          <div>
            <span className="fan-mini-label">{t('fan_real_old_fan_title')}</span>
            <h2>{t('fan_real_old_fan_title')}</h2>
            <p>{t('fan_real_upload_old_fan_desc')}</p>
          </div>
          <div className="fan-verification-hero-visual">
            <img
              src={FAN_OLD_VERIFICATION_VISUAL}
              alt={t('fan_real_verification_alt')}
              loading="lazy"
              onError={(event) => {
                if (event.currentTarget.src.includes(FAN_OLD_VERIFICATION_FALLBACK)) return;
                event.currentTarget.src = FAN_OLD_VERIFICATION_FALLBACK;
              }}
            />
            <span className="fan-verification-image-fallback">{t('fan_real_upload_old_fan_desc')}</span>
          </div>
        </div>

        <section className="fan-verification-status-card">
          <div>
            <span>{t('fan_real_review_status')}</span>
            <strong>{statusText}</strong>
          </div>
          <Tag color={statusColor}>{statusText}</Tag>
        </section>

        <section className="fan-verification-upload-card">
          <div>
            <strong>{t('fan_real_submit_proof_image')}</strong>
            <span>{t('fan_real_clear_product_photo')}</span>
          </div>
          <Upload accept="image/*" showUploadList={false} beforeUpload={handleOldFanUpload}>
            <Button type="primary" icon={<UploadOutlined />}>{t('fan_real_upload_proof_image')}</Button>
          </Upload>
        </section>

        <section className="fan-verification-history-list">
          <div className="fan-section-heading">
            <span>{t('fan_real_submission_history')}</span>
            <strong>{oldFanVerifications.length} {t('fan_real_records_unit')}</strong>
          </div>
          {oldFanVerifications.length ? oldFanVerifications.map((item) => (
            <div key={item.id} className="fan-verification-history-row">
              <img src={item.image_url} alt={t('fan_real_verification_alt')} />
              <div>
                <strong>{t('fan_real_verification_image')}</strong>
                <p>{item.status === 'approved' ? t('fan_real_verification_approved_desc') : item.status === 'rejected' ? t('fan_real_verification_rejected_desc') : t('fan_real_verification_waiting_desc')}</p>
                <em>{formatDateTime(item.submitted_at || item.created_at)}</em>
              </div>
              <b className={item.status === 'approved' ? 'is-positive' : ''}>{item.status === 'approved' ? '+100' : ''}</b>
            </div>
          )) : <div className="fan-me-empty-row">{t('fan_real_no_submissions')}</div>}
        </section>
      </section>
    );
  };

  const renderSecondaryView = () => {
    const viewMap = {
      checkin: { title: t('fan_real_checkin_title'), content: <CheckInTab fan={currentFan} onPointsChange={handlePointsChange} /> },
      scan: { title: t('fan_real_scan_title'), content: <ScanTab fan={currentFan} onPointsChange={handlePointsChange} /> },
      mall: { title: t('fan_real_rewards_title'), content: <MallTab fan={currentFan} onPointsChange={handlePointsChange} /> },
      invite: { title: t('fan_real_invite_title'), content: <InviteTab fan={currentFan} /> },
      campaigns: { title: t('fan_real_activities'), content: <CampaignTab fan={currentFan} /> },
      profile: { title: t('fan_real_me'), content: renderProfile() },
      oldfan: { title: t('fan_real_old_fan_title'), content: renderOldFanVerification() },
      map: { title: t('fan_real_store_map_title'), content: renderStores() },
      help: { title: t('fan_real_help_title'), content: <HowItWorksTab /> },
    };
    const selected = viewMap[activeView];
    if (!selected) return null;
    return (
      <section className="fan-secondary-view">
        <div className="fan-subpage-bar">
          <Button className="fan-subpage-back" type="text" onClick={handleSecondaryBack}>{t('fan_real_back')}</Button>
          <strong className="fan-subpage-title">{selected.title}</strong>
          <span className="fan-subpage-spacer" aria-hidden="true" />
        </div>
        <div className="fan-secondary-content">
          {selected.content}
        </div>
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
          <Empty description={t('fan_real_no_profile')} />
          <Button type="primary" onClick={handleLogout} style={{ marginTop: 16 }}>{t('fan_real_back_home')}</Button>
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
    <div className="fan-shell fan-premium-member-shell">
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
      <nav
        className={`fan-bottom-nav ${navVisibility === 'hidden' ? 'is-nav-hidden' : ''} ${navVisibility === 'soft' ? 'is-nav-soft' : ''} ${shouldStabilizeBottomNav ? 'is-nav-stable' : ''}`}
        aria-label={t('fan_real_fan_nav_label')}
        onPointerEnter={revealBottomNav}
        onFocus={revealBottomNav}
      >
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
