import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Modal, Progress, Spin, Tag, Typography, message } from 'antd';
import { FireOutlined, GiftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';

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
  { title: 'Join the activity', desc: 'Open the campaign details and confirm the reward rules.' },
  { title: 'Scan your product code', desc: 'Scan after purchase so your campaign points can be recorded.' },
  { title: 'Claim rewards', desc: 'Use your points in the rewards shop or keep collecting for higher tiers.' },
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

const CampaignTab = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    const data = (localDb.all('campaigns') || []).sort((a, b) => {
      const order = { ongoing: 0, planned: 1, completed: 2 };
      return (order[a.status] || 3) - (order[b.status] || 3);
    });
    setCampaigns(data);
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>;
  }

  const ongoing = campaigns.filter((campaign) => campaign.status === 'ongoing');
  const upcoming = campaigns.filter((campaign) => campaign.status === 'planned');
  const past = campaigns.filter((campaign) => campaign.status === 'completed');

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
                try {
                  const existing = localDb.all('campaign_claims') || [];
                  const already = existing.find(c => c.campaign_id === campaign.id && c.store_id);
                  if (already) { message.info('Already joined this campaign.'); return; }
                  localDb.insert('campaign_claims', {
                    campaign_id: campaign.id,
                    campaign_name: campaign.name_english || campaign.name,
                    store_id: null,
                    status: 'pending',
                    claimed_at: new Date().toISOString(),
                  });
                  message.success('Joined campaign! Scan eligible products to collect rewards.');
                } catch { message.error('Failed to join.'); }
              }}
              style={{ borderRadius: 12 }}
            >
              Join
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
        <Title level={4} style={{ margin: 0 }}><FireOutlined /> UWELL Brand Activities</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>Join campaigns, scan eligible products, and earn extra rewards.</Text>
        <div className="fan-campaign-mini-steps">
          {FAN_CAMPAIGN_STEPS.map((step, index) => (
            <div key={step.title}>
              <span>Step {index + 1}</span>
              <strong>{step.title}</strong>
            </div>
          ))}
        </div>
      </Card>

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
