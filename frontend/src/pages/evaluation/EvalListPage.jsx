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

const STORE_RATING_DIMENSIONS = [
  { label: '月销售额', points: 20 },
  { label: '位置 / 客流', points: 15 },
  { label: '门头 / 招牌形象', points: 10 },
  { label: 'UWELL 陈列质量', points: 15 },
  { label: '产品覆盖', points: 15 },
  { label: '店员配合', points: 10 },
  { label: '活动准备度', points: 10 },
  { label: '照片 / 数据完整度', points: 5 },
];

const LEVEL_THRESHOLDS = [
  { range: '90-100', level: 'S' },
  { range: '75-89', level: 'A' },
  { range: '60-74', level: 'B' },
  { range: '低于 60', level: 'C' },
];

const levelColors = { S: 'purple', A: 'green', B: 'blue', C: 'orange' };
const levelOptions = ['S', 'A', 'B', 'C'].map((value) => ({ label: `${value} 级`, value }));

const REVIEW_ACTIONS = {
  approve: { label: '通过建议等级', actionType: 'Approve suggested level' },
  evidence: { label: '要求补充材料', actionType: 'Request more evidence' },
  change: { label: '调整等级', actionType: 'Change level' },
};

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

  const writeRatingAudit = (record, actionType, finalLevel, previousLevel) => {
    localDb.insert('audit_logs', {
      actor: profile?.name || 'Reviewer',
      role: profile?.role || 'manager',
      region: profile?.region || profile?.city || record?.stores?.city || '-',
      action_type: 'Store level change',
      target: record?.stores?.name || record?.store_id || record?.id,
      before_value: previousLevel || record?.stores?.level || record?.recommended_level || '-',
      after_value: finalLevel || record?.recommended_level || '-',
      reason: actionType,
      created_at: new Date().toISOString(),
    });
  };

  const handleRatingReviewAction = (record, actionType, finalLevel = record?.recommended_level) => {
    const previousLevel = record?.stores?.level || localDb.findById('stores', record?.store_id)?.level || '-';
    if (record?.id && localDb.findById('store_evaluations', record.id)) {
      localDb.update('store_evaluations', record.id, {
        backend_final_level: finalLevel,
        final_level: finalLevel,
        review_status: actionType === 'Request more evidence' ? 'needs_more_evidence' : 'reviewed',
        reviewer_id: profile?.id || 'u-manager',
        reviewer_name: profile?.name || 'Reviewer',
        reviewed_at: new Date().toISOString(),
        review_note: `${actionType}. Previous level: ${previousLevel}. Final level: ${finalLevel}.`,
      });
    }
    if (record?.store_id && actionType !== 'Request more evidence' && localDb.findById('stores', record.store_id)) {
      localDb.update('stores', record.store_id, {
        level: finalLevel,
        rating_status: 'reviewed',
        rating_reviewed_at: new Date().toISOString(),
        rating_reviewer_id: profile?.id || 'u-manager',
      });
    }
    writeRatingAudit(record, actionType, finalLevel, previousLevel);
  };

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
      title: '总分',
      dataIndex: 'total_score',
      key: 'score',
      width: 180,
      render: (value) => (
        <div className="eval-table-score">
          <strong>{value || 0}</strong>
          <Progress percent={Math.min(100, Math.round(value || 0))} showInfo={false} size="small" />
        </div>
      ),
    },
    {
      title: '等级',
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
            <div className="eval-kicker">SABC 100分</div>
            <h1>{t('nav_evaluation')}</h1>
            <p>门店拜访评分进入后台复核后，才确认最终等级。</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/evaluation/create')}>
            新建评级
          </Button>
        </div>

        <Row gutter={[16, 16]} className="eval-stat-grid">
          <Col xs={12} md={6}>
            <Card className="dash-stat-card liquid-glass" size="small">
              <Statistic title="平均分" value={avgScore} suffix="/100" prefix={<StarOutlined />} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="dash-stat-card liquid-glass" size="small">
              <Statistic title="A级门店" value={levelCount('A')} prefix={<TrophyOutlined />} styles={{ content: { color: '#63d471' } }} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="dash-stat-card liquid-glass" size="small">
              <Statistic title="B/C待提升" value={levelCount('B') + levelCount('C')} prefix={<ShopOutlined />} styles={{ content: { color: '#d6a84f' } }} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="dash-stat-card liquid-glass" size="small">
              <Statistic title="S级候选" value={levelCount('S')} styles={{ content: { color: '#b9f2ff' } }} />
            </Card>
          </Col>
        </Row>

        {latestRecord && (
          <Card className="crud-card eval-latest-card">
            <div>
              <span>最新评级</span>
              <strong>{latestRecord.stores?.name || '-'}</strong>
            </div>
            <Tag color={levelColors[latestRecord.recommended_level] || 'default'}>{latestRecord.recommended_level} 级</Tag>
            <span>{latestRecord.total_score || 0} / 100</span>
          </Card>
        )}

        <Card className="crud-card" title="100分评级模型" style={{ marginBottom: 16 }}>
          <Row gutter={[12, 12]}>
            {STORE_RATING_DIMENSIONS.map((item) => (
              <Col xs={12} md={6} key={item.label}>
                <Card size="small">
                  <strong>{item.points}</strong>
                  <div>{item.label}</div>
                </Card>
              </Col>
            ))}
          </Row>
          <Space wrap style={{ marginTop: 12 }}>
            {LEVEL_THRESHOLDS.map((item) => <Tag key={item.level} color={levelColors[item.level]}>{item.range}: {item.level} 级</Tag>)}
          </Space>
        </Card>

        <Card className="crud-card" title="评级审核" style={{ marginBottom: 16 }}>
          <Table
            className="eval-review-table"
            size="small"
            rowKey="id"
            dataSource={filtered.slice(0, 5)}
            pagination={false}
            scroll={{ x: 760 }}
            columns={[
              { title: '门店', width: 180, render: (_, record) => record.stores?.name || record.store_id || '-' },
              { title: 'BD建议等级', width: 120, dataIndex: 'recommended_level', render: (value) => <Tag color={levelColors[value] || 'default'}>{value || '-'} 级</Tag> },
              { title: '后台最终等级', width: 130, render: (_, record) => <Select size="small" defaultValue={record.recommended_level || 'C'} style={{ width: 100 }} options={levelOptions} onChange={(value) => handleRatingReviewAction(record, REVIEW_ACTIONS.change.actionType, value)} /> },
              {
                title: '操作',
                width: 310,
                render: (_, record) => (
                  <Space wrap className="eval-review-action-grid">
                    <Button size="small" type="primary" onClick={() => handleRatingReviewAction(record, REVIEW_ACTIONS.approve.actionType)}>{REVIEW_ACTIONS.approve.label}</Button>
                    <Button size="small" onClick={() => handleRatingReviewAction(record, REVIEW_ACTIONS.evidence.actionType)}>{REVIEW_ACTIONS.evidence.label}</Button>
                    <Button size="small" onClick={() => handleRatingReviewAction(record, REVIEW_ACTIONS.change.actionType)}>{REVIEW_ACTIONS.change.label}</Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>

        <Card className="crud-card" title="评级记录" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/evaluation/create')}>新建评级</Button>}>
          <Space wrap style={{ marginBottom: 16 }}>
            <Input
              placeholder="搜索门店"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              allowClear
              style={{ width: 240 }}
            />
            <Select placeholder="等级" value={level} onChange={setLevel} allowClear style={{ width: 140 }} options={levelOptions} />
          </Space>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={isLoading}
            locale={{ emptyText: <Empty description="暂无评级记录" /> }}
            pagination={{ pageSize: 15, showTotal: (total) => `${t('total')} ${total}` }}
            scroll={{ x: 820 }}
          />
        </Card>
      </div>
    </PageTransition>
  );
};

export default EvalListPage;
