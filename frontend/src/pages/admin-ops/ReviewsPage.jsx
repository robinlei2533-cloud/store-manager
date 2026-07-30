import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Card, Col, Input, Modal, Row, Space, Table, Tag, Typography, message } from 'antd';
import { applyReviewAction, buildReviewRows, getReviewCounters } from './admin-ops-workflows';
import useAuthStore from '../../stores/authStore';
import { canApproveReview } from '../../utils/uwellRoleAccess';

const { Title, Text } = Typography;

const reviewFilters = [
  { key: 'all', label: '全部' },
  { key: 'campaigns', label: '活动' },
  { key: 'rewards', label: '奖励' },
  { key: 'store-levels', label: '门店等级' },
  { key: 'visits', label: '拜访' },
  { key: 'scan-risks', label: '扫码风险' },
  { key: 'photos', label: '照片' },
  { key: 'materials', label: '物料' },
  { key: 'community', label: '社区' },
  { key: 'risk', label: '风险' },
];

const statusColors = {
  Pending: 'blue',
  'Need More Info': 'orange',
  Escalated: 'volcano',
  Approved: 'green',
  Rejected: 'red',
};

const reviewSourceMap = [
  ['粉丝端', '老粉认证、奖励审批、投诉和社区举报进入这里。'],
  ['门店端', '门店活动、陈列照片、物料申请和奖励领取异常进入这里。'],
  ['地推端', '新店评级、复访证据、等级调整建议和经理审核进入这里。'],
  ['风控端', '扫码风险、重复参与、异常积分和高价值兑换进入这里。'],
];

const reviewActionLadder = [
  '通过、拒绝、要求补充、升级处理或添加备注',
  '决策写入审计日志',
  '来源记录立即同步到对应端',
];

const reviewHandoffQueue = [
  ['来源记录', '决策前先查看粉丝、门店、地推、风控或奖励来源记录。'],
  ['下一动作负责人', 'Admin 或 Manager 做决策，来源端接收状态更新。'],
  ['回流模块', '通过后的工作回到活动、奖励、物料、拜访、S店或粉丝运营。'],
];

const getReviewDestination = (row) => {
  const destinationBySource = {
    campaigns: { label: '活动', route: row.sourceId ? `/app/campaigns/${row.sourceId}` : '/app/campaigns' },
    material_requests: { label: '物料', route: '/app/materials' },
    store_display_uploads: { label: '门店档案', route: row.owner?.includes('Store:') ? '/app/stores' : '/app/reviews' },
    mall_redemptions: { label: '奖励', route: '/app/rewards' },
    store_evaluations: { label: '门店等级审核', route: '/app/evaluation/list' },
    visits: { label: '地推拜访', route: row.sourceId ? `/app/visits/${row.sourceId}` : '/app/visits/list' },
    store_activity_verifications: { label: '风控中心', route: '/app/risk-center' },
    fan_complaints: { label: '粉丝运营', route: '/app/fans' },
  };
  return destinationBySource[row.sourceTable] || { label: '审核中心', route: '/app/reviews' };
};

export default function ReviewsPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const canRunReviewActions = canApproveReview(profile);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const reviewRows = useMemo(() => {
    void refreshKey;
    return buildReviewRows();
  }, [refreshKey]);
  const counters = getReviewCounters(reviewRows);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleRows = reviewRows.filter((row) => (
    (
      activeFilter === 'all'
      || row.category.toLowerCase().replaceAll(' ', '-') === activeFilter
      || (activeFilter === 'risk' && row.category === 'Risk')
    )
    && (
      !normalizedSearch
      || [row.category, row.type, row.target, row.owner, row.priority, row.status, row.nextStep, row.sourceTable, getReviewDestination(row).label]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    )
  ));

  const runAction = (row, action) => {
    if (!canRunReviewActions) {
      message.error('你没有审核决策权限。');
      return;
    }
    const labels = {
      approve: '通过',
      reject: '拒绝',
      need_more_info: '要求补充信息',
      escalate: '升级处理',
      note: '添加备注',
    };

    Modal.confirm({
      title: `${labels[action]}: ${row.target}`,
      content: action === 'approve' && row.sourceTable === 'material_requests'
        ? '这会在审核中心通过该申请。请到物料模块预留区域仓库存并管理物流。'
        : '这会更新来源记录并写入审计日志。',
      okText: labels[action],
      onOk: () => {
        try {
          applyReviewAction(row, action, action === 'note' ? 'Trial admin note from unified review queue.' : '');
          setRefreshKey((value) => value + 1);
          message.success('审核队列已更新');
        } catch (error) {
          message.error(error?.message || '审核操作失败');
        }
      },
    });
  };

  const columns = [
    { title: '分类', dataIndex: 'category', render: (value) => <Tag color="geekblue">{value}</Tag> },
    {
      title: '操作',
      render: (_, row) => (
        <Space className="admin-review-action-grid" wrap>
          <Button size="small" onClick={() => navigate(getReviewDestination(row).route)}>查看来源</Button>
          <Button size="small" type="primary" disabled={!canRunReviewActions} onClick={() => runAction(row, 'approve')}>通过</Button>
          <Button size="small" disabled={!canRunReviewActions} onClick={() => runAction(row, 'reject')}>拒绝</Button>
          <Button size="small" disabled={!canRunReviewActions} onClick={() => runAction(row, 'need_more_info')}>要求补充</Button>
          <Button size="small" disabled={!canRunReviewActions} onClick={() => runAction(row, 'escalate')}>升级处理</Button>
          <Button size="small" disabled={!canRunReviewActions} onClick={() => runAction(row, 'note')}>添加备注</Button>
        </Space>
      ),
    },
    { title: '类型', dataIndex: 'type' },
    {
      title: '来源',
      render: (_, row) => (
        <Space orientation="vertical" size={0}>
          <Text>{row.sourceTable}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{row.sourceId}</Text>
        </Space>
      ),
    },
    { title: '对象', dataIndex: 'target', render: (value, row) => <><Text strong>{value}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{row.owner}</Text></> },
    { title: '优先级', dataIndex: 'priority', render: (value) => <Tag color={value === 'High' ? 'volcano' : 'gold'}>{value}</Tag> },
    { title: '状态', dataIndex: 'status', render: (value) => <Tag color={statusColors[value] || 'default'}>{value}</Tag> },
    { title: '下一步', dataIndex: 'nextStep' },
    { title: '回流模块', render: (_, row) => <Tag color="green">{getReviewDestination(row).label}</Tag> },
  ];

  return (
    <div className="admin-ops-page admin-review-workbench admin-review-workbench-compact">
      <Title level={2}>审核中心</Title>
      <Text type="secondary">统一承接活动、奖励、门店等级、拜访、扫码风险、照片、物料和社区举报的待处理工作。</Text>

      <Card className="admin-review-command-strip admin-review-guidance-card" style={{ marginTop: 18 }}>
        <div>
          <Text strong>跨端审核入口</Text>
          <p>粉丝凭证、门店提交、地推评级、扫码风险和奖励审批统一进入这里。</p>
        </div>
        <Tag color="blue">决策写入审计日志</Tag>
      </Card>

      <Row className="admin-review-decision-grid admin-review-guidance-card" gutter={[16, 16]} style={{ marginTop: 18 }}>
        <Col xs={24} lg={14}>
          <Card title="审核来源地图" className="admin-review-source-map admin-review-source-map-compact">
            <Row gutter={[10, 10]}>
              {reviewSourceMap.map(([title, desc]) => (
                <Col xs={24} sm={12} key={title}>
                  <div className="admin-ops-mini-card">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="决策阶梯" className="admin-review-action-ladder admin-review-action-ladder-compact">
            {reviewActionLadder.map((item, index) => (
              <div className="admin-ops-row" key={item}>
                <span>步骤 {index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card title="待处理交接" className="admin-review-handoff-queue admin-review-handoff-compact admin-review-guidance-card" style={{ marginTop: 18 }}>
        <Row gutter={[10, 10]}>
          {reviewHandoffQueue.map(([title, desc]) => (
            <Col xs={24} md={8} key={title}>
              <div className="admin-ops-mini-card">
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Row className="admin-review-counter-grid" gutter={[16, 16]} style={{ marginTop: 18 }}>
        {[
          ['待处理', counters.pending],
          ['高优先级', counters.highPriority],
          ['需补充信息', counters.needMoreInfo],
          ['已升级', counters.escalated],
        ].map(([item, value]) => (
          <Col xs={24} sm={12} lg={6} key={item}>
            <Card><Text>{item}</Text><Title level={3}>{value}</Title></Card>
          </Col>
        ))}
      </Row>
      <Card title="审核筛选" className="admin-review-filter-card" style={{ marginTop: 18 }}>
        <Space className="admin-review-filter-grid" wrap>
          {reviewFilters.map((filter) => (
            <Button
              key={filter.key}
              type={activeFilter === filter.key ? 'primary' : 'default'}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </Button>
          ))}
        </Space>
        <Input.Search
          placeholder="搜索粉丝、门店、奖励、活动或备注"
          style={{ marginTop: 14, maxWidth: 420 }}
          allowClear
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </Card>
      <Card title="审核队列" className="admin-review-queue-card" style={{ marginTop: 18 }}>
        <div className="admin-trial-wide-table">
          <Table className="admin-review-queue-table" size="small" columns={columns} dataSource={visibleRows} pagination={false} scroll={{ x: 980 }} />
        </div>
      </Card>
    </div>
  );
}
