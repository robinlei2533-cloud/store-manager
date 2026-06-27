import React, { useState } from 'react';
import { message, Button, Card, Statistic, Tag, Space, Row, Col, Typography, Input, Divider, List, Empty } from 'antd';
import { TeamOutlined, CopyOutlined, GiftOutlined, UserOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';
const { Text } = Typography;
const InviteTab = ({ fan }) => {
  const [inviteCount, setInviteCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!fan) return;
    const records = localDb.find('mall_redemptions', (r) => r.fan_id === fan.id && r.source === 'invite');
    setInviteCount(records.length);
  }, [fan]);

  const referralCode = fan ? `UWELL-${fan.id?.slice(-8).toUpperCase()}` : 'UWELL-FAN';
  const referralLink = `${window.location.origin}/#/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      message.success('Link copied! Share with your friends 📤');
    }).catch(() => {
      message.info(`Share this code: ${referralCode}`);
    });
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
        <TeamOutlined style={{ fontSize: 56, color: '#667eea', marginBottom: 16 }} />
        <Title level={4}>Invite Friends, Earn 30 Points!</Title>
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Share your unique referral link. When your friends register, you get <strong style={{ color: '#52c41a' }}>30 points</strong> per friend!
        </Paragraph>
      </Card>

      <Card title="Your Referral Code" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{
          textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 12, marginBottom: 12,
          fontFamily: 'monospace', fontSize: 20, fontWeight: 700, letterSpacing: 2, color: '#667eea',
        }}>
          {referralCode}
        </div>
        <Button type="primary" block size="large" icon={<CopyOutlined />} onClick={handleCopy} style={{ borderRadius: 12, height: 48 }}>
          Copy Referral Link
        </Button>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Friends Invited" value={inviteCount} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Points Earned" value={inviteCount * 30} prefix={<StarOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Card size="small" style={{ marginTop: 16, borderRadius: 12, background: '#fffbe6' }}>
        <Text style={{ fontSize: 12, color: '#666' }}>
          💡 <strong>How it works:</strong> Your friend clicks the link, registers as a UWELL fan, and you both earn points. The more friends you invite, the more rewards you unlock!
        </Text>
      </Card>
    </div>
  );
};

export default InviteTab;

