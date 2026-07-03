import React, { useState } from 'react';
import { message, Button, Card, Tag, Row, Col, Statistic, Alert } from 'antd';
import { GiftOutlined, StarOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';
import { MALL_ITEMS } from '../../../utils/constants';
const MallTab = ({ fan, onPointsChange }) => {
  const [category, setCategory] = useState('All');
  const [redeeming, setRedeeming] = useState(null);

  const categories = ['All', 'Device', 'Pod', 'Merch', 'Coupon', 'VIP'];
  const filteredItems = category === 'All' ? MALL_ITEMS : MALL_ITEMS.filter((i) => i.category === category);

  const handleRedeem = async (item) => {
    if (!fan) return;
    if (fan.points < item.points_cost) {
      message.error('Not enough points!');
      return;
    }
    setRedeeming(item.id);
    try {
      localDb.insert('mall_redemptions', {
        fan_id: fan.id,
        item_id: item.id,
        item_name: item.name,
        points_cost: item.points_cost,
      });
      await addFanPoints(fan.id, -item.points_cost, 'redeem', 'Mall Redemption', `Redeemed: ${item.name}`);
      onPointsChange && onPointsChange();
      message.success(`Redeemed ${item.name}! -${item.points_cost} points`);
      onPointsChange();
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
              <Tag color="orange" style={{ marginBottom: 8 }}>{item.points_cost} pts</Tag>
              <div style={{ minHeight: 30, fontSize: 11, color: 'rgba(255,255,255,0.62)', marginBottom: 8 }}>
                {(fan?.points || 0) >= item.points_cost ? 'Ready to redeem' : `${item.points_cost - (fan?.points || 0)} more points needed`}
              </div>
              <br />
              <Button
                size="small"
                type="primary"
                loading={redeeming === item.id}
                disabled={(fan?.points || 0) < item.points_cost}
                onClick={() => handleRedeem(item)}
                style={{ borderRadius: 12, width: '100%' }}
              >
                Redeem
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MallTab;

