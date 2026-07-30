import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Modal, Progress, Spin, Tag, Typography, message } from 'antd';
import { BookOutlined, CheckCircleOutlined, GiftOutlined, LikeOutlined, ShareAltOutlined, ShopOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';
import useLanguageStore from '../../../stores/languageStore';
import { canClaimTimedTask, filterFanVisibleStoreActivities, TIMED_TASK_SECONDS } from '../../../utils/fanActivityRules';

const { Text, Title } = Typography;

const TYPE_COLORS = {
  product_launch: '#99d800',
  holiday: '#ccff00',
  channel: '#7ee000',
  community: '#9be900',
  promotion: '#f9ff46',
  store_event: '#b7ff2a',
};

const FAN_ACTIVITY_VISUAL_ASSETS = {
  hero: '/uwell-assets/fan-refresh-v2/official-g5-hero.webp',
  g5Launch: 'https://files.myuwell.com/uwell/ow-home-banner/G5-banner-3840-1620-20260421160504521.jpg',
  g5Koko: 'https://files.myuwell.com/uwell/ow-home-banner/G5%20KOKO-BANNER-3840x1620-20260108144156453.png',
  g5Lite: 'https://files.myuwell.com/uwell/ow-home-banner/G5%20Lite%20%26%20Lite%20SE-BANNER-3840x1620-20251210144711254.png',
  g5LiteKoko: 'https://files.myuwell.com/uwell/ow-home-banner/G5-Lite-KOKO-banner-3840-1620-20251210135848829.jpg',
  productLine: 'https://files.myuwell.com/uwell/ow-home-product/%E9%A6%96%E9%A1%B5%E4%BA%A7%E5%93%81-20260422165840329.png',
  productMuseum: 'https://files.myuwell.com/uwell/ow-home-product/%E5%AE%98%E7%BD%91.18-20260615150850811.png',
  liteLine: 'https://files.myuwell.com/uwell/ow-home-product/G5%20Lite%20%26%20G5%20Lite%20SE-20251210171607053.png',
  store: '/uwell-assets/g5-ugc-display.jpg',
};

const CAMPAIGN_VISUAL_BY_ID = {
  'ca-real-001': FAN_ACTIVITY_VISUAL_ASSETS.g5Launch,
  'ca-real-002': FAN_ACTIVITY_VISUAL_ASSETS.g5Koko,
  'ca-real-003': FAN_ACTIVITY_VISUAL_ASSETS.productLine,
  'ca-real-004': FAN_ACTIVITY_VISUAL_ASSETS.g5LiteKoko,
  'ca-real-005': FAN_ACTIVITY_VISUAL_ASSETS.g5Lite,
};

const TYPE_LABEL_KEYS = {
  product_launch: 'fan_real_activities_new_product',
  'New product launch': 'fan_real_activities_new_product',
  holiday: 'fan_real_activities_holiday_offer',
  'Seasonal campaign': 'fan_real_activities_holiday_offer',
  channel: 'fan_real_activities_store_experience',
  'Channel development': 'fan_real_activities_store_experience',
  community: 'fan_real_activities_community_type',
  'Community operations': 'fan_real_activities_community_type',
  promotion: 'fan_real_activities_promotion',
  'Sales promotion': 'fan_real_activities_promotion',
  store_event: 'fan_real_activities_store_activity',
  新品上市: 'fan_real_activities_new_product',
  节日营销: 'fan_real_activities_holiday_offer',
  渠道建设: 'fan_real_activities_store_experience',
  社群运营: 'fan_real_activities_community_type',
  促销活动: 'fan_real_activities_promotion',
};

const TYPE_COLOR_KEYS = {
  新品上市: 'product_launch',
  节日营销: 'holiday',
  渠道建设: 'channel',
  社群运营: 'community',
  促销活动: 'promotion',
};

const STATUS_MAP = {
  ongoing: { labelKey: 'fan_real_activities_ongoing', className: 'is-ongoing' },
  completed: { labelKey: 'fan_real_activities_completed', className: 'is-completed' },
  planned: { labelKey: 'fan_real_activities_upcoming', className: 'is-planned' },
};

const getEngagementTasks = (t) => [
  {
    key: 'read-care-guide',
    title: t('fan_real_activities_task_learn'),
    desc: t('fan_real_activities_task_learn_desc'),
    points: 5,
    icon: <BookOutlined />,
    action: t('fan_real_activities_task_open_article'),
    url: 'https://www.myuwell.com/news/all',
  },
  {
    key: 'share-social-post',
    title: t('fan_real_activities_task_instagram'),
    desc: t('fan_real_activities_task_instagram_desc'),
    points: 5,
    icon: <ShareAltOutlined />,
    action: t('fan_real_activities_task_open_instagram'),
    url: 'https://www.instagram.com/uwell.tech/',
  },
  {
    key: 'like-comment-social',
    title: t('fan_real_activities_task_social'),
    desc: t('fan_real_activities_task_social_desc'),
    points: 10,
    icon: <LikeOutlined />,
    action: t('fan_real_activities_task_open_instagram'),
    url: 'https://www.instagram.com/uwell.tech/',
  },
];

const STORE_ACTIVITY_FLOW_KEYS = [
  'fan_real_activities_flow_join',
  'fan_real_activities_flow_visit',
  'fan_real_activities_flow_verify',
  'fan_real_activities_flow_points',
];

const CAMPAIGN_COPY_KEYS = {
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

function daysLeft(endDate) {
  const diff = new Date(endDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCampaignTypeMeta(type, t) {
  const colorKey = TYPE_COLOR_KEYS[type] || type;
  return {
    label: t(TYPE_LABEL_KEYS[type] || 'fan_real_activities_campaign'),
    color: TYPE_COLORS[colorKey] || '#8a7d68',
  };
}

function getCampaignVisual(campaign) {
  if (CAMPAIGN_VISUAL_BY_ID[campaign.id]) return CAMPAIGN_VISUAL_BY_ID[campaign.id];
  const visualKey = TYPE_COLOR_KEYS[campaign.type] || campaign.type;
  if (visualKey === 'product_launch' || visualKey === 'New product launch') return FAN_ACTIVITY_VISUAL_ASSETS.productMuseum;
  if (visualKey === 'channel' || visualKey === 'Channel development' || visualKey === 'store_event') return FAN_ACTIVITY_VISUAL_ASSETS.store;
  if (visualKey === 'promotion' || visualKey === 'Sales promotion') return FAN_ACTIVITY_VISUAL_ASSETS.liteLine;
  if (visualKey === 'holiday' || visualKey === 'Seasonal campaign') return FAN_ACTIVITY_VISUAL_ASSETS.g5Koko;
  return FAN_ACTIVITY_VISUAL_ASSETS.hero;
}

function getConsumerCampaign(campaign, t, lang) {
  const localizedKeys = lang === 'ar' ? CAMPAIGN_COPY_KEYS[campaign.id] : null;
  return {
    name: localizedKeys ? t(localizedKeys.name) : (campaign.name_english || campaign.name || t('fan_real_activities_uwell_campaign')),
    description: localizedKeys ? t(localizedKeys.description) : (campaign.description_english || campaign.description || t('fan_real_activities_details_pending')),
  };
}

function formatDate(value, t) {
  if (!value) return t('fan_real_activities_not_set');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('fan_real_activities_not_set');
  return date.toLocaleDateString();
}

function formatDateRange(campaign, t) {
  return `${formatDate(campaign.start_date, t)} - ${formatDate(campaign.end_date, t)}`;
}

function getOrganizerLabel(campaign, t) {
  if (campaign.source === 'store_application') return campaign.store_name || campaign.submitted_by_store_name || t('fan_real_activities_uwell_store');
  return t('fan_real_activities_uwell_official');
}

function getLocationLabel(campaign, t) {
  if (campaign.source === 'store_application') {
    return [campaign.city, campaign.country].filter(Boolean).join(', ') || t('fan_real_activities_confirmed_store');
  }
  return campaign.location || t('fan_real_activities_official_location');
}

function getRewardLabel(campaign, t) {
  if (campaign.source === 'store_application') {
    const points = Number(campaign.fan_points || 0);
    return [
      campaign.gift || t('fan_real_activities_store_benefit'),
      points > 0 ? `+${points} ${t('fan_real_activities_possible_points')}` : t('fan_real_activities_no_extra_points'),
    ].join(' · ');
  }
  return campaign.reward || campaign.benefit || t('fan_real_activities_official_benefits');
}

const CampaignTab = ({ fan }) => {
  const { lang, t } = useLanguageStore();
  const engagementTasks = getEngagementTasks(t);
  const [campaigns, setCampaigns] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [engagementRecords, setEngagementRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(TIMED_TASK_SECONDS);

  useEffect(() => {
    const data = (localDb.all('campaigns') || []).sort((a, b) => {
      const order = { ongoing: 0, planned: 1, completed: 2 };
      return (order[a.status] || 3) - (order[b.status] || 3);
    });
    setCampaigns(data);
    const records = localDb.find('fan_engagement_tasks', (item) => item.fan_id === fan?.id) || [];
    setEngagementRecords(records);
    setCompletedTasks(records
      .filter((item) => canClaimTimedTask(records, fan?.id, item.task_key, new Date(), TIMED_TASK_SECONDS).reason === 'already_claimed_today')
      .map((item) => item.task_key));
    setLoading(false);
  }, [fan?.id]);

  useEffect(() => {
    if (!activeTask) return undefined;
    setRemainingSeconds(TIMED_TASK_SECONDS);
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeTask]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>;
  }

  const officialCampaigns = campaigns.filter((campaign) => campaign.source !== 'store_application');
  const ongoing = officialCampaigns.filter((campaign) => campaign.status === 'ongoing');
  const upcoming = officialCampaigns.filter((campaign) => campaign.status === 'planned');
  const past = officialCampaigns.filter((campaign) => campaign.status === 'completed');
  const storeActivities = filterFanVisibleStoreActivities(campaigns, fan);

  const handleCompleteEngagementTask = async (task) => {
    if (!fan?.id) {
      message.warning(t('fan_real_activities_signin_required'));
      return;
    }
    const claimState = canClaimTimedTask(engagementRecords, fan.id, task.key, new Date(), TIMED_TASK_SECONDS - remainingSeconds);
    if (!claimState.canClaim) {
      message.info(claimState.reason === 'need_more_time' ? t('fan_real_activities_need_more_time') : t('fan_real_activities_already_done_today'));
      return;
    }
    try {
      const record = localDb.insert('fan_engagement_tasks', {
        fan_id: fan.id,
        task_key: task.key,
        task_title: task.title,
        points: task.points,
        completed_at: new Date().toISOString(),
      });
      await addFanPoints(fan.id, task.points, 'earn', 'UWELL Engagement', task.title);
      setEngagementRecords((items) => [...items, record]);
      setCompletedTasks((items) => [...items, task.key]);
      setActiveTask(null);
      message.success(`${t('fan_real_activities_completed_message')} +${task.points} ${t('fan_real_activities_points')}`);
    } catch (err) {
      message.error(err?.message || t('fan_real_activities_failed_claim'));
    }
  };

  const openEngagementTaskLink = (task) => {
    if (typeof window !== 'undefined' && task.url) {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }
    setActiveTask(task);
  };

  const renderCampaignCard = (campaign, isOngoing) => {
    const days = daysLeft(campaign.end_date);
    const typeMeta = getCampaignTypeMeta(campaign.type, t);
    const campaignCopy = getConsumerCampaign(campaign, t, lang);
    const statusConfig = STATUS_MAP[campaign.status] || { labelKey: campaign.status, color: 'default' };
    const campaignVisual = getCampaignVisual(campaign);

    return (
      <Card
        key={campaign.id}
        size="small"
        className="fan-campaign-card is-brand-campaign liquid-glass"
        style={{ marginBottom: 10, borderRadius: 12, cursor: 'pointer' }}
        onClick={() => setDetailModal(campaign)}
      >
        <div className="fan-campaign-cover">
          <img src={campaignVisual} alt="UWELL campaign product visual" loading="lazy" />
          <span>{typeMeta.label}</span>
        </div>
        <div className="fan-campaign-copy">
          <div className="fan-campaign-card-head">
            <div>
              <Tag className="fan-campaign-type-tag" style={{ '--tag-accent': typeMeta.color }}>{typeMeta.label}</Tag>
              <Tag className={`fan-campaign-status-tag ${statusConfig.className || ''}`}>{t(statusConfig.labelKey, campaign.status)}</Tag>
            </div>
            {isOngoing && days <= 7 && days > 0 && (
              <span className="fan-activity-time-chip">{days <= 1 ? t('fan_real_activities_ends_tomorrow') : `${days} ${t('fan_real_activities_days_left')}`}</span>
            )}
          </div>

          <Text strong className="fan-campaign-card-title">
            <GiftOutlined />
            {campaignCopy.name}
          </Text>
          <Text type="secondary" className="fan-campaign-card-desc">
            {campaignCopy.description.substring(0, 100)}
            {campaignCopy.description.length > 100 ? '...' : ''}
          </Text>

          <div className="fan-campaign-facts">
            <span className="fan-activity-time-chip">{formatDateRange(campaign, t)}</span>
            <span>{getOrganizerLabel(campaign, t)}</span>
            <span>{getRewardLabel(campaign, t)}</span>
          </div>

          <div className="fan-campaign-card-actions">
            <Button type="link" size="small" onClick={(event) => { event.stopPropagation(); setDetailModal(campaign); }}>
              {t('fan_real_activities_view_details')}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="fan-activity-page">
      <section className="fan-activity-brand-stage fan-activity-hero" data-theme-class="fan-activity-challenge-hero" aria-label={t('fan_real_activities_title')}>
        <div className="fan-activity-brand-copy">
          <span className="fan-mini-label">{t('fan_real_activities_label')}</span>
          <Title level={4}>{t('fan_real_activities_brand_title')}</Title>
          <Text>{t('fan_real_activities_brand_desc')}</Text>
          <div className="fan-activity-stage-actions">
            <Button type="primary" className="fan-activity-action-button" onClick={() => ongoing[0] && setDetailModal(ongoing[0])}>{t('fan_real_activities_view_live')}</Button>
            <Button className="fan-activity-action-button" onClick={() => document.querySelector('.fan-activity-store-events')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{t('fan_real_activities_view_store_events')}</Button>
          </div>
        </div>
        <div className="fan-activity-brand-media is-filled">
          <img src={FAN_ACTIVITY_VISUAL_ASSETS.hero} alt="UWELL activity campaign visual" loading="eager" />
          <div className="fan-activity-brand-poster">
            <span>{t('fan_real_activities_quick_tasks')}</span>
            <strong>+5 / +10</strong>
          </div>
        </div>
      </section>

      <section className="fan-activity-feature-strip">
        <article className="fan-activity-feature-card is-live">
          <span>{ongoing.length}</span>
          <strong>{t('fan_real_activities_official_title')}</strong>
        </article>
        <article className="fan-activity-feature-card is-reward">
          <span>+5 / +10</span>
          <strong>{t('fan_real_activities_earn_points')}</strong>
        </article>
        <article className="fan-activity-feature-card is-store">
          <span>{storeActivities.length}</span>
          <strong>{t('fan_real_activities_store_title')}</strong>
        </article>
      </section>

      <section className="fan-activity-block">
        <div className="fan-activity-section-head">
          <div>
            <span>{t('fan_real_activities_earn_points')}</span>
            <strong>{t('fan_real_activities_official_actions')}</strong>
          </div>
          <small>{engagementTasks.length} {t('fan_real_activities_tasks_unit')}</small>
        </div>
        <div className="fan-activity-quick-grid">
          {engagementTasks.map((task) => {
            const done = completedTasks.includes(task.key);
            return (
              <Card key={task.key} size="small" className="fan-engagement-task-card liquid-glass">
                <div className="fan-engagement-task-icon">{task.icon}</div>
                <div className="fan-engagement-task-copy">
                  <strong>{task.title}</strong>
                  <p>{task.desc}</p>
                  <span className="fan-activity-xp-chip">+{task.points} {t('fan_real_activities_points')}</span>
                </div>
                <Button
                  className="fan-activity-action-button"
                  type={done ? 'default' : 'primary'}
                  icon={done ? <CheckCircleOutlined /> : null}
                  disabled={done}
                  onClick={() => openEngagementTaskLink(task)}
                >
                  {done ? t('fan_real_activities_completed') : task.action}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="fan-activity-block">
        <div className="fan-activity-section-head">
          <div>
            <span>{t('fan_real_activities_official')}</span>
            <strong>{t('fan_real_activities_official_title')} ({officialCampaigns.length})</strong>
          </div>
          <small>{t('fan_real_activities_campaigns')}</small>
        </div>
        <div className="fan-activity-drop-grid">
          {ongoing.length > 0 && (
            <div className="fan-activity-tab-panel">
              <Text type="secondary">{t('fan_real_activities_ongoing')}</Text>
              {ongoing.map((campaign) => renderCampaignCard(campaign, true))}
            </div>
          )}
          {upcoming.length > 0 && (
            <div className="fan-activity-tab-panel">
              <Text type="secondary">{t('fan_real_activities_upcoming')}</Text>
              {upcoming.map((campaign) => renderCampaignCard(campaign, false))}
            </div>
          )}
          {past.length > 0 && (
            <div className="fan-activity-tab-panel">
              <Text type="secondary">{t('fan_real_activities_past')}</Text>
              {past.slice(0, 5).map((campaign) => renderCampaignCard(campaign, false))}
            </div>
          )}
        </div>
        {officialCampaigns.length === 0 && <Empty description={t('fan_real_activities_no_official')} />}
      </section>

      <section className="fan-activity-block fan-activity-store-events">
        <div className="fan-activity-section-head">
          <div>
            <span>{t('fan_real_activities_stores')}</span>
            <strong>{t('fan_real_activities_store_title')} ({storeActivities.length})</strong>
          </div>
          <small>{t('fan_real_activities_store_verified')}</small>
        </div>
        <details className="fan-activity-rules-drawer">
          <summary>{t('fan_real_activities_how_it_works')}</summary>
          <div className="fan-activity-verify-strip">
            {STORE_ACTIVITY_FLOW_KEYS.map((stepKey, index) => (
              <div key={stepKey}>
                <span>{index + 1}</span>
                <strong>{t(stepKey)}</strong>
              </div>
            ))}
          </div>
        </details>
        {storeActivities.length > 0 ? storeActivities.map((activity) => (
          <Card
            key={activity.id}
            size="small"
            className="fan-store-activity-card liquid-glass"
            onClick={() => setDetailModal(activity)}
          >
            <div className="fan-store-activity-head">
              <div>
                <span className="fan-activity-store-chip">{t('fan_real_activities_store_activity')}</span>
                <span className="fan-activity-store-chip is-store">{activity.store_name || activity.submitted_by_store_name}</span>
              </div>
              <Text type="secondary">{activity.city || t('fan_real_activities_uwell_store')}</Text>
            </div>
            <div className="fan-activity-store-poster">
              <ShopOutlined />
              <span>{t('fan_real_activities_store_event')}</span>
            </div>
            <strong>{activity.name}</strong>
            <p>{activity.description}</p>
            <div className="fan-store-activity-meta">
              <span>{t('fan_real_activities_gift')}: {activity.gift || t('fan_real_activities_store_gift')}</span>
              <span className="fan-activity-store-proof">{t('fan_real_activities_store_proof')}</span>
              <span>{new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}</span>
              {activity.fan_points > 0 && <span className="fan-activity-xp-chip">+{activity.fan_points} {t('fan_real_activities_possible_points')}</span>}
            </div>
          </Card>
        )) : (
          <div className="fan-activity-empty-state">
            <ShopOutlined />
            <strong>{t('fan_real_activities_no_store_nearby')}</strong>
            <Text type="secondary">{t('fan_real_activities_no_store_desc')}</Text>
          </div>
        )}
      </section>

      {campaigns.length === 0 && <Empty description={t('fan_real_activities_no_campaigns')} />}

      <Modal
        title={activeTask?.title || t('fan_real_activities_task_modal_title')}
        open={!!activeTask}
        onCancel={() => setActiveTask(null)}
        footer={[
          <Button key="cancel" onClick={() => setActiveTask(null)}>{t('fan_real_activities_cancel')}</Button>,
          <Button
            key="claim"
            type="primary"
            disabled={remainingSeconds > 0}
            onClick={() => activeTask && handleCompleteEngagementTask(activeTask)}
          >
            {remainingSeconds > 0 ? `${t('fan_real_activities_stay_prefix')} ${remainingSeconds}s` : `${t('fan_real_activities_claim')} +${activeTask?.points || 0} ${t('fan_real_activities_points')}`}
          </Button>,
        ]}
        className="fan-campaign-detail-modal"
        width={420}
      >
        {activeTask && (
          <div className="fan-timed-task-modal">
            <Text type="secondary">{activeTask.desc}</Text>
            <Progress
              percent={Math.round(((TIMED_TASK_SECONDS - remainingSeconds) / TIMED_TASK_SECONDS) * 100)}
              status={remainingSeconds > 0 ? 'active' : 'success'}
              strokeColor="#ccff00"
            />
            <p>{t('fan_real_activities_keep_visible')}</p>
          </div>
        )}
      </Modal>

      <Modal
        title={<span><GiftOutlined /> {detailModal ? getConsumerCampaign(detailModal, t, lang).name : ''}</span>}
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={<Button onClick={() => setDetailModal(null)}>{t('fan_real_activities_close')}</Button>}
        className="fan-campaign-detail-modal"
        width={480}
      >
        {detailModal && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>{getConsumerCampaign(detailModal, t, lang).description}</Text>
            <div className="fan-campaign-detail-grid">
              <div>
                <Text type="secondary">{t('fan_real_activities_organizer')}</Text>
                <strong>{getOrganizerLabel(detailModal, t)}</strong>
              </div>
              <div>
                <Text type="secondary">{t('fan_real_activities_time')}</Text>
                <strong>{formatDateRange(detailModal, t)}</strong>
              </div>
              <div>
                <Text type="secondary">{t('fan_real_activities_location')}</Text>
                <strong>{getLocationLabel(detailModal, t)}</strong>
              </div>
              <div>
                <Text type="secondary">{t('fan_real_activities_reward_benefit')}</Text>
                <strong>{getRewardLabel(detailModal, t)}</strong>
              </div>
              <div>
                <Text type="secondary">{t('fan_real_activities_status')}</Text>
                <Tag className={`fan-campaign-status-tag ${STATUS_MAP[detailModal.status]?.className || ''}`}>{t(STATUS_MAP[detailModal.status]?.labelKey, detailModal.status)}</Tag>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CampaignTab;
