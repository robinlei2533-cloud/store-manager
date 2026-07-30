import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import { CheckOutlined, CloseOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { REWARD_CATALOG } from '../../utils/uwellLaunchRules';
import localDb from '../../services/db/localDb';
import useAuthStore from '../../stores/authStore';
import { canAssignRewardPickup, canManageRewardOps } from '../../utils/uwellRoleAccess';

const { Title, Text } = Typography;

const rewardRules = [
  '奖励积分成本可配置',
  '区域资格可配置',
  '领取规则按奖励类型配置',
  '兑换逻辑固定',
  '只扣除可用积分',
  '终身成长积分永不扣除',
  '门店账号只做领取核销',
];

const pickupRules = [
  '普通奖励：A/S门店可履约',
  '进阶奖励：仅S店履约',
  '钻石高价值奖励需要后台审核',
];

const luxuryRewardNames = [
  '一周中国行',
  '高端耳机',
  '手机或高价值电子产品',
];

const rewardGovernanceCards = [
  ['目录与素材状态', '奖励名称、积分成本、等级门槛、区域资格和素材状态由后台管理。'],
  ['等级与积分成本规则', '粉丝可看到锁定奖励，但兑换取决于可用积分和所需等级。'],
  ['领取门店资格', '普通奖励使用 A/S 门店，高级奖励使用 S 店或指定领取门店。'],
  ['高价值奖励审批', '钻石高价值奖励履约前必须经过后台审批。'],
];

const rewardFulfillmentLadder = [
  '仅扣除可用积分',
  '终身成长积分保持不变',
  '分配合格 A/S 领取门店',
];

const rewardHandoffQueue = [
  ['审核决策', 'Admin 或 Manager 对高价值兑换进行通过、拒绝或继续审核。'],
  ['领取分配', '通过审批或合规检查后分配合格 A/S 领取门店。'],
  ['粉丝/门店通知状态', '奖励状态告诉粉丝和门店是否可以继续领取。'],
];

const normalizeReviewStatus = (value) => {
  if (['pending_review', 'review_pending', 'pending'].includes(value)) return '待审核';
  if (value === 'approved') return '已通过';
  if (value === 'rejected') return '已拒绝';
  if (value === 'assigned_pickup') return '已分配领取门店';
  return value || '待审核';
};

const getRewardFulfillmentState = (row) => {
  if (row.status === '已拒绝') return '已拒绝并停止';
  if (row.status === '已通过' && !row.pickupStoreId) return '待分配领取门店';
  if (row.status === '已分配领取门店' || row.pickupStoreId) return '领取门店已分配';
  return '等待审核决策';
};

const writeRewardAudit = ({ row, action, after }) => {
  localDb.insert('audit_logs', {
    actor: 'UWELL operations',
    role: 'admin',
    action_type: action,
    action,
    target: row.id,
    target_id: row.sourceId || row.id,
    before_value: { status: row.status },
    after_value: after,
    reason: `${row.reward} review operation`,
    created_at: new Date().toISOString(),
  });
};

const buildReviewQueue = () => {
  const redemptions = localDb.all('mall_redemptions') || [];
  const dynamicRows = redemptions
    .filter((item) => (
      ['pending_review', 'review_pending', 'assigned_pickup'].includes(item.review_status || item.status)
      || Number(item.points_cost || item.required_points || 0) >= 3000
    ))
    .map((item) => ({
      id: `redemption-${item.id}`,
      sourceId: item.id,
      reward: item.item_name || item.reward_name || item.item_id || '奖励申请',
      fan: item.fan_name || item.fan_id || '粉丝',
      points: Number(item.points_cost || item.required_points || 0),
      level: item.required_level || item.fan_level || 'Gold',
      region: item.region || 'Riyadh',
      status: normalizeReviewStatus(item.review_status || item.status),
      pickupStoreId: item.assigned_pickup_store_id || '',
    }));

  if (dynamicRows.length) return dynamicRows;

  return REWARD_CATALOG
    .filter((item) => item.reviewRequired)
    .map((item, index) => ({
      id: `review-${item.id}`,
      sourceId: null,
      reward: item.name,
      fan: ['钻石粉丝 - Amal', '金卡粉丝 - Fahad', '钻石粉丝 - Sara'][index % 3],
      points: item.requiredPoints,
      level: item.requiredLevel,
      region: ['Riyadh', 'Dammam', 'Jeddah'][index % 3],
      status: index < 2 ? '待审核' : '待合规检查',
      pickupStoreId: '',
    }));
};

export default function RewardsOpsPage() {
  const profile = useAuthStore((s) => s.profile);
  const canReviewRewards = canManageRewardOps(profile);
  const canAssignPickup = canAssignRewardPickup(profile);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pickupStoreByRow, setPickupStoreByRow] = useState({});
  const stores = useMemo(() => localDb.all('stores') || [], []);
  const reviewQueue = useMemo(() => {
    void refreshKey;
    return buildReviewQueue();
  }, [refreshKey]);
  const counts = {
    normal: REWARD_CATALOG.filter((item) => item.type === 'Normal').length,
    premium: REWARD_CATALOG.filter((item) => item.type === 'Premium').length,
    diamond: REWARD_CATALOG.filter((item) => item.type === 'Diamond').length,
    approvals: reviewQueue.filter((item) => ['待审核', '待合规检查'].includes(item.status)).length,
  };

  const updateRedemptionReview = (row, reviewStatus, extra = {}) => {
    if (!canReviewRewards) {
      message.error('你没有奖励审核权限。');
      return;
    }
    if (row.sourceId && localDb.findById('mall_redemptions', row.sourceId)) {
      localDb.update('mall_redemptions', row.sourceId, {
        review_status: reviewStatus,
        status: reviewStatus === 'approved' ? 'pending_pickup' : reviewStatus === 'rejected' ? 'rejected' : 'pending_review',
        reviewed_at: new Date().toISOString(),
        ...extra,
      });
    }
    localDb.insert('reward_reviews', {
      redemption_id: row.sourceId || row.id,
      reward_name: row.reward,
      fan_label: row.fan,
      points: row.points,
      review_status: reviewStatus,
      assigned_pickup_store_id: extra.assigned_pickup_store_id || '',
      reviewed_at: new Date().toISOString(),
    });
    writeRewardAudit({
      row,
      action: `reward_review_${reviewStatus}`,
      after: { review_status: reviewStatus, ...extra },
    });
    setRefreshKey((value) => value + 1);
    message.success(`${row.reward}: ${normalizeReviewStatus(reviewStatus)}`);
  };

  const assignPickupStore = (row) => {
    if (!canAssignPickup) {
      message.error('你没有分配领取门店权限。');
      return;
    }
    const selectedStoreId = pickupStoreByRow[row.id] || row.pickupStoreId;
    if (!selectedStoreId) {
      message.warning('请先选择合格的领取门店。');
      return;
    }
    updateRedemptionReview(row, 'assigned_pickup', {
      assigned_pickup_store_id: selectedStoreId,
      assigned_pickup_store_name: stores.find((store) => store.id === selectedStoreId)?.name || selectedStoreId,
    });
  };

  return (
    <div className="admin-ops-page admin-reward-cockpit">
      <Title level={2}>奖励运营</Title>
      <Text type="secondary">
        奖励目录参数可配置，但兑换逻辑固定：只扣除可用积分，终身成长积分永不扣除。
      </Text>

      <Card className="admin-reward-command-strip">
        <div>
          <Text strong>奖励治理驾驶舱</Text>
          <p>目录可以运营调整，兑换和成长积分规则保持固定。</p>
        </div>
        <Tag color="volcano">高价值奖励审批</Tag>
      </Card>

      <Row gutter={[12, 12]} className="admin-reward-governance-compact">
        <Col xs={24} lg={14}>
          <Card title="奖励治理地图" className="admin-reward-governance-grid">
            <Row gutter={[10, 10]}>
              {rewardGovernanceCards.map(([title, desc]) => (
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
          <Card title="履约阶梯" className="admin-reward-fulfillment-ladder">
            {rewardFulfillmentLadder.map((item, index) => (
              <div className="admin-ops-row" key={item}>
                <span>步骤 {index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <div className="admin-reward-compact-summary">
        {[
          ['普通奖励', counts.normal],
          ['进阶奖励', counts.premium],
          ['钻石高价值奖励', counts.diamond],
          ['需要审核', counts.approvals],
        ].map(([item, value]) => (
          <Card className="admin-reward-summary-card" key={item}>
            <Text>{item}</Text>
            <Title level={3}>{value}</Title>
          </Card>
        ))}
      </div>

      <Row gutter={[12, 12]} className="admin-reward-rule-dock">
        <Col xs={24} lg={12}>
          <Card title="运营规则">
            <Space orientation="vertical" size={8}>
              {rewardRules.map((rule) => <Tag key={rule} color="blue">{rule}</Tag>)}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="领取与审批逻辑">
            <Space orientation="vertical" size={8}>
              {pickupRules.map((rule) => <Tag key={rule} color={rule.includes('Diamond') ? 'volcano' : 'green'}>{rule}</Tag>)}
              {luxuryRewardNames.map((name) => <Tag key={name} color="purple">{name}</Tag>)}
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="奖励履约交接" className="admin-reward-handoff-queue admin-reward-handoff-compact">
        <Row gutter={[10, 10]}>
          {rewardHandoffQueue.map(([title, desc]) => (
            <Col xs={24} md={8} key={title}>
              <div className="admin-ops-mini-card">
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <div className="admin-reward-table-stack">
        <Card title="初始奖励目录" className="admin-trial-wide-table">
          <Table
            size="small"
            pagination={{ pageSize: 8 }}
            dataSource={REWARD_CATALOG}
            rowKey="id"
            scroll={{ x: 920 }}
            columns={[
              { title: '奖励', dataIndex: 'name' },
              { title: '积分', dataIndex: 'requiredPoints' },
              { title: '等级', dataIndex: 'requiredLevel', render: (value) => `${value}+` },
              { title: '类型', dataIndex: 'type' },
              { title: '区域资格', render: () => '按区域配置' },
              { title: '图片风格', dataIndex: 'imageTone', render: (value) => <Tag color="lime">{value || '目录素材'}</Tag> },
              { title: '领取规则', dataIndex: 'pickupRule' },
              { title: '审核', dataIndex: 'reviewRequired', render: (value) => <Tag color={value ? 'volcano' : 'green'}>{value ? '需要' : '否'}</Tag> },
            ]}
          />
        </Card>

        <Card title="高价值奖励审批队列" className="admin-trial-wide-table">
          <Table
            size="small"
            pagination={{ pageSize: 6 }}
            dataSource={reviewQueue}
            rowKey="id"
            scroll={{ x: 1100 }}
            columns={[
              { title: '奖励', dataIndex: 'reward' },
              { title: '粉丝', dataIndex: 'fan' },
              { title: '积分', dataIndex: 'points' },
              { title: '所需等级', dataIndex: 'level' },
              { title: '区域', dataIndex: 'region' },
              { title: '状态', dataIndex: 'status', render: (value) => <Tag color="orange">{value}</Tag> },
              { title: '履约状态', render: (_, row) => <Tag color={row.pickupStoreId ? 'green' : 'blue'}>{getRewardFulfillmentState(row)}</Tag> },
              {
                title: '领取门店',
                render: (_, row) => (
                  <Select
                    className="admin-reward-pickup-select"
                    size="small"
                    placeholder="分配S/A门店"
                    style={{ minWidth: 180 }}
                    value={pickupStoreByRow[row.id] || row.pickupStoreId || undefined}
                    disabled={!canAssignPickup}
                    onChange={(value) => setPickupStoreByRow((current) => ({ ...current, [row.id]: value }))}
                    options={stores
                      .filter((store) => ['S', 'A'].includes(store.level))
                      .map((store) => ({ label: `${store.name} / ${store.level}级`, value: store.id }))}
                  />
                ),
              },
              {
                title: '操作',
                render: (_, row) => (
                  <Space wrap className="admin-reward-review-actions">
                    <Button size="small" icon={<CheckOutlined />} disabled={!canReviewRewards} onClick={() => updateRedemptionReview(row, 'approved')}>通过审核</Button>
                    <Button size="small" danger icon={<CloseOutlined />} disabled={!canReviewRewards} onClick={() => updateRedemptionReview(row, 'rejected')}>拒绝审核</Button>
                    <Button size="small" icon={<EnvironmentOutlined />} disabled={!canAssignPickup} onClick={() => assignPickupStore(row)}>分配领取门店</Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
