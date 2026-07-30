import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Tabs, Table, Tag, Button, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getFanById, getFanPointsLog, getLevelRules } from '../../services/api';
import { FAN_LEVELS } from '../../utils/constants';
import PageTransition from "../../components/common/PageTransition";
import useAuthStore from '../../stores/authStore';

const FanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const { data: fan, isLoading } = useQuery({ queryKey: ['fan', id, profile?.id, profile?.role, profile?.region], queryFn: () => getFanById(id, { scopeProfile: profile }), enabled: !!id });
  const { data: logs = [] } = useQuery({ queryKey: ['fan-logs', id], queryFn: () => getFanPointsLog(id), enabled: !!id && Boolean(fan) });
  const { data: levelRules = [] } = useQuery({ queryKey: ['level-rules'], queryFn: getLevelRules });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  if (!fan) {
    return (
      <PageTransition>
        <div className="bg-radial-top admin-fan-detail-page" style={{ minHeight: "100vh", padding: 24 }}>
          <Button type="link" onClick={() => navigate('/app/fans/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>← 返回粉丝列表</Button>
          <Card className="liquid-glass" title="访问受限">
            <Empty description="粉丝不存在或不在当前账号可查看范围内" />
          </Card>
        </div>
      </PageTransition>
    );
  }

  const levelMap = Object.fromEntries(FAN_LEVELS.map(f => [f.value, f]));
  const currentLevel = levelRules.find(r => r.level === fan?.level);
  const nextLevel = levelRules.find(r => r.min_points > (fan?.points || 0));

  const logColumns = [
    { title: '日期', dataIndex: 'created_at', key: 'date', render: (v) => new Date(v).toLocaleString('zh-CN') },
    { title: '积分', dataIndex: 'points', key: 'points', render: (v, r) => <span style={{ color: r.type === 'earn' ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>{r.type === 'earn' ? '+' : ''}{v}</span> },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t) => <Tag color={t === 'earn' ? 'green' : 'red'}>{t === 'earn' ? '获得' : '兑换'}</Tag> },
    { title: '来源', dataIndex: 'source', key: 'source' },
    { title: '说明', dataIndex: 'description', key: 'desc', ellipsis: true },
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top admin-fan-detail-page" style={{minHeight:"100vh",padding:24}}>
      <Button type="link" onClick={() => navigate('/app/fans/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>← 返回粉丝列表</Button>
      <Card className="liquid-glass admin-fan-detail-card" title="粉丝详情">
        <Descriptions className="admin-fan-detail-descriptions" column={{ xs: 1, sm: 1, md: 2 }} bordered>
          <Descriptions.Item label="姓名">{fan?.profiles?.name || `粉丝 #${fan?.id?.slice(0, 6)}`}</Descriptions.Item>
          <Descriptions.Item label="门店">{fan?.stores?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="等级"><Tag color={levelMap[fan?.level]?.color}>{levelMap[fan?.level]?.label || fan?.level}</Tag></Descriptions.Item>
          <Descriptions.Item label="积分"><span style={{ fontSize: 18, fontWeight: 700 }}>{fan?.points || 0}</span></Descriptions.Item>
          <Descriptions.Item label="总贡献">{fan?.total_contribution || 0}</Descriptions.Item>
          <Descriptions.Item label="当前权益">{currentLevel?.benefits || '-'}</Descriptions.Item>
        </Descriptions>
        <Tabs style={{ marginTop: 16 }} items={[
          { key: 'logs', label: '积分记录', children: <div className="admin-trial-wide-table admin-fan-detail-history-table"><Table columns={logColumns} dataSource={logs} rowKey="id" pagination={{ pageSize: 10 }} size="small" locale={{ emptyText: <Empty description="暂无积分记录" /> }} scroll={{ x: 680 }} /></div> },
          { key: 'level', label: '等级规则', children: (
            <div>
              {levelRules.map(r => (
                <Card key={r.id} size="small" className="liquid-glass" style={{ marginBottom: 8, border: r.level === fan?.level ? '2px solid #FFD700' : '1px solid rgba(255,215,0,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><Tag color={levelMap[r.level]?.color}>{levelMap[r.level]?.label}</Tag> {r.min_points}+ 积分</div>
                    <span style={{ color: '#666' }}>{r.benefits}</span>
                  </div>
                </Card>
              ))}
              {nextLevel && <p style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>还差 {nextLevel.min_points - (fan?.points || 0)} 积分到达 {levelMap[nextLevel.level]?.label}</p>}
            </div>
          )},
        ]} />
      </Card>
    </div>
    </PageTransition>);
};

export default FanDetailPage;

