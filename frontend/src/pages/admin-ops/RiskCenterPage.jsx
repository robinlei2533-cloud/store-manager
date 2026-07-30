import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Row, Space, Table, Tag, Timeline, Typography, message } from 'antd';
import localDb from '../../services/db/localDb';
import useAuthStore from '../../stores/authStore';
import { canManageRiskDecision } from '../../utils/uwellRoleAccess';

const { Title, Text } = Typography;

const riskStatuses = {
  open: { label: '待处理', color: 'red' },
  underReview: { label: '审核中', color: 'orange' },
  sentToReviews: { label: '已发送至审核中心', color: 'blue' },
  resolved: { label: '已解决', color: 'green' },
};

const risks = [
  ['扫码风险', '无效扫码单日超过10次', '重复扫描已领取码'],
  ['门店核销风险', '人工核销比例超过50%', '同一门店每小时核销超过30次'],
  ['社区风险', '重复评论单日超过5次', '被举报帖子'],
  ['奖励风险', '高价值奖励申请', '兑换前积分来源异常'],
  ['账号风险', '新账号首日获得超过100积分', '同设备多账号'],
];

const riskPolicyCards = [
  ['产品扫码作弊', '只有官方 UWELL 唯一产品码才能增加产品扫码积分。'],
  ['门店核销滥用', '重复或异常门店核销必须发送至审核中心。'],
  ['奖励兑换风险', '高价值奖励分配领取门店前必须后台审核。'],
  ['社区积分滥用', '点赞、评论和发帖积分有上限且可审计。'],
];

const riskResolutionLadder = [
  '冻结或拒绝相关积分',
  '发送至审核中心进行人工决策',
  '写入审计备注后才能标记解决',
];

const riskHandoffQueue = [
  ['升级路径', '高风险奖励、扫码、积分和门店核销事项可流转到审核中心。'],
  ['处理证据', '拒绝积分或关闭风险前，运营人员应核验来源记录。'],
  ['审计结果', '高风险和关键决策必须留下可审计的后台操作记录。'],
];

const riskStatusGuidance = {
  open: '核验来源证据',
  underReview: '检查来源记录时暂停相关积分',
  sentToReviews: '已升级至审核中心',
  resolved: '审计结果已记录',
};

const normalizeCreatedAt = (value) => String(value || '').slice(0, 10);
const todayKey = () => new Date().toISOString().slice(0, 10);

const writeRiskAudit = (row, action) => {
  localDb.insert('audit_logs', {
    actor: 'UWELL operations',
    role: 'admin',
    action_type: action,
    action,
    target: row.key,
    target_id: row.key,
    before_value: { status: row.status },
    after_value: { category: row.category, trigger: row.trigger, subject: row.subject },
    reason: `${row.category}: ${row.trigger}`,
    created_at: new Date().toISOString(),
  });
};

const buildRiskRows = () => {
  const scans = localDb.all('scan_records') || [];
  const scanRiskRows = scans
    .filter((item) => ['suspicious', 'not_uwell', 'daily_limit', 'already_claimed'].includes(item.scan_status))
    .map((item) => ({
      key: `scan-${item.id}`,
      category: '扫码风险',
      subject: item.fan_id || item.scanned_code,
      trigger: item.scan_status === 'not_uwell' ? '无效扫码尝试' : item.scan_status === 'daily_limit' ? '超过每日扫码上限' : '重复扫描已领取码',
      status: item.review_status || 'open',
      severity: item.scan_status === 'suspicious' ? '高' : '中',
      relatedPoints: item.points_earned || 0,
      sourceTable: 'scan_records',
      sourceId: item.id,
    }));

  const verifications = localDb.all('store_activity_verifications') || [];
  const storeRiskRows = verifications
    .filter((item) => item.status === 'duplicate' || item.risk_status === 'duplicate_attempt' || item.requires_backend_review)
    .map((item) => ({
      key: `verification-${item.id}`,
      category: '门店核销风险',
      subject: item.store_name || item.store_id,
      trigger: '同一粉丝同一活动重复尝试',
      status: item.review_status || 'open',
      severity: '高',
      relatedPoints: item.points_award_status === 'system_pending' ? 20 : 0,
      sourceTable: 'store_activity_verifications',
      sourceId: item.id,
    }));

  const comments = localDb.all('community_comments') || [];
  const commentCountByFan = comments.reduce((acc, item) => {
    if (normalizeCreatedAt(item.created_at) !== todayKey()) return acc;
    acc[item.fan_id] = (acc[item.fan_id] || 0) + 1;
    return acc;
  }, {});
  const communityRiskRows = Object.entries(commentCountByFan)
    .filter(([, count]) => count > 5)
    .map(([fanId, count]) => ({
      key: `community-${fanId}`,
      category: '社区风险',
      subject: fanId,
      trigger: '重复评论单日超过5次',
      status: 'open',
      severity: '中',
      relatedPoints: count * 2,
      sourceTable: 'community_comments',
      sourceId: fanId,
    }));

  const redemptions = localDb.all('mall_redemptions') || [];
  const rewardRiskRows = redemptions
    .filter((item) => (
      ['pending_review', 'review_pending'].includes(item.review_status || item.status)
      || Number(item.points_cost || item.required_points || 0) >= 3000
    ))
    .map((item) => ({
      key: `reward-${item.id}`,
      category: '奖励风险',
      subject: item.fan_name || item.fan_id,
      trigger: '高价值奖励申请',
      status: item.review_status === 'approved' ? 'resolved' : 'underReview',
      severity: Number(item.points_cost || item.required_points || 0) >= 8000 ? '高' : '中',
      relatedPoints: Number(item.points_cost || item.required_points || 0),
      sourceTable: 'mall_redemptions',
      sourceId: item.id,
    }));

  return [...scanRiskRows, ...storeRiskRows, ...communityRiskRows, ...rewardRiskRows];
};

export default function RiskCenterPage() {
  const profile = useAuthStore((s) => s.profile);
  const canHandleRiskDecision = canManageRiskDecision(profile);
  const [refreshKey, setRefreshKey] = useState(0);
  const riskRows = useMemo(() => {
    void refreshKey;
    return buildRiskRows();
  }, [refreshKey]);

  const updateRiskStatus = (row, status, action) => {
    if (!canHandleRiskDecision) {
      message.error('你没有风控决策权限。');
      return;
    }
    if (row.sourceTable && row.sourceId && localDb.findById(row.sourceTable, row.sourceId)) {
      localDb.update(row.sourceTable, row.sourceId, {
        review_status: status,
        risk_review_status: status,
        reviewed_at: new Date().toISOString(),
      });
    }
    writeRiskAudit(row, action);
    setRefreshKey((value) => value + 1);
    message.success(`${row.trigger}: ${riskStatuses[status]?.label || status}`);
  };

  const sendToReviews = (row) => updateRiskStatus(row, 'sentToReviews', 'risk_sent_to_reviews');
  const rejectRelatedPoints = (row) => updateRiskStatus(row, 'underReview', 'risk_related_points_rejected');
  const addNote = (row) => updateRiskStatus(row, row.status || 'open', 'risk_note_added');
  const markResolved = (row) => updateRiskStatus(row, 'resolved', 'risk_marked_resolved');

  const riskColumns = [
    { title: '分类', dataIndex: 'category', render: (value) => <Tag color="volcano">{value}</Tag> },
    { title: '对象', dataIndex: 'subject' },
    { title: '触发原因', dataIndex: 'trigger' },
    { title: '严重度', dataIndex: 'severity', render: (value) => <Tag color={value === '高' ? 'red' : 'gold'}>{value}</Tag> },
    { title: '状态', dataIndex: 'status', render: (value) => <Tag color={riskStatuses[value]?.color}>{riskStatuses[value]?.label || value}</Tag> },
    { title: '下一动作', render: (_, row) => <Text>{riskStatusGuidance[row.status] || '核验来源证据'}</Text> },
    { title: '关联积分', dataIndex: 'relatedPoints' },
    {
      title: '操作',
      render: (_, row) => (
        <Space wrap>
          <Button size="small" type="primary" disabled={!canHandleRiskDecision} onClick={() => sendToReviews(row)}>发送至审核中心</Button>
          <Button size="small" danger disabled={!canHandleRiskDecision} onClick={() => rejectRelatedPoints(row)}>拒绝相关积分</Button>
          <Button size="small" disabled={!canHandleRiskDecision} onClick={() => addNote(row)}>添加备注</Button>
          <Button size="small" disabled={!canHandleRiskDecision} onClick={() => markResolved(row)}>标记解决</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-ops-page admin-risk-cockpit">
      <Title level={2}>风控中心</Title>
      <Text type="secondary">风控中心识别异常行为，高风险事项由审核中心进行人工决策。</Text>
      <Card className="admin-risk-command-strip" style={{ marginTop: 18 }}>
        <div>
          <Text strong>反作弊分诊</Text>
          <p>识别可疑扫码、重复门店核销、社区滥用和高价值奖励风险。</p>
        </div>
        <Tag color="volcano">发送至审核中心</Tag>
      </Card>
      <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
        <Col xs={24} lg={14}>
          <Card title="风控策略地图" className="admin-risk-policy-grid">
            <Row gutter={[10, 10]}>
              {riskPolicyCards.map(([title, desc]) => (
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
          <Card title="处理阶梯" className="admin-risk-resolution-ladder">
            {riskResolutionLadder.map((item, index) => (
              <div className="admin-ops-row" key={item}>
                <span>步骤 {index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
      <Row gutter={[12, 12]} style={{ marginTop: 18 }}>
        {Object.values(riskStatuses).map((status) => (
          <Col xs={12} md={6} key={status.label}>
            <Card>
              <Text type="secondary">{status.label}</Text>
              <Title level={3} style={{ margin: 0 }}>
                {riskRows.filter((row) => riskStatuses[row.status]?.label === status.label).length}
              </Title>
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="风控转审核交接" className="admin-risk-handoff-queue" style={{ marginTop: 18 }}>
        <Row gutter={[10, 10]}>
          {riskHandoffQueue.map(([title, desc]) => (
            <Col xs={24} md={8} key={title}>
              <div className="admin-ops-mini-card">
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
      <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
        {risks.map(([title, first, second]) => (
          <Col xs={24} md={12} xl={8} key={title}>
            <Card title={title}>
              <Timeline items={[
                { color: 'red', content: first },
                { color: 'gold', content: second },
                { color: 'green', content: <Tag>发送至审核中心</Tag> },
              ]} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="风控处理队列" style={{ marginTop: 18 }}>
        <Table size="small" columns={riskColumns} dataSource={riskRows} pagination={{ pageSize: 8 }} />
      </Card>
    </div>
  );
}
