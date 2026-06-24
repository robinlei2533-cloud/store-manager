import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tabs, Table, Tag, Button, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getFanById, getFanPointsLog, getLevelRules } from '../../services/api';
import { FAN_LEVELS } from '../../utils/constants';

const FanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: fan, isLoading } = useQuery({ queryKey: ['fan', id], queryFn: () => getFanById(id), enabled: !!id });
  const { data: logs = [] } = useQuery({ queryKey: ['fan-logs', id], queryFn: () => getFanPointsLog(id), enabled: !!id });
  const { data: levelRules = [] } = useQuery({ queryKey: ['level-rules'], queryFn: getLevelRules });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  const levelMap = Object.fromEntries(FAN_LEVELS.map(f => [f.value, f]));
  const currentLevel = levelRules.find(r => r.level === fan?.level);
  const nextLevel = levelRules.find(r => r.min_points > (fan?.points || 0));

  const logColumns = [
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: (v) => new Date(v).toLocaleString('en-US') },
    { title: 'Points', dataIndex: 'points', key: 'points', render: (v, r) => <span style={{ color: r.type === 'earn' ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>{r.type === 'earn' ? '+' : ''}{v}</span> },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t) => <Tag color={t === 'earn' ? 'green' : 'red'}>{t === 'earn' ? 'Earned' : 'Redeemed'}</Tag> },
    { title: 'Source', dataIndex: 'source', key: 'source' },
    { title: 'Description', dataIndex: 'description', key: 'desc', ellipsis: true },
  ];

  return (
    <div>
      <Button type="link" onClick={() => navigate('/app/fans/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back to Fans</Button>
      <Card title="Fan Detail">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Name">{fan?.profiles?.name || `Fan #${fan?.id?.slice(0, 6)}`}</Descriptions.Item>
          <Descriptions.Item label="Store">{fan?.stores?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Level"><Tag color={levelMap[fan?.level]?.color}>{levelMap[fan?.level]?.label || fan?.level}</Tag></Descriptions.Item>
          <Descriptions.Item label="Points"><span style={{ fontSize: 18, fontWeight: 700 }}>{fan?.points || 0}</span></Descriptions.Item>
          <Descriptions.Item label="Total Contribution">{fan?.total_contribution || 0}</Descriptions.Item>
          <Descriptions.Item label="Current Benefits">{currentLevel?.benefits || '-'}</Descriptions.Item>
        </Descriptions>
        <Tabs style={{ marginTop: 16 }} items={[
          { key: 'logs', label: 'Points History', children: <Table columns={logColumns} dataSource={logs} rowKey="id" pagination={{ pageSize: 10 }} size="small" locale={{ emptyText: <Empty description="No points history" /> }} /> },
          { key: 'level', label: 'Level Info', children: (
            <div>
              {levelRules.map(r => (
                <Card key={r.id} size="small" style={{ marginBottom: 8, border: r.level === fan?.level ? '2px solid #1677ff' : '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><Tag color={levelMap[r.level]?.color}>{levelMap[r.level]?.label}</Tag> {r.min_points}+ points</div>
                    <span style={{ color: '#666' }}>{r.benefits}</span>
                  </div>
                </Card>
              ))}
              {nextLevel && <p style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>{nextLevel.min_points - (fan?.points || 0)} points to reach {levelMap[nextLevel.level]?.label}</p>}
            </div>
          )},
        ]} />
      </Card>
    </div>
  );
};

export default FanDetailPage;
