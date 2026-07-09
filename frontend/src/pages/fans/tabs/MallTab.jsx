import React, { useEffect, useState } from 'react';
import { message, Button, Card, Tag, Row, Col, Statistic, Alert, Modal, Typography } from 'antd';
import { GiftOutlined, StarOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints, createRewardRedemptionRemote } from '../../../services/api';
import { MALL_ITEMS } from '../../../utils/constants';
import { createPendingRedemption } from '../../../utils/reward-redemption';
import { rewardRules } from '../../../utils/legal-content';

const { Text, Paragraph } = Typography;

const generateRedeemCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'UW-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const getRedemptionStorageKey = (fanId) => `uwell_latest_redemption_${fanId || 'guest'}`;

const getStoredRedeemResult = (fanId) => {
  if (typeof window === 'undefined' || !fanId) return null;
  try {
    const value = window.sessionStorage.getItem(getRedemptionStorageKey(fanId));
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const storeRedeemResult = (fanId, result) => {
  if (typeof window === 'undefined' || !fanId) return;
  try {
    window.sessionStorage.setItem(getRedemptionStorageKey(fanId), JSON.stringify(result));
  } catch {
    // Session storage is a best-effort fallback for keeping the pickup code visible.
  }
};

const clearStoredRedeemResult = (fanId) => {
  if (typeof window === 'undefined' || !fanId) return;
  try {
    window.sessionStorage.removeItem(getRedemptionStorageKey(fanId));
  } catch {
    // Ignore storage cleanup errors.
  }
};

const MallTab = ({ fan, onPointsChange }) => {
  const [category, setCategory] = useState('All');
  const [redeeming, setRedeeming] = useState(null);
  const [redeemResult, setRedeemResult] = useState(() => getStoredRedeemResult(fan?.id));
  const [rulesOpen, setRulesOpen] = useState(false);

  const categories = ['All', 'Device', 'Pod', 'Merch', 'Coupon', 'VIP'];
  const filteredItems = category === 'All' ? MALL_ITEMS : MALL_ITEMS.filter((i) => i.category === category);

  const createLocalRedemption = (pendingRedemption) => ({
    ...localDb.insert('mall_redemptions', pendingRedemption),
    trial_sync_status: 'remote redemption unavailable',
  });

  const handleRedeem = async (item) => {
    if (!fan) return;
    if (fan.points < item.points_cost) {
      message.error('Not enough points!');
      return;
    }
    if ((item.stock ?? 999) <= 0) {
      message.error('This item is out of stock.');
      return;
    }
    setRedeeming(item.id);
    try {
      const redeemCode = generateRedeemCode();
      const pendingRedemption = createPendingRedemption({ fan, item, code: redeemCode });
      // status: pending_pickup
      const createdRedemption = await createRewardRedemptionRemote(pendingRedemption, () => createLocalRedemption(pendingRedemption));
      await addFanPoints(fan.id, -item.points_cost, 'redeem', 'Mall Redemption', `Redeemed: ${item.name}`);
      const result = {
        item,
        code: createdRedemption?.redeem_code || pendingRedemption.redeem_code || redeemCode,
        expiresAt: createdRedemption?.expires_at || pendingRedemption.expires_at,
      };
      storeRedeemResult(fan.id, result);
      setRedeemResult(result);
      onPointsChange?.();
      message.success(createdRedemption?.trial_sync_status ? 'Redemption saved locally. Show this pickup code at an S-level store.' : `Redeemed ${item.name}!`);
    } catch (_err) {
      message.error('Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  useEffect(() => {
    if (!redeemResult && fan?.id) {
      const storedResult = getStoredRedeemResult(fan.id);
      if (storedResult) setRedeemResult(storedResult);
    }
  }, [fan?.id, redeemResult]);

  const handleCloseRedeemResult = () => {
    clearStoredRedeemResult(fan?.id);
    setRedeemResult(null);
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card size="small" className='liquid-glass' style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16 }}>
        <Statistic title="Available Points" value={fan?.points || 0} prefix={<StarOutlined style={{ color: '#faad14' }} />} styles={{ content: { fontSize: 28, fontWeight: 700, color: '#FFD700' } }} />
      </Card>
      <Alert
        className="fan-reward-help"
        type="info"
        showIcon
        message="How rewards work"
        description={(
          <div>
            <Paragraph style={{ marginBottom: 8 }}>
              Choose a reward, redeem with points, then show the redemption code at an S-level UWELL store for pickup.
            </Paragraph>
            <Button size="small" type="link" onClick={() => setRulesOpen(true)} style={{ padding: 0 }}>
              View full redemption rules
            </Button>
          </div>
        )}
        style={{ marginBottom: 16 }}
      />

      {redeemResult && (
        <div className="fan-redemption-inline">
          <div className="fan-redemption-status">
            <GiftOutlined className="fan-redemption-icon" />
            <Paragraph className="fan-redemption-summary">
              You redeemed <Text strong>{redeemResult.item.name}</Text>
            </Paragraph>
            <Paragraph className="fan-redemption-points">
              -{redeemResult.item.points_cost} points
            </Paragraph>
          </div>
          <div className="fan-redemption-code">
            <Text className="fan-redemption-code-label">Redemption Code</Text>
            <Text copyable strong className="fan-redemption-code-value">
              {redeemResult.code}
            </Text>
          </div>
          <Paragraph className="fan-redemption-note">
            Show this code at an S-level UWELL store to collect your reward.
            {redeemResult.expiresAt ? ` Valid until ${new Date(redeemResult.expiresAt).toLocaleDateString()}.` : ''}
            {' '}The code is one-time use and must be verified in the store portal before pickup.
          </Paragraph>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map((cat) => (
          <Button
            key={cat}
            size="small"
            type={category === cat ? 'primary' : 'default'}
            onClick={() => setCategory(cat)}
            style={{ borderRadius: 20, flexShrink: 0 }}
          >
            {cat}
          </Button>
        ))}
      </div>

      <Row gutter={[12, 12]}>
        {filteredItems.map((item) => (
          <Col xs={12} sm={8} md={6} key={item.id}>
            <Card
              size="small"
              hoverable
              className='liquid-glass' style={{ borderRadius: 16, textAlign: 'center', overflow: 'hidden' }}
              cover={
                <div style={{
                  height: 100, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                }}>
                  <GiftOutlined />
                </div>
              }
            >
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, minHeight: 36 }}>{item.name}</div>
              <Tag color="orange" style={{ marginBottom: 4 }}>{item.points_cost} pts</Tag>
              {item.stock !== undefined && (
                <div style={{ fontSize: 11, color: item.stock > 0 ? '#52c41a' : '#ff4d4f', marginBottom: 4 }}>
                  {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                </div>
              )}
              <div style={{ minHeight: 30, fontSize: 11, color: 'rgba(59,45,19,0.62)', marginBottom: 8 }}>
                {(fan?.points || 0) >= item.points_cost ? 'Ready to redeem' : `${item.points_cost - (fan?.points || 0)} more points needed`}
              </div>
              <Button
                size="small"
                type="primary"
                loading={redeeming === item.id}
                disabled={(fan?.points || 0) < item.points_cost || (item.stock ?? 999) <= 0}
                onClick={() => handleRedeem(item)}
                style={{ borderRadius: 12, width: '100%' }}
              >
                Redeem
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        className="fan-redemption-modal"
        rootClassName="fan-redemption-modal-root"
        open={!!redeemResult}
        onCancel={handleCloseRedeemResult}
        footer={null}
        title={<span className="fan-redemption-title">Redemption Successful!</span>}
        centered
        width={420}
      >
        {redeemResult && (
          <div className="fan-redemption-body">
            <div className="fan-redemption-status">
              <GiftOutlined className="fan-redemption-icon" />
              <Paragraph className="fan-redemption-summary">
                You redeemed <Text strong>{redeemResult.item.name}</Text>
              </Paragraph>
              <Paragraph className="fan-redemption-points">
                -{redeemResult.item.points_cost} points
              </Paragraph>
            </div>
            <div className="fan-redemption-code">
              <Text className="fan-redemption-code-label">Redemption Code</Text>
              <Text copyable strong className="fan-redemption-code-value">
                {redeemResult.code}
              </Text>
            </div>
            <Paragraph className="fan-redemption-note">
              Show this code at an S-level UWELL store to collect your reward.
              {redeemResult.expiresAt ? ` Valid until ${new Date(redeemResult.expiresAt).toLocaleDateString()}.` : ''}
              {' '}The code is one-time use and must be verified in the store portal before pickup.
            </Paragraph>
          </div>
        )}
      </Modal>

      <Modal
        className="fan-redemption-modal"
        rootClassName="fan-redemption-modal-root"
        open={rulesOpen}
        onCancel={() => setRulesOpen(false)}
        footer={<Button type="primary" onClick={() => setRulesOpen(false)}>I understand</Button>}
        title={rewardRules.title}
        centered
        width={520}
      >
        <div className="fan-redemption-body">
          <Paragraph>{rewardRules.summary}</Paragraph>
          <ul className="fan-rule-list">
            {rewardRules.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <Paragraph className="fan-redemption-note">{rewardRules.operatorNote}</Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default MallTab;

