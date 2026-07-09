import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Modal, Progress, Spin, Tag, Typography, message } from 'antd';
import { BookOutlined, CheckCircleOutlined, FireOutlined, GiftOutlined, LikeOutlined, ShareAltOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';
import { buildRewardTierRules, canClaimTimedTask, filterFanVisibleStoreActivities, TIMED_TASK_SECONDS } from '../../../utils/fanActivityRules';

const { Text, Title } = Typography;

const TYPE_COLORS = {
  product_launch: '#B98916',
  holiday: '#F5A623',
  channel: '#6c5ce7',
  community: '#00b894',
  promotion: '#fdcb6e',
  store_event: '#2f80ed',
};

const TYPE_LABELS = {
  product_launch: 'New product',
  holiday: 'Holiday offer',
  channel: 'Store experience',
  community: 'Community',
  promotion: 'Promotion',
  store_event: 'Store activity',
  新品上市: 'New product',
  节日营销: 'Holiday offer',
  渠道建设: 'Store experience',
  社群运营: 'Community',
  促销活动: 'Promotion',
};

const TYPE_COLOR_KEYS = {
  新品上市: 'product_launch',
  节日营销: 'holiday',
  渠道建设: 'channel',
  社群运营: 'community',
  促销活动: 'promotion',
};

const STATUS_MAP = {
  ongoing: { label: 'Ongoing', className: 'is-ongoing' },
  completed: { label: 'Completed', className: 'is-completed' },
  planned: { label: 'Planned', className: 'is-planned' },
};

const ENGAGEMENT_TASKS = [
  {
    key: 'read-care-guide',
    title: 'Read UWELL care guide',
    desc: 'Read a short guide about pod care, battery safety, and product authenticity.',
    points: 5,
    icon: <BookOutlined />,
    action: 'Open article',
    url: 'https://www.myuwell.com/news/all',
  },
  {
    key: 'share-social-post',
    title: 'View UWELL Instagram',
    desc: 'Open the official UWELL Instagram account and stay for 10 seconds.',
    points: 5,
    icon: <ShareAltOutlined />,
    action: 'Open Instagram',
    url: 'https://www.instagram.com/uwell.tech/',
  },
  {
    key: 'like-comment-social',
    title: 'Like, comment, or share UWELL post',
    desc: 'Open the official account, interact with a recent post, then return to claim.',
    points: 10,
    icon: <LikeOutlined />,
    action: 'Open Instagram',
    url: 'https://www.instagram.com/uwell.tech/',
  },
];

function daysLeft(endDate) {
  const diff = new Date(endDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCampaignTypeMeta(type) {
  const colorKey = TYPE_COLOR_KEYS[type] || type;
  return {
    label: TYPE_LABELS[type] || 'Campaign',
    color: TYPE_COLORS[colorKey] || '#8a7d68',
  };
}

function getConsumerCampaign(campaign) {
  return {
    name: campaign.name_english || campaign.name || 'UWELL campaign',
    description: campaign.description_english || campaign.description || 'Activity details will be updated by UWELL.',
  };
}

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString();
}

function formatDateRange(campaign) {
  return `${formatDate(campaign.start_date)} - ${formatDate(campaign.end_date)}`;
}

function getOrganizerLabel(campaign) {
  if (campaign.source === 'store_application') return campaign.store_name || campaign.submitted_by_store_name || 'UWELL store';
  return 'UWELL official';
}

function getLocationLabel(campaign) {
  if (campaign.source === 'store_application') {
    return [campaign.city, campaign.country].filter(Boolean).join(', ') || 'Confirmed by store';
  }
  return campaign.location || 'Official online / selected stores';
}

function getRewardLabel(campaign) {
  if (campaign.source === 'store_application') {
    const points = Number(campaign.fan_points || 0);
    return [campaign.gift || 'Store activity benefit', points > 0 ? `+${points} possible points` : 'No extra points required'].join(' · ');
  }
  return campaign.reward || campaign.benefit || 'Official activity benefits';
}

const CampaignTab = ({ fan }) => {
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
  const rewardTiers = buildRewardTierRules();

  const handleCompleteEngagementTask = async (task) => {
    if (!fan?.id) {
      message.warning('Please sign in before claiming activity points.');
      return;
    }
    const claimState = canClaimTimedTask(engagementRecords, fan.id, task.key, new Date(), TIMED_TASK_SECONDS - remainingSeconds);
    if (!claimState.canClaim) {
      message.info(claimState.reason === 'need_more_time' ? 'Please stay for 10 seconds before claiming points.' : 'This task has already been completed today.');
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
      message.success(`Activity completed. +${task.points} points`);
    } catch (err) {
      message.error(err?.message || 'Failed to claim activity points.');
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
    const typeMeta = getCampaignTypeMeta(campaign.type);
    const campaignCopy = getConsumerCampaign(campaign);
    const statusConfig = STATUS_MAP[campaign.status] || { label: campaign.status, color: 'default' };

    return (
      <Card
        key={campaign.id}
        size="small"
        className="fan-campaign-card liquid-glass"
        style={{ marginBottom: 10, borderRadius: 12, cursor: 'pointer' }}
        onClick={() => setDetailModal(campaign)}
      >
        <div className="fan-campaign-card-head">
          <div>
            <Tag className="fan-campaign-type-tag" style={{ '--tag-accent': typeMeta.color }}>{typeMeta.label}</Tag>
            <Tag className={`fan-campaign-status-tag ${statusConfig.className || ''}`}>{statusConfig.label}</Tag>
          </div>
          {isOngoing && days <= 7 && days > 0 && (
            <Tag color="volcano">{days <= 1 ? 'Ends tomorrow' : `${days} days left`}</Tag>
          )}
        </div>

        <Text strong className="fan-campaign-card-title">
          <GiftOutlined style={{ marginRight: 6, color: '#B98916' }} />
          {campaignCopy.name}
        </Text>
        <Text type="secondary" className="fan-campaign-card-desc">
          {campaignCopy.description.substring(0, 100)}
          {campaignCopy.description.length > 100 ? '...' : ''}
        </Text>

        <div className="fan-campaign-facts">
          <span>{formatDateRange(campaign)}</span>
          <span>{getOrganizerLabel(campaign)}</span>
          <span>{getRewardLabel(campaign)}</span>
        </div>

        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button type="link" size="small" onClick={(event) => { event.stopPropagation(); setDetailModal(campaign); }}>
            View details
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: '4px 0' }}>
      <Card className="liquid-glass" style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}><FireOutlined /> UWELL Knowledge Hub</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>Read UWELL articles, share official social posts, and earn member points.</Text>
      </Card>

      <section style={{ marginBottom: 20 }}>
        <Text strong style={{ display: 'block', marginBottom: 10 }}>Knowledge and social tasks</Text>
        <div className="fan-engagement-task-list">
          {ENGAGEMENT_TASKS.map((task) => {
            const done = completedTasks.includes(task.key);
            return (
              <Card key={task.key} size="small" className="fan-engagement-task-card liquid-glass">
                <div className="fan-engagement-task-icon">{task.icon}</div>
                <div className="fan-engagement-task-copy">
                  <strong>{task.title}</strong>
                  <p>{task.desc}</p>
                  <Tag color="gold">+{task.points} points</Tag>
                </div>
                <Button
                  type={done ? 'default' : 'primary'}
                  icon={done ? <CheckCircleOutlined /> : null}
                  disabled={done}
                  onClick={() => openEngagementTaskLink(task)}
                >
                  {done ? 'Completed' : task.action}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <Text strong style={{ display: 'block', marginBottom: 10 }}>Nearby store activities ({storeActivities.length})</Text>
        {storeActivities.length > 0 ? storeActivities.map((activity) => (
          <Card
            key={activity.id}
            size="small"
            className="fan-store-activity-card liquid-glass"
            onClick={() => setDetailModal(activity)}
          >
            <div className="fan-store-activity-head">
              <div>
                <Tag color="blue">Store activity</Tag>
                <Tag color="gold">{activity.store_name || activity.submitted_by_store_name}</Tag>
              </div>
              <Text type="secondary">{activity.city || 'UWELL store'}</Text>
            </div>
            <strong>{activity.name}</strong>
            <p>{activity.description}</p>
            <div className="fan-store-activity-meta">
              <span>Gift: {activity.gift || 'Store gift'}</span>
              <span>{new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}</span>
              {activity.fan_points > 0 && <Tag color="green">+{activity.fan_points} possible points</Tag>}
            </div>
          </Card>
        )) : (
          <Card size="small" className="liquid-glass fan-empty-card">
            <Text type="secondary">No approved nearby store activities yet.</Text>
          </Card>
        )}
      </section>

      <section style={{ marginBottom: 20 }}>
        <Text strong style={{ display: 'block', marginBottom: 10 }}>Reward exchange rules</Text>
        <div className="fan-reward-tier-grid">
          {rewardTiers.map((tier) => (
            <Card key={tier.key} size="small" className="fan-reward-tier-card liquid-glass">
              <strong>{tier.label}</strong>
              <p>{tier.minPoints}-{tier.maxPoints} points</p>
              <Text type="secondary">{tier.examples.join(' / ')}</Text>
              <Tag color="gold">Pickup at S-level store</Tag>
              {tier.monthlyLimit && <Tag color="volcano">{tier.monthlyLimit} per fan per month</Tag>}
            </Card>
          ))}
        </div>
      </section>

      {ongoing.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <Text strong style={{ display: 'block', marginBottom: 10 }}>Ongoing campaigns ({ongoing.length})</Text>
          {ongoing.map((campaign) => renderCampaignCard(campaign, true))}
        </section>
      )}

      {upcoming.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Upcoming campaigns ({upcoming.length})</Text>
          {upcoming.map((campaign) => renderCampaignCard(campaign, false))}
        </section>
      )}

      {past.length > 0 && (
        <section>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Past campaigns ({past.length})</Text>
          {past.slice(0, 5).map((campaign) => renderCampaignCard(campaign, false))}
        </section>
      )}

      {campaigns.length === 0 && <Empty description="No campaigns" />}

      <Modal
        title={activeTask?.title || 'UWELL task'}
        open={!!activeTask}
        onCancel={() => setActiveTask(null)}
        footer={[
          <Button key="cancel" onClick={() => setActiveTask(null)}>Cancel</Button>,
          <Button
            key="claim"
            type="primary"
            disabled={remainingSeconds > 0}
            onClick={() => activeTask && handleCompleteEngagementTask(activeTask)}
          >
            {remainingSeconds > 0 ? `Stay ${remainingSeconds}s` : `Claim +${activeTask?.points || 0} points`}
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
              strokeColor="#B98916"
            />
            <p>Keep this page visible for 10 seconds. The countdown pauses when the page is hidden.</p>
          </div>
        )}
      </Modal>

      <Modal
        title={<span><GiftOutlined /> {detailModal ? getConsumerCampaign(detailModal).name : ''}</span>}
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={<Button onClick={() => setDetailModal(null)}>Close</Button>}
        className="fan-campaign-detail-modal"
        width={480}
      >
        {detailModal && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>{getConsumerCampaign(detailModal).description}</Text>
            <div className="fan-campaign-detail-grid">
              <div>
                <Text type="secondary">Organizer</Text>
                <strong>{getOrganizerLabel(detailModal)}</strong>
              </div>
              <div>
                <Text type="secondary">Time</Text>
                <strong>{formatDateRange(detailModal)}</strong>
              </div>
              <div>
                <Text type="secondary">Location</Text>
                <strong>{getLocationLabel(detailModal)}</strong>
              </div>
              <div>
                <Text type="secondary">Reward / benefit</Text>
                <strong>{getRewardLabel(detailModal)}</strong>
              </div>
              <div>
                <Text type="secondary">Status</Text>
                <Tag className={`fan-campaign-status-tag ${STATUS_MAP[detailModal.status]?.className || ''}`}>{STATUS_MAP[detailModal.status]?.label || detailModal.status}</Tag>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CampaignTab;
