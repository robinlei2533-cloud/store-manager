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
import { getFans } from '../../services/api';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { IS_LOCAL_MODE } from '../../services/api';
import { FAN_LEVELS, MALL_ITEMS } from '../../utils/constants';
import { FAN_LEVEL_LABELS, readImageAsDataUrl } from '../../utils/uwellClosedLoop';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

import CheckInTab from './tabs/CheckInTab';
import ScanTab from './tabs/ScanTab';
import MallTab from './tabs/MallTab';
import InviteTab from './tabs/InviteTab';
import CommunityTab from './tabs/CommunityTab';
import HowItWorksTab from './tabs/HowItWorksTab';
import MapTab from './tabs/MapTab';
import CampaignTab from './tabs/CampaignTab';

const FAN_CENTER_BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4';

const formatDateTime = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '-';
  }
};

const LevelBadge = ({ levelInfo }) => (
  <Tag className="fan-shell-level-tag" color={levelInfo?.color || 'gold'}>
    <CrownOutlined /> {FAN_LEVEL_LABELS[levelInfo?.value] || levelInfo?.label || '黄金'}
  </Tag>
);

const FanCenterPage = () => {
  const { t } = useLanguageStore();
  const { user, signOut } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  let currentFan = fans.find((f) => f.user_id === user?.id) || fans[0] || null;

  useRealtimeSubscription('fan_points_log', { event: 'INSERT' }, (payload) => {
    const newLog = payload.new;
    if (currentFan && newLog.fan_id === currentFan.id && !IS_LOCAL_MODE) {
      const pts = newLog.points > 0 ? `+${newLog.points}` : String(newLog.points);
      message.success(`${t('fan_points_changed')}: ${pts} - ${newLog.reason || ''}`);
      queryClient.invalidateQueries({ queryKey: ['fans'] });
      queryClient.invalidateQueries({ queryKey: ['fan-points-log'] });
    }
  });

  if (localDb.needsInit()) localDb.init(seedData);

  if (!currentFan) {
    const savedFanId = localStorage.getItem('store_manager_current_user');
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
  const nextLevel = useMemo(
    () => FAN_LEVELS.find((level) => level.min_points > (currentFan?.points || 0)),
    [currentFan?.points],
  );
  const levelProgress = nextLevel
    ? Math.min(100, Math.round(((currentFan?.points || 0) / nextLevel.min_points) * 100))
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
      return (localDb.all('stores') || [])
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

  const handleOldFanUpload = async (file) => {
    if (!currentFan) return false;
    if (!file.type?.startsWith('image/')) {
      message.error('只能上传图片文件');
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
      message.success('老粉验证已提交，等待后台人工审核');
      setRefreshKey((k) => k + 1);
    } catch {
      message.error('图片读取失败，请换一张较小的图片');
    }
    return false;
  };

  const navItems = [
    { key: 'home', label: '首页', icon: <HomeOutlined /> },
    { key: 'tasks', label: '任务', icon: <CalendarOutlined /> },
    { key: 'stores', label: '门店', icon: <EnvironmentOutlined /> },
    { key: 'profile', label: '我的', icon: <UserOutlined /> },
  ];

  const featureItems = [
    { key: 'tasks', label: '今日任务', icon: <CalendarOutlined />, tone: 'gold' },
    { key: 'scan', label: '扫码积分', icon: <QrcodeOutlined />, tone: 'blue' },
    { key: 'campaigns', label: '活动奖励', icon: <FireOutlined />, tone: 'red' },
    { key: 'stores', label: '推荐门店', icon: <EnvironmentOutlined />, tone: 'teal' },
  ];

  const taskCards = [
    { key: 'checkin', title: '每日签到', desc: '每天打开会员中心即可领取基础积分。', points: '+10', done: true, action: '去签到' },
    { key: 'scan', title: '扫码累积积分', desc: '购买 UWELL 产品后扫码，积分自动进入账户。', points: '+20', done: true, action: '去扫码' },
    { key: 'campaigns', title: '参加本周活动', desc: '查看正在进行的品牌活动，完成后可获得额外奖励。', points: '+50', done: false, action: '看活动' },
    { key: 'stores', title: '到可信门店领取福利', desc: '优先推荐已审核展示和等级更高的门店。', points: '门店福利', done: false, action: '找门店' },
  ];

  const renderShellHeader = () => (
    <header className="fan-shell-header">
      <div className="fan-shell-brand"><strong>UWELL</strong><span>{t('fan_center_label')}</span></div>
      <div className="fan-shell-actions">
        <div className="store-settings-slot">
          <button
            type="button"
            className={`store-settings-trigger${settingsOpen ? ' is-open' : ''}`}
            onClick={() => setSettingsOpen((value) => !value)}
            aria-label="Open fan settings"
          >
            <SettingOutlined />
          </button>
          {settingsOpen && (
            <div className="store-settings-panel liquid-glass">
              <div className="store-settings-label">{t('settings_language')}</div>
              <LanguageSwitcher inline showCurrent sourceOnly anchor="end" tone="light" buttonMinWidth={52} menuMinWidth={180} />
              <div className="fe-settings-divider" />
              <button type="button" className="store-settings-item" onClick={() => { window.location.href = '/store-app.html#/store-login'; }}>
                <HomeOutlined /> 门店入口
              </button>
              <button type="button" className="store-settings-item" onClick={() => setActiveView('oldfan')}>
                <UploadOutlined /> 我的认证
              </button>
              <button type="button" className="store-settings-item" onClick={handleLogout}>
                <LogoutOutlined /> {t('logout')}
              </button>
            </div>
          )}
        </div>
        <Avatar className="fan-shell-avatar">{(currentFan?.name || 'U').slice(0, 1).toUpperCase()}</Avatar>
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
      <section className="fan-feature-grid fan-feature-grid-primary">
        {featureItems.map((item) => (
          <button key={item.key} type="button" className={`fan-feature-card tone-${item.tone}`} onClick={() => setActiveView(item.key)}>
            <span>{item.icon}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </section>
      <section className="fan-panel fan-today-panel">
        <div className="fan-section-title"><StarOutlined /> 今日任务 <span>2/4</span></div>
        {taskCards.slice(0, 3).map((task) => (
          <div key={task.key} className={`fan-task-row${task.done ? ' is-done' : ''}`}>
            <CheckCircleOutlined />
            <span>{task.title}</span>
            <strong>{task.points}</strong>
          </div>
        ))}
        <Button block type="primary" onClick={() => setActiveView('tasks')}>查看全部任务</Button>
      </section>
      {featuredCampaign && (
        <section className="fan-campaign-poster">
          <div>
            <span className="fan-mini-label">本周推荐活动</span>
            <h3>{featuredCampaign.name}</h3>
            <p>{featuredCampaign.description}</p>
          </div>
          <Button type="primary" onClick={() => setActiveView('campaigns')}>查看步骤与奖励</Button>
        </section>
      )}
      <section className="fan-section-block">
        <div className="fan-section-heading">
          <span>可信门店</span>
          <button type="button" onClick={() => setActiveView('stores')}>查看地图</button>
        </div>
        <div className="fan-store-strip">
          {recommendedStores.map((store) => (
            <button type="button" key={store.id} className="fan-store-card" onClick={() => setActiveView('stores')}>
              <strong>{store.name}</strong>
              <span>{store.level || 'C'} 级门店</span>
              <em>{store.phone || '门店信息待补充'}</em>
            </button>
          ))}
        </div>
      </section>
      <section className="fan-section-block">
        <div className="fan-section-heading">
          <span>热门兑换</span>
          <button type="button" onClick={() => setActiveView('mall')}>进入积分商城</button>
        </div>
        <div className="fan-reward-grid fan-reward-grid-home">
          {MALL_ITEMS.slice(0, 3).map((item) => (
            <button type="button" key={item.id} className="fan-reward-card" onClick={() => setActiveView('mall')}>
              <GiftOutlined />
              <strong>{item.name}</strong>
              <span>{item.points_cost.toLocaleString()} 积分</span>
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
                <strong>{item.source || item.type || t('fan_points_changed')}</strong>
                <p>{item.description || item.reason || '-'}</p>
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
        <span className="fan-mini-label">今日任务</span>
        <h2>先做最容易的三件事</h2>
        <p>签到、扫码和查看活动是粉丝最常用的路径，完成后积分与奖励会自动记录在个人中心。</p>
      </section>
      <section className="fan-task-card-list">
        {taskCards.map((task) => (
          <button key={task.key} type="button" className={`fan-task-card${task.done ? ' is-done' : ''}`} onClick={() => setActiveView(task.key)}>
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
        <span className="fan-mini-label">推荐门店</span>
        <h2>优先去已审核、等级更高的 UWELL 门店</h2>
        <p>这里会展示门店等级、导航入口和审核通过的真实陈列图，粉丝更容易判断去哪家店领取活动权益。</p>
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
        <button type="button" onClick={() => setActiveView('oldfan')}><UploadOutlined /> 我的认证</button>
        <button type="button" onClick={() => setActiveView('mall')}><GiftOutlined /> 积分兑换</button>
        <button type="button" onClick={() => setActiveView('help')}><QuestionCircleOutlined /> {t('fan_help')}</button>
        <button type="button" className="is-danger" onClick={handleLogout}><LogoutOutlined /> {t('logout')}</button>
      </section>
    </>
  );

  const renderOldFanVerification = () => {
    const latest = oldFanVerifications[0];
    const statusText = latest?.status === 'approved' ? '已通过' : latest?.status === 'rejected' ? '已拒绝' : latest ? '待审核' : '未提交';
    const statusColor = latest?.status === 'approved' ? 'green' : latest?.status === 'rejected' ? 'red' : 'gold';
    return (
      <section className="fan-section-block">
        <div className="fan-section-heading"><span>老粉验证</span></div>
        <Card className="fan-panel">
          <p style={{ color: 'rgba(255,255,255,0.72)', marginTop: 0 }}>
            上传至少包含 4 个 UWELL 老产品的证明图片，后台人工审核通过后奖励 100 积分。
          </p>
          <Tag color={statusColor} style={{ marginBottom: 12 }}>{statusText}</Tag>
          <Upload accept="image/*" showUploadList={false} beforeUpload={handleOldFanUpload}>
            <Button type="primary" icon={<UploadOutlined />}>上传证明图片</Button>
          </Upload>
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            {oldFanVerifications.length ? oldFanVerifications.map((item) => (
              <div key={item.id} className="fan-activity-card">
                <img src={item.image_url} alt="老粉验证" style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 10 }} />
                <div>
                  <strong>老粉验证图片</strong>
                  <p>{item.status === 'approved' ? '审核通过，积分已发放' : item.status === 'rejected' ? '审核未通过' : '等待后台审核'}</p>
                  <em>{formatDateTime(item.submitted_at || item.created_at)}</em>
                </div>
                <b className={item.status === 'approved' ? 'is-positive' : ''}>{item.status === 'approved' ? '+100' : ''}</b>
              </div>
            )) : <Empty description="暂无提交记录" />}
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
      oldfan: { title: '老粉验证', content: renderOldFanVerification() },
      map: { title: '门店推荐', content: renderStores() },
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

  if (isLoading) {
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

  const activeNavKey = navItems.some((item) => item.key === activeView) ? activeView : 'home';

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
        {navItems.map((item) => (
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
