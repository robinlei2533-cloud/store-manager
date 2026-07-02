import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Button, Card, Tag, Input, Select, Space, Statistic, Row, Col, Empty, Progress } from 'antd';
import { PlusOutlined, SearchOutlined, StarOutlined, ShopOutlined, TrophyOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import useLanguageStore from '../../stores/languageStore';
import { getEvaluations } from '../../services/api';
import PageTransition from '../../components/common/PageTransition';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import { canViewCompanyScope, getAssignedStoreIds } from '../../utils/uwellRoleAccess';

const levelColors = { A: 'green', B: 'blue', C: 'orange', D: 'red' };
const levelOptions = ['A', 'B', 'C', 'D'].map((value) => ({ label: `${value} 级`, value }));

const EvalListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const profile = useAuthStore((state) => state.profile);
  const [level, setLevel] = useState(undefined);
  const [search, setSearch] = useState('');
  const canManageCompany = canViewCompanyScope(profile);
  const assignedStoreIds = canManageCompany ? null : getAssignedStoreIds(profile, localDb.all('stores') || []);

  const { data: evals = [], isLoading } = useQuery({
    queryKey: ['evaluations', { level, profileId: profile?.id }],
    queryFn: () => getEvaluations({ level, assigned_store_ids: assignedStoreIds }),
  });

  const filtered = search
    ? evals.filter((item) => item.stores?.name?.toLowerCase().includes(search.toLowerCase()))
    : evals;
  const avgScore = filtered.length > 0
    ? (filtered.reduce((sum, item) => sum + Number(item.total_score || 0), 0) / filtered.length).toFixed(1)
    : 0;
  const levelCount = (target) => filtered.filter((item) => item.recommended_level === target).length;
  const latestRecord = filtered[0];

  const columns = [
    {
      title: '门店',
      dataIndex: ['stores', 'name'],
      key: 'store',
      render: (text) => <span style={{ fontWeight: 700 }}>{text || '-'}</span>,
    },
    {
      title: '拜访日期',
      dataIndex: 'eval_date',
      key: 'date',
      width: 130,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: '综合评分',
      dataIndex: 'total_score',
      key: 'score',
      width: 180,
      render: (value) => (
        <div className="eval-table-score">
          <strong>{value || 0}</strong>
          <Progress percent={Math.min(100, Math.round(((value || 0) / 110) * 100))} showInfo={false} size="small" />
        </div>
      ),
    },
    {
      title: '评级',
      dataIndex: 'recommended_level',
      key: 'level',
      width: 90,
      render: (value) => <Tag color={levelColors[value] || 'default'}>{value || '-'} 级</Tag>,
    },
    { title: 'BD', dataIndex: ['evaluator', 'name'], key: 'evaluator', width: 140, render: (value) => value || '-' },
    {
      title: t('actions'),
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/app/evaluation/${record.id}`)}>{t('view')}</Button>
          <Button type="link" size="small" onClick={() => navigate(`/app/evaluation/create?id=${record.id}`)}>{t('edit')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="evaluation-page">
        <div className="eval-hero-card liquid-glass">
          <div>
            <div className="eval-kicker">Store Rating MVP</div>
            <h1>{t('nav_evaluation')}</h1>
            <p>BD 现场调研评分，自动计算 A/B/C/D 级别，并把门店评级沉淀到后续拜访、物料和活动策略里。</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/evaluation/create')}>
            新建评分
          </Button>
        </div>

        <Row gutter={[16, 16]} className="eval-stat-grid">
          <Col xs={12} md={6}>
            <Card className="dash-stat-card liquid-glass" size="small">
              <Statistic title="平均评分" value={avgScore} suffix="/110" prefix={<StarOutlined />} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="dash-stat-card liquid-glass" size="small">
              <Statistic title="A级门店" value={levelCount('A')} prefix={<TrophyOutlined />} valueStyle={{ color: '#63d471' }} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="dash-stat-card liquid-glass" size="small">
              <Statistic title="B/C 门店" value={levelCount('B') + levelCount('C')} prefix={<ShopOutlined />} valueStyle={{ color: '#d6a84f' }} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="dash-stat-card liquid-glass" size="small">
              <Statistic title="D级预警" value={levelCount('D')} valueStyle={{ color: '#ff7a7a' }} />
            </Card>
          </Col>
        </Row>

        {latestRecord && (
          <Card className="crud-card eval-latest-card">
            <div>
              <span>最近评分</span>
              <strong>{latestRecord.stores?.name || '-'}</strong>
            </div>
            <Tag color={levelColors[latestRecord.recommended_level] || 'default'}>{latestRecord.recommended_level} 级</Tag>
            <span>{latestRecord.total_score || 0} / 110</span>
          </Card>
        )}

        <Card className="crud-card" title="评分记录" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/evaluation/create')}>新建评分</Button>}>
          <Space wrap style={{ marginBottom: 16 }}>
            <Input
              placeholder="搜索门店"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              allowClear
              style={{ width: 240 }}
            />
            <Select placeholder="评级" value={level} onChange={setLevel} allowClear style={{ width: 140 }} options={levelOptions} />
          </Space>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={isLoading}
            locale={{ emptyText: <Empty description="暂无评分记录" /> }}
            pagination={{ pageSize: 15, showTotal: (total) => `${t('total')} ${total}` }}
            scroll={{ x: 820 }}
          />
        </Card>
      </div>
    </PageTransition>
  );
};

export default EvalListPage;
