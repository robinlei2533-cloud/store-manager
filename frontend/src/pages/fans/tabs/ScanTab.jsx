import React, { useState, useEffect } from 'react';
import { message, Button, Card, Statistic, Tag, Space, Typography, Row, Col } from 'antd';
import { QrcodeOutlined, CheckCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import localDb from '../../../services/db/localDb';
import { addFanPoints, getScanRecords } from '../../../services/api';
const { Text } = Typography;
const ScanTab = ({ fan, onPointsChange }) => {
  const { data: qrCodes = [], isLoading } = useQuery({ queryKey: ['fan-qr-codes'], queryFn: () => getQrCodes({}) });
  const { data: scanRecords = [] } = useQuery({ queryKey: ['fan-scans'], queryFn: () => getScanRecords({}) });
  const [scanning, setScanning] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const myScans = scanRecords.filter((s) => s.fan_id === fan?.id);
  const todayScans = myScans.filter((s) => s.created_at?.startsWith(todayStr)).length;
  const scanLimit = 3;
  const scansRemaining = scanLimit - todayScans;

  const activeQr = qrCodes.find((q) => q.is_active);

  const handleScan = async () => {
    if (!activeQr || scansRemaining <= 0) return;
    setScanning(true);
    try {
      await scanQrCode(activeQr.id);
      message.success(`Scan successful! +${activeQr.points} points 🎉`);
      onPointsChange();
    } catch (err) {
      message.error(err.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #722ed110 0%, #FFD70010 100%)' }}>
        <QrcodeOutlined style={{ fontSize: 64, color: '#722ed1', marginBottom: 16 }} />
        <Title level={4}>Scan to Earn Points!</Title>
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Buy any UWELL product, find the QR code inside the package, and scan it here to earn points!
        </Paragraph>
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Today's Scans" value={`${todayScans}/${scanLimit}`} valueStyle={{ color: scansRemaining > 0 ? '#52c41a' : '#ff4d4f' }} />
          </Col>
          <Col span={12}>
            <Statistic title="Total Scans" value={myScans.length} />
          </Col>
        </Row>
      </Card>

      <Button
        type="primary"
        size="large"
        block
        loading={scanning}
        disabled={!activeQr || scansRemaining <= 0}
        onClick={handleScan}
        style={{ height: 56, fontSize: 18, fontWeight: 700, borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #722ed1 0%, #FFD700 100%)', border: 'none' }}
      >
        {scansRemaining > 0 ? '📱 Scan Now' : 'Limit Reached (3/day)'}
      </Button>

      <Card title="Recent Scans" size="small" style={{ borderRadius: 12 }}>
        {myScans.length === 0 ? (
          <Empty description="No scans yet. Buy a UWELL product and scan the QR code!" />
        ) : (
          <List
            size="small"
            dataSource={myScans.slice(0, 5)}
            renderItem={(s) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<QrcodeOutlined style={{ fontSize: 20, color: '#722ed1' }} />}
                  title={`${s.products?.name || 'Product'} · +${s.points_earned} pts`}
                  description={new Date(s.created_at).toLocaleString('en-US')}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default ScanTab;

