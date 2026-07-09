import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Modal, Progress, Spin, Tag, Typography, message } from 'antd';
import { BookOutlined, CheckCircleOutlined, FireOutlined, GiftOutlined, LikeOutlined, ShareAltOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';

const { Text, Title } = Typography;

const TYPE_COLORS = {
  product_launch: '#B98916',
  holiday: '#F5A623',
  channel: '#6c5ce7',
  community: '#00b894',
  promotion: '#fdcb6e',
};

const TYPE_LABELS = {
  product_launch: 'New product',
  holiday: 'Holiday offer',
  channel: 'Store experience',
  community: 'Community',
  promotion: 'Promotion',
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

const FAN_CAMPAIGN_STEPS = [
  { title: 'Read UWELL knowledge', desc: 'Learn product care and safe usage tips.' },
  { title: 'Share UWELL social content', desc: 'Forward approved UWELL posts to your social feed.' },
  { title: 'Like or comment', desc: 'Interact with UWELL posts and claim member points.' },
];

const ENGAGEMENT_TASKS = [
  {
    key: 'read-care-guide',
    title: 'Read UWELL care guide',
    desc: 'Read a short guide about pod care, battery safety, and product authenticity.',
    points: 10,
    icon: <BookOutlined />,
    action: 'Open article',
    url: 'https://www.myuwell.com/news/all',
  },
  {
    key: 'share-social-post',
    title: 'Share UWELL social post',
    desc: 'Share an approved UWELL product or campaign post on your social media.',
    points: 15,
    icon: <ShareAltOutlined />,
    action: 'Open Instagram',
    url: 'https://www.instagram.com/uwell.tech/',
  },
  {
    key: 'like-comment-social',
    title: 'Like or comment on UWELL social media',
    desc: 'Like, comment, or save the latest UWELL official content.',
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

function getCampaignProgress(campaign) {
  const total = new Date(campaign.end_date) - new Date(campaign.start_date);
  if (!Number.isFinite(total) || total <= 0) return 0;
  const elapsed = Date.now() - new Date(campaign.start_date);
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
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
    description: campaign.description_english || campaign.description || 'Complete the activity steps and collect member rewards.',
  };
}

const CampaignTab = ({ fan }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    const data = (localDb.all('campaigns') || []).sort((a, b) => {
      const order = { ongoing: 0, planned: 1, completed: 2 };
      return (order[a.status] || 3) - (order[b.status] || 3);
    });
    setCampaigns(data);
    const records = localDb.find('fan_engagement_tasks', (item) => item.fan_id === fan?.id) || [];
    setCompletedTasks(records.map((item) => item.task_key));
    setLoading(false);
  }, [fan?.id]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>;
  }

  const ongoing = campaigns.filter((campaign) => campaign.status === 'ongoing');
  const upcoming = campaigns.filter((campaign) => campaign.status === 'planned');
  const past = campaigns.filter((campaign) => campaign.status === 'completed');

  const handleCompleteEngagementTask = async (task) => {
    if (!fan?.id) {
      message.warning('Please sign in before claiming activity points.');
      return;
    }
    if (completedTasks.includes(task.key)) {
      message.info('This task has already been completed.');
      return;
    }
    try {
      localDb.insert('fan_engagement_tasks', {
        fan_id: fan.id,
        task_key: task.key,
        task_title: task.title,
        points: task.points,
        completed_at: new Date().toISOString(),
      });
      await addFanPoints(fan.id, task.points, 'earn', 'UWELL Engagement', task.title);
      setCompletedTasks((items) => [...items, task.key]);
      message.success(`Activity completed. +${task.points} points`);
    } catch (err) {
      message.error(err?.message || 'Failed to claim activity points.');
    }
  };

  const openEngagementTaskLink = (task) => {
    if (typeof window !== 'undefined' && task.url) {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }
    handleCompleteEngagementTask(task);
  };

  const renderCampaignCard = (campaign, isOngoing) => {
    const days = daysLeft(campaign.end_date);
    const typeMeta = getCampaignTypeMeta(campaign.type);
    const campaignCopy = getConsumerCampaign(campaign);
    const statusConfig = STATUS_MAP[campaign.status] || { label: campaign.status, color: 'default' };
    const progress = getCampaignProgress(campaign);

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

        {isOngoing && (
          <div className="fan-campaign-progress">
            <Progress percent={progress} size="small" showInfo={false} style={{ flex: 1, margin: 0 }} />
            <Text type="secondary" className="fan-campaign-progress-value">{progress}%</Text>
          </div>
        )}

        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {isOngoing && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={(event) => {
                event.stopPropagation();
                setDetailModal(campaign);
              }}
              style={{ borderRadius: 12 }}
            >
              View guide
            </Button>
          )}
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
        <div className="fan-campaign-mini-steps">
          {FAN_CAMPAIGN_STEPS.map((step, index) => (
            <div key={step.title}>
              <span>Step {index + 1}</span>
              <strong>{step.title}</strong>
            </div>
          ))}
        </div>
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
            <div className="fan-campaign-guide">
              {FAN_CAMPAIGN_STEPS.map((step, index) => (
                <div key={step.title} className="fan-campaign-guide-step">
                  <span>Step {index + 1}</span>
                  <strong>{step.title}</strong>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
              <div><Text type="secondary">Start:</Text> {new Date(detailModal.start_date).toLocaleDateString()}</div>
              <div><Text type="secondary">End:</Text> {new Date(detailModal.end_date).toLocaleDateString()}</div>
              <div><Text type="secondary">Reward:</Text> Extra member points</div>
              <div><Text type="secondary">Status:</Text> <Tag className={`fan-campaign-status-tag ${STATUS_MAP[detailModal.status]?.className || ''}`}>{STATUS_MAP[detailModal.status]?.label || detailModal.status}</Tag></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CampaignTab;
