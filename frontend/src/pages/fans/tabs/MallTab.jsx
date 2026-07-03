import React, { useState } from 'react';
import { message, Button, Card, Tag, Row, Col, Statistic, Alert, Modal, Typography } from 'antd';
import { GiftOutlined, StarOutlined, CopyOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';
import { MALL_ITEMS } from '../../../utils/constants';

const { Text, Paragraph } = Typography;

const generateRedeemCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'UW-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const MallTab = ({ fan, onPointsChange }) => {
  const [category, setCategory] = useState('All');
  const [redeeming, setRedeeming] = useState(null);
  const [redeemResult, setRedeemResult] = useState(null);

  const categories = ['All', 'Device', 'Pod', 'Merch', 'Coupon', 'VIP'];
  const filteredItems = category === 'All' ? MALL_ITEMS : MALL_ITEMS.filter((i) => i.category === category);

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
      localDb.insert('mall_redemptions', {
        fan_id: fan.id,
        item_id: item.id,
        item_name: item.name,
        points_cost: item.points_cost,
        redeem_code: redeemCode,
      });
      await addFanPoints(fan.id, -item.points_cost, 'redeem', 'Mall Redemption', `Redeemed: ${item.name}`);
      onPointsChange?.();
      setRedeemResult({ item, code: redeemCode });
      message.success(`Redeemed ${item.name}!`);
    } catch (_err) {
      message.error('Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card size="small" className='liquid-glass' style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16 }}>
        <Statistic title="Available Points" value={fan?.points || 0} prefix={<StarOutlined style={{ color: '#faad14' }} />} valueStyle={{ fontSize: 28, fontWeight: 700, color: '#FFD700' }} />
      </Card>
      <Alert
        className="fan-reward-help"
        type="info"
        showIcon
        message="How rewards work"
        description="Choose a reward, redeem with points, then show the redemption record to a verified UWELL store or support staff."
        style={{ marginBottom: 16 }}
      />

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
              <div style={{ minHeight: 30, fontSize: 11, color: 'rgba(255,255,255,0.62)', marginBottom: 8 }}>
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
        open={!!redeemResult}
        onCancel={() => setRedeemResult(null)}
        footer={null}
        title={<span style={{ color: '#FFD700' }}>🎉 Redemption Successful!</span>}
        centered
        width={360}
      >
        {redeemResult && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <GiftOutlined style={{ fontSize: 48, color: '#FFD700', marginBottom: 16 }} />
            <Paragraph style={{ color: '#e5e5e5', marginBottom: 4 }}>
              You redeemed <Text strong style={{ color: '#FFD700' }}>{redeemResult.item.name}</Text>
            </Paragraph>
            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
              -{redeemResult.item.points_cost} points
            </Paragraph>
            <div style={{
              background: '#0d0d14', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8,
              padding: '12px 16px', marginBottom: 12,
            }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Redemption Code</Text>
              <Text copyable strong style={{ fontSize: 18, color: '#FFD700', fontFamily: 'monospace', letterSpacing: 2 }}>
                {redeemResult.code}
              </Text>
            </div>
            <Paragraph type="secondary" style={{ fontSize: 11 }}>
              Show this code at any verified UWELL store to collect your reward.
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MallTab;

