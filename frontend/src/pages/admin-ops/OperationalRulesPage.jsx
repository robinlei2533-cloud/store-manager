import React, { useMemo, useState } from 'react';
import { Button, Card, Col, InputNumber, Row, Space, Table, Tag, Typography, message } from 'antd';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import { canManageGlobalRules } from '../../utils/uwellRoleAccess';
import {
  ACTIVITY_VERIFICATION_STEPS,
  DEFAULT_OPERATIONAL_RULES,
  FAN_LEVEL_THRESHOLDS,
  OPERATIONAL_RULE_RECORD_ID,
  POINT_EARNING_CHANNELS,
  REGIONAL_WAREHOUSES,
  REWARD_CATALOG,
  RISK_RULES,
  STORE_EXPOSURE_LEVELS,
} from '../../utils/uwellLaunchRules';

const { Title, Text } = Typography;

const fixedRules = [
  '奖励兑换只扣除可用积分。',
  '奖励兑换不会扣除终身成长积分，也不会降低粉丝等级。',
  '门店账号只负责核销参与或领取，积分由系统发放。',
  '每个 UWELL 唯一产品码只能被领取一次。',
  '同一粉丝不能从同一活动重复获得积分。',
  '后台登录不开放公开注册。',
  '只有 Admin 可以创建 Manager 和 Rep 账号。',
  'Manager 和 Field Rep 只能查看分配区域内的数据。',
  '关键后台操作必须写入审计日志。',
];

const configurableRules = [
  '扫码积分和每日计分扫码上限',
  '每日签到积分',
  '社区点赞/评论/发帖积分和每日上限',
  '粉丝等级门槛',
  '奖励积分成本、等级要求、库存和区域资格',
  '活动积分、有效期和适用门店',
  '按仓库设置物料低库存阈值',
  '高价值奖励审核阈值',
];

const reviewRequiredRules = [
  '门店自建活动积分支持',
  '高价值奖励审批',
  'S/A/B/C 门店等级调整',
  '人工积分调整',
  '可疑扫码处理',
  '社区滥用积分冲正',
  '物料申请通过或拒绝',
];

const ratingRows = [
  ['月销售表现', 20, '0:0 / 1-2:5 / 2-3:10 / 3-4:15 / 4-6+:20'],
  ['地段 / 客流', 15, '地推评分'],
  ['门头 / 招牌照片', 10, '必须有证据'],
  ['UWELL 陈列质量', 15, '陈列证据和审核'],
  ['产品覆盖', 15, 'SKU / 覆盖数据'],
  ['店员配合度', 10, '地推评估'],
  ['活动准备度', 10, '官方活动准备情况'],
  ['照片 / 数据完整度', 5, '档案和证据完整度'],
].map(([dimension, points, note]) => ({ dimension, points, note }));

export default function OperationalRulesPage() {
  const { profile } = useAuthStore();
  const canEditRules = canManageGlobalRules(profile);
  const persistedRuleRecord = useMemo(() => localDb.findById('fan_points_rules', OPERATIONAL_RULE_RECORD_ID), []);
  const [editableTrialRules, setEditableTrialRules] = useState(() => ({
    ...DEFAULT_OPERATIONAL_RULES,
    ...(persistedRuleRecord?.settings || {}),
  }));

  const updateEditableRule = (key, value) => {
    if (!canEditRules) return;
    setEditableTrialRules((current) => ({ ...current, [key]: Number(value) || 0 }));
  };

  const saveOperationalRules = () => {
    if (!canEditRules) {
      message.error('只有管理员可以更新全局运营规则。');
      return;
    }
    const before = persistedRuleRecord?.settings || DEFAULT_OPERATIONAL_RULES;
    const after = { ...editableTrialRules };
    localDb.upsert(
      'fan_points_rules',
      {
        id: OPERATIONAL_RULE_RECORD_ID,
        name: '试运营规则设置',
        rule_scope: 'trial_launch',
        settings: after,
        updated_by: profile?.id || 'trial-admin',
        updated_by_name: profile?.name || 'Trial Admin',
      },
      'id',
    );
    localDb.insert('audit_logs', {
      actor: profile?.name || 'Trial Admin',
      actor_id: profile?.id || 'trial-admin',
      role: profile?.role || 'admin',
      region: profile?.region || profile?.city || '全部',
      action_type: 'rule_setting_changed',
      action: '试运营规则已更新',
      target: 'fan_points_rules',
      target_id: OPERATIONAL_RULE_RECORD_ID,
      before_value: before,
      after_value: after,
      reason: '管理员更新试运营可配置参数。',
      created_at: new Date().toISOString(),
    });
    message.success('试运营规则已保存，并已写入审计日志');
  };

  const rewardColumns = [
    { title: '奖励', dataIndex: 'name' },
    { title: '积分', dataIndex: 'requiredPoints', render: (value) => value.toLocaleString() },
    { title: '等级', dataIndex: 'requiredLevel', render: (value) => <Tag color={value === 'Diamond' ? 'purple' : value === 'Gold' ? 'gold' : 'green'}>{value}+</Tag> },
    { title: '类型', dataIndex: 'type' },
    { title: '审核', dataIndex: 'reviewRequired', render: (value) => <Tag color={value ? 'volcano' : 'green'}>{value ? '需要' : '不需要'}</Tag> },
    { title: '领取规则', dataIndex: 'pickupRule' },
  ];

  return (
    <div className="admin-ops-page admin-rules-page">
      <Title level={2}>运营规则</Title>
      <Text type="secondary">
        试运营规则中心统一管理粉丝增长、扫码反作弊、门店核销、奖励、门店评级、仓库可见性和审核边界。
      </Text>

      <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
        <Col xs={24} lg={8}>
          <Card title="固定系统逻辑" className="admin-readable-card">
            <div className="admin-rule-stack">
              {fixedRules.map((rule) => <Tag key={rule} color="green">{rule}</Tag>)}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="管理员可配置参数" className="admin-readable-card">
            <div className="admin-rule-stack">
              {configurableRules.map((rule) => <Tag key={rule} color="gold">{rule}</Tag>)}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="需要审核和审计日志" className="admin-readable-card">
            <div className="admin-rule-stack">
              {reviewRequiredRules.map((rule) => <Tag key={rule} color="volcano">{rule}</Tag>)}
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="可编辑试运营参数" className="admin-readable-card" style={{ marginTop: 18 }}>
        <Text type="secondary">
          这些值可用于试运营配置。上方固定规则保持锁定，每次保存都会写入审计日志。
        </Text>
        <div className="admin-editable-rule-grid">
          {[
            ['scanPoints', '扫码积分'],
            ['dailyScanLimit', '每日产品扫码上限'],
            ['checkInPoints', '每日签到积分'],
            ['communityLikePoints', '社区点赞积分'],
            ['communityLikeDailyLimit', '每日计分点赞上限'],
            ['communityCommentPoints', '社区评论积分'],
            ['communityCommentDailyLimit', '每日计分评论上限'],
            ['communityPostPoints', '每日首发帖积分'],
            ['communityPostDailyLimit', '每日计分发帖上限'],
            ['storeEventMinPoints', '门店活动最低积分'],
            ['storeEventMaxPoints', '门店活动最高积分'],
            ['highValueRewardReviewThreshold', '高价值审核阈值'],
            ['materialLowStockThreshold', '物料低库存阈值'],
          ].map(([key, label]) => (
            <label key={key} className="admin-editable-rule-field">
              <span>{label}</span>
              <InputNumber
                min={0}
                value={editableTrialRules[key]}
                disabled={!canEditRules}
                onChange={(value) => updateEditableRule(key, value)}
                style={{ width: '100%' }}
              />
            </label>
          ))}
        </div>
        <Space wrap style={{ marginTop: 14 }}>
          <Button type="primary" disabled={!canEditRules} onClick={saveOperationalRules}>保存试运营规则</Button>
          <Tag color="green">写入 fan_points_rules</Tag>
          <Tag color="gold">写入 audit_logs</Tag>
          {!canEditRules && <Tag color="default">非管理员角色只读</Tag>}
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
        <Col xs={24} lg={12}>
          <Card title="粉丝等级和积分渠道" className="admin-readable-card">
            <div className="admin-level-grid">
              {FAN_LEVEL_THRESHOLDS.map((item) => (
                <div key={item.level} className="admin-rule-tile">
                  <span>{item.level}</span>
                  <strong>{item.threshold.toLocaleString()}</strong>
                  <small>终身成长积分</small>
                </div>
              ))}
            </div>
            <div className="admin-rule-list">
              {POINT_EARNING_CHANNELS.map((item) => (
                <div key={item.key} className="admin-rule-row">
                  <strong>{item.label}</strong>
                  <span>{item.points}</span>
                  <small>{item.limit}</small>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="门店活动核销闭环" className="admin-readable-card">
            <div className="admin-rule-flow">
              {ACTIVITY_VERIFICATION_STEPS.map((step, index) => (
                <div key={step} className="admin-rule-flow-step">
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
            <Text type="secondary">
              门店账号不能任意录入积分。门店只核销参与或领取，系统负责校验重复、时间、门店和风控规则。
            </Text>
          </Card>
        </Col>
      </Row>

      <Card title="奖励目录治理" className="admin-readable-card" style={{ marginTop: 18 }}>
        <Table rowKey="id" size="small" columns={rewardColumns} dataSource={REWARD_CATALOG} pagination={{ pageSize: 8 }} />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
        <Col xs={24} lg={12}>
          <Card title="门店评级模型" className="admin-readable-card">
            <Table
              rowKey="dimension"
              size="small"
              pagination={false}
              dataSource={ratingRows}
              columns={[
                { title: '维度', dataIndex: 'dimension' },
                { title: '分数', dataIndex: 'points' },
                { title: '规则说明', dataIndex: 'note' },
              ]}
            />
            <div className="admin-rule-stack" style={{ marginTop: 12 }}>
              <Tag color="purple">90-100 S</Tag>
              <Tag color="green">75-89 A</Tag>
              <Tag color="blue">60-74 B</Tag>
              <Tag color="default">60以下 C</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="门店曝光和区域仓库" className="admin-readable-card">
            <div className="admin-rule-list">
              {STORE_EXPOSURE_LEVELS.map((item) => (
                <div key={item.level} className="admin-rule-row">
                  <strong>{item.level}级</strong>
                  <span>{item.fanLabel}</span>
                  <small>{item.exposure}</small>
                </div>
              ))}
            </div>
            <div className="admin-rule-stack" style={{ marginTop: 12 }}>
              {REGIONAL_WAREHOUSES.map((item) => <Tag key={item.region} color="cyan">{item.warehouse}</Tag>)}
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="初始风控规则" className="admin-readable-card" style={{ marginTop: 18 }}>
        <div className="admin-rule-stack">
          {RISK_RULES.map((rule) => <Tag key={rule} color="red">{rule}</Tag>)}
        </div>
      </Card>
    </div>
  );
}
