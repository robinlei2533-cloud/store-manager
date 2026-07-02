import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Modal, Progress, Spin, Tag, Typography } from 'antd';
import { FireOutlined, GiftOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';

const { Text, Title } = Typography;

const TYPE_COLORS = {
  product_launch: '#B98916',
  holiday: '#F5A623',
  channel: '#6c5ce7',
  community: '#00b894',
  promotion: '#fdcb6e',
};

const STATUS_MAP = {
  ongoing: { label: 'Ongoing', color: 'gold' },
  completed: { label: 'Completed', color: 'default' },
  planned: { label: 'Planned', color: 'blue' },
};

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
    const typeColor = TYPE_COLORS[campaign.type] || '#8a7d68';
    const statusConfig = STATUS_MAP[campaign.status] || { label: campaign.status, color: 'default' };
    const progress = getCampaignProgress(campaign);

    return (
      <Card
        key={campaign.id}
        size="small"
        className="liquid-glass"
        style={{ marginBottom: 10, borderRadius: 12, cursor: 'pointer' }}
        onClick={() => setDetailModal(campaign)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <div>
            <Tag color={typeColor}>{campaign.type || 'Campaign'}</Tag>
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
          </div>
          {isOngoing && days <= 7 && days > 0 && (
            <Tag color="volcano">{days <= 1 ? 'Ends tomorrow' : `${days} days left`}</Tag>
          )}
        </div>

        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
          <GiftOutlined style={{ marginRight: 6, color: '#B98916' }} />
          {campaign.name}
        </Text>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
          {campaign.description?.substring(0, 100)}
          {campaign.description?.length > 100 ? '...' : ''}
        </Text>

        {isOngoing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Progress percent={progress} size="small" showInfo={false} style={{ flex: 1, margin: 0 }} />
            <Text type="secondary" style={{ fontSize: 10, whiteSpace: 'nowrap' }}>{progress}%</Text>
          </div>
        )}

        <div style={{ marginTop: 8, textAlign: 'right' }}>
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
        <Text type="secondary" style={{ fontSize: 12 }}>Join campaigns and earn extra rewards.</Text>
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
        title={<span><GiftOutlined /> {detailModal?.name}</span>}
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={<Button onClick={() => setDetailModal(null)}>Close</Button>}
        width={480}
      >
        {detailModal && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>{detailModal.description}</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
              <div><Text type="secondary">Start:</Text> {new Date(detailModal.start_date).toLocaleDateString()}</div>
              <div><Text type="secondary">End:</Text> {new Date(detailModal.end_date).toLocaleDateString()}</div>
              <div><Text type="secondary">Budget:</Text> SAR {detailModal.budget?.toLocaleString?.() || 0}</div>
              <div><Text type="secondary">Status:</Text> <Tag color={STATUS_MAP[detailModal.status]?.color}>{STATUS_MAP[detailModal.status]?.label || detailModal.status}</Tag></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CampaignTab;
