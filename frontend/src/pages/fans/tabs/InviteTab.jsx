import React, { useState, useEffect } from 'react';
import { message, Button, Card, Statistic, Row, Col, Typography } from 'antd';
import { TeamOutlined, CopyOutlined, UserOutlined, StarOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { getFanPointsLog } from '../../../services/api';
import { buildReferralCode } from '../../../utils/trialOps';
const { Text, Title, Paragraph } = Typography;
const InviteTab = ({ fan }) => {
  const [inviteCount, setInviteCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    if (!fan) return;
    let disposed = false;
    async function loadReferralStats() {
      const localRecords = localDb.find('mall_redemptions', (r) => r.fan_id === fan.id && r.source === 'invite');
      let referralLogs = [];
      try {
        referralLogs = await getFanPointsLog(fan.id);
      } catch {
        referralLogs = localDb.find('fan_points_log', (r) => r.fan_id === fan.id);
      }
      if (disposed) return;
      const inviterLogs = (referralLogs || []).filter((log) => (
        log.source === 'Referral'
        && Number(log.points) > 0
        && String(log.description || '').startsWith('Friend registered')
      ));
      setInviteCount(Math.max(localRecords.length, inviterLogs.length));
      setPointsEarned(inviterLogs.reduce((sum, log) => sum + Number(log.points || 0), 0) || localRecords.length * 30);
    }
    loadReferralStats();
    return () => { disposed = true; };
  }, [fan]);

  const referralCode = fan ? buildReferralCode(fan.id) : 'UWELL-FAN';
  const referralLink = `${window.location.origin}/fan-app.html#/fan-entry?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      message.success('Link copied! Share with your friends.');
    }).catch(() => {
      message.info(`Share this code: ${referralCode}`);
    });
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card className='liquid-glass' style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16 }}>
        <TeamOutlined style={{ fontSize: 56, color: '#667eea', marginBottom: 16 }} />
        <Title level={4}>Invite Friends, Earn 30 Points!</Title>
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Share your unique referral link. When your friends register, you get <strong style={{ color: '#52c41a' }}>30 points</strong> per friend!
        </Paragraph>
      </Card>

      <Card title="Your Referral Code" size="small" className='liquid-glass' style={{ borderRadius: 12, marginBottom: 16 }}>
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
          <Card size="small" className='liquid-glass' style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Friends Invited" value={inviteCount} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Points Earned" value={pointsEarned} prefix={<StarOutlined style={{ color: '#faad14' }} />} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
      </Row>

      <Card size="small" className='liquid-glass' style={{ marginTop: 16, borderRadius: 12 }}>
        <Text style={{ fontSize: 12, color: '#666' }}>
          <strong>How it works:</strong> Your friend clicks the link, registers as a UWELL fan, and you both earn points. The more friends you invite, the more rewards you unlock!
        </Text>
      </Card>
    </div>
  );
};

export default InviteTab;

